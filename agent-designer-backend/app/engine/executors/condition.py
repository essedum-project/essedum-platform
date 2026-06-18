"""Conditional branching executor.

Evaluates a Python expression against the resolved upstream value and emits
the value on **either** the ``true`` or ``false`` output port (never both).

The compiler reads ``output["_route"]`` (one of ``"true"``/``"false"``) and
follows only the matching outgoing edge.

Recognised ``node.data.config`` fields:
  - ``condition`` (str) — required. A Python expression. The upstream value is
    available as ``value`` (and aliased as ``input``, ``text``, ``message``).

Examples that just work:
  - ``len(value) > 0``
  - ``value == "yes"``
  - ``"error" in value``
  - ``int(value) >= 5``

Light JS-compatibility: ``.length`` is rewritten to ``len(...)`` so the
default UI placeholder (``value.length > 0``) evaluates as expected.
"""

import json
import re
from typing import Any

from app.engine.executors.base import BaseExecutor


_LENGTH_RE = re.compile(r"\b([A-Za-z_][\w]*)\.length\b")

_SAFE_BUILTINS = {
    "len": len,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "abs": abs,
    "min": min,
    "max": max,
    "any": any,
    "all": all,
    "True": True,
    "False": False,
    "None": None,
}


def _to_python_expression(expr: str) -> str:
    """Rewrite ``foo.length`` → ``len(foo)`` for JS-style expressions."""
    return _LENGTH_RE.sub(r"len(\1)", expr)


def _try_parse_json(value: Any) -> Any:
    """Extract and parse the first JSON object from ``value``.

    Handles:
      - The value is already a non-string object → returned as-is.
      - Clean JSON string.
      - Markdown-fenced JSON (``` ```json ... ``` ```).
      - JSON object embedded in surrounding prose (LLM output).

    Returns the original ``value`` unchanged if no valid JSON is found.
    """
    if not isinstance(value, str):
        return value
    text = value.strip()
    if not text:
        return value

    # 1. Direct parse (fast path for clean JSON).
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        pass

    # 2. Markdown fences — strip and retry.
    if text.startswith("```"):
        unfenced = re.sub(r"^```(?:json)?\s*", "", text)
        unfenced = re.sub(r"\s*```\s*$", "", unfenced)
        try:
            return json.loads(unfenced)
        except (json.JSONDecodeError, ValueError):
            pass
    # Fence block anywhere in the body.
    fence = re.search(r"```(?:json)?\s*(.+?)\s*```", text, re.DOTALL)
    if fence:
        try:
            return json.loads(fence.group(1))
        except (json.JSONDecodeError, ValueError):
            pass

    # 3. Brace-walking scan — find the first balanced ``{...}`` object
    #    even when surrounded by prose (typical LLM output).
    start = text.find("{")
    while start != -1:
        depth = 0
        in_str = False
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
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
                    try:
                        return json.loads(text[start : i + 1])
                    except (json.JSONDecodeError, ValueError):
                        break
        start = text.find("{", start + 1)

    # Nothing parsed — return the original string so substring expressions
    # like ``"relatedParty" in value`` still work.
    return value


def _evaluate(expr: str, value: Any) -> bool:
    expr = _to_python_expression(expr.strip())
    if not expr:
        raise ValueError("Condition expression is empty.")

    parsed = _try_parse_json(value)

    scope = {
        "value": value,
        "input": value,
        "text": value,
        "message": value,
        # Pre-parsed convenience: if `value` was a JSON string, ``parsed`` and
        # ``data`` are the decoded object; otherwise they equal ``value``.
        "parsed": parsed,
        "data": parsed,
        # Useful helpers exposed to the expression sandbox.
        "json": json,
        "re": re,
    }
    try:
        return bool(eval(expr, {"__builtins__": _SAFE_BUILTINS}, scope))  # noqa: S307
    except (KeyError, IndexError, TypeError, AttributeError):
        # Data-access failures (missing dict key, indexing into a string, etc.)
        # are treated as a "false" outcome rather than a hard error. Branching
        # nodes should *always* pick a route — if upstream data is malformed,
        # we go down the ``false`` branch so the flow can recover gracefully.
        return False
    except Exception as exc:
        # Syntax errors, NameError on unknown helpers, etc. are real bugs in
        # the user's expression and should surface to the inspector.
        raise ValueError(
            f"Failed to evaluate condition {expr!r}: {type(exc).__name__}: {exc}"
        ) from exc


class ConditionExecutor(BaseExecutor):
    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        expression = config.get("condition") or config.get("expression") or ""
        if not expression:
            raise ValueError(
                "Condition node is missing 'condition'. Set the expression in the node inspector."
            )

        # Resolve upstream value. The frontend port id is "value", but we also
        # accept "input"/"text"/"message" for flexibility.
        value = inputs.get("value")
        if value is None:
            for key in ("input", "text", "message"):
                if inputs.get(key) is not None:
                    value = inputs[key]
                    break
        if value is None and inputs:
            value = next(iter(inputs.values()))

        result = _evaluate(expression, value)
        route = "true" if result else "false"

        return {
            route: value,
            "_route": route,
            "_condition_result": result,
        }
