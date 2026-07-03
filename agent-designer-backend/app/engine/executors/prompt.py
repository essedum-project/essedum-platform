import re
from typing import Any
from app.engine.executors.base import BaseExecutor


# Matches a single brace-pair placeholder like ``{name}`` or ``{ name }``.
# Excludes already-doubled braces (``{{`` / ``}}``) so JSON examples and other
# literal-brace content can coexist with templated variables.
_PLACEHOLDER_RE = re.compile(r"(?<!\{)\{\s*([A-Za-z_][\w\.]*)\s*\}(?!\})")


def _safe_substitute(template: str, mapping: dict[str, Any]) -> str:
    """Replace ``{key}`` with ``mapping[key]`` only for keys present in
    ``mapping``. Any other ``{...}`` content is left untouched, so authors
    can paste raw JSON / curly-brace examples into prompts without escaping.

    Doubled braces ``{{`` / ``}}`` are likewise preserved verbatim.
    """
    def _replace(match: re.Match[str]) -> str:
        key = match.group(1)
        if key in mapping:
            return str(mapping[key])
        # Unknown key -> leave the original ``{key}`` text in place.
        return match.group(0)

    return _PLACEHOLDER_RE.sub(_replace, template)


class PromptExecutor(BaseExecutor):
    """
    Formats a prompt template using a permissive ``{key}`` substitution.

    Template syntax: use ``{input}``, ``{message}``, ``{history}``, ``{variables}``
    or any key that arrives in the inputs dict. Literal ``{`` / ``}`` (e.g. JSON
    examples) are left untouched as long as the enclosed token isn't a key we
    can substitute — no escaping required.
    """

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        template: str = config.get("template", "{input}")
        system_message: str | None = config.get("system_message")

        # Build substitution map: inputs + context variables
        sub_map: dict[str, Any] = {**inputs}
        # Flatten history list to readable string if present
        if "history" in sub_map and isinstance(sub_map["history"], list):
            sub_map["history"] = "\n".join(
                f"{e.get('role','?')}: {e.get('content','')}"
                for e in sub_map["history"]
            )

        formatted = _safe_substitute(template, sub_map)

        return {
            "prompt": formatted,
            "system_message": system_message or "",
        }
