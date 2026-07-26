from app.engine.executors.chat_input import ChatInputExecutor
from app.engine.executors.chat_output import ChatOutputExecutor
from app.engine.executors.prompt import PromptExecutor
from app.engine.executors.model import ModelExecutor
from app.engine.executors.mcp import MCPExecutor
from app.engine.executors.rag import RAGExecutor
from app.engine.executors.memory import MemoryExecutor
from app.engine.executors.http_request import HTTPRequestExecutor
from app.engine.executors.condition import ConditionExecutor
from app.engine.executors.router_agent import RouterAgentExecutor

EXECUTOR_REGISTRY = {
    "chat_input": ChatInputExecutor(),
    "chat_output": ChatOutputExecutor(),
    "prompt_template": PromptExecutor(),
    "model": ModelExecutor(),
    "mcp_tool": MCPExecutor(),
    "rag_agent": RAGExecutor(),
    "memory": MemoryExecutor(),
    "http_request": HTTPRequestExecutor(),
    "condition": ConditionExecutor(),
    "router_agent": RouterAgentExecutor(),
}

# Node types whose execution emits a routing decision in ``output['_route']``.
# The compiler uses this set to wire conditional edges instead of plain edges.
BRANCHING_EXECUTOR_KEYS = {"condition", "router_agent"}


def get_executor(node_type: str):
    if node_type not in EXECUTOR_REGISTRY:
        raise ValueError(
            f"Node type '{node_type}' is not supported in V1. "
            f"Supported: {sorted(EXECUTOR_REGISTRY)}"
        )
    return EXECUTOR_REGISTRY[node_type]
