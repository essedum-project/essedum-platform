import uuid
from typing import Any
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    score_threshold: float = Field(default=0.0, ge=0.0, le=1.0)
    filter: dict[str, Any] | None = None


class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    knowledge_base_ids: list[uuid.UUID]
    llm_provider: str = Field(
        ..., pattern="^(azure_openai|bedrock|vertex_ai|ollama|litellm)$"
    )
    llm_model: str
    top_k: int = Field(default=5, ge=1, le=50)
    score_threshold: float = Field(default=0.0, ge=0.0, le=1.0)
    system_prompt: str | None = None
    include_sources: bool = True
    stream: bool = False


class SourceChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    page_number: int | None
    content: str
    relevance_score: float


class RAGQueryResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    metadata: dict[str, Any]
