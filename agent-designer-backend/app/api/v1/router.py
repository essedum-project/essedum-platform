from fastapi import APIRouter

from app.api.v1.flows import router as flows_router
from app.api.v1.executions import router as executions_router
from app.api.v1.nodes import router as nodes_router
from app.api.v1.llm import router as llm_router
from app.api.v1.knowledge_bases import router as kb_router
from app.api.v1.documents import router as documents_router
from app.api.v1.rag import router as rag_router
from app.api.v1.mcp import router as mcp_router
from app.api.v1.memory import router as memory_router
from app.api.v1.websocket import router as ws_router
from app.api.v1.pipelines import router as pipelines_router

v1_router = APIRouter()

v1_router.include_router(flows_router)
v1_router.include_router(executions_router)
v1_router.include_router(nodes_router)
v1_router.include_router(llm_router)
v1_router.include_router(kb_router)
v1_router.include_router(documents_router)
v1_router.include_router(rag_router)
v1_router.include_router(mcp_router)
v1_router.include_router(memory_router)
v1_router.include_router(ws_router)
v1_router.include_router(pipelines_router)
