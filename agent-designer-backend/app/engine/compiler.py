"""
Flow compiler: converts AgentFlow JSON (nodes + edges) into a LangGraph StateGraph.

How it works
------------
Each node in the flow becomes a LangGraph node function that:
  1. Resolves its inputs from the shared AgentFlowState using the same edge-based
     resolution logic that graph.resolve_inputs() uses.
  2. Calls the existing BaseExecutor.execute() — no executor changes required.
  3. Writes its output back into state["node_outputs"][node_id].

Conditional edges (V2 — not yet wired) will read a routing key out of a
special "condition" node output to select the next node dynamically.

State schema
------------
AgentFlowState is a TypedDict with:
  - node_outputs : running dict of {node_id: output_dict}
  - execution_id : str (for broadcast hooks)
  - context      : the original execution context (db, flow_id, session_id, input)
  - error        : last error message (if any)
"""

from __future__ import annotations

import logging
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.engine.executors import EXECUTOR_REGISTRY, get_executor
from app.engine.graph import build_adjacency, get_node_by_id, get_node_type, resolve_inputs

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared state
# ---------------------------------------------------------------------------

class AgentFlowState(TypedDict):
    node_outputs: dict[str, Any]   # keyed by node_id
    execution_id: str
    context: dict[str, Any]        # flow_id, session_id, input, db, …
    error: str | None              # set on first node failure


# ---------------------------------------------------------------------------
# Compiler
# ---------------------------------------------------------------------------

def compile_flow(
    nodes: list[dict],
    edges: list[dict],
    *,
    broadcast_fn: Any | None = None,
    log_fn: Any | None = None,
) -> Any:
    """
    Compile a flow into a LangGraph CompiledGraph.

    Parameters
    ----------
    nodes        : list of node dicts from the flow JSON
    edges        : list of edge dicts from the flow JSON
    broadcast_fn : async (execution_id, message_dict) → None  (optional)
    log_fn       : async (db, execution_id, node_id, level, msg) → None  (optional)

    Returns a CompiledGraph (call `await graph.ainvoke(state)` to execute).
    """
    graph = StateGraph(AgentFlowState)
    adj = build_adjacency(nodes, edges)

    # --- Add one LangGraph node per flow node ---
    for node in nodes:
        node_id: str = node["id"]
        node_type: str = get_node_type(node)

        # Capture by value in closure
        def make_node_fn(n: dict, nt: str, nid: str):
            async def node_fn(state: AgentFlowState) -> dict:
                # Skip if a previous node already errored
                if state.get("error"):
                    return {}

                ctx = state["context"]
                node_outputs = state["node_outputs"]

                # Resolve upstream inputs via edges
                inputs = resolve_inputs(nid, edges, node_outputs)

                # Broadcast node_started
                if broadcast_fn:
                    await broadcast_fn(state["execution_id"], {
                        "event": "node_started",
                        "execution_id": state["execution_id"],
                        "node_id": nid,
                        "node_type": nt,
                    })

                try:
                    executor = get_executor(nt)
                    output = await executor.execute(n, inputs, ctx)

                    # Persist output into shared state
                    updated_outputs = {**node_outputs, nid: output}

                    if log_fn:
                        await log_fn(
                            ctx["db"], state["execution_id"], nid,
                            "success", f"Node '{nid}' completed successfully."
                        )
                    if broadcast_fn:
                        await broadcast_fn(state["execution_id"], {
                            "event": "node_completed",
                            "execution_id": state["execution_id"],
                            "node_id": nid,
                            "node_type": nt,
                            "output": output,
                        })

                    return {"node_outputs": updated_outputs}

                except Exception as exc:
                    logger.exception("Node %s (%s) failed: %s", nid, nt, exc)
                    if log_fn:
                        await log_fn(
                            ctx["db"], state["execution_id"], nid,
                            "error", f"Node '{nid}' failed: {exc}"
                        )
                    if broadcast_fn:
                        await broadcast_fn(state["execution_id"], {
                            "event": "node_error",
                            "execution_id": state["execution_id"],
                            "node_id": nid,
                            "error": str(exc),
                        })
                    return {"error": str(exc)}

            node_fn.__name__ = f"node_{nid}"
            return node_fn

        graph.add_node(node_id, make_node_fn(node, node_type, node_id))

    # --- Wire edges ---
    # Find source nodes (no incoming edges) → connect from START
    all_targets = {e["target"] for e in edges}
    source_nodes = [n["id"] for n in nodes if n["id"] not in all_targets]

    for nid in source_nodes:
        graph.add_edge(START, nid)

    # Add normal edges between flow nodes
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        # Both nodes must exist in the graph
        src_exists = any(n["id"] == src for n in nodes)
        tgt_exists = any(n["id"] == tgt for n in nodes)
        if src_exists and tgt_exists:
            graph.add_edge(src, tgt)

    # Find sink nodes (no outgoing edges) → connect to END
    all_sources = {e["source"] for e in edges}
    sink_nodes = [n["id"] for n in nodes if n["id"] not in all_sources]

    for nid in sink_nodes:
        graph.add_edge(nid, END)

    # Compile without checkpointer (stateless V1).
    # For V2 human-in-the-loop, pass: checkpointer=SqliteSaver.from_conn_string("...")
    return graph.compile()
