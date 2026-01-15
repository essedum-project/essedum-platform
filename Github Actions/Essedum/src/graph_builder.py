# file: src/graph_builder.py
"""
Graph Builder - Constructs LangGraph workflow from Langflow design JSON

Parses nodes and edges from Langflow JSON, creates StateGraph, and compiles workflow.
"""

import logging
from functools import partial
from typing import Any, Dict

from langgraph.graph import StateGraph, END

from src.workflow_state import WorkflowState
from src.config import AppConfig
from src import nodes

logger = logging.getLogger(__name__)


def sanitize_node_id(node_id: str) -> str:
    """
    Convert Langflow node ID to valid Python identifier.
    
    Args:
        node_id: Original node ID (e.g., "ChatInput-viP4f")
        
    Returns:
        Sanitized identifier (e.g., "chatinput_vip4f")
    """
    # Lowercase and replace non-alphanumeric with underscore
    sanitized = "".join(
        c.lower() if c.isalnum() else "_" 
        for c in node_id
    )
    # Remove leading/trailing underscores
    sanitized = sanitized.strip("_")
    return sanitized


def visualize_graph_structure(design_json: dict) -> str:
    """
    Generate ASCII visualization of workflow topology.
    
    Args:
        design_json: Langflow design JSON
        
    Returns:
        ASCII string showing node connections
    """
    try:
        edges = design_json.get("data", {}).get("edges", [])
        nodes_data = design_json.get("data", {}).get("nodes", [])
        
        # Build adjacency map
        adjacency = {}
        for edge in edges:
            source = edge.get("source", "")
            target = edge.get("target", "")
            if source not in adjacency:
                adjacency[source] = []
            adjacency[source].append(target)
        
        # Build node name map
        node_names = {}
        for node in nodes_data:
            node_id = node.get("id", "")
            node_type = node.get("data", {}).get("type", "Unknown")
            node_names[node_id] = f"{node_type} ({node_id})"
        
        # Generate visualization
        lines = ["Graph Structure:"]
        lines.append("-" * 60)
        
        for node_id, successors in adjacency.items():
            node_label = node_names.get(node_id, node_id)
            successor_labels = [node_names.get(s, s) for s in successors]
            
            if successor_labels:
                lines.append(f"{node_label} -> {', '.join(successor_labels)}")
            else:
                lines.append(f"{node_label} (END)")
        
        # Find nodes with no outgoing edges
        all_nodes = set(node_names.keys())
        nodes_with_edges = set(adjacency.keys())
        terminal_nodes = all_nodes - nodes_with_edges
        
        for node_id in terminal_nodes:
            if node_id not in adjacency:
                node_label = node_names.get(node_id, node_id)
                lines.append(f"{node_label} (END)")
        
        lines.append("-" * 60)
        
        return "\n".join(lines)
        
    except Exception as e:
        logger.error(f"Error visualizing graph: {e}")
        return f"Visualization failed: {e}"


def create_workflow(design_json: dict, config: AppConfig):
    """
    Build and compile LangGraph workflow from Langflow design JSON.
    
    Args:
        design_json: Langflow design JSON containing nodes and edges
        config: Application configuration
        
    Returns:
        Compiled LangGraph workflow
    """
    try:
        logger.info("Building workflow from design JSON")
        
        # Extract nodes and edges
        nodes_data = design_json.get("data", {}).get("nodes", [])
        edges_data = design_json.get("data", {}).get("edges", [])
        
        if not nodes_data:
            raise ValueError("No nodes found in design JSON")
        
        logger.info(f"Found {len(nodes_data)} nodes and {len(edges_data)} edges")
        
        # Create StateGraph
        workflow = StateGraph(WorkflowState)
        
        # Map node IDs to node functions
        node_function_map = {
            "ChatInput-viP4f": nodes.node_chatinput_vip4f,
            "Prompt Template-t2VSF": nodes.node_prompt_template_t2vsf,
            "MCP-ufEql": nodes.node_mcp_ufeql,
            "AzureOpenAIModel-6aodL": nodes.node_azureopenaimodel_6aodl,
            "Agent-Zgq5D": nodes.node_agent_zgq5d,
            "ChatOutput-AVpjO": nodes.node_chatoutput_avpjo,
        }
        
        # Add nodes to graph
        for node in nodes_data:
            node_id = node.get("id", "")
            node_type = node.get("data", {}).get("type", "Unknown")
            
            if node_id in node_function_map:
                node_func = node_function_map[node_id]
                # Bind config to node function
                bound_func = partial(node_func, config=config)
                
                # Use sanitized node ID as graph node name
                sanitized_id = sanitize_node_id(node_id)
                workflow.add_node(sanitized_id, bound_func)
                logger.info(f"Added node: {sanitized_id} (type: {node_type})")
            else:
                logger.warning(f"No implementation for node: {node_id} (type: {node_type})")
        
        # Add edges
        edge_count = 0
        for edge in edges_data:
            source = edge.get("source", "")
            target = edge.get("target", "")
            
            if source and target:
                source_sanitized = sanitize_node_id(source)
                target_sanitized = sanitize_node_id(target)
                
                workflow.add_edge(source_sanitized, target_sanitized)
                logger.info(f"Added edge: {source_sanitized} -> {target_sanitized}")
                edge_count += 1
        
        logger.info(f"Added {edge_count} edges")
        
        # Detect branching
        source_counts = {}
        for edge in edges_data:
            source = edge.get("source", "")
            source_counts[source] = source_counts.get(source, 0) + 1
        
        branching_nodes = [node_id for node_id, count in source_counts.items() if count > 1]
        if branching_nodes:
            logger.warning(f"Branching detected at nodes: {branching_nodes}; skipped in phase-1")
        
        # Determine entry point (node with no incoming edges)
        incoming_nodes = set(edge.get("target") for edge in edges_data)
        all_node_ids = set(node.get("id") for node in nodes_data)
        entry_candidates = all_node_ids - incoming_nodes
        
        if entry_candidates:
            entry_node = list(entry_candidates)[0]
            entry_sanitized = sanitize_node_id(entry_node)
            logger.info(f"Setting entry point: {entry_sanitized}")
            workflow.set_entry_point(entry_sanitized)
        else:
            logger.warning("No clear entry point; using first node")
            first_node = sanitize_node_id(nodes_data[0].get("id", ""))
            workflow.set_entry_point(first_node)
        
        # Determine finish point (node with no outgoing edges)
        outgoing_nodes = set(edge.get("source") for edge in edges_data)
        finish_candidates = all_node_ids - outgoing_nodes
        
        if finish_candidates:
            for finish_node in finish_candidates:
                finish_sanitized = sanitize_node_id(finish_node)
                workflow.add_edge(finish_sanitized, END)
                logger.info(f"Added finish edge: {finish_sanitized} -> END")
        else:
            logger.warning("No clear finish point; using last node")
            last_node = sanitize_node_id(nodes_data[-1].get("id", ""))
            workflow.add_edge(last_node, END)
        
        # Compile workflow
        logger.info("Compiling workflow...")
        compiled_workflow = workflow.compile()
        logger.info("Workflow compiled successfully")
        
        # Log visualization
        viz = visualize_graph_structure(design_json)
        logger.info(f"\n{viz}")
        
        return compiled_workflow
        
    except Exception as e:
        logger.error(f"Failed to create workflow: {e}")
        raise
