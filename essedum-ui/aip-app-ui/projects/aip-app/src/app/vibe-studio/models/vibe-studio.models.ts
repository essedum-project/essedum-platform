export interface VibeSession {
  id: string;
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
  | 'idle'
  | 'selecting'
  | 'generating'
  | 'deploying'
  | 'live'
  | 'error';

export interface VibeChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VibeFile {
  path: string;
  content: string;
}

export interface VibeGenerateRequest {
  prompt: string;
  model: VibeModel;
  sessionId: string;
}

export interface VibeDeployRequest {
  files: VibeFile[];
  appType: string;
}

export interface VibeSseEvent {
  type: 'token' | 'file' | 'app_type' | 'done';
  data?: string;
  path?: string;
  content?: string;
  fileCount?: number;
}

export interface VibePreviewEvent {
  type: 'preview_ready';
  url: string;
}

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
  }
];
