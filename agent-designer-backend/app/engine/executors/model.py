import time
from typing import Any
from app.engine.executors.base import BaseExecutor
from app.engine.connectors import get_connector


# Map the frontend LLM node-library type → backend connector key.
# Lets the user drop an "Ollama (Local)" node without having to set
# a separate ``provider`` field.
_NODE_TYPE_TO_PROVIDER = {
    "ollama-llm": "ollama",
    "azure-openai-llm": "azure_openai",
    "openai-llm": "azure_openai",       # routed through Azure OpenAI in V1
    "anthropic-llm": "bedrock",
    "google-llm": "vertex_ai",
    "mistral-llm": "bedrock",
    "cohere-llm": "bedrock",
    "groq-llm": "bedrock",
    "huggingface-llm": "bedrock",
    "litellm-llm": "litellm",           # routes through LiteLLM gateway
}


def _resolve_provider(node: dict, config: dict) -> str:
    """Determine which connector to use.

    Priority: explicit ``config.provider`` > definition.type mapping > error.
    """
    explicit = (config.get("provider") or "").strip()
    if explicit:
        return explicit

    data = node.get("data") or {}
    definition = data.get("definition") or {}
    node_type = definition.get("type") or node.get("type") or ""
    mapped = _NODE_TYPE_TO_PROVIDER.get(node_type)
    if mapped:
        return mapped

    raise ValueError(
        f"Model node {node.get('id')!r} is missing 'provider' and no mapping "
        f"exists for node type {node_type!r}. Set 'provider' in the node "
        "config (one of: azure_openai, bedrock, vertex_ai, ollama, litellm)."
    )


class ModelExecutor(BaseExecutor):
    """Calls Azure OpenAI, AWS Bedrock, Google Vertex AI, or Ollama."""

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        provider: str = _resolve_provider(node, config)

        model: str | None = config.get("model")
        if not model:
            raise ValueError(
                f"Model node {node.get('id')!r} is missing 'model'. "
                "Set it in the node inspector."
            )

        temperature: float = float(config.get("temperature", 0.7))
        # Ollama UI uses ``num_predict``; other LLMs use ``max_tokens``.
        max_tokens_raw = (
            config.get("max_tokens")
            if config.get("max_tokens") is not None
            else config.get("num_predict", 1000)
        )
        max_tokens: int = int(max_tokens_raw or 1000)

        # Resolve prompt text
        prompt_text: str = (
            inputs.get("prompt")
            or inputs.get("message")
            or inputs.get("input")
            or ""
        )
        system_text: str = (
            inputs.get("system_message")
            or config.get("system_message")
            or config.get("system_prompt")   # nodeDefinitions uses 'system_prompt'
            or ""
        )

        messages: list[dict[str, str]] = []
        if system_text:
            messages.append({"role": "system", "content": system_text})
        messages.append({"role": "user", "content": prompt_text})

        connector = get_connector(provider)

        extra_kwargs: dict[str, Any] = {}
        # Ollama and LiteLLM allow overriding the gateway URL per node.
        if provider in ("ollama", "litellm") and config.get("base_url"):
            extra_kwargs["base_url_override"] = config["base_url"]

        # Langfuse generation span — records input messages, model, latency, output.
        from app.core.langfuse_tracer import get_trace
        trace = get_trace(context.get("execution_id"))
        generation = None
        if trace:
            generation = trace.generation(
                name=f"node:{node.get('id', 'model')}",
                model=model,
                model_parameters={"temperature": temperature, "max_tokens": max_tokens},
                input=messages,
                metadata={"provider": provider, "node_id": node.get("id")},
            )

        t0 = time.monotonic()
        response = await connector.chat(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **extra_kwargs,
        )

        if generation:
            generation.end(
                output=response,
                metadata={"latency_ms": round((time.monotonic() - t0) * 1000)},
            )

        return {"response": response}
