"""Async HTTP client for the Salus responsible-AI APIs.

Two services are wrapped:
  - Moderation  POST /rai/v1/moderations          (default: http://localhost:30000)
  - Privacy     POST /v1/privacy/text/analyze      (default: http://localhost:30002)
                POST /v1/privacy/text/anonymize
"""

import logging
import httpx
from app.config import settings

logger = logging.getLogger("agentflow.salus")


class SalusClient:
    """Thin async wrapper around the Salus REST endpoints."""

    def __init__(self) -> None:
        self._http: httpx.AsyncClient | None = None

    async def _client(self) -> httpx.AsyncClient:
        if self._http is None or self._http.is_closed:
            self._http = httpx.AsyncClient(
                timeout=settings.salus_timeout,
                verify=False,
            )
        return self._http

    async def close(self) -> None:
        if self._http and not self._http.is_closed:
            await self._http.aclose()
            self._http = None

    # ------------------------------------------------------------------
    # Moderation
    # ------------------------------------------------------------------

    async def moderate(
        self,
        text: str,
        checks: list[str],
        thresholds: dict | None = None,
    ) -> dict:
        """POST /rai/v1/moderations — run the requested checks on *text*.

        Returns the full JSON response; callers inspect
        ``result["moderationResults"]["summary"]["status"]``.
        """
        payload = {
            "AccountName": "None",
            "userid": "None",
            "PortfolioName": "None",
            "lotNumber": "1",
            "translate": "no",
            "Prompt": text,
            "ModerationChecks": checks,
            "ModerationCheckThresholds": thresholds or {},
        }
        client = await self._client()
        url = f"{settings.salus_moderation_url}/rai/v1/moderations"
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    # ------------------------------------------------------------------
    # Privacy
    # ------------------------------------------------------------------

    async def analyze_pii(
        self,
        text: str,
        entities_to_detect: list[str] | None = None,
        score_threshold: float = 0.4,
    ) -> dict:
        """POST /v1/privacy/text/analyze — return detected PII entities."""
        payload = {
            "inputText": text,
            "nlp": "basic",
            "piiEntitiesToBeRedacted": entities_to_detect or [],
            "scoreThreshold": score_threshold,
        }
        client = await self._client()
        url = f"{settings.salus_privacy_url}/v1/privacy/text/analyze"
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    async def anonymize_pii(
        self,
        text: str,
        entities_to_redact: list[str] | None = None,
        score_threshold: float = 0.4,
    ) -> str:
        """POST /v1/privacy/text/anonymize — return redacted text.

        Falls back to the original *text* on API errors (caller decides
        whether that is acceptable via ``salus_fail_closed``).
        """
        payload = {
            "inputText": text,
            "nlp": "basic",
            "piiEntitiesToBeRedacted": entities_to_redact or [],
            "scoreThreshold": score_threshold,
            "redactionType": "replace",
            "fakeData": False,
        }
        client = await self._client()
        url = f"{settings.salus_privacy_url}/v1/privacy/text/anonymize"
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        result = resp.json()
        return result.get("anonymizedText", text)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_salus_client: SalusClient | None = None


def get_salus_client() -> SalusClient:
    global _salus_client
    if _salus_client is None:
        _salus_client = SalusClient()
    return _salus_client
