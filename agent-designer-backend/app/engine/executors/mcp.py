import json
import re
from typing import Any
from app.engine.executors.base import BaseExecutor


def _flatten_exception(exc: BaseException) -> str:
    """anyio TaskGroups wrap real errors in BaseExceptionGroup. Unwrap them
    so the user sees the actual underlying message instead of the cryptic
    'unhandled errors in a TaskGroup (1 sub-exception)'.
    """
    if isinstance(exc, BaseExceptionGroup):
        parts: list[str] = []
        for sub in exc.exceptions:
            parts.append(_flatten_exception(sub))
        joined = " | ".join(p for p in parts if p)
        return joined or f"{type(exc).__name__}: {exc}"
    return f"{type(exc).__name__}: {exc}"


def _extract_json_object(text: str) -> Any:
    """Best-effort JSON extraction from an LLM response.

    Handles, in order:
      1. The whole string is valid JSON.
      2. Markdown-fenced JSON ```` ```json ... ``` ````.
      3. A bare JSON object embedded in surrounding prose — finds the first
         ``{`` and walks forward respecting brace/string nesting until the
         matching ``}``.

    Returns the parsed Python object on success, otherwise raises
    ``json.JSONDecodeError``.
    """
    if not isinstance(text, str):
        return text
    stripped = text.strip()
    if not stripped:
        raise json.JSONDecodeError("empty input", text, 0)

    # 1. Direct parse.
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # 2. Markdown fences.
    if stripped.startswith("```"):
        unfenced = re.sub(r"^```(?:json)?\s*", "", stripped)
        unfenced = re.sub(r"\s*```\s*$", "", unfenced)
        try:
            return json.loads(unfenced)
        except json.JSONDecodeError:
            pass
    # Also try fenced block anywhere in the body.
    fence_match = re.search(r"```(?:json)?\s*(.+?)\s*```", stripped, re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Brace-walking scan for the first balanced ``{...}`` object.
    start = stripped.find("{")
    while start != -1:
        depth = 0
        in_str = False
        escape = False
        for i in range(start, len(stripped)):
            ch = stripped[i]
            if in_str:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    candidate = stripped[start : i + 1]
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        break  # try next ``{`` after this one
        start = stripped.find("{", start + 1)

    # Nothing worked — let json.loads emit the canonical error.
    return json.loads(stripped)


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

        # Static extra arguments merged with the live input.
        # Accepts either:
        #   - ``arguments`` (already a dict, e.g. from a future JSON-config field)
        #   - ``arguments_json`` (a JSON string the user pastes into a text field)
        static_args: dict = {}
        raw_args = config.get("arguments")
        if isinstance(raw_args, dict):
            static_args.update(raw_args)
        raw_json = config.get("arguments_json")
        if isinstance(raw_json, str) and raw_json.strip():
            try:
                parsed_json = json.loads(raw_json)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"MCP node 'arguments_json' is not valid JSON: {exc}"
                ) from exc
            if not isinstance(parsed_json, dict):
                raise ValueError(
                    "MCP node 'arguments_json' must decode to a JSON object."
                )
            static_args.update(parsed_json)

        # Name of the tool argument that should receive the upstream value.
        # Defaults to "input" for back-compat. Special value ``"*"`` means
        # "the upstream value is itself a JSON object — unpack it as the
        # entire tool-arguments dict" (handy for TMF645-style schemas where
        # the LLM emits the full payload).
        arg_name = (config.get("arg_name") or "input").strip() or "input"

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

        tool_args: dict = {**static_args}

        if arg_name == "*":
            # Unpack mode: parse upstream value as JSON and merge into tool_args.
            unpacked: Any = input_value
            if isinstance(unpacked, str):
                try:
                    unpacked = _extract_json_object(unpacked)
                except json.JSONDecodeError as exc:
                    preview = unpacked.strip()[:300]
                    raise ValueError(
                        "MCP node has arg_name='*' (unpack mode) but no JSON "
                        f"object could be extracted from the upstream value: "
                        f"{exc}. Upstream value preview: {preview!r}"
                    ) from exc
            if not isinstance(unpacked, dict):
                raise ValueError(
                    "MCP node arg_name='*' (unpack mode) requires the upstream "
                    f"value to decode to a JSON object, got {type(unpacked).__name__}."
                )
            # Static args take precedence (so users can force overrides);
            # change to ``unpacked, **static_args`` reversal if you want the
            # opposite. Document it clearly either way.
            tool_args = {**unpacked, **static_args}
        else:
            # If the user already supplied a value for arg_name via static args,
            # respect it; otherwise inject the live upstream value.
            if arg_name not in tool_args:
                tool_args[arg_name] = input_value

        try:
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
        except BaseExceptionGroup as eg:
            raise RuntimeError(
                f"MCP transport failure for {server_url!r}: {_flatten_exception(eg)}"
            ) from eg
        except ValueError:
            raise
        except Exception as exc:
            raise RuntimeError(
                f"MCP transport failure for {server_url!r}: "
                f"{type(exc).__name__}: {exc}"
            ) from exc

        # result.content is a list of content blocks; join text parts
        parts = [
            block.text
            for block in (result.content or [])
            if hasattr(block, "text")
        ]
        return {"result": "\n".join(parts)}
