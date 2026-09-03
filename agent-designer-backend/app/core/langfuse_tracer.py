"""Langfuse observability integration.

Provides a lightweight singleton that:
  - Initialises the Langfuse client once on first use (guarded by LANGFUSE_ENABLED)
  - Maintains an in-process registry of open Trace objects keyed by execution_id
  - Exposes helpers used by runner.py and model.py

Nothing here raises — every call is fire-and-forget so that a Langfuse
outage never blocks a flow execution.
"""

import logging
from typing import Optional

logger = logging.getLogger("agentflow.langfuse")

# execution_id → langfuse Trace object
_traces: dict[str, object] = {}
_langfuse: Optional[object] = None


def _get_client():
    global _langfuse
    if _langfuse is not None:
        return _langfuse
    try:
        from app.config import settings
        if not settings.langfuse_enabled:
            return None
        from langfuse import Langfuse
        _langfuse = Langfuse(
            public_key=settings.langfuse_public_key or "",
            secret_key=settings.langfuse_secret_key or "",
            host=settings.langfuse_host,
        )
        logger.info("Langfuse client initialised at %s", settings.langfuse_host)
    except Exception as exc:
        logger.warning("Langfuse init failed (tracing disabled): %s", exc)
        _langfuse = None
    return _langfuse


def start_trace(execution_id: str, flow_id: str, input_data: dict) -> None:
    """Create a Langfuse trace for the given execution and cache it."""
    client = _get_client()
    if client is None:
        return
    try:
        trace = client.trace(
            id=execution_id,
            name=f"flow:{flow_id}",
            input=input_data,
            metadata={"flow_id": flow_id, "execution_id": execution_id},
        )
        _traces[execution_id] = trace
    except Exception as exc:
        logger.debug("Langfuse start_trace error: %s", exc)


def get_trace(execution_id: str | None):
    """Return the cached trace for *execution_id*, or None."""
    if not execution_id:
        return None
    return _traces.get(execution_id)


def end_trace(execution_id: str, output: dict, error: str | None = None) -> None:
    """Finalise the trace and flush it to Langfuse."""
    trace = _traces.pop(execution_id, None)
    if trace is None:
        return
    try:
        if error:
            trace.update(output={"error": error}, level="ERROR")
        else:
            trace.update(output=output)
        client = _get_client()
        if client:
            client.flush()
    except Exception as exc:
        logger.debug("Langfuse end_trace error: %s", exc)
