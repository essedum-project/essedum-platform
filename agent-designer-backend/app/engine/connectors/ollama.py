from typing import Any
from openai import AsyncOpenAI
from app.config import settings


def _normalize_base_url(url: str) -> str:
    """Ollama's OpenAI-compatible endpoint lives at ``/v1``. Accept either
    ``http://host:11434`` or ``http://host:11434/v1`` from the user."""
    if not url:
        return url
    url = url.rstrip("/")
    if not url.endswith("/v1"):
        url = url + "/v1"
    return url


class OllamaConnector:
    """Handles chat completions via Ollama's OpenAI-compatible API."""

    def _get_client(self, base_url_override: str | None = None) -> AsyncOpenAI:
        base_url = (
            _normalize_base_url(base_url_override)
            if base_url_override
            else settings.ollama_base_url
        )
        return AsyncOpenAI(
            base_url=base_url,
            api_key="ollama",  # Ollama doesn't need a real key
        )

    async def chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
        base_url_override: str | None = None,
        **kwargs: Any,
    ) -> str:
        client = self._get_client(base_url_override)
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    async def list_models(self, base_url_override: str | None = None) -> list[str]:
        client = self._get_client(base_url_override)
        models = await client.models.list()
        return [m.id for m in models.data]
