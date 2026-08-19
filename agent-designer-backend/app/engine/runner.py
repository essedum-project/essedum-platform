"""
Flow execution runner.

Responsibilities:
  - Validate all nodes are V1-supported
  - Create + update Execution records
  - Compile flow JSON into a LangGraph StateGraph and invoke it
  - Broadcast real-time events over WebSocket (via in-process asyncio.Queue)
  - Persist per-node ExecutionLog records
  - Expose ConnectionManager for WS clients
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.compiler import AgentFlowState, compile_flow
from app.engine.executors import get_executor
from app.engine.graph import get_node_type
from app.models.execution import Execution, ExecutionLog, ExecutionStatus, LogLevel

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# WebSocket connection manager (in-process asyncio.Queue fan-out)
# ---------------------------------------------------------------------------

class ConnectionManager:
    def __init__(self) -> None:
        # execution_id → list of (WebSocket, Queue) pairs
        self._connections: dict[str, list[tuple[WebSocket, asyncio.Queue]]] = {}

    async def connect(self, execution_id: str, ws: WebSocket) -> asyncio.Queue:
        await ws.accept()
        queue: asyncio.Queue = asyncio.Queue()
        self._connections.setdefault(execution_id, []).append((ws, queue))
        return queue

    def disconnect(self, execution_id: str, ws: WebSocket, queue: asyncio.Queue) -> None:
        pairs = self._connections.get(execution_id, [])
        self._connections[execution_id] = [(w, q) for w, q in pairs if w is not ws]
        # signal sender task to exit
        try:
            queue.put_nowait(None)
        except asyncio.QueueFull:
            pass

    async def broadcast(self, execution_id: str, message: dict) -> None:
        payload = json.dumps(message)
        for _ws, queue in list(self._connections.get(execution_id, [])):
            try:
                await queue.put(payload)
            except Exception:
                pass


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Core runner
# ---------------------------------------------------------------------------

async def run_flow(
    *,
    flow_id: str,
    input_data: dict[str, Any],
    db: AsyncSession,
    execution_id: str | None = None,
) -> str:
    """
    Create an Execution record, compile the flow into a LangGraph StateGraph,
    invoke it, and return the execution_id.

    Intended to be called inside a FastAPI BackgroundTask.
    """
    from app.models.flow import Flow

    # ── Load flow ──────────────────────────────────────────────────────────
    row = await db.get(Flow, flow_id)
    if row is None:
        raise ValueError(f"Flow '{flow_id}' not found.")

    nodes: list[dict] = row.nodes or []
    edges: list[dict] = row.edges or []

    # ── Create or update Execution record ────────────────────────────────────
    if execution_id:
        # Endpoint pre-created the record; update it to running
        execution = await db.get(Execution, execution_id)
        if execution is None:
            raise ValueError(f"Execution '{execution_id}' not found.")
        execution.status = ExecutionStatus.running
        execution.started_at = datetime.now(timezone.utc)
        await db.flush()
    else:
        execution = Execution(
            id=str(uuid.uuid4()),
            flow_id=flow_id,
            status=ExecutionStatus.running,
            started_at=datetime.now(timezone.utc),
            input=input_data,
        )
        db.add(execution)
        await db.flush()
        execution_id = execution.id

    # ── Build execution context (passed through LangGraph state) ───────────
    session_id: str | None = input_data.get("session_id")
    ctx: dict[str, Any] = {
        "flow_id": flow_id,
        "execution_id": execution_id,
        "session_id": session_id,
        "input": input_data,
        "db": db,
        "log_fn": _log,
    }

    await manager.broadcast(execution_id, {
        "event": "execution_started",
        "execution_id": execution_id,
    })

    # ── Validate V1 node types (after execution record exists so we can mark error) ──
    try:
        for node in nodes:
            get_executor(get_node_type(node))  # raises for unsupported types
    except Exception as exc:
        await _fail_execution(execution, db, str(exc))
        return execution_id

    # ── Compile flow → LangGraph StateGraph ───────────────────────────────
    try:
        compiled = compile_flow(
            nodes,
            edges,
            broadcast_fn=manager.broadcast,
            log_fn=_log,
        )
    except Exception as exc:
        await _fail_execution(execution, db, str(exc))
        return execution_id

    # ── Invoke LangGraph graph ─────────────────────────────────────────────
    # Derive a recursion limit that gives enough headroom for cyclic flows.
    # Each feedback-evaluator loop iteration visits ~2 nodes; multiply by 4 for
    # safety and add 10 for all non-looping nodes in the flow.
    from app.engine.graph import get_node_type as _get_node_type
    _max_iter = max(
        (
            int((n.get("data") or {}).get("config", {}).get("max_iterations") or 3)
            for n in nodes
            if _get_node_type(n) == "feedback_evaluator"
        ),
        default=3,
    )
    _recursion_limit = _max_iter * 4 + 10

    initial_state: AgentFlowState = {
        "node_outputs": {},
        "execution_id": execution_id,
        "context": ctx,
        "error": None,
        "loop_counts": {},
    }

    try:
        final_state: AgentFlowState = await compiled.ainvoke(
            initial_state,
            {"recursion_limit": _recursion_limit},
        )
    except Exception as exc:
        logger.exception("LangGraph invocation failed: %s", exc)
        await _fail_execution(execution, db, str(exc))
        return execution_id

    # ── Handle error propagated through state ─────────────────────────────
    if final_state.get("error"):
        await _fail_execution(execution, db, final_state["error"])
        return execution_id

    # ── Collect final output from chat_output node ─────────────────────────
    final_output: dict = {}
    for node in nodes:
        if get_node_type(node) == "chat_output":
            final_output = final_state["node_outputs"].get(node["id"], {})
            break

    # ── Mark completed ─────────────────────────────────────────────────────
    execution.status = ExecutionStatus.completed
    execution.completed_at = datetime.now(timezone.utc)
    execution.output = final_output
    await db.commit()

    await manager.broadcast(execution_id, {
        "event": "execution_completed",
        "execution_id": execution_id,
        "output": final_output,
    })

    return execution_id


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _log(
    db: AsyncSession,
    execution_id: str,
    node_id: str,
    level: LogLevel | str,
    message: str,
    detail: dict | None = None,
) -> None:
    # Accept both LogLevel enum values and plain strings from the compiler
    if isinstance(level, str):
        level = LogLevel(level)
    log = ExecutionLog(
        id=str(uuid.uuid4()),
        execution_id=execution_id,
        node_id=node_id,
        level=level,
        message=message,
        detail=detail or {},
        timestamp=datetime.now(timezone.utc),
    )
    db.add(log)
    # Do NOT flush here — the session is shared across concurrent LangGraph node
    # coroutines; concurrent flushes cause "Session is already flushing".
    # All log rows are flushed together at the final db.commit().


async def _fail_execution(
    execution: Execution,
    db: AsyncSession,
    error: str,
) -> None:
    # Roll back any partial/poisoned transaction before writing the error state.
    # This is necessary when a concurrent flush inside a LangGraph node has
    # already left the session in a PendingRollbackError state.
    try:
        await db.rollback()
    except Exception:
        pass
    execution.status = ExecutionStatus.error
    execution.completed_at = datetime.now(timezone.utc)
    execution.error = error
    try:
        await db.commit()
    except Exception as commit_exc:
        logger.warning("Could not persist execution error state: %s", commit_exc)
    await manager.broadcast(execution.id, {
        "event": "execution_error",
        "execution_id": execution.id,
        "error": error,
    })
