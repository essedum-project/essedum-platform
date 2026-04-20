import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';
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

@Injectable()
export class VibeStudioService implements OnDestroy {

  private session: VibeSession;
  /** AbortController for the active fetch-based SSE stream. */
  private replyAbortController: AbortController | null = null;
  private streamingAssistantIndex: number | null = null;

  readonly sseEvents$         = new Subject<any>();
  readonly status$            = new BehaviorSubject<VibeSessionStatus>('idle');
  readonly files$             = new BehaviorSubject<VibeFile[]>([]);
  readonly messages$          = new BehaviorSubject<VibeChatMessage[]>([]);
  readonly previewUrl$        = new BehaviorSubject<string | null>(null);
  readonly tokenStream$       = new Subject<string>();
  readonly sessionId$         = new BehaviorSubject<string | null>(null);
  /** Emits the complete final file list exactly once when a generation round fully completes. */
  readonly generationComplete$ = new Subject<VibeFile[]>();
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

  setAppType(appType: AppType): void {
    this.session.appType = appType;
    this.status$.next('selecting');
  }

  /** Change LLM model.  If a Goose session is already running, propagates immediately. */
  setModel(model: VibeModel): void {
    this.session.model = model;
    if (this.session.id) {
      this.updateProvider(model);
    }
  }

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

    this.ensureAgentStarted().then((sessionId) => {
      this.openReplyStream(sessionId, prompt + ' - send all code files generated here');
    }).catch(() => {
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
      const body: GooseAgentStartRequest = { working_dir: '.' };

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
    const { provider, gooseModel } = GOOSE_PROVIDER_MAP[model];
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/update-provider`;
    return new Promise((resolve, reject) => {
      this.http.post(url,
        { session_id: sessionId, provider, model: gooseModel },
        { headers: this.getHttpHeaders() },
      ).subscribe({ next: () => resolve(), error: reject });
    });
  }

  /** Hot-swap the provider on an already-running session. */
  private updateProvider(model: VibeModel): void {
    if (!this.session.id) return;
    const { provider, gooseModel } = GOOSE_PROVIDER_MAP[model];
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/update-provider`;
    this.http.post(url,
      { session_id: this.session.id, provider, model: gooseModel },
      { headers: this.getHttpHeaders() },
    ).subscribe({ error: () => {} });
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
          this.finaliseAssistantMessage(assistantText);
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
              this.finaliseAssistantMessage(assistantText);
            }
          });
        };

        read();
      })
      .catch((err: any) => {
        if (err?.name !== 'AbortError') {
          this.finaliseAssistantMessage(assistantText);
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
      this.listAppsAndFetchFiles(this.session.id, () => {
        // Emit the complete file list before transitioning to idle
        if (this.files$.value.length) {
          this.generationComplete$.next([...this.files$.value]);
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
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/list-apps`;
    this.http
      .get<any>(url, {
        params: { session_id: sessionId },
        headers: this.getHttpHeaders() as any,
      })
      .subscribe({
        next: (resp) => {
          const pathsToFetch = this.extractFilePathsFromListApps(resp);
          if (pathsToFetch.length > 0) {
            this.fetchFilesFromServer(sessionId, pathsToFetch, done);
          } else {
            done();
          }
        },
        error: () => done(),
      });
  }

  /**
   * Walks any list_apps response shape and:
   *  - if content already present → calls upsertFile immediately
   *  - if only a path → adds to the returned array for later fetching
   */
  private extractFilePathsFromListApps(resp: any): string[] {
    const pathsToFetch: string[] = [];

    const processApp = (app: any): void => {
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
      messages: [],
      files: [],
      previewUrl: null,
      status: 'idle',
    };
  }

  private getHttpHeaders(): Record<string, string> {
    const project = JSON.parse(sessionStorage.getItem('project') || '{}');
    const role    = JSON.parse(sessionStorage.getItem('role')    || '{}');
    return {
      Authorization:  'Bearer ' + (localStorage.getItem('jwtToken') ?? ''),
      Project:        project.id?.toString() ?? '',
      Roleid:         role.id?.toString()    ?? '',
      Rolename:       role.name?.toString()  ?? '',
      'Access-Token': localStorage.getItem('accessToken') ?? '',
    };
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
          next: () => { if (sessionId) this.triggerPreview(sessionId); },
          error: () => { if (sessionId) this.triggerPreview(sessionId); },
        });
    } catch {
      // non-fatal — never disrupts the existing generation flow
    }
  }

  /**
   * Calls GET /sessions/{sessionId}/preview immediately after the ZIP upload.
   * Emits deployment progress via deploymentStatus$ and the raw result via deploymentResult$.
   */
  private triggerPreview(sessionId: string): void {
    this.deploymentStatus$.next('deploying');
    const url = `${this.baseUrl}/sessions/${sessionId}/preview`;
    this.http.get<any>(url, { headers: this.getHttpHeaders() as any })
      .subscribe({
        next: (result) => {
          this.deploymentResult$.next(result);
          this.deploymentStatus$.next('success');
        },
        error: () => {
          this.deploymentStatus$.next('error');
        },
      });
  }
}
