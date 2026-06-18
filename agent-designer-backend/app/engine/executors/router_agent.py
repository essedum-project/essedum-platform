"""Router-agent executor.

Selects exactly one of the outgoing routes (``route_a`` / ``route_b`` / ``route_c``)
based on either:
  1. **Keyword rules** parsed from ``routing_prompt`` — preferred, deterministic,
     no LLM required. Format (one rule per line)::

         route_a: greet, hello, hi
         route_b: bye, goodbye
         route_c: *               # default / fallback

  2. **LLM classifier** — if ``provider`` and ``classifier_model`` are configured
     and no keyword rule matches, the input is sent to the LLM along with the
     routing prompt and the model is asked to reply with a single route name.

The compiler reads ``output["_route"]`` and follows only the matching outgoing
edge.

Recognised ``node.data.config`` fields (all optional):
  - ``routing_prompt``    (str) — keyword rules and/or natural-language description
  - ``classifier_model``  (str) — e.g. ``gpt-4o-mini``
  - ``provider``          (str) — passed to ``get_connector`` (default ``ollama``)
  - ``available_routes``  (list[str]) — overrides the default ``["route_a","route_b","route_c"]``
"""

from __future__ import annotations

import re
from typing import Any

from app.engine.executors.base import BaseExecutor


DEFAULT_ROUTES: tuple[str, ...] = ("route_a", "route_b", "route_c")
_RULE_RE = re.compile(r"^\s*([A-Za-z_][\w]*)\s*:\s*(.+?)\s*$")


def _parse_keyword_rules(prompt: str) -> list[tuple[str, list[str]]]:
    """Parse ``route_x: kw1, kw2, *`` lines into ``[(route, [keywords])]``."""
    rules: list[tuple[str, list[str]]] = []
    if not prompt:
        return rules
    for line in prompt.splitlines():
        m = _RULE_RE.match(line)
        if not m:
            continue
        route = m.group(1).strip().lower()
        keywords = [k.strip().lower() for k in m.group(2).split(",") if k.strip()]
        if route and keywords:
            rules.append((route, keywords))
    return rules


def _match_keywords(
    rules: list[tuple[str, list[str]]],
    text: str,
    available: list[str],
) -> str | None:
    needle = (text or "").lower()
    # Tokenise on word boundaries so e.g. keyword "hi" doesn't match
    # the "hi" inside "something".
    tokens = set(re.findall(r"[a-z0-9_]+", needle))
    fallback: str | None = None
    for route, keywords in rules:
        if route not in available:
            continue
        for kw in keywords:
            if kw == "*":
                fallback = route
                continue
            if not kw:
                continue
            # Multi-word keyword → fall back to substring match.
            if " " in kw:
                if kw in needle:
                    return route
            elif kw in tokens:
                return route
    return fallback


async def _classify_with_llm(
    provider: str,
    model: str,
    routing_prompt: str,
    user_input: str,
    available: list[str],
) -> str | None:
    """Ask an LLM to pick a route. Returns ``None`` on any failure."""
    try:
        from app.engine.connectors import get_connector

        connector = get_connector(provider)
        system = (
            "You are a strict classifier. Read the input and pick exactly one "
            f"route from this list: {available}. "
            "Reply with ONLY the route name and nothing else."
        )
        if routing_prompt:
            system += f"\n\nRouting instructions:\n{routing_prompt}"
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user_input},
        ]
        reply = await connector.chat(model=model, messages=messages)
    except Exception:
        return None

    answer = (reply or "").strip().lower()
    for route in available:
        if route.lower() == answer or route.lower() in answer:
            return route
    return None


class RouterAgentExecutor(BaseExecutor):
    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        routing_prompt: str = (config.get("routing_prompt") or "").strip()
        classifier_model: str = (config.get("classifier_model") or "").strip()
        provider: str = (config.get("provider") or "ollama").strip()

        # Determine which routes are actually wired downstream of this node so
        # we never pick a dead-end route.
        definition = (node.get("data") or {}).get("definition") or {}
        outputs_def = definition.get("outputs") or []
        defined_routes = [str(o.get("id")) for o in outputs_def if o.get("id")]
        available = config.get("available_routes") or defined_routes or list(DEFAULT_ROUTES)
        available = [r for r in available if r]  # drop empties

        if not available:
            raise ValueError(
                "Router Agent has no available routes. "
                "Define output ports (route_a/route_b/...) on the node."
            )

        # Resolve the routable value from inputs.
        value: Any = inputs.get("input")
        if value is None:
            for key in ("text", "message", "prompt", "value"):
                if inputs.get(key) is not None:
                    value = inputs[key]
                    break
        if value is None and inputs:
            value = next(iter(inputs.values()))
        if value is None:
            value = ""

        # 1) Keyword rules
        rules = _parse_keyword_rules(routing_prompt)
        chosen = _match_keywords(rules, str(value), available)

        # 2) LLM classifier (only if model is configured and no keyword match)
        if not chosen and classifier_model:
            chosen = await _classify_with_llm(
                provider, classifier_model, routing_prompt, str(value), available
            )

        # 3) Final fallback — first available route
        if not chosen:
            chosen = available[0]

        return {chosen: value, "_route": chosen}
