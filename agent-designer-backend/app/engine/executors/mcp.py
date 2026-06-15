import json
from typing import Any
from app.engine.executors.base import BaseExecutor


class MCPExecutor(BaseExecutor):
    """
    Invokes a tool on an MCP-compatible server using the mcp Python SDK.
    Supports HTTP/SSE transport (Streamable HTTP).
    """

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client

        config: dict = (node.get("data") or {}).get("config") or {}

        server_url = config.get("server_url")
        if not server_url:
            raise ValueError(
                "MCP node is missing 'server_url'. Set it in the node inspector."
            )

        # Resolve which tool to call. Accept any of:
        #   - tool_name        (explicit single tool)
        #   - tool_filter      (frontend field — comma-separated; we use the first)
        #   - <auto>           (if the server exposes exactly one tool, use it)
        tool_name = (config.get("tool_name") or "").strip()
        if not tool_name:
            tf = config.get("tool_filter")
            if isinstance(tf, str) and tf.strip():
                first = tf.split(",")[0].strip()
                if first:
                    tool_name = first

        # Static extra arguments merged with the live input
        static_args: dict = config.get("arguments") or {}

        input_value = (
            inputs.get("input")
            or inputs.get("message")
            or inputs.get("prompt")
            or inputs.get("text")
            or inputs.get("content")
        )
        if not input_value:
            # Fall back to the first non-empty upstream value.
            for v in inputs.values():
                if v:
                    input_value = v
                    break
        if input_value is None:
            input_value = ""

        tool_args: dict = {**static_args, "input": input_value}

        async with streamablehttp_client(server_url) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Auto-pick the only tool when the user hasn't named one.
                if not tool_name:
                    listed = await session.list_tools()
                    available = [t.name for t in (listed.tools or [])]
                    if len(available) == 1:
                        tool_name = available[0]
                    elif len(available) == 0:
                        raise ValueError(
                            f"MCP server {server_url!r} exposes no tools."
                        )
                    else:
                        raise ValueError(
                            "MCP node has no 'tool_name' (or single-entry 'tool_filter') "
                            f"and the server exposes multiple tools: {available}. "
                            "Set one in the node inspector."
                        )

                result = await session.call_tool(tool_name, arguments=tool_args)

        # result.content is a list of content blocks; join text parts
        parts = [
            block.text
            for block in (result.content or [])
            if hasattr(block, "text")
        ]
        return {"result": "\n".join(parts)}
