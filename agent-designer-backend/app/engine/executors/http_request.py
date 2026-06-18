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


def _resolve_url(config: dict) -> str:
    url = (config.get("url") or "").strip()
    if not url:
        raise ValueError(
            "HTTP Request node is missing 'url'. Set it in the node inspector."
        )
    return url


def _resolve_timeout(config: dict) -> float:
    try:
        return float(config.get("timeout", 30) or 30)
    except (TypeError, ValueError):
        return 30.0


def _resolve_body(config: dict, inputs: dict[str, Any]) -> Any:
    """Resolve the request body: explicit config.body, else first upstream input."""
    raw_body = config.get("body")
    if raw_body:
        return _apply_input_template(raw_body, inputs)
    if not inputs:
        return None
    first_value = next((v for v in inputs.values() if v is not None), None)
    return {"input": first_value} if first_value is not None else None


def _build_request_kwargs(method: str, headers: dict, body: Any) -> dict[str, Any]:
    """Assemble the httpx ``request`` kwargs from method + body shape."""
    request_kwargs: dict[str, Any] = {"headers": headers}
    if body is None:
        return request_kwargs
    if method in ("GET", "DELETE", "HEAD") and isinstance(body, dict):
        request_kwargs["params"] = body
    elif isinstance(body, (dict, list)):
        request_kwargs["json"] = body
    else:
        request_kwargs["content"] = str(body)
    return request_kwargs


def _parse_response_body(response: httpx.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return response.text


class HTTPRequestExecutor(BaseExecutor):
    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}

        url = _resolve_url(config)
        method = (config.get("method") or "GET").upper()
        headers = _coerce_dict(config.get("headers"))
        timeout_seconds = _resolve_timeout(config)
        body = _resolve_body(config, inputs)
        request_kwargs = _build_request_kwargs(method, headers, body)

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.request(method, url, **request_kwargs)

        return {
            "output": _parse_response_body(response),
            "status_code": response.status_code,
        }
