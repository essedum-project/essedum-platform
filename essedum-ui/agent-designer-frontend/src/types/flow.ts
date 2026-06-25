import type { Node } from '@xyflow/react';

export type NodeCategory = 'llm' | 'tool' | 'agent' | 'memory' | 'prompt' | 'mcp' | 'input' | 'output' | 'condition';

export interface NodePort {
  id: string;
  label: string;
  type: 'data' | 'control' | 'text' | 'any';
}

export interface NodeField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'password' | 'code' | 'slider';
  placeholder?: string;
  options?: { label: string; value: string }[];
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  description?: string;
  group?: string;
}

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: NodePort[];
  outputs: NodePort[];
  fields: NodeField[];
  tags?: string[];
}

export interface FlowNodeData {
  definition: NodeDefinition;
  label: string;
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  output?: unknown;
  error?: string;
}

// React Flow requires data to extend Record<string, unknown>; intersection avoids widening FlowNodeData properties
export type AgentFlowNode = Node<FlowNodeData & Record<string, unknown>, 'agentNode'>;

export interface SavedFlow {
  id: string;
  name: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  env_vars?: Array<{ name: string; value: string }>;
  secrets?: Array<{ name: string; value: string }>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  nodeId?: string;
  nodeLabel?: string;
  message: string;
  detail?: string;
}

export interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  currentNodeId?: string;
  logs: LogEntry[];
  startedAt?: string;
  completedAt?: string;
}
