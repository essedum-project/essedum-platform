from typing import Any

_SUPPORTED = {"azure_openai", "bedrock", "vertex_ai", "ollama"}
_INSTANCES: dict[str, Any] = {}


class _SalusGuardedConnector:
    """Transparent proxy that runs Salus privacy + moderation checks on every chat() call.

    All other methods (embed, list_models, …) are forwarded unchanged to the
    wrapped connector.
    """

    def __init__(self, inner: Any) -> None:
        self._inner = inner

    async def chat(
        self,
        model: str,
        messages: list[dict],
        **kwargs: Any,
    ) -> str:
        from app.core.salus_guard import check_input, check_output
        messages = await check_input(messages)
        response: str = await self._inner.chat(model=model, messages=messages, **kwargs)
        return await check_output(response)

    def __getattr__(self, name: str) -> Any:
        return getattr(self._inner, name)


def get_connector(provider: str):
    if provider not in _SUPPORTED:
        raise ValueError(
            f"Model provider '{provider}' is not supported in V1. "
            f"Supported: {sorted(_SUPPORTED)}"
        )
    if provider not in _INSTANCES:
        if provider == "azure_openai":
            from app.engine.connectors.azure_openai import AzureOpenAIConnector
            raw = AzureOpenAIConnector()
        elif provider == "bedrock":
            from app.engine.connectors.bedrock import BedrockConnector
            raw = BedrockConnector()
        elif provider == "vertex_ai":
            from app.engine.connectors.vertex_ai import VertexAIConnector
            raw = VertexAIConnector()
        elif provider == "ollama":
            from app.engine.connectors.ollama import OllamaConnector
            raw = OllamaConnector()
        _INSTANCES[provider] = _SalusGuardedConnector(raw)
    return _INSTANCES[provider]
