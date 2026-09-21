from typing import Any
from openai import AsyncOpenAI
from app.config import settings


class LiteLLMConnector:
    """Routes LLM calls through LiteLLM's OpenAI-compatible API.

    LiteLLM acts as a unified proxy — models from any configured provider
    (Azure OpenAI, Bedrock, Vertex AI, Ollama, etc.) are accessible here
    via a single endpoint, with centralized cost tracking and rate limiting.
    """

    def _get_client(
        self,
        api_key: str | None = None,
        base_url_override: str | None = None,
    ) -> AsyncOpenAI:
        return AsyncOpenAI(
            base_url=base_url_override or settings.litellm_base_url,
            api_key=api_key or settings.litellm_api_key or "sk-dummy",
        )

    async def chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
        api_key: str | None = None,
        base_url_override: str | None = None,
        **kwargs: Any,
    ) -> str:
        client = self._get_client(api_key, base_url_override)
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    async def embed(
        self,
        texts: list[str],
        model: str = "text-embedding-3-small",
        api_key: str | None = None,
        base_url_override: str | None = None,
    ) -> list[list[float]]:
        client = self._get_client(api_key, base_url_override)
        response = await client.embeddings.create(model=model, input=texts)
        return [item.embedding for item in response.data]

    async def list_models(
        self,
        api_key: str | None = None,
        base_url_override: str | None = None,
    ) -> list[str]:
        client = self._get_client(api_key, base_url_override)
        models = await client.models.list()
        return [m.id for m in models.data]
