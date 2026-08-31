import { api } from './api';
import type { PublishRequest, WorkflowDeploymentStatusResponse } from '../models/api';

const BASE = '/api/v1/flows';

export const deploymentService = {
  /** Publish a workflow — creates K8s ConfigMap, Deployment, and Service. */
  publish(flowId: string, req: PublishRequest): Promise<WorkflowDeploymentStatusResponse> {
    return api.post<WorkflowDeploymentStatusResponse>(`${BASE}/${flowId}/publish`, req);
  },

  /** Unpublish — deletes the K8s Deployment, Service, and ConfigMap. */
  unpublish(flowId: string): Promise<void> {
    return api.post<void>(`${BASE}/${flowId}/unpublish`, {});
  },

  /** Fetch live Kubernetes deployment status (ready replicas, conditions, endpoint). */
  getStatus(flowId: string): Promise<WorkflowDeploymentStatusResponse> {
    return api.get<WorkflowDeploymentStatusResponse>(`${BASE}/${flowId}/deployment`);
  },

  /** Scale the Deployment replica count up or down. */
  scale(flowId: string, replicas: number): Promise<WorkflowDeploymentStatusResponse> {
    return api.patch<WorkflowDeploymentStatusResponse>(`${BASE}/${flowId}/scale`, { replicas });
  },
};
