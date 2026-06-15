import { api } from './api';
import type {
  ExecutionRunRequest,
  ExecutionRunResponse,
  ExecutionResponse,
} from '../models/api';

const BASE = '/api/v1/executions';

export interface ExecutionLog {
  id: string;
  execution_id: string;
  node_id: string | null;
  level: string;
  message: string;
  detail: Record<string, unknown> | null;
  timestamp: string;
}

export const executionService = {
  run(flowId: string, data: ExecutionRunRequest): Promise<ExecutionRunResponse> {
    return api.post<ExecutionRunResponse>(`${BASE}/flows/${flowId}/run`, data);
  },

  get(executionId: string): Promise<ExecutionResponse> {
    return api.get<ExecutionResponse>(`${BASE}/${executionId}`);
  },

  getLogs(executionId: string): Promise<ExecutionLog[]> {
    return api.get<ExecutionLog[]>(`${BASE}/${executionId}/logs`);
  },

  list(flowId?: string, skip = 0, limit = 50): Promise<ExecutionResponse[]> {
    return api.get<ExecutionResponse[]>(BASE, {
      ...(flowId ? { flow_id: flowId } : {}),
      skip,
      limit,
    });
  },
};
