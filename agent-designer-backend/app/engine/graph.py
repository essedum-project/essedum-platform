from collections import defaultdict, deque
from typing import Any


def build_adjacency(nodes: list[dict], edges: list[dict]) -> dict[str, list[str]]:
    """Returns node_id → list of downstream node_ids."""
    adj: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        adj[edge["source"]].append(edge["target"])
    return adj


def topological_sort(
    nodes: list[dict],
    edges: list[dict],
    *,
    allow_cycles: bool = False,
) -> list[str]:
    """
    Kahn's algorithm.
    Raises ValueError on cycle detection unless allow_cycles=True.

    Note: the LangGraph compiler (compiler.py) does NOT call this function —
    it lets LangGraph handle node ordering natively, which supports cycles for
    agent-loop nodes. This function is retained for validation and dry-run paths.
    """
    node_ids = {n["id"] for n in nodes}
    in_degree: dict[str, int] = {nid: 0 for nid in node_ids}

    for edge in edges:
        if edge["target"] in in_degree:
            in_degree[edge["target"]] += 1

    queue: deque[str] = deque(
        nid for nid, deg in in_degree.items() if deg == 0
    )
    order: list[str] = []

    # Build reverse adjacency for in-degree updates
    adj = build_adjacency(nodes, edges)

    while queue:
        nid = queue.popleft()
        order.append(nid)
        for neighbor in adj.get(nid, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(node_ids):
        if not allow_cycles:
            raise ValueError(
                "Flow graph contains a cycle — cannot execute as a plain DAG. "
                "Use agent_loop nodes for cyclic patterns (V2)."
            )
        # Cycles present but allowed — append remaining nodes in arbitrary order
        visited = set(order)
        order += [nid for nid in node_ids if nid not in visited]

    return order


def get_node_by_id(nodes: list[dict], node_id: str) -> dict:
    for n in nodes:
        if n["id"] == node_id:
            return n
    raise KeyError(f"Node '{node_id}' not found in flow.")


def resolve_inputs(
    node_id: str, edges: list[dict], context: dict[str, Any]
) -> dict[str, Any]:
    """Collect outputs from upstream nodes via edges into this node's input dict."""
    inputs: dict[str, Any] = {}
    for edge in edges:
        if edge["target"] != node_id:
            continue
        source_output = context.get(edge["source"], {})
        source_handle = edge.get("sourceHandle") or "output"
        target_handle = edge.get("targetHandle") or "input"

        # Resolve source handle: try exact key first, then first value
        value = source_output.get(source_handle)
        if value is None and source_output:
            value = next(iter(source_output.values()))

        inputs[target_handle] = value
    return inputs


def get_node_type(node: dict) -> str:
    """Extract the logical executor type from a flow node dict.

    React Flow stores every canvas node with ``type == "agentNode"``.  The
    actual frontend node-library type (e.g. ``"text-input"``,
    ``"openai-llm"``) lives at ``node["data"]["definition"]["type"]`` and the
    high-level category (``"input"``, ``"llm"``, …) at
    ``node["data"]["definition"]["category"]``.

    This helper normalises all of these representations into one of the
    backend executor keys: ``chat_input``, ``chat_output``,
    ``prompt_template``, ``model``, ``mcp_tool``, ``memory``, ``rag_agent``.
    """
    raw = node.get("type", "")
    data = node.get("data") or {}
    definition = data.get("definition") or {}

    if raw == "agentNode":
        raw = definition.get("type", raw)

    # Already a backend executor key — use as-is.
    if raw in _BACKEND_EXECUTOR_KEYS:
        return raw

    # Explicit per-type overrides from the frontend node library.
    if raw in _FRONTEND_TYPE_TO_EXECUTOR:
        return _FRONTEND_TYPE_TO_EXECUTOR[raw]

    # Fall back to the node's category (set by the frontend node library).
    category = definition.get("category") or data.get("category")
    if category in _CATEGORY_TO_EXECUTOR:
        return _CATEGORY_TO_EXECUTOR[category]

    return raw


_BACKEND_EXECUTOR_KEYS = {
    "chat_input",
    "chat_output",
    "prompt_template",
    "model",
    "mcp_tool",
    "memory",
    "rag_agent",
}

# Specific frontend node-library type strings → backend executor keys.
_FRONTEND_TYPE_TO_EXECUTOR = {
    "text-input": "chat_input",
    "text-output": "chat_output",
    "prompt-template": "prompt_template",
    "few-shot-prompt": "prompt_template",
    "chat-prompt": "prompt_template",
    "vector-search": "rag_agent",
}

# Category → backend executor key (covers all *-llm, *-memory, mcp-*,
# *-agent definitions without listing each one explicitly).
_CATEGORY_TO_EXECUTOR = {
    "input": "chat_input",
    "output": "chat_output",
    "llm": "model",
    "prompt": "prompt_template",
    "mcp": "mcp_tool",
    "memory": "memory",
    "agent": "rag_agent",
}


def find_nodes_by_type(nodes: list[dict], node_type: str) -> list[dict]:
    return [n for n in nodes if get_node_type(n) == node_type]
