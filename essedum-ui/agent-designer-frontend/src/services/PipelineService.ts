import { api } from './api';
import type {
  PipelineCreateRequest,
  PipelineResponse,
  PipelineListResponse,
} from '../models/api';

const BASE = '/api/v1/pipelines';

export const pipelineService = {
  list(skip = 0, limit = 50): Promise<PipelineListResponse> {
    return api.get<PipelineListResponse>(BASE, { skip, limit });
  },

  get(pipelineId: string): Promise<PipelineResponse> {
    return api.get<PipelineResponse>(`${BASE}/${pipelineId}`);
  },

  create(data: PipelineCreateRequest): Promise<PipelineResponse> {
    return api.post<PipelineResponse>(BASE, data);
  },

  updateStatus(pipelineId: string, status: string): Promise<PipelineResponse> {
    return api.patch<PipelineResponse>(`${BASE}/${pipelineId}/status`, { status });
  },

  delete(pipelineId: string): Promise<void> {
    return api.delete(`${BASE}/${pipelineId}`);
  },
};
