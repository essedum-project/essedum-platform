export type DeploymentState = 'DEPLOYING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'COMPLETED' | 'FAILED';
export type RegistrationState = 'PENDING' | 'REGISTERING' | 'REGISTERED' | 'FAILED';
export type StepState = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface DeploymentStep {
  name: string;
  state: StepState;
}

export interface RegistrationInfo {
  state: RegistrationState;
  modelId: string | null;
  failureReason: string | null;
}

export interface DeploymentStatusDto {
  deploymentId: string;
  state: DeploymentState;
  message: string;
  startedAt: string;
  finishedAt: string | null;
  failureReason: string | null;
  steps: DeploymentStep[];
  registration: RegistrationInfo;
  allowedActions: string[];
  version: number;
}

export interface DeploymentEventDto {
  sequence: number;
  type: 'STATE_CHANGED' | 'METRIC';
  state?: DeploymentState;
  name?: string;
  value?: number;
  timestamp: string;
}

export interface DeploymentEventsDto {
  events: DeploymentEventDto[];
  latestSequence: number;
}

export interface MetricPointDto {
  step: number;
  value: number;
  timestamp: string;
}

export interface MetricSeriesDto {
  name: string;
  unit: string;
  points: MetricPointDto[];
}

export interface CheckpointDto {
  checkpointId: string;
  step: number;
  createdAt: string;
  valid: boolean;
}

export interface OperationAcceptedDto {
  operationId: string;
  deploymentId: string;
  state?: DeploymentState;
  attempt?: number;
  version?: number;
  registration?: { state: RegistrationState; modelId: string | null };
}

export interface ApiErrorDto {
  status: number;
  code: string;
  detail: string;
  retryable: boolean;
}
