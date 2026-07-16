"""Salus guard: privacy + moderation checks for all LLM inputs and outputs.

Flow for every chat() call
──────────────────────────
  1. check_input(messages)
       a. Privacy  — anonymize PII in every user/system message
       b. Moderation — check the full prompt text against configured rules;
          raise SalusViolationError if the summary status is FAILED
     → returns (possibly redacted) messages

  2. LLM call happens

  3. check_output(response_text)
       a. Privacy  — anonymize PII in the LLM response
       b. Moderation — check the response text
          raise SalusViolationError if the summary status is FAILED
     → returns (possibly redacted) response text

Error handling
──────────────
  - If Salus is unreachable and ``salus_fail_closed=False`` (default), the
    error is logged and the call proceeds unchanged.
  - If ``salus_fail_closed=True``, an HTTP 503 is raised instead.
  - A SalusViolationError (HTTP 400) is always raised when a check fails,
    regardless of fail_closed.
"""

from __future__ import annotations

import logging
from fastapi import HTTPException, status

from app.config import settings
from app.core.salus_client import get_salus_client

logger = logging.getLogger("agentflow.salus_guard")


# ---------------------------------------------------------------------------
# Public exception
# ---------------------------------------------------------------------------

class SalusViolationError(HTTPException):
    """Raised when a Salus moderation check returns FAILED."""

    def __init__(self, stage: str, failed_checks: list[str]) -> None:
        detail = (
            f"Content blocked by Salus {stage} check. "
            f"Failed: {', '.join(failed_checks)}"
        )
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def check_input(messages: list[dict]) -> list[dict]:
    """Run Salus privacy + moderation checks on the outgoing messages.

    Returns the (possibly PII-redacted) message list.
    Raises SalusViolationError if moderation fails.
    """
    if not settings.salus_enabled:
        return messages

    # --- 1. Privacy: anonymize PII in each message ---
    messages = await _anonymize_messages(messages, stage="input")

    # --- 2. Moderation: check the full prompt text ---
    if settings.salus_input_checks:
        full_text = _all_content(messages)
        if full_text:
            await _run_moderation(full_text, settings.salus_input_checks, stage="input")

    return messages


async def check_output(response_text: str) -> str:
    """Run Salus privacy + moderation checks on the LLM response.

    Returns the (possibly PII-redacted) response text.
    Raises SalusViolationError if moderation fails.
    """
    if not settings.salus_enabled or not response_text:
        return response_text

    # --- 1. Privacy: anonymize PII in the response ---
    text = await _anonymize_text(response_text, stage="output")

    # --- 2. Moderation: check the (possibly redacted) response ---
    if settings.salus_output_checks and text:
        await _run_moderation(text, settings.salus_output_checks, stage="output")

    return text


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _all_content(messages: list[dict]) -> str:
    """Concatenate all non-empty message contents into a single string."""
    return " ".join(
        (m.get("content") or "").strip()
        for m in messages
        if (m.get("content") or "").strip()
    )


async def _anonymize_text(text: str, stage: str) -> str:
    """Anonymize PII in *text*. Returns unchanged text on error (if fail-open)."""
    if not settings.salus_pii_entities or not text.strip():
        return text

    client = get_salus_client()
    try:
        anonymized = await client.anonymize_pii(
            text=text,
            entities_to_redact=settings.salus_pii_entities,
            score_threshold=settings.salus_pii_score_threshold,
        )
        if anonymized != text:
            logger.info("Salus %s: PII redacted", stage)
        return anonymized
    except Exception as exc:
        return _handle_salus_error(f"privacy ({stage})", exc, fallback=text)


async def _anonymize_messages(messages: list[dict], stage: str) -> list[dict]:
    """Anonymize PII in every message that has textual content."""
    if not settings.salus_pii_entities:
        return messages

    result: list[dict] = []
    for msg in messages:
        content = msg.get("content") or ""
        if not content.strip():
            result.append(msg)
            continue
        anonymized = await _anonymize_text(content, stage=stage)
        if anonymized != content:
            result.append({**msg, "content": anonymized})
        else:
            result.append(msg)
    return result


async def _run_moderation(text: str, checks: list[str], stage: str) -> None:
    """Call the Salus moderation API and raise SalusViolationError on failure."""
    client = get_salus_client()
    try:
        result = await client.moderate(
            text=text,
            checks=checks,
            thresholds=_build_thresholds(),
        )
        _assert_passed(result, stage)
    except SalusViolationError:
        raise
    except Exception as exc:
        _handle_salus_error(f"moderation ({stage})", exc, fallback=None)


def _assert_passed(moderation_result: dict, stage: str) -> None:
    """Raise SalusViolationError when the Salus summary is FAILED."""
    summary = (
        moderation_result
        .get("moderationResults", {})
        .get("summary", {})
    )
    if summary.get("status", "PASSED") == "FAILED":
        failed: list[str] = summary.get("reason", ["unknown"])
        raise SalusViolationError(stage, failed)


def _build_thresholds() -> dict:
    """Construct the ModerationCheckThresholds block from settings."""
    tox = settings.salus_toxicity_threshold
    return {
        "PromptinjectionThreshold": settings.salus_prompt_injection_threshold,
        "JailbreakThreshold": settings.salus_jailbreak_threshold,
        "PiientitiesConfiguredToBlock": settings.salus_pii_entities,
        "RefusalThreshold": settings.salus_refusal_threshold,
        "ToxicityThresholds": {
            "ToxicityThreshold": tox,
            "SevereToxicityThreshold": tox,
            "ObsceneThreshold": tox,
            "ThreatThreshold": tox,
            "InsultThreshold": tox,
            "IdentityAttackThreshold": tox,
            "SexualExplicitThreshold": tox,
        },
        "ProfanityCountThreshold": 1,
    }


def _handle_salus_error(stage: str, exc: Exception, fallback):
    """Log a Salus connectivity error; raise 503 if fail-closed, else return fallback."""
    logger.error("Salus %s unavailable: %s", stage, exc)
    if settings.salus_fail_closed:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Salus {stage} service unavailable",
        )
    return fallback
