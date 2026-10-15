/**
 * Shared models for pipeline components
 */

export class DynamicParamsGrid {
  name: string;
  value: string;
}

export class DynamicSecretsGrid {
  name: string;
  value: string;
}

export class DynamicRuntimeGrid {
  runtype: string;
  value: Array<DynamicParamsGrid> = [];
}

// ─── Python REST Tool models ──────────────────────────────────────────────────

export type RestBackendAppStatus =
  | 'draft'
  | 'generating'
  | 'generated'
  | 'committed'
  | 'building'
  | 'deployed'
  | 'registered'
  | 'healthy'
  | 'unhealthy'
  | 'failed'
  | 'retired';

export interface RestBackendAppJsonContent {
  created_source: 'agent_studio';
  session_id: string;
  runtime: 'fastapi' | 'flask';
  port: number;
  repo: string;
  branch: string;
  endpoint: string;
  status: RestBackendAppStatus;
  lastError?: string;
  updatedAt?: string;
  environment?: { name: string; value: string }[];
  usedSecrets?: { name: string; value: string }[];
}
