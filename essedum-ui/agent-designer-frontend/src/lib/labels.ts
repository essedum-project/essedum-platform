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
  // ── Publish / Deploy ───────────────────────────────────────────────────────
  TOPBAR_PUBLISH_WORKFLOW: 'Create Pipeline',
  TOPBAR_UPDATE_DEPLOYMENT: 'Update Pipeline',
  TOPBAR_SAVE_PIPELINE: 'Save Pipeline',
  TOPBAR_VIEW_DEPLOYMENT: 'View Deployment Status',
  TOPBAR_DEPLOYMENTS_PAGE: 'View Agent Pipelines',
  TOPBAR_TOAST_PUBLISHED: 'Pipeline created successfully',
  TOPBAR_TOAST_PUBLISH_SAVE_FIRST: 'Save the flow before creating a pipeline',

  // ── Deployments Page ──────────────────────────────────────────────────────
  DEPLOYMENTS_TITLE: 'View Agent Pipelines',
  DEPLOYMENTS_SEARCH_PLACEHOLDER: 'Search pipelines…',
  DEPLOYMENTS_EMPTY: 'No pipelines found',
  DEPLOYMENTS_EMPTY_HINT: 'Save and create a pipeline in the Agent Designer to see it here.',
  DEPLOYMENTS_OPEN_IN_DESIGNER: 'Open in Designer',
  DEPLOYMENTS_VIEW_IN_AGENT_STUDIO: 'View in Agent Studio',
  DEPLOYMENTS_STATUS_BTN: 'Status',
  DEPLOYMENTS_BACK_TO_DESIGNER: 'Go to Designer',

  // ── PublishModal ──────────────────────────────────────────────────────────────
  PUBLISH_MODAL_PIPELINE_LIVE: 'Pipeline is live!',
  PUBLISH_MODAL_VIEW_STATUS: 'View Status',
  PUBLISH_MODAL_CANCEL: 'Cancel',
  PUBLISH_MODAL_CLOSE: 'Close',
  PUBLISH_MODAL_BTN_CREATE: 'Create',
  PUBLISH_MODAL_BTN_UPDATE: 'Update',
  PUBLISH_MODAL_BTN_RETRY: 'Retry',
  PUBLISH_MODAL_TOAST_ERROR: 'Pipeline creation failed',
} as const;
