# file: src/__init__.py
"""
Langflow to Python ADK Conversion Package

This package provides a production-ready Python implementation of a Langflow workflow design.
Converts Langflow graph JSON (nodes + edges) into executable LangGraph workflows using
modern langchain_core, langchain_openai, langgraph, and pydantic v2.

Phase-1 Implementation:
- Linear workflow execution only
- Conditional branching detected but linearized to first path
- All nodes wrapped with error handling and ASCII logging

Exports:
    - create_workflow: Build a compiled LangGraph workflow from design JSON
    - run_workflow: Execute a workflow with state input
"""

from src.graph_builder import create_workflow

__all__ = ["create_workflow"]

__version__ = "1.0.0"
