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


def _keyword_matches(keyword: str, needle: str, tokens: set[str]) -> bool:
    """Return ``True`` if ``keyword`` matches the input.

    Multi-word keywords use substring match; single-word keywords match on
    whole-token boundaries to avoid spurious hits inside other words.
    """
    if not keyword:
        return False
    if " " in keyword:
        return keyword in needle
    return keyword in tokens


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
            if _keyword_matches(kw, needle, tokens):
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


def _resolve_input_value(inputs: dict[str, Any]) -> Any:
    """Pick the routable value from upstream inputs.

    Tries ``input`` first, then a few common aliases, then any non-``None``
    input, finally an empty string.
    """
    for key in ("input", "text", "message", "prompt", "value"):
        candidate = inputs.get(key)
        if candidate is not None:
            return candidate
    if inputs:
        return next(iter(inputs.values()))
    return ""


def _defined_route_ids(node: dict) -> list[str]:
    """Return the route ids declared as output ports on the node."""
    definition = (node.get("data") or {}).get("definition") or {}
    outputs_def = definition.get("outputs") or []
    return [str(o.get("id")) for o in outputs_def if o.get("id")]


def _resolve_available_routes(node: dict, config: dict) -> list[str]:
    """Return the list of routes actually wired/declared on the node."""
    candidates = (
        config.get("available_routes")
        or _defined_route_ids(node)
        or list(DEFAULT_ROUTES)
    )
    return [r for r in candidates if r]


def _router_config(node: dict) -> dict[str, str]:
    """Extract and normalise the router-agent's config block."""
    config: dict = (node.get("data") or {}).get("config") or {}
    return {
        "raw": config,
        "routing_prompt": (config.get("routing_prompt") or "").strip(),
        "classifier_model": (config.get("classifier_model") or "").strip(),
        "provider": (config.get("provider") or "ollama").strip(),
    }


class RouterAgentExecutor(BaseExecutor):
    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        cfg = _router_config(node)
        available = _resolve_available_routes(node, cfg["raw"])
        if not available:
            raise ValueError(
                "Router Agent has no available routes. "
                "Define output ports (route_a/route_b/...) on the node."
            )

        value: Any = _resolve_input_value(inputs)
        chosen = await self._choose_route(cfg, str(value), available)
        return {chosen: value, "_route": chosen}

    @staticmethod
    async def _choose_route(
        cfg: dict[str, str], text: str, available: list[str]
    ) -> str:
        """Pick a route via keyword rules → LLM classifier → first available."""
        rules = _parse_keyword_rules(cfg["routing_prompt"])
        chosen = _match_keywords(rules, text, available)
        if chosen:
            return chosen
        if cfg["classifier_model"]:
            chosen = await _classify_with_llm(
                cfg["provider"], cfg["classifier_model"],
                cfg["routing_prompt"], text, available,
            )
            if chosen:
                return chosen
        return available[0]
