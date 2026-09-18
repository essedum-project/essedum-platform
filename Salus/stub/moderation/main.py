"""Lightweight Salus Moderation stub.

Implements the exact API contract consumed by salus_client.py:
  POST /rai/v1/moderations
  GET  /health

Real (but simple, regex/keyword-based) detectors for Profanity, Toxicity,
PromptInjection, JailBreak and PII. This is still not a full ML moderation
model, but unlike the original always-PASSED stub it actually flags
obviously bad input/output so guardrail integration tests are meaningful.
"""
import re
import os
import logging
from fastapi import FastAPI
from pydantic import BaseModel

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("salus-moderation-stub")

app = FastAPI(title="Salus Moderation Stub", version="0.0.2")

_PROFANITY = re.compile(
    r"\b(fuck|shit|ass|bitch|damn|crap)\b", re.IGNORECASE
)

_TOXICITY = re.compile(
    r"\b(idiot|moron|stupid|dumb|worthless|pathetic|useless|loser|shut up|hate you)\b",
    re.IGNORECASE,
)

_PROMPT_INJECTION = re.compile(
    r"(ignore (all|any) (previous|prior|the above) instructions"
    r"|disregard (all|any) (previous|prior|the above) instructions"
    r"|reveal (your|the) system prompt"
    r"|show (me )?your (system )?prompt"
    r"|new instructions\s*:"
    r"|override (your|the) (previous|system) instructions)",
    re.IGNORECASE,
)

_JAILBREAK = re.compile(
    r"(\bDAN\b|do anything now|jailbreak|pretend you (are|have) no (restrictions|rules)"
    r"|act as if you have no (restrictions|rules|filters)"
    r"|bypass (your|all) (restrictions|guidelines|safety))",
    re.IGNORECASE,
)

_SSN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
_PHONE = re.compile(r"\b(\+?\d{1,2}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")

_DETECTORS = {
    "Profanity": _PROFANITY,
    "Toxicity": _TOXICITY,
    "PromptInjection": _PROMPT_INJECTION,
    "JailBreak": _JAILBREAK,
}


class ModerationRequest(BaseModel):
    AccountName: str = "None"
    userid: str = "None"
    PortfolioName: str = "None"
    lotNumber: str = "1"
    translate: str = "no"
    Prompt: str
    ModerationChecks: list[str] = []
    ModerationCheckThresholds: dict = {}


@app.get("/health")
def health():
    return {"status": "ok", "service": "salus-moderation-stub"}


def _check_pii(text: str) -> bool:
    return bool(_SSN.search(text) or _EMAIL.search(text) or _PHONE.search(text))


@app.post("/rai/v1/moderations")
def moderate(req: ModerationRequest):
    failed_checks: list[str] = []
    check_results: dict = {}

    for check in req.ModerationChecks:
        detector = _DETECTORS.get(check)
        if check == "PII" and _check_pii(req.Prompt):
            matched = True
        elif detector is not None and detector.search(req.Prompt):
            matched = True
        else:
            matched = False

        if matched:
            failed_checks.append(check)
            check_results[check] = {"status": "FAILED", "score": 1.0}
        else:
            check_results[check] = {"status": "PASSED", "score": 0.0}

    status = "FAILED" if failed_checks else "PASSED"
    logger.info("Moderation: checks=%s status=%s prompt_len=%d",
                req.ModerationChecks, status, len(req.Prompt))

    return {
        "moderationResults": {
            "summary": {
                "status": status,
                "reason": failed_checks,
            },
            "checks": check_results,
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 30000)))
