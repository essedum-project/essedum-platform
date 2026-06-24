from typing import Any
from app.engine.executors.base import BaseExecutor


class ChatOutputExecutor(BaseExecutor):
    """Terminal node — collects the final response text."""

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        # Try common semantic keys first; if none match, fall back to the
        # first non-empty value so flows wired with arbitrary handle names
        # (e.g. 'text') still produce output.
        for key in ("message", "response", "answer", "result",
                    "output", "input", "text", "content"):
            value = inputs.get(key)
            if value:
                return {"output": value}

        for value in inputs.values():
            if value:
                return {"output": value}

        return {"output": ""}
