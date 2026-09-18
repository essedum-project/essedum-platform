"""Lightweight Salus Privacy stub.

Implements the exact API contract consumed by salus_client.py:
  POST /v1/privacy/text/analyze
  POST /v1/privacy/text/anonymize
  GET  /health

Uses regex patterns only — no ML models, no spaCy. Covers common PII
entity types with high precision for development/testing. In production,
replace with the real Presidio-backed privacy service.
"""
import re
import os
import logging
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("salus-privacy-stub")

app = FastAPI(title="Salus Privacy Stub", version="0.0.1")

# ---------------------------------------------------------------------------
# Regex patterns per PII entity type
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

_REDACTION = {k: f"<{k}>" for k in _PATTERNS}


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
    return {"status": "ok", "service": "salus-privacy-stub"}


@app.post("/v1/privacy/text/analyze")
def analyze(req: AnalyzeRequest):
    entities = req.piiEntitiesToBeRedacted or list(_PATTERNS.keys())
    found = []
    for entity in entities:
        pattern = _PATTERNS.get(entity)
        if not pattern:
            continue
        for m in pattern.finditer(req.inputText):
            found.append({
                "entity_type": entity,
                "start": m.start(),
                "end": m.end(),
                "score": 0.85,
                "text": m.group(),
            })

    logger.info("Analyze: entities=%s found=%d", entities, len(found))
    return {"entities": found, "input_length": len(req.inputText)}


@app.post("/v1/privacy/text/anonymize")
def anonymize(req: AnonymizeRequest):
    entities = req.piiEntitiesToBeRedacted or list(_PATTERNS.keys())
    text = req.inputText
    redacted_count = 0

    for entity in entities:
        pattern = _PATTERNS.get(entity)
        if not pattern:
            continue
        replacement = _REDACTION.get(entity, "<REDACTED>")
        new_text, n = pattern.subn(replacement, text)
        if n:
            text = new_text
            redacted_count += n

    logger.info("Anonymize: entities=%s redacted=%d", entities, redacted_count)
    return {
        "anonymizedText": text,
        "originalLength": len(req.inputText),
        "anonymizedLength": len(text),
        "redactedCount": redacted_count,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 30002)))
