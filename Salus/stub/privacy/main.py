"""Salus Privacy service — Microsoft Presidio backed.

Implements the exact API contract consumed by salus_client.py / RaiservicesService:
  POST /v1/privacy/text/analyze
  POST /v1/privacy/text/anonymize
  GET  /health

Detection uses Presidio (`presidio-analyzer` + `presidio-anonymizer`) with the small
spaCy model, mirroring salus-rai/Salus `responsible-ai-privacy` but without its heavy
extras (en_core_web_lg, transformers/flair NER, image + DICOM redaction). If Presidio
or its model can't load, the service falls back to the original regex matcher so the
API keeps working — `GET /health` reports which engine is live.
"""
import re
import os
import logging
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("salus-privacy")

app = FastAPI(title="Salus Privacy", version="0.2.0")

PRESIDIO_ENABLED = os.getenv("PRESIDIO_ENABLED", "true").lower() == "true"
SPACY_MODEL = os.getenv("PRESIDIO_NLP_MODEL", "en_core_web_sm")

# ---------------------------------------------------------------------------
# Regex fallback patterns (used when Presidio is not installed/loadable)
# ---------------------------------------------------------------------------
_PATTERNS: dict[str, re.Pattern] = {
    "EMAIL_ADDRESS":  re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"),
    "PHONE_NUMBER":   re.compile(r"(?:\+?\d[\d\-\s().]{7,}\d)"),
    "US_SSN":         re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "CREDIT_CARD":    re.compile(r"\b(?:\d[ -]?){13,16}\b"),
    "IN_AADHAAR":     re.compile(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}\b"),
    "IN_PAN":         re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b"),
    "IP_ADDRESS":     re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "URL":            re.compile(r"https?://[^\s]+"),
}

# Entities used when the caller sends no explicit list. The NER-only ones
# (PERSON/LOCATION/...) are what Presidio adds over the regex matcher.
_DEFAULT_ENTITIES = list(_PATTERNS.keys()) + [
    "PERSON", "LOCATION", "DATE_TIME", "NRP", "IBAN_CODE", "CRYPTO",
]

_REDACTION = {k: f"<{k}>" for k in _DEFAULT_ENTITIES}

# ---------------------------------------------------------------------------
# Presidio engine (built once, lazily)
# ---------------------------------------------------------------------------
_analyzer = None
_anonymizer = None
_engine_name = "regex"
_engine_error: Optional[str] = None


def _india_recognizers(supported: set[str]) -> list:
    """Aadhaar/PAN recognizers for Presidio builds that don't ship them."""
    from presidio_analyzer import Pattern, PatternRecognizer

    extra = []
    if "IN_AADHAAR" not in supported:
        extra.append(PatternRecognizer(
            supported_entity="IN_AADHAAR",
            patterns=[Pattern("Aadhaar (weak)", r"\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b", 0.4)],
            context=["aadhaar", "aadhar", "uidai", "uid"],
        ))
    if "IN_PAN" not in supported:
        extra.append(PatternRecognizer(
            supported_entity="IN_PAN",
            patterns=[Pattern("PAN", r"\b[A-Z]{5}\d{4}[A-Z]\b", 0.6)],
            context=["pan", "permanent account number", "income tax"],
        ))
    return extra


def _build_presidio() -> None:
    global _analyzer, _anonymizer, _engine_name, _engine_error
    if _analyzer is not None or not PRESIDIO_ENABLED:
        return
    try:
        from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
        from presidio_analyzer.nlp_engine import NlpEngineProvider
        from presidio_anonymizer import AnonymizerEngine

        nlp_engine = NlpEngineProvider(nlp_configuration={
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": "en", "model_name": SPACY_MODEL}],
        }).create_engine()

        registry = RecognizerRegistry()
        registry.load_predefined_recognizers(languages=["en"], nlp_engine=nlp_engine)
        for rec in _india_recognizers(set(registry.get_supported_entities(languages=["en"]))):
            registry.add_recognizer(rec)

        _analyzer = AnalyzerEngine(registry=registry, nlp_engine=nlp_engine, supported_languages=["en"])
        _anonymizer = AnonymizerEngine()
        _engine_name = f"presidio ({SPACY_MODEL})"
        logger.info("Presidio ready — entities: %s", sorted(_analyzer.get_supported_entities()))
    except Exception as exc:
        _engine_error = str(exc)
        logger.warning("Presidio unavailable (%s) — falling back to regex matching", exc)


@app.on_event("startup")
def _startup() -> None:
    _build_presidio()


class AnalyzeRequest(BaseModel):
    inputText: str
    nlp: str = "basic"
    piiEntitiesToBeRedacted: list[str] = []
    scoreThreshold: float = 0.4


class AnonymizeRequest(BaseModel):
    inputText: str
    nlp: str = "basic"
    piiEntitiesToBeRedacted: list[str] = []
    scoreThreshold: float = 0.4
    redactionType: str = "replace"
    fakeData: bool = False


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "salus-privacy",
        "engine": _engine_name,
        "engineError": _engine_error,
    }


def _requested_entities(requested: list[str]) -> list[str]:
    if requested:
        return requested
    if _analyzer is not None:
        supported = set(_analyzer.get_supported_entities())
        return [e for e in _DEFAULT_ENTITIES if e in supported] or _DEFAULT_ENTITIES
    return list(_PATTERNS.keys())


def _analyze_presidio(text: str, entities: list[str], threshold: float):
    supported = set(_analyzer.get_supported_entities())
    wanted = [e for e in entities if e in supported] or None
    return _analyzer.analyze(text=text, language="en", entities=wanted, score_threshold=threshold)


def _analyze_regex(text: str, entities: list[str]) -> list[dict]:
    found = []
    for entity in entities:
        pattern = _PATTERNS.get(entity)
        if not pattern:
            continue
        for m in pattern.finditer(text):
            found.append({
                "entity_type": entity,
                "start": m.start(),
                "end": m.end(),
                "score": 0.85,
                "text": m.group(),
            })
    return found


@app.post("/v1/privacy/text/analyze")
def analyze(req: AnalyzeRequest):
    _build_presidio()
    entities = _requested_entities(req.piiEntitiesToBeRedacted)

    if _analyzer is not None:
        found = [{
            "entity_type": r.entity_type,
            "start": r.start,
            "end": r.end,
            "score": round(r.score, 2),
            "text": req.inputText[r.start:r.end],
        } for r in _analyze_presidio(req.inputText, entities, req.scoreThreshold)]
    else:
        found = _analyze_regex(req.inputText, entities)

    logger.info("Analyze[%s]: entities=%s found=%d", _engine_name, entities, len(found))
    return {"entities": found, "input_length": len(req.inputText)}


def _operator_config(redaction_type: str, entity: str):
    from presidio_anonymizer.entities import OperatorConfig

    if redaction_type == "mask":
        return OperatorConfig("mask", {"masking_char": "*", "chars_to_mask": 100, "from_end": False})
    if redaction_type == "hash":
        return OperatorConfig("hash", {"hash_type": "sha256"})
    if redaction_type == "redact":
        return OperatorConfig("redact", {})
    return OperatorConfig("replace", {"new_value": _REDACTION.get(entity, f"<{entity}>")})


@app.post("/v1/privacy/text/anonymize")
def anonymize(req: AnonymizeRequest):
    _build_presidio()
    entities = _requested_entities(req.piiEntitiesToBeRedacted)

    if _analyzer is not None:
        results = _analyze_presidio(req.inputText, entities, req.scoreThreshold)
        operators = {e: _operator_config(req.redactionType, e) for e in {r.entity_type for r in results}}
        operators["DEFAULT"] = _operator_config(req.redactionType, "REDACTED")
        text = _anonymizer.anonymize(text=req.inputText, analyzer_results=results, operators=operators).text
        redacted_count = len(results)
    else:
        text = req.inputText
        redacted_count = 0
        for entity in entities:
            pattern = _PATTERNS.get(entity)
            if not pattern:
                continue
            text, n = pattern.subn(_REDACTION.get(entity, "<REDACTED>"), text)
            redacted_count += n

    logger.info("Anonymize[%s]: entities=%s redacted=%d", _engine_name, entities, redacted_count)
    return {
        "anonymizedText": text,
        "originalLength": len(req.inputText),
        "anonymizedLength": len(text),
        "redactedCount": redacted_count,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 30002)))
