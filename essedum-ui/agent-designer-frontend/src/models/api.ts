// ─── Flow Models ──────────────────────────────────────────────────────────────

export interface FlowCreateRequest {
  name: string;
  description?: string;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  tags?: string[];
  env_vars?: Array<{ name: string; value: string }>;
  secrets?: Array<{ name: string; value: string }>;
}

export interface FlowUpdateRequest {
  name?: string;
  description?: string;
  nodes?: Record<string, unknown>[];
  edges?: Record<string, unknown>[];
  tags?: string[];
  env_vars?: Array<{ name: string; value: string }>;
  secrets?: Array<{ name: string; value: string }>;
}

export interface FlowResponse {
  id: string;
  name: string;
  description: string | null;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  tags: string[];
  env_vars: Array<{ name: string; value: string }>;
  secrets: Array<{ name: string; value: string }>;
  created_at: string;
  updated_at: string;
}

// ─── Execution Models ─────────────────────────────────────────────────────────

export interface ExecutionRunRequest {
  message: string;
  session_id?: string;
  variables?: Record<string, unknown>;
}

export interface ExecutionRunResponse {
  execution_id: string;
  status: string;
}

export interface ExecutionResponse {
  id: string;
  flow_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
}

// ─── Node Models ──────────────────────────────────────────────────────────────

export interface ApiNodePort {
  name: string;
  type: string;
  description?: string;
}

export interface ApiNodeConfigField {
  type: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
  description?: string;
}

export interface ApiNodeDefinition {
  type: string;
  label: string;
  description: string;
  inputs: ApiNodePort[];
  outputs: ApiNodePort[];
  config_schema: Record<string, ApiNodeConfigField>;
}

// ─── Knowledge Base Models ────────────────────────────────────────────────────

export interface KnowledgeBaseResponse {
  id: string;
  name: string;
  description: string | null;
  embedding_model: string;
  embedding_dims: number;
  chunk_size: number;
  chunk_overlap: number;
  vectordb_provider: string;
  collection_name: string;
  doc_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Pipeline Models ──────────────────────────────────────────────────────────

export type PipelineStatus = 'registered' | 'deploying' | 'running' | 'stopped' | 'error';

export interface PipelineCreateRequest {
  flow_id: string;
  name: string;
  description?: string;
  env_vars?: Array<{ name: string; value: string }>;
  secrets?: Array<{ name: string; value: string }>;
}

export interface PipelineResponse {
  id: string;
  flow_id: string;
  name: string;
  description: string | null;
  cname: string;
  status: PipelineStatus;
  env_vars: Array<{ name: string; value: string }>;
  secrets: Array<{ name: string; value: string }>;
  created_at: string;
  updated_at: string;
}

export interface PipelineListResponse {
  items: PipelineResponse[];
  total: number;
}

// ─── LLM Models ───────────────────────────────────────────────────────────────

export interface LlmModelsResponse {
  provider: string;
  models: string[];
}

export interface LlmChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmChatRequest {
  provider: string;
  model: string;
  messages: LlmChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface LlmChatResponse {
  response: string;
}
