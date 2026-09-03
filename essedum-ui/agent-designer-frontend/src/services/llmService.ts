import { api } from './api';
import type {
  LlmModelsResponse,
  LlmChatRequest,
  LlmChatResponse,
} from '../models/api';

const BASE = '/api/v1/llm';

export const SUPPORTED_PROVIDERS = ['ollama', 'litellm', 'azure_openai', 'bedrock', 'vertex_ai'] as const;
export type LlmProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const llmService = {
  listModels(provider: string): Promise<LlmModelsResponse> {
    return api.get<LlmModelsResponse>(`${BASE}/models`, { provider });
  },

  chat(data: LlmChatRequest): Promise<LlmChatResponse> {
    return api.post<LlmChatResponse>(`${BASE}/chat`, data);
  },
};
