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

import ast
import json
import operator
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

# Whitelisted callables (by identity) that may appear as the ``func`` of a
# Call node. Anything else — including attribute calls like ``foo.bar()`` —
# is rejected by ``_SafeEvaluator``.
_SAFE_CALLABLES = frozenset(
    id(v) for v in _SAFE_BUILTINS.values() if callable(v)
)

_BIN_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_UNARY_OPS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
    ast.Not: operator.not_,
}

_CMP_OPS = {
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.In: lambda a, b: a in b,
    ast.NotIn: lambda a, b: a not in b,
    ast.Is: operator.is_,
    ast.IsNot: operator.is_not,
}


class _SafeEvaluator(ast.NodeVisitor):
    """Evaluate a single Python expression against a fixed scope.

    Only a small whitelist of node types is permitted. Anything else —
    including imports, attribute access to dunder methods, lambda/function
    definitions, comprehensions that bind iterables we don't control, and
    arbitrary method calls — raises ``ValueError`` before evaluation.
    """

    def __init__(self, scope: dict[str, Any]) -> None:
        self._scope = scope

    def visit(self, node: ast.AST) -> Any:  # type: ignore[override]
        method = getattr(self, f"visit_{type(node).__name__}", None)
        if not callable(method):
            raise ValueError(
                f"Unsupported expression element: {type(node).__name__}"
            )
        return method(node)

    def visit_Expression(self, node: ast.Expression) -> Any:
        return self.visit(node.body)

    def visit_Constant(self, node: ast.Constant) -> Any:
        return node.value

    def visit_Name(self, node: ast.Name) -> Any:
        if node.id in self._scope:
            return self._scope[node.id]
        if node.id in _SAFE_BUILTINS:
            return _SAFE_BUILTINS[node.id]
        raise ValueError(f"Unknown name in condition: {node.id!r}")

    def visit_BoolOp(self, node: ast.BoolOp) -> Any:
        if isinstance(node.op, ast.And):
            result: Any = True
            for value in node.values:
                result = self.visit(value)
                if not result:
                    return result
            return result
        if isinstance(node.op, ast.Or):
            result = False
            for value in node.values:
                result = self.visit(value)
                if result:
                    return result
            return result
        raise ValueError(f"Unsupported boolean operator: {type(node.op).__name__}")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> Any:
        op = _UNARY_OPS.get(type(node.op))
        if op is None:
            raise ValueError(
                f"Unsupported unary operator: {type(node.op).__name__}"
            )
        return op(self.visit(node.operand))

    def visit_BinOp(self, node: ast.BinOp) -> Any:
        op = _BIN_OPS.get(type(node.op))
        if op is None:
            raise ValueError(
                f"Unsupported binary operator: {type(node.op).__name__}"
            )
        return op(self.visit(node.left), self.visit(node.right))

    def visit_Compare(self, node: ast.Compare) -> Any:
        left = self.visit(node.left)
        for op_node, comparator in zip(node.ops, node.comparators):
            op = _CMP_OPS.get(type(op_node))
            if op is None:
                raise ValueError(
                    f"Unsupported comparison operator: {type(op_node).__name__}"
                )
            right = self.visit(comparator)
            if not op(left, right):
                return False
            left = right
        return True

    def visit_Call(self, node: ast.Call) -> Any:
        # Reject any keyword arguments and starred expansions — keeps the
        # surface area small and matches what the old eval scope offered.
        if node.keywords:
            raise ValueError("Keyword arguments are not allowed in conditions.")
        func = self.visit(node.func)
        if not callable(func) or id(func) not in _SAFE_CALLABLES:
            raise ValueError("Only whitelisted builtin calls are allowed.")
        args = [self.visit(a) for a in node.args]
        return func(*args)

    def visit_Subscript(self, node: ast.Subscript) -> Any:
        target = self.visit(node.value)
        key = self.visit(node.slice)
        return target[key]

    def visit_Slice(self, node: ast.Slice) -> Any:
        lower = self.visit(node.lower) if node.lower is not None else None
        upper = self.visit(node.upper) if node.upper is not None else None
        step = self.visit(node.step) if node.step is not None else None
        return slice(lower, upper, step)

    def visit_Attribute(self, node: ast.Attribute) -> Any:
        # Block dunder access to prevent escapes like ``"".__class__``.
        if node.attr.startswith("_"):
            raise ValueError(f"Attribute access to {node.attr!r} is not allowed.")
        target = self.visit(node.value)
        return getattr(target, node.attr)

    def visit_List(self, node: ast.List) -> Any:
        return [self.visit(elt) for elt in node.elts]

    def visit_Tuple(self, node: ast.Tuple) -> Any:
        return tuple(self.visit(elt) for elt in node.elts)

    def visit_Set(self, node: ast.Set) -> Any:
        return {self.visit(elt) for elt in node.elts}

    def visit_Dict(self, node: ast.Dict) -> Any:
        return {
            (self.visit(k) if k is not None else None): self.visit(v)
            for k, v in zip(node.keys, node.values)
        }

    def visit_IfExp(self, node: ast.IfExp) -> Any:
        return self.visit(node.body) if self.visit(node.test) else self.visit(node.orelse)


def _safe_eval(expr: str, scope: dict[str, Any]) -> Any:
    """Parse ``expr`` and evaluate it via :class:`_SafeEvaluator`."""
    tree = ast.parse(expr, mode="eval")
    return _SafeEvaluator(scope).visit(tree)


def _to_python_expression(expr: str) -> str:
    """Rewrite ``foo.length`` → ``len(foo)`` for JS-style expressions."""
    return _LENGTH_RE.sub(r"len(\1)", expr)


_SENTINEL = object()


def _loads_or_sentinel(text: str) -> Any:
    """Return the parsed JSON value or ``_SENTINEL`` if ``text`` is invalid."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return _SENTINEL


def _strip_fences(text: str) -> str | None:
    """Return ``text`` with leading/trailing markdown fences removed, or ``None``."""
    if not text.startswith("```"):
        return None
    unfenced = re.sub(r"^```(?:json)?\s*", "", text)
    unfenced = re.sub(r"\s*```\s*$", "", unfenced)
    return unfenced


def _extract_fenced_body(text: str) -> str | None:
    """Return the body of the first ```` ```json ... ``` ```` block, or ``None``."""
    fence = re.search(r"```(?:json)?\s*(.+?)\s*```", text, re.DOTALL)
    return fence.group(1) if fence else None


def _find_balanced_object_end(text: str, start: int) -> int:
    """Return the index of the ``}`` that closes the object at ``start``, or ``-1``."""
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
                return i
    return -1


def _scan_balanced_object(text: str) -> Any:
    """Find and parse the first balanced ``{...}`` object in ``text``."""
    start = text.find("{")
    while start != -1:
        end = _find_balanced_object_end(text, start)
        if end == -1:
            break
        parsed = _loads_or_sentinel(text[start : end + 1])
        if parsed is not _SENTINEL:
            return parsed
        start = text.find("{", start + 1)
    return _SENTINEL


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

    # Try each strategy in order. The first one that successfully parses wins.
    candidates = (
        text,
        _strip_fences(text),
        _extract_fenced_body(text),
    )
    for candidate in candidates:
        if candidate is None:
            continue
        parsed = _loads_or_sentinel(candidate)
        if parsed is not _SENTINEL:
            return parsed

    # Brace-walking scan — find the first balanced ``{...}`` object
    # even when surrounded by prose (typical LLM output).
    parsed = _scan_balanced_object(text)
    if parsed is not _SENTINEL:
        return parsed

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
    }
    try:
        return bool(_safe_eval(expr, scope))
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
