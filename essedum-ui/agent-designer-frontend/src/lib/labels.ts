/**
 * Centralized static labels for agent-designer-frontend components.
 * Update values here to reflect changes across all consuming components.
 */
export const LABELS = {
  // ── Brand ──────────────────────────────────────────────────────────────
  APP_NAME: 'Agent Designer',

  // ── TopBar ─────────────────────────────────────────────────────────────
  TOPBAR_NODE_LIBRARY: 'Node Library',
  TOPBAR_EXECUTION_LOGS: 'Execution Logs',
  TOPBAR_NODE_INSPECTOR: 'Node Inspector',
  TOPBAR_FLOW_MANAGER: 'Flow Manager',
  TOPBAR_NEW_FLOW: 'New Flow',
  TOPBAR_SAVE_FLOW: 'Save Flow (Ctrl+S)',
  TOPBAR_EXPORT_JSON: 'Export JSON',
  TOPBAR_IMPORT_JSON: 'Import JSON',
  TOPBAR_RUN_FLOW: 'Run Flow',
  TOPBAR_STOP: 'Stop',
  TOPBAR_NEW_SESSION: 'New Session',
  TOPBAR_PLAYGROUND: 'Playground',
  TOPBAR_OPEN_PLAYGROUND: 'Open Playground',
  TOPBAR_TOAST_FLOW_RENAMED: 'Flow renamed',
  TOPBAR_TOAST_FLOW_SAVED: 'Flow saved',
  TOPBAR_TOAST_FLOW_SAVE_FAILED: 'Failed to save flow',
  TOPBAR_TOAST_NEW_FLOW: 'New flow created',
  TOPBAR_TOAST_FLOW_IMPORTED: 'Flow imported',
  TOPBAR_TOAST_NO_NODES: 'Add nodes to the canvas first',

  // ── LogsPanel ──────────────────────────────────────────────────────────
  LOGS_PANEL_TITLE: 'Execution Logs',
  LOGS_PANEL_EMPTY: 'No logs yet — run the flow to see execution output',
  LOGS_AUTO_SCROLL: 'Auto-scroll',
  LOGS_DOWNLOAD_TITLE: 'Download logs',
  LOGS_CLEAR_TITLE: 'Clear logs',
  LOGS_STATUS_IDLE: 'Idle',
  LOGS_STATUS_RUNNING: 'Running',
  LOGS_STATUS_COMPLETED: 'Completed',
  LOGS_STATUS_ERROR: 'Error',

  // ── PlaygroundModal ────────────────────────────────────────────────────
  PLAYGROUND_TITLE: 'Playground',
  PLAYGROUND_SESSION_DETAILS: 'Session Details',
  PLAYGROUND_SESSION_NAME_LABEL: 'Session Name',
  PLAYGROUND_CREATED_AT_LABEL: 'Created At',
  PLAYGROUND_ALL_SESSIONS_LABEL: 'All Sessions',
  PLAYGROUND_EMPTY_STATE: 'Send a message to start the playground session.',
  PLAYGROUND_NEW_SESSION: 'New Session',
  PLAYGROUND_SELECT_SESSION_PLACEHOLDER: 'Select session',
  PLAYGROUND_PROVIDER_LABEL: 'Provider',
  PLAYGROUND_MODEL_LABEL: 'Model',
  PLAYGROUND_MODEL_LOADING: 'Loading…',
  PLAYGROUND_MODEL_PLACEHOLDER: 'Select model',
  PLAYGROUND_ERROR_PREFIX: 'Error: ',

  // ── FlowManager ────────────────────────────────────────────────────────
  FLOW_MANAGER_TITLE: 'Flow Manager',
  FLOW_MANAGER_SEARCH_PLACEHOLDER: 'Search flows…',
  FLOW_MANAGER_NEW_FLOW: 'New Flow',
  FLOW_MANAGER_NO_FLOWS: 'No saved flows yet',
  FLOW_MANAGER_SAVE_HINT: 'Save a flow using the Save button in the top bar',
  FLOW_MANAGER_ACTIVE_BADGE: 'Active',
  FLOW_MANAGER_EXPORT_TITLE: 'Export',
  FLOW_MANAGER_DELETE_TITLE: 'Delete',
  FLOW_MANAGER_SAVE_CURRENT: 'Save Current Flow',
  FLOW_MANAGER_SAVED_FLOWS_SUFFIX: 'saved flows',
  FLOW_MANAGER_TOAST_NEW_FLOW: 'New flow created',
  FLOW_MANAGER_TOAST_LOAD_FAILED: 'Failed to load flow',
  FLOW_MANAGER_TOAST_DELETE_FAILED: 'Failed to delete flow',
  FLOW_MANAGER_TOAST_FLOW_SAVED: 'Flow saved',
  FLOW_MANAGER_TOAST_FLOW_SAVE_FAILED: 'Failed to save flow',

  // ── FlowCanvas ─────────────────────────────────────────────────────────
  CANVAS_EMPTY_HEADING: 'Start Building Your Flow',
  CANVAS_EMPTY_DESCRIPTION: 'Drag nodes from the left panel onto this canvas, then connect them to build your agent workflow',
  CANVAS_NODE_TAGS: ['🤖 LLMs', '🔍 Tools', '🔌 MCP', '🧠 Agents', '💾 Memory', '📝 Prompts'],

  // ── NodeInspector ──────────────────────────────────────────────────────
  INSPECTOR_TITLE: 'Inspector',
  INSPECTOR_EMPTY_STATE: 'Select a node on the canvas to configure its properties',
  INSPECTOR_STATUS_RUNNING: '⟳ Running…',
  INSPECTOR_STATUS_SUCCESS: '✓ Completed',
  INSPECTOR_STATUS_ERROR: '✕ Error',
  INSPECTOR_STATUS_SKIPPED: '— Skipped',
  INSPECTOR_BTN_DUPLICATE: 'Duplicate',
  INSPECTOR_BTN_DELETE: 'Delete',
  INSPECTOR_OUTPUT_PREVIEW: 'Output Preview',
  INSPECTOR_TOAST_DUPLICATED: 'Node duplicated',
  INSPECTOR_TOAST_DELETED: 'Node deleted',

  // ── NodeLibrary ────────────────────────────────────────────────────────
  LIBRARY_TITLE: 'Node Library',
  LIBRARY_SEARCH_PLACEHOLDER: 'Search nodes…',
  LIBRARY_DRAG_HINT: 'Drag nodes onto the canvas',

  // ── Pipeline ───────────────────────────────────────────────────────────
  TOPBAR_CREATE_PIPELINE: 'Create Pipeline',
  TOPBAR_OPEN_CREATE_PIPELINE: 'Deploy this flow as a scalable agent pipeline',
  TOPBAR_VIEW_PIPELINE: 'View Pipeline',
  TOPBAR_OPEN_VIEW_PIPELINE: 'Open this pipeline in Agent Pipelines',
  TOPBAR_UPDATE_PIPELINE: 'Update Pipeline',
  TOPBAR_OPEN_UPDATE_PIPELINE: 'Sync pipeline with latest flow changes',
  PIPELINE_MODAL_TITLE: 'Create Pipeline',
  PIPELINE_MODAL_DESCRIPTION: 'Deploy this flow as a scalable agent pipeline visible in Agent Pipelines.',
  PIPELINE_MODAL_NAME_LABEL: 'Pipeline Name',
  PIPELINE_MODAL_NAME_PLACEHOLDER: 'My Agent Pipeline',
  PIPELINE_MODAL_DESC_LABEL: 'Description',
  PIPELINE_MODAL_DESC_PLACEHOLDER: 'What does this pipeline do?',
  PIPELINE_MODAL_SUBMIT: 'Create Pipeline',
  PIPELINE_MODAL_CANCEL: 'Cancel',
  PIPELINE_TOAST_SUCCESS: 'Pipeline created successfully',
  PIPELINE_TOAST_ERROR: 'Failed to create pipeline',
  PIPELINE_UPDATE_TOAST_SUCCESS: 'Pipeline updated successfully',
  PIPELINE_UPDATE_TOAST_ERROR: 'Failed to update pipeline',
} as const;
