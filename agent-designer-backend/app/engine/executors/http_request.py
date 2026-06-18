"""Executor for the frontend's "HTTP Request" node.

Makes an HTTP call using ``httpx`` and returns the parsed JSON (when possible)
or the raw text body, along with the status code.

Recognised ``node.data.config`` fields (all optional unless noted):
  - ``url``      str   — request URL (required)
  - ``method``   str   — HTTP method, default ``"GET"``
  - ``headers``  dict | str — request headers (JSON string accepted)
  - ``body``     dict | str — request body (JSON string accepted; templated below)
  - ``timeout``  number — request timeout in **seconds** (default 30)

The body is templated against the resolved upstream ``inputs``:
  - If ``body`` contains ``{input}``, ``{message}``, ``{text}`` etc. as a string,
    each occurrence is substituted with the matching upstream value.
  - If no ``body`` is configured but the node has upstream inputs, we send the
    first non-empty input under the key ``"input"``.
"""

import json
from typing import Any

import httpx

from app.engine.executors.base import BaseExecutor


def _coerce_dict(value: Any) -> dict:
    if isinstance(value, dict):
        return value
    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass
    return {}


def _apply_input_template(body: Any, inputs: dict[str, Any]) -> Any:
    """Replace ``{key}`` placeholders in string bodies with input values."""
    if isinstance(body, str) and inputs:
        rendered = body
        for k, v in inputs.items():
            rendered = rendered.replace("{" + str(k) + "}", "" if v is None else str(v))
        try:
            return json.loads(rendered)
        except json.JSONDecodeError:
            return rendered
    return body


class HTTPRequestExecutor(BaseExecutor):
    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}

        url = (config.get("url") or "").strip()
        if not url:
            raise ValueError(
                "HTTP Request node is missing 'url'. Set it in the node inspector."
            )

        method = (config.get("method") or "GET").upper()
        headers = _coerce_dict(config.get("headers"))

        try:
            timeout_seconds = float(config.get("timeout", 30) or 30)
        except (TypeError, ValueError):
            timeout_seconds = 30.0

        # Resolve body: prefer explicit config.body, fall back to upstream input.
        raw_body = config.get("body")
        body: Any = _apply_input_template(raw_body, inputs) if raw_body else None

        if body is None and inputs:
            first_value = next((v for v in inputs.values() if v is not None), None)
            if first_value is not None:
                body = {"input": first_value}

        request_kwargs: dict[str, Any] = {"headers": headers}
        if method in ("GET", "DELETE", "HEAD") and isinstance(body, dict):
            request_kwargs["params"] = body
        elif body is not None:
            if isinstance(body, (dict, list)):
                request_kwargs["json"] = body
            else:
                request_kwargs["content"] = str(body)

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.request(method, url, **request_kwargs)

        try:
            parsed: Any = response.json()
        except ValueError:
            parsed = response.text

        return {
            "output": parsed,
            "status_code": response.status_code,
        }
