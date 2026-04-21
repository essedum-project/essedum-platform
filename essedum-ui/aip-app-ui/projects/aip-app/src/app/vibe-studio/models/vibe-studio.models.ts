// ─── Core session ────────────────────────────────────────────────────────────

export interface VibeSession {
  /** Goose session ID returned by POST /agent/start. Null until the agent is started. */
  id: string | null;
  appType: AppType | null;
  model: VibeModel;
  messages: VibeChatMessage[];
  files: VibeFile[];
  previewUrl: string | null;
  status: VibeSessionStatus;
}

export type AppType = 'agents_mcp' | 'react_app' | 'react_node' | 'streamlit';

export type VibeModel = 'claude' | 'gemini' | 'azure-oai';

export type VibeSessionStatus =
  | 'idle'       // no session, nothing started
  | 'selecting'  // app type picker visible, no chat yet
  | 'generating' // Goose agent is processing / streaming a reply
  | 'live'       // agent produced a preview URL
  | 'error';     // a fatal error occurred

export interface VibeChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VibeFile {
  path: string;
  content: string;
}

// ─── Goose API types ─────────────────────────────────────────────────────────

export interface GooseTextContent {
  type: 'text';
  text: string;
}

export interface GooseToolRequestContent {
  type: 'toolRequest';
  id: string;
  toolUse: { name: string; input: any };
}

export interface GooseToolResponseContent {
  type: 'toolResponse';
  id: string;
  toolResult: any;
}

/** Union of all Goose message content parts. */
export type GooseMessageContent =
  | GooseTextContent
  | GooseToolRequestContent
  | GooseToolResponseContent
  | { type: string; [key: string]: any };

/** A Goose conversation message (user or assistant). */
export interface GooseMessage {
  id?: string;
  role: 'user' | 'assistant';
  created: number;
  content: GooseMessageContent[];
  metadata?: { agentVisible?: boolean; userVisible?: boolean };
}

/** Request body for POST /reply. */
export interface GooseReplyRequest {
  session_id: string;
  user_message: GooseMessage;
  override_conversation?: GooseMessage[];
  recipe_name?: string;
  recipe_version?: string;
}

/** Request body for POST /agent/start. */
export interface GooseAgentStartRequest {
  working_dir: string;
  recipe?: any;
  recipe_id?: string;
  recipe_deeplink?: string;
  extension_overrides?: any[];
}

/** Maps a VibeModel UI value to a Goose provider identifier and default model. */
export const GOOSE_PROVIDER_MAP: Record<VibeModel, { provider: string; gooseModel: string }> = {
  'claude':    { provider: 'anthropic',    gooseModel: 'claude-3-5-sonnet-20241022' },
  'gemini':    { provider: 'google',       gooseModel: 'gemini-2.0-flash' },
  'azure-oai': { provider: 'azure-openai', gooseModel: 'gpt-4o' },
};

// ─── UI constants ─────────────────────────────────────────────────────────────

export const APP_TYPE_OPTIONS: { label: string; value: AppType; icon: string; description: string }[] = [
  {
    label: 'Agents, MCP Servers',
    value: 'agents_mcp',
    icon: 'assets/img/ai-agent-mini.jpg',
    description: 'Build AI agents and MCP server integrations'
  },
  {
    label: 'Simple React App',
    value: 'react_app',
    icon: 'assets/img/tools_icon.jpg',
    description: 'A standalone React frontend application'
  },
  {
    label: 'React Frontend + NodeJs Backend',
    value: 'react_node',
    icon: 'assets/img/resources_icon.jpg',
    description: 'Full-stack app with React UI and Node.js API'
  },
  {
    label: 'Streamlit App',
    value: 'streamlit',
    icon: 'assets/img/settings.png',
    description: 'Python Streamlit data application'
  },
];
