from typing import Any, Literal
from pydantic import BaseModel

# V1 supported node types (feature-gated)
V1_NODE_TYPES = {
    "chat_input",
    "prompt_template",
    "model",
    "mcp_tool",
    "rag_agent",
    "memory",
    "chat_output",
}


class NodePort(BaseModel):
    name: str
    type: str
    description: str | None = None


class NodeConfigField(BaseModel):
    type: str
    required: bool = False
    default: Any = None
    enum: list[str] | None = None
    description: str | None = None


class NodeDefinition(BaseModel):
    type: str
    label: str
    description: str
    inputs: list[NodePort]
    outputs: list[NodePort]
    config_schema: dict[str, NodeConfigField]


# V1 node registry
NODE_REGISTRY: dict[str, NodeDefinition] = {
    "chat_input": NodeDefinition(
        type="chat_input",
        label="Chat Input",
        description="Entry point for user messages in a chat flow.",
        inputs=[],
        outputs=[NodePort(name="message", type="string")],
        config_schema={},
    ),
    "prompt_template": NodeDefinition(
        type="prompt_template",
        label="Prompt Template",
        description="Formats a system/user prompt using Jinja2-style {{ variable }} syntax.",
        inputs=[NodePort(name="input", type="string", description="User message or upstream text")],
        outputs=[NodePort(name="prompt", type="string")],
        config_schema={
            "template": NodeConfigField(
                type="string",
                required=True,
                description="Prompt template. Use {{ input }} for upstream value.",
            ),
            "system_message": NodeConfigField(
                type="string",
                required=False,
                description="Optional system role message.",
            ),
        },
    ),
    "model": NodeDefinition(
        type="model",
        label="Model",
        description="Calls an LLM via Azure OpenAI, AWS Bedrock, Google Vertex AI, Ollama, or the LiteLLM gateway.",
        inputs=[NodePort(name="prompt", type="string")],
        outputs=[NodePort(name="response", type="string")],
        config_schema={
            "provider": NodeConfigField(
                type="string",
                required=True,
                enum=["azure_openai", "bedrock", "vertex_ai", "ollama", "litellm"],
            ),
            "model": NodeConfigField(type="string", required=True),
            "temperature": NodeConfigField(type="number", default=0.7),
            "max_tokens": NodeConfigField(type="integer", default=1000),
            "system_message": NodeConfigField(type="string", required=False),
        },
    ),
    "mcp_tool": NodeDefinition(
        type="mcp_tool",
        label="MCP Tool",
        description="Invokes a tool exposed by an MCP-compatible server.",
        inputs=[NodePort(name="input", type="string")],
        outputs=[NodePort(name="result", type="string")],
        config_schema={
            "server_url": NodeConfigField(type="string", required=True),
            "tool_name": NodeConfigField(type="string", required=True),
            "arguments": NodeConfigField(
                type="object",
                required=False,
                description="Static extra arguments merged with the input.",
            ),
        },
    ),
    "rag_agent": NodeDefinition(
        type="rag_agent",
        label="RAG Agent",
        description="Retrieves context from a Qdrant knowledge base and generates an answer.",
        inputs=[NodePort(name="query", type="string")],
        outputs=[
            NodePort(name="answer", type="string"),
            NodePort(name="sources", type="array"),
        ],
        config_schema={
            "knowledge_base_id": NodeConfigField(type="string", required=True),
            "top_k": NodeConfigField(type="integer", default=5),
            "score_threshold": NodeConfigField(type="number", default=0.0),
            "provider": NodeConfigField(
                type="string",
                required=True,
                enum=["azure_openai", "bedrock", "vertex_ai", "ollama", "litellm"],
            ),
            "model": NodeConfigField(type="string", required=True),
            "system_prompt": NodeConfigField(type="string", required=False),
        },
    ),
    "memory": NodeDefinition(
        type="memory",
        label="Memory",
        description="Reads and/or writes conversational history for multi-turn continuity.",
        inputs=[NodePort(name="input", type="string")],
        outputs=[NodePort(name="history", type="array")],
        config_schema={
            "operation": NodeConfigField(
                type="string",
                default="read_write",
                enum=["read", "write", "read_write"],
            ),
            "max_entries": NodeConfigField(type="integer", default=10),
        },
    ),
    "chat_output": NodeDefinition(
        type="chat_output",
        label="Chat Output",
        description="Terminal node that emits the final chat response.",
        inputs=[NodePort(name="message", type="string")],
        outputs=[],
        config_schema={},
    ),
}
