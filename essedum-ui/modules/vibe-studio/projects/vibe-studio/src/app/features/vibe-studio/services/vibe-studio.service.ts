import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import {
  VibeSession,
  VibeChatMessage,
  VibeFile,
  VibeModel,
  VibeSessionStatus,
  AppType,
  GooseMessage,
  GooseReplyRequest,
  GooseAgentStartRequest,
  GOOSE_PROVIDER_MAP,
} from '../models/vibe-studio.models';

function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

const PROJECT_STRUCTURE_INSTRUCTIONS = `
You build web applications, backends, data apps, and MCP servers.
Read the user's request carefully and pick the correct project type below.
Do NOT default to React — match the type to what the user asks for.

## CRITICAL: What files to create

ALWAYS create MULTIPLE files — a source file, a requirements.txt or package.json, AND a Dockerfile.
NEVER create a single HTML file as the output for a backend, MCP server, or Streamlit app.
A single .html file CANNOT be deployed. It will always fail.

The only time you output HTML is for React frontend source files (e.g. frontend/src/App.js which contain JSX, NOT a standalone .html page).

## How to choose the project type
- User asks for a **website, dashboard, UI, web app** → use React (see below)
- User asks for a **data science, ML, analytics** app → use Streamlit
- User asks for an **MCP server, tool server, AI tool provider, agent integration** → use MCP server structure
- User asks for an **API, backend, microservice** with no frontend → use Python FastAPI or Node.js Express

When in doubt between React and another type, ask yourself: does this need a browser UI? If not, do NOT use React and do NOT create HTML files.

---

## React web application (only for UI/dashboard/website requests)

Use this structure **only** when the user explicitly asks for a website, web app, dashboard, or UI.
The preview system handles bundling, JSX transpilation, and React mounting — you just write the source files.

\`\`\`
project-name/
├── frontend/
│   ├── src/
│   │   ├── App.js              ← root React component (REQUIRED)
│   │   ├── App.css             ← styles for App (optional)
│   │   └── components/
│   │       ├── MyComponent.js  ← one component per file
│   │       └── MyComponent.css ← styles for that component (optional)
│   └── Dockerfile
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
\`\`\`

## Frontend rules (CRITICAL)

### App.js
- Export a **default function named \`App\`**.
- Always use \`React.useState\`, \`React.useEffect\`, \`React.useCallback\`, etc.
  (prefix every hook with \`React.\` — do NOT destructure from an import).
- Return JSX — standard HTML tags in lowercase, React components in PascalCase.

### Component files (\`frontend/src/components/MyComponent.js\`)
- Each file defines **exactly one component** as a named function.
- Do **NOT** use \`export\`, \`import\`, or \`require\` in any frontend file.
  The preview system concatenates all files automatically.

### CSS files
- Put styles in a \`.css\` file next to the component.
- Reference class names with \`className\` in JSX.
- Do NOT use inline style objects or CSS-in-JS libraries.

### API calls
- Use \`fetch('/api/...')\` — never hardcode \`localhost\`, a port, or a full URL.

### What NOT to do (will break the preview)
- Do NOT write any \`import\` or \`require\` statement in frontend files.
- Do NOT call \`ReactDOM.createRoot\` or \`ReactDOM.render\`.
- Do NOT generate \`node_modules/\`, \`package-lock.json\`, \`build/\`, or \`dist/\`.
- Do NOT generate \`public/index.html\` or \`src/index.js\`.
- Do NOT use TypeScript (\`.ts\`, \`.tsx\`).
- Do NOT reference any CDN URL or external script.
- Do NOT use CSS-in-JS (styled-components, emotion, etc.).

## Backend rules

The backend can be written in **Node.js (Express)** or **Python (FastAPI / Flask)**.
Choose based on what the user asks for. If not specified, default to Node.js.

### Node.js backend (\`backend/server.js\`)
- Express server listening on \`process.env.PORT || 5000\`.
- Include CORS middleware (\`cors\` npm package).
- All API routes prefixed with \`/api/\`.
- Respond with JSON.

### Python backend (\`backend/app.py\` or \`backend/main.py\`)
- Use **FastAPI** (preferred) or **Flask**.
- Always bind to \`0.0.0.0\` and read port from \`os.environ.get("PORT", 5000)\`.

## Streamlit frontend (for data science / ML / analytics projects)

When the user asks for a **data science, ML, analytics, or Python-first** application,
use **Streamlit** as the frontend instead of React.

### Project structure for Streamlit projects
\`\`\`
project-name/
├── app.py                  ← Streamlit frontend (REQUIRED)
├── requirements.txt        ← ALL Python dependencies
├── Dockerfile
├── docker-compose.yml
├── README.md
└── src/                    ← helper modules (optional)
\`\`\`

### \`app.py\` rules
- Always include \`st.set_page_config(page_title="...", layout="wide")\` as the first Streamlit call.
- Use \`st.sidebar\` for controls/filters, \`st.columns()\` for multi-column layouts.
- Handle errors with \`st.error()\` / \`st.warning()\`.

### Dockerfile for Streamlit
\`\`\`dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501", "--server.headless=true"]
\`\`\`

## MCP server (for AI tool / agent integration projects)

When the user asks for an **MCP server**, **AI tool server**, or any project that exposes tools for AI agents,
use **FastMCP** (Python) or **@modelcontextprotocol/sdk** (Node.js).

**CRITICAL: ALWAYS use HTTP transport (SSE). NEVER use stdio transport.**
stdio servers cannot be deployed as containers.

### Project structure for Python MCP servers
\`\`\`
project-name/
├── server.py               ← MCP server entry point (REQUIRED)
├── requirements.txt        ← ALL Python dependencies (REQUIRED)
├── Dockerfile              ← (REQUIRED)
└── docker-compose.yml
\`\`\`

### \`server.py\` — Python FastMCP example
\`\`\`python
from fastmcp import FastMCP
import os

mcp = FastMCP("my-server")

@mcp.tool()
def add(a: int, b: int) -> int:
    '''Add two numbers together.'''
    return a + b

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    mcp.run(transport="sse", host="0.0.0.0", port=port)
\`\`\`

### Dockerfile for Python MCP servers
\`\`\`dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["python", "server.py"]
\`\`\`

### MCP server rules (CRITICAL)
- **ALWAYS** use HTTP transport: \`mcp.run(transport="sse", ...)\` in Python.
- **NEVER** use \`mcp.run()\` with no args (defaults to stdio).
- **ALWAYS** bind to \`0.0.0.0\` — required for container networking.
- Port: default **8080** for Python (FastMCP), **3000** for Node.js.
- **NEVER create a single HTML file** for an MCP server.

## Docker deployment (REQUIRED for every project)

Every project MUST include complete Docker configuration.

### \`docker-compose.yml\` (REQUIRED)
\`\`\`yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    restart: unless-stopped
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
\`\`\`

### Rules for Docker files
- Always pin base image versions (e.g. \`node:18-alpine\`, \`python:3.11-slim\`).
- Always include \`requirements.txt\` for Python backends with ALL dependencies.
- Never bake secrets or API keys into Dockerfiles — use environment variables.
`;

const VIBE_STUDIO_RECIPE = {
  version: '1.0.0',
  title: 'App Dev Session',
  description: 'Builds web apps, backends, Streamlit apps, and MCP servers. Detects the correct project type from the user request.',
  instructions: PROJECT_STRUCTURE_INSTRUCTIONS,
};

@Injectable()
export class VibeStudioService implements OnDestroy {

  private session: VibeSession;
  /** AbortController for the active fetch-based SSE stream. */
  private replyAbortController: AbortController | null = null;
  private streamingAssistantIndex: number | null = null;
  /** Guards against duplicate push-to-github calls within a single generation round. */
  private pushInFlight = false;

  readonly sseEvents$         = new Subject<any>();
  readonly status$            = new BehaviorSubject<VibeSessionStatus>('idle');
  readonly files$             = new BehaviorSubject<VibeFile[]>([]);
  readonly messages$          = new BehaviorSubject<VibeChatMessage[]>([]);
  readonly previewUrl$        = new BehaviorSubject<string | null>(null);
  readonly tokenStream$       = new Subject<string>();
  readonly sessionId$         = new BehaviorSubject<string | null>(null);
  /** Emits the complete final file list exactly once when a generation round fully completes. */
  readonly generationComplete$ = new Subject<VibeFile[]>();
  /** Emits once when the ZIP of generated files is successfully stored in the pipeline card. */
  readonly fileUploadSuccess$  = new Subject<void>();
  /** Deployment status after the ZIP upload triggers /sessions/{id}/preview. */
  readonly deploymentStatus$  = new BehaviorSubject<'idle' | 'deploying' | 'success' | 'error'>('idle');
  /** Raw response from /sessions/{id}/preview on success. */
  readonly deploymentResult$  = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    @Inject('envi') private baseUrl: string,
  ) {
    this.session = this.createNewSession();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  getSession(): VibeSession {
    return this.session;
  }

  /** Fetches the available LLM providers from the backend configuration endpoint. */
  getProviders(): Observable<any> {
    const url = `${this.baseUrl}/service/v1/vibe-coding/config/providers`;
    return this.http.get<any>(url, { headers: this.getHttpHeaders() });
  }

  setAppType(appType: AppType): void {
    this.session.appType = appType;
    this.status$.next('selecting');
  }

  /** Change LLM model (and optionally the agent provider name). If a Goose session is already running, propagates immediately. */
  setModel(model: VibeModel, agentProvider?: string): void {
    this.session.model = model;
    if (agentProvider !== undefined) {
      this.session.agentProvider = agentProvider;
    }
    if (this.session.id) {
      this.updateProvider();
    }
  }

  /** Update the agent provider name stored in the session (sent as `provider` in update-provider calls). */
  setAgentProvider(name: string): void {
    this.session.agentProvider = name;
  }

  /** Read the currently stored agent provider (e.g. 'ollama', 'azure_openai'). */
  get currentAgentProvider(): string { return this.session.agentProvider; }

  /** Read the currently stored model name. */
  get currentModel(): VibeModel { return this.session.model; }

  /**
   * Sends a user message to the Goose agent and opens an SSE stream for the reply.
   * Starts the agent session on first call (lazy init).
   *
   * Alias: `generate()` is kept so left-panel component needs no changes.
   */
  generate(prompt: string, displayText?: string): void {
    const userMsg: VibeChatMessage = { role: 'user', content: displayText ?? prompt, timestamp: new Date() };
    this.session.messages.push(userMsg);
    this.messages$.next([...this.session.messages]);
    this.status$.next('generating');

    this.cancelReply(); // abort any in-flight reply stream first
    this.pushInFlight = false; // allow push for this new generation round

    this.ensureAgentStarted().then((sessionId) => {
      this.openReplyStream(sessionId, prompt + ' - send all code files generated here');
    }).catch(() => {
      const errMsg: VibeChatMessage = {
        role: 'assistant',
        content: '⚠️ Failed to start the AI agent session. Please refresh the page and try again.',
        timestamp: new Date(),
      };
      this.session.messages.push(errMsg);
      this.messages$.next([...this.session.messages]);
      this.status$.next('error');
    });
  }

  /** Cancel the currently streaming Goose reply locally (if any). */
  cancelReply(): void {
    if (this.replyAbortController) {
      this.replyAbortController.abort();
      this.replyAbortController = null;
    }
    if (this.streamingAssistantIndex !== null) {
      this.session.messages.splice(this.streamingAssistantIndex, 1);
      this.streamingAssistantIndex = null;
      this.messages$.next([...this.session.messages]);
    }
  }

  /** Stop the running Goose agent for this session. */
  stopAgent(): void {
    if (!this.session.id) return;
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/stop`;
    this.http.post(url, { session_id: this.session.id }, { headers: this.getHttpHeaders() })
      .subscribe({ error: () => {} });
    this.session.id = null;
  }

  /** Reset the local session and stop the running Goose agent. */
  resetSession(): void {
    this.cancelReply();
    this.stopAgent();
    this.session = this.createNewSession();
    this.status$.next('idle');
    this.files$.next([]);
    this.messages$.next([]);
    this.previewUrl$.next(null);
    this.sessionId$.next(null);
    this.deploymentStatus$.next('idle');
    this.deploymentResult$.next(null);
  }

  ngOnDestroy(): void {
    this.cancelReply();
  }

  // ─── Goose agent lifecycle ───────────────────────────────────────────────────

  /**
   * Ensures a Goose agent session exists.
   * On first call: POSTs /agent/start and applies the selected model via /agent/update_provider.
   * Subsequent calls: resolves immediately with the cached session ID.
   */
  private ensureAgentStarted(): Promise<string> {
    if (this.session.id) {
      return Promise.resolve(this.session.id);
    }

    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/service/v1/vibe-coding/agent/start`;
      const body: GooseAgentStartRequest = {
        working_dir: '.',
        recipe: VIBE_STUDIO_RECIPE,
      };

      this.http.post<any>(url, body, { headers: this.getHttpHeaders() }).subscribe({
        next: (resp) => {
          const sessionId: string | undefined =
            resp?.id ?? resp?.session_id ?? resp?.sessionId;

          if (!sessionId) {
            reject(new Error('Goose did not return a session ID'));
            return;
          }
          this.session.id = sessionId;
          this.sessionId$.next(sessionId);
          this.applyModelToSession(sessionId, this.session.model)
            .then(() => resolve(sessionId))
            .catch(() => resolve(sessionId)); // non-fatal
        },
        error: reject,
      });
    });
  }

  /** Calls /agent/update_provider so the session uses the selected VibeModel. */
  private applyModelToSession(sessionId: string, model: VibeModel): Promise<void> {
    const provider = this.session.agentProvider || model;
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/update-provider`;
    return new Promise((resolve, reject) => {
      this.http.post(url,
        { session_id: sessionId, provider, model },
        { headers: this.getHttpHeaders() },
      ).subscribe({ next: () => resolve(), error: reject });
    });
  }

  /** Hot-swap the provider on an already-running session. */
  private updateProvider(): void {
    if (!this.session.id) return;
    const provider = this.session.agentProvider || this.session.model;
    const model = this.session.model;
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/update-provider`;
    this.http.post(url,
      { session_id: this.session.id, provider, model },
      { headers: this.getHttpHeaders() },
    ).subscribe({
      error: () => {
        const errMsg: VibeChatMessage = {
          role: 'assistant',
          content: '⚠️ Failed to update the agent/model configuration. Please check your selection and try again.',
          timestamp: new Date(),
        };
        this.session.messages.push(errMsg);
        this.messages$.next([...this.session.messages]);
        this.status$.next('error');
      },
    });
  }

  // ─── Goose reply SSE stream ──────────────────────────────────────────────────

  private openReplyStream(sessionId: string, prompt: string): void {
    const url = `${this.baseUrl}/service/v1/vibe-coding/reply`;

    const userMessage: GooseMessage = {
      id: generateRequestId(),
      role: 'user',
      created: Math.floor(Date.now() / 1000),
      content: [{ type: 'text', text: prompt }],
      metadata: { agentVisible: true, userVisible: true },
    };

    const body: GooseReplyRequest = {
      session_id: sessionId,
      user_message: userMessage,
    };

    this.replyAbortController = new AbortController();
    const { signal } = this.replyAbortController;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...this.getHttpHeaders(),
    };

    let assistantText = '';
    this.startStreamingAssistantMessage();

    fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include', signal })
      .then((response) => {
        if (!response.ok || !response.body) {
          const msg = response.status === 403
            ? `Access denied (403 Forbidden). Your session may have expired — please refresh the page and try again.`
            : `The request failed with status ${response.status}. Please try again.`;
          assistantText = `⚠️ ${msg}`;
          this.updateStreamingAssistantMessage(assistantText);
          this.finaliseAssistantMessage(assistantText);
          this.status$.next('error');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // Flush any remaining buffered SSE event before finalizing.
              this.processSseChunk(buffer, (chunk) => {
                assistantText += chunk;
                this.tokenStream$.next(chunk);
                this.updateStreamingAssistantMessage(assistantText);
              });
              // If the stream closed with no content, surface an error in the chat panel.
              if (!assistantText.trim()) {
                assistantText = '⚠️ The agent did not return a response. This could be a model configuration issue or the agent may be unavailable. Please check your agent/model selection and try again.';
                this.updateStreamingAssistantMessage(assistantText);
                this.status$.next('error');
              }
              this.finaliseAssistantMessage(assistantText);
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const processed = this.processSseChunk(buffer, (chunk) => {
              assistantText += chunk;
              this.tokenStream$.next(chunk);
              this.updateStreamingAssistantMessage(assistantText);
            });
            buffer = processed.remaining;

            read();
          }).catch((err: any) => {
            if (err?.name !== 'AbortError') {
              const errMsg = '⚠️ Connection to the agent was interrupted. Please try again.';
              if (!assistantText.trim()) assistantText = errMsg;
              this.updateStreamingAssistantMessage(assistantText);
              this.finaliseAssistantMessage(assistantText);
              this.status$.next('error');
            }
          });
        };

        read();
      })
      .catch((err: any) => {
        if (err?.name !== 'AbortError') {
          const msg = '⚠️ A network error occurred while connecting to the AI agent. Please check your connection and try again.';
          assistantText = msg;
          this.updateStreamingAssistantMessage(assistantText);
          this.finaliseAssistantMessage(assistantText);
          this.status$.next('error');
        }
      });
  }

  private processSseChunk(
    chunk: string,
    emit: (text: string) => void
  ): { remaining: string } {
    const normalized = chunk.replace(/\r\n/g, '\n');
    const events = normalized.split('\n\n');
    const remaining = events.pop() ?? '';

    for (const rawEvent of events) {
      const dataLines: string[] = [];
      const lines = rawEvent.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (!dataLines.length) {
        continue;
      }

      const data = dataLines.join('\n').trim();
      if (!data || data === '[DONE]') {
        continue;
      }

      this.extractAndEmitText(data, emit);
    }

    return { remaining };
  }

  private extractAndEmitText(rawData: string, emit: (text: string) => void): void {
    try {
      const parsed = JSON.parse(rawData);
      this.sseEvents$.next(parsed);
      this.extractText(parsed, emit);
      this.extractFiles(parsed);
    } catch {
      // raw non-JSON chunk — treat as plain text
      emit(rawData);
    }
  }

  // ─── File extraction from Goose tool events ──────────────────────────────────

  /**
   * Walks a Goose SSE event looking for toolRequest content parts that write files.
   * Supports: write_file, create_file, str_replace_editor (command=write/create),
   * developer__text_editor, and any *_editor tool with a `file_text` field.
   */
  private extractFiles(event: any): void {
    if (!event) return;

    // Unwrap common wrappers
    if (event.message && typeof event.message === 'object') {
      this.extractFiles(event.message);
    }
    if (event.data && typeof event.data === 'object') {
      this.extractFiles(event.data);
    }

    // Full message shape: { role, content: [...] }
    if (Array.isArray(event.content)) {
      for (const part of event.content) {
        if (part?.type === 'toolRequest' && part.toolUse) {
          this.extractFileFromToolUse(part.toolUse);
        }
      }
    }

    // Bare toolUse at top level
    if (event.toolUse) {
      this.extractFileFromToolUse(event.toolUse);
    }
  }

  private extractFileFromToolUse(toolUse: any): void {
    if (!toolUse?.name || !toolUse?.input) return;
    const name = (toolUse.name as string).toLowerCase();
    const input = toolUse.input;

    // write_file / create_file: { path, content }
    if ((name === 'write_file' || name === 'create_file') &&
        typeof input.path === 'string' && typeof input.content === 'string') {
      this.upsertFile(input.path, input.content);
      return;
    }

    // str_replace_editor / text_editor / developer__text_editor:
    //   { command: 'write'|'create', path, file_text }
    if ((name.includes('editor') || name.includes('text_editor')) &&
        typeof input.path === 'string' && typeof input.file_text === 'string' &&
        (input.command === 'write' || input.command === 'create' || !input.command)) {
      this.upsertFile(input.path, input.file_text);
      return;
    }

    // Fallback: any tool with a path + file_text field
    if (typeof input.path === 'string' && typeof input.file_text === 'string') {
      this.upsertFile(input.path, input.file_text);
    }
  }

  /**
   * After the full streamed text is available, extract fenced code blocks that are
   * preceded by a recognisable filename header so casual text-mode responses also
   * surface files (e.g. when the agent describes a file then shows its content).
   *
   * Patterns matched (all are optional leading annotations):
   *   **src/App.jsx**          bold filename before the fence
   *   `src/App.jsx`            backtick filename before the fence
   *   ### src/App.jsx          heading filename before the fence
   *   // src/App.jsx           comment as first line inside the fence
   *   # src/App.jsx            hash comment as first line inside the fence
   */
  private extractFilesFromMarkdown(text: string): void {
    if (!text) return;

    const FILE_PAT = '[\\w][\\w./\\-]*\\.\\w{1,10}';

    // Leading annotation before the fence: **name**, `name`, ### name
    // Using string concatenation to avoid backtick-inside-template-literal issues
    const prefixPattern = '(?:\\*{1,2}|[`]|#{1,4}\\s+)(' + FILE_PAT + ')(?:\\*{1,2}|[`])?\\s*(?::|\\s*\\n)';
    const prefixRe = new RegExp(prefixPattern, 'gm');

    // Build a list of (offset, filename) from prefix annotations
    const prefixes: Array<{ offset: number; name: string }> = [];
    let pm: RegExpExecArray | null;
    while ((pm = prefixRe.exec(text)) !== null) {
      prefixes.push({ offset: pm.index, name: pm[1] });
    }

    // Walk every fenced code block
    const blockRe = /```(?:\w+)?\n([\s\S]*?)```/g;
    let bm: RegExpExecArray | null;
    while ((bm = blockRe.exec(text)) !== null) {
      const blockStart = bm.index;
      const blockContent = bm[1];

      // Check for a prefix annotation within 120 chars before this fence
      const nearby = prefixes.find(p => blockStart - p.offset >= 0 && blockStart - p.offset <= 120);
      if (nearby) {
        this.upsertFile(nearby.name, blockContent);
        continue;
      }

      // Check first line of block for a filename comment (// file.js or # file.py)
      const firstLine = blockContent.split('\n')[0].trim();
      const commentMatch = firstLine.match(/^(?:\/\/|#)\s*([\w][\w./\-]*\.\w{1,10})\s*$/);
      if (commentMatch) {
        const contentWithoutComment = blockContent.slice(firstLine.length).replace(/^\n/, '');
        this.upsertFile(commentMatch[1], contentWithoutComment);
      }
    }
  }

  private upsertFile(path: string, content: string): void {
    // Normalise path (strip leading ./ or /)
    const normPath = path.replace(/^\.?\//, '');
    const current = [...this.files$.value];
    const idx = current.findIndex(f => f.path === normPath);
    if (idx >= 0) {
      current[idx] = { path: normPath, content };
    } else {
      current.push({ path: normPath, content });
    }
    this.session.files = current;
    this.files$.next(current);
  }

  /**
   * Extracts text tokens from a Goose SSE event, supporting both full-message
   * format `{ role, content: [{ type: "text", text: "..." }] }` and delta
   * formats `{ type: "text" | "text_delta", text: "..." }`.
   */
  private extractText(event: any, emit: (text: string) => void): void {
    if (!event) {
      return;
    }

    // OpenAI-style: { choices: [{ delta: { content: "..." } }] }
    if (Array.isArray(event.choices)) {
      for (const choice of event.choices) {
        const deltaContent = choice?.delta?.content;
        if (typeof deltaContent === 'string' && deltaContent) {
          emit(deltaContent);
        }
        const messageContent = choice?.message?.content;
        if (typeof messageContent === 'string' && messageContent) {
          emit(messageContent);
        }
      }
    }

    // Nested wrappers: { message: {...} } or { data: {...} }
    if (event.message && typeof event.message === 'object') {
      this.extractText(event.message, emit);
    }
    if (event.data && typeof event.data === 'object') {
      this.extractText(event.data, emit);
    }

    // Full message: { role, content: [...] }
    if (event.role && Array.isArray(event.content)) {
      for (const part of event.content) {
        if ((part.type === 'text' || part.type === 'text_delta') && part.text) {
          emit(part.text);
        }
        if (typeof part?.content === 'string' && part.content) {
          emit(part.content);
        }
      }
    }

    // Generic content shapes
    if (typeof event.content === 'string' && event.content) {
      emit(event.content);
    }
    if (typeof event.text === 'string' && event.text) {
      emit(event.text);
    }
    if (typeof event.delta === 'string' && event.delta) {
      emit(event.delta);
    }

    // Delta: { type: 'text' | 'text_delta', text: '...' }
    if ((event.type === 'text' || event.type === 'text_delta') && event.text) {
      emit(event.text);
    }
  }

  /** Commits the accumulated assistant text as a chat message and transitions status. */
  private finaliseAssistantMessage(text: string): void {
    this.replyAbortController = null;

    // Scan full streamed text for fenced code blocks with filename headers
    this.extractFilesFromMarkdown(text);

    // Commit the assistant message bubble
    if (this.streamingAssistantIndex !== null) {
      if (text) {
        this.session.messages[this.streamingAssistantIndex].content = text;
      } else {
        this.session.messages.splice(this.streamingAssistantIndex, 1);
      }
      this.streamingAssistantIndex = null;
      this.messages$.next([...this.session.messages]);
    } else if (text) {
      const msg: VibeChatMessage = { role: 'assistant', content: text, timestamp: new Date() };
      this.session.messages.push(msg);
      this.messages$.next([...this.session.messages]);
    }

    // Check for a live preview URL
    if (text) {
      const urlMatch = text.match(/https?:\/\/[^\s"')\]]+/);
      if (urlMatch) {
        this.session.previewUrl = urlMatch[0];
        this.previewUrl$.next(urlMatch[0]);
        this.status$.next('live');
        // still fall through to call list_apps below
      }
    }

    // Call list_apps after every reply to get all generated files.
    if (this.session.id) {
      const sid = this.session.id;
      this.listAppsAndFetchFiles(sid, () => {
        // Emit the complete file list before transitioning to idle
        if (this.files$.value.length) {
          this.generationComplete$.next([...this.files$.value]);
          this.triggerPushToGitHub(sid);
        }
        if (this.status$.value !== 'live') {
          this.status$.next('idle');
        }
      });
      return;
    }

    if (this.status$.value !== 'live') {
      this.status$.next('idle');
    }
  }

  // ─── Post-stream file loading via list_apps + call-tool ─────────────────────

  /**
   * Calls GET /agent/list-apps?session_id=<id>, extracts every file path,
   * reads file content via /agent/call-tool (developer__text_editor view),
   * upserts into files$, then calls done().
   *
   * Handles all known Goose list_apps response shapes:
   *   • Array of app objects:  [{ name, files: ["path", ...] | { "path": "content" } }]
   *   • Wrapped:               { apps: [...] }
   *   • Files with content:    { files: { "path": "content" } }
   */
  private listAppsAndFetchFiles(sessionId: string, done: () => void): void {
    // Safety net: guarantee done() fires within 90 s even if call-tool requests hang.
    let resolved = false;
    const safeDone = () => { if (!resolved) { resolved = true; done(); } };
    const safetyTimer = setTimeout(safeDone, 90000);

    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/list-apps`;
    this.http
      .get<any>(url, {
        params: { session_id: sessionId },
        headers: this.getHttpHeaders() as any,
      })
      .subscribe({
        next: (resp) => {
          clearTimeout(safetyTimer);
          const pathsToFetch = this.extractFilePathsFromListApps(resp);
          if (pathsToFetch.length > 0) {
            this.fetchFilesFromServer(sessionId, pathsToFetch, safeDone);
          } else {
            safeDone();
          }
        },
        error: () => { clearTimeout(safetyTimer); safeDone(); },
      });
  }

  /**
   * Walks any list_apps response shape and:
   *  - if content already present → calls upsertFile immediately
   *  - if only a path → adds to the returned array for later fetching
   */
  private extractFilePathsFromListApps(resp: any): string[] {
    const pathsToFetch: string[] = [];

    const isSessionApp = (app: any): boolean => {
      // MCP session apps have uri like "ui://apps/..." or mimeType "text/html;profile=mcp-app"
      // or carry inline text content with no files — these are NOT source-code apps.
      if (typeof app.uri === 'string' && app.uri.startsWith('ui://')) return true;
      if (typeof app.mimeType === 'string' && app.mimeType.includes('mcp-app')) return true;
      if (typeof app.text === 'string' && !app.files) return true;
      return false;
    };

    const processApp = (app: any): void => {
      // Skip MCP / session apps — they should not be fetched or pushed
      if (isSessionApp(app)) return;

      // Derive the app's root directory name from name or path
      let appDir = '';
      if (typeof app.name === 'string' && app.name.trim()) {
        appDir = app.name.trim();
      } else if (typeof app.path === 'string' && app.path) {
        appDir = app.path.split('/').pop() ?? '';
      }

      const qualify = (filePath: string): string => {
        // Strip leading absolute prefix, keep everything from appDir onward
        if (filePath.startsWith('/')) {
          const idx = appDir ? filePath.indexOf('/' + appDir + '/') : -1;
          if (idx >= 0) {
            return filePath.slice(idx + 1); // e.g. "simple-react-app/src/App.jsx"
          }
          return filePath.replace(/^\/+/, ''); // strip leading slash
        }
        // Already relative — prefix with appDir if not already prefixed
        if (appDir && !filePath.startsWith(appDir + '/')) {
          return appDir + '/' + filePath;
        }
        return filePath;
      };

      if (app.files && typeof app.files === 'object' && !Array.isArray(app.files)) {
        // { files: { "path": "content" } } — content already available
        for (const [filePath, content] of Object.entries(app.files)) {
          if (typeof content === 'string' && content.trim()) {
            this.upsertFile(qualify(filePath), content);
          } else {
            const p = qualify(filePath);
            if (!pathsToFetch.includes(p)) pathsToFetch.push(p);
          }
        }
      } else if (Array.isArray(app.files)) {
        // { files: ["path", ...] } — only paths, need to fetch content
        for (const f of app.files) {
          if (typeof f === 'string') {
            const p = qualify(f);
            if (!pathsToFetch.includes(p)) pathsToFetch.push(p);
          }
        }
      }
    };

    if (Array.isArray(resp)) {
      resp.forEach(processApp);
    } else if (resp?.apps && Array.isArray(resp.apps)) {
      resp.apps.forEach(processApp);
    } else if (resp && typeof resp === 'object') {
      processApp(resp);
    }

    return pathsToFetch;
  }

  /**
   * Calls POST /agent/call-tool sequentially for each path to read file content
   * from the Goose server filesystem, then invokes `done` when all are fetched.
   */
  private fetchFilesFromServer(sessionId: string, paths: string[], done: () => void): void {
    const fetchNext = (index: number): void => {
      if (index >= paths.length) {
        done();
        return;
      }

      const path = paths[index];
      const url = `${this.baseUrl}/service/v1/vibe-coding/agent/call-tool`;
      const body = {
        session_id: sessionId,
        tool_name: 'developer__text_editor',
        input: { command: 'view', path },
      };

      this.http.post<any>(url, body, { headers: this.getHttpHeaders() }).subscribe({
        next: (resp) => {
          const content = this.extractContentFromToolResponse(resp);
          if (content !== null && content !== undefined && content.trim() !== '') {
            this.upsertFile(path, content);
          }
          fetchNext(index + 1);
        },
        error: () => fetchNext(index + 1),
      });
    };

    fetchNext(0);
  }

  /**
   * Tries to extract a plain-text file content string out of whatever shape
   * the Goose /agent/call_tool endpoint returns.
   */
  private extractContentFromToolResponse(resp: any): string | null {
    if (!resp) return null;
    if (typeof resp === 'string') return resp;

    // Direct string fields
    if (typeof resp.output   === 'string') return resp.output;
    if (typeof resp.content  === 'string') return resp.content;
    if (typeof resp.result   === 'string') return resp.result;
    if (typeof resp.text     === 'string') return resp.text;

    // Nested result: { result: { content|output: "..." } }
    if (resp.result && typeof resp.result === 'object') {
      if (typeof resp.result.content === 'string') return resp.result.content;
      if (typeof resp.result.output  === 'string') return resp.result.output;
      if (typeof resp.result.text    === 'string') return resp.result.text;
    }

    // { toolResult: { content: [...] | "..." } }
    if (resp.toolResult) {
      if (typeof resp.toolResult.content === 'string') return resp.toolResult.content;
      if (Array.isArray(resp.toolResult.content)) {
        const parts = resp.toolResult.content
          .map((c: any) => c?.text ?? c?.content ?? '')
          .filter(Boolean);
        if (parts.length) return parts.join('\n');
      }
    }

    // Array content: { content: [{ type: "text", text: "..." }] }
    if (Array.isArray(resp.content)) {
      const parts = resp.content
        .map((c: any) => c?.text ?? c?.content ?? '')
        .filter(Boolean);
      if (parts.length) return parts.join('\n');
    }

    // messages array: { messages: [{ content: [...] }] }
    if (Array.isArray(resp.messages)) {
      for (const msg of resp.messages) {
        const extracted = this.extractContentFromToolResponse(msg);
        if (extracted) return extracted;
      }
    }

    return null;
  }

  private startStreamingAssistantMessage(): void {
    const msg: VibeChatMessage = { role: 'assistant', content: '', timestamp: new Date() };
    this.session.messages.push(msg);
    this.streamingAssistantIndex = this.session.messages.length - 1;
    this.messages$.next([...this.session.messages]);
  }

  private updateStreamingAssistantMessage(text: string): void {
    if (this.streamingAssistantIndex === null) {
      this.startStreamingAssistantMessage();
    }
    if (this.streamingAssistantIndex !== null) {
      this.session.messages[this.streamingAssistantIndex].content = text;
      this.messages$.next([...this.session.messages]);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private createNewSession(): VibeSession {
    return {
      id: null,
      appType: null,
      model: 'claude',
      agentProvider: '',
      messages: [],
      files: [],
      previewUrl: null,
      status: 'idle',
    };
  }

  private getHttpHeaders(): Record<string, string> {
    const project = JSON.parse(sessionStorage.getItem('project') || '{}');
    const role    = JSON.parse(sessionStorage.getItem('role')    || '{}');
    const headers: Record<string, string> = {
      Authorization:      'Bearer ' + (localStorage.getItem('jwtToken') ?? ''),
      Project:            project.id?.toString() ?? '',
      Roleid:             role.id?.toString()    ?? '',
      Rolename:           role.name?.toString()  ?? '',
      'Access-Token':     localStorage.getItem('accessToken') ?? '',
      'X-Requested-With': 'Leap',
    };
    const csrf = this.readCsrfCookie();
    if (csrf) {
      headers['X-XSRF-TOKEN'] = csrf;
    }
    return headers;
  }

  /** Reads the XSRF-TOKEN cookie set by the backend for CSRF protection. */
  private readCsrfCookie(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  /**
   * Bundles all generated files into a ZIP and uploads to the folder/upload endpoint.
   * Uses the same auth headers as every other vibe-coding API call.
   */
  async uploadFilesAsZip(files: VibeFile[], cname: string): Promise<void> {
    if (!files.length || !cname) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });

      // Resolve org — same priority order as the rest of the platform
      const project = JSON.parse(sessionStorage.getItem('project') || '{}');
      const org: string =
        project?.organization ||
        sessionStorage.getItem('organization') ||
        localStorage.getItem('organisation') ||
        'default';

      const url = `${this.baseUrl}/folder/upload/${cname}/${org}?zipFile=null`;
      const formData = new FormData();
      formData.append('zipFile', new File([blob], `${cname}.zip`, { type: 'application/zip' }));

      // getHttpHeaders() provides Authorization (jwtToken), Access-Token, Project, Roleid, Rolename.
      // Do NOT set Content-Type — browser must set it with the multipart boundary.
      const sessionId = this.session.id;
      this.http.post(url, formData, { headers: this.getHttpHeaders() })
        .subscribe({
          next: () => {
            this.fileUploadSuccess$.next();
            if (sessionId) this.triggerPreview(sessionId);
          },
          error: () => { if (sessionId) this.triggerPreview(sessionId); },
        });
    } catch {
      // non-fatal — never disrupts the existing generation flow
    }
  }

  /**
   * Calls POST /sessions/{sessionId}/push-to-github after list-apps succeeds.
   * Fire-and-forget — does not block the file-fetching flow.
   * Pushes only the studio app folder (excludes vibesession) on a studio/* branch.
   */
  private triggerPushToGitHub(sessionId: string): void {
    // Guard: only one push per generation round
    if (this.pushInFlight) return;
    this.pushInFlight = true;

    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sessionId}/push-to-github`;
    const project = JSON.parse(sessionStorage.getItem('project') || '{}');

    // Derive the top-level app directory from generated files (e.g. "my-react-app").
    // A valid appDir must contain at least one nested file (i.e. some file path starts with "dir/").
    // Root-level files like "package.json" are NOT directories.
    const allFiles = this.files$.value;
    const dirCandidates = allFiles
      .map(f => f.path.split('/'))
      .filter(parts => parts.length > 1)   // only files inside a folder
      .map(parts => parts[0]);
    const appDir = dirCandidates.length ? dirCandidates[0] : null;

    // Only include files that belong to the app folder — exclude session / vibesession / root files
    const appFiles = appDir
      ? allFiles.filter(f => f.path.startsWith(appDir + '/'))
      : allFiles;
    const filePaths = appFiles.map(f => f.path);

    // Branch name: studio/<sessionId> — append appDir only when it's a real folder name
    const branchSuffix = appDir && appDir !== sessionId
      ? `${appDir}-${sessionId}`
      : sessionId;

    const body: any = {
      org: project?.name || 'leo1311',
      branch: `studio/${branchSuffix}`,
      push_dir: appDir ?? sessionId,
      exclude_dirs: ['vibesession'],
      files: filePaths,
    };
    this.http.post<any>(url, body, { headers: this.getHttpHeaders() as any })
      .subscribe({
        next: () => {},
        error: () => {},
      });
  }

  /**
   * Calls POST /sessions/{sessionId}/preview immediately after the ZIP upload.
   * Emits deployment progress via deploymentStatus$ and the raw result via deploymentResult$.
   */
  private triggerPreview(sessionId: string): void {
    this.deploymentStatus$.next('deploying');
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sessionId}/preview`;
    const body = { working_dir: '/home/engne2/essedum/goose' };
    this.http.post<any>(url, body, { headers: this.getHttpHeaders() as any })
      .subscribe({
        next: (result) => {
          const deployUrl = result?.deployUrl ?? result;
          this.deploymentResult$.next(deployUrl);
          this.deploymentStatus$.next('success');
        },
        error: () => {
          this.deploymentStatus$.next('error');
        },
      });
  }
}
