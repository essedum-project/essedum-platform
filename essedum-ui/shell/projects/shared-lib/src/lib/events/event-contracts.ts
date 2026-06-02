export type AppEvent =
  | { type: 'DATASET_CREATED'; payload: { id: string; name: string } }
  | { type: 'DATASET_DELETED'; payload: { id: string } }
  | { type: 'MODEL_CREATED'; payload: { id: string; name: string } }
  | { type: 'CONNECTION_CREATED'; payload: { id: string; name: string } }
  | { type: 'PIPELINE_PUBLISHED'; payload: { id: string; version: number } }
  | { type: 'PIPELINE_DELETED'; payload: { id: string } }
  | { type: 'APP_DEPLOYED'; payload: { appId: string; instanceId: string } }
  | { type: 'AGENT_DEPLOYED'; payload: { agentId: string } }
  | { type: 'AGENT_PIPELINE_RUN'; payload: { agentId: string; pipelineId: string } }
  | { type: 'VIBE_SCRIPT_SAVED'; payload: { scriptId: string } }
  | { type: 'VIBE_APP_DEPLOYED'; payload: { appId: string } };

export type AppEventType = AppEvent['type'];
