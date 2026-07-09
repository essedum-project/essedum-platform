/**
 * AiChatCoderService — mirrors the Vibe Studio service (agent/start, /reply SSE,
 * list-apps + call-tool file fetching, push-to-github) so the copilot-style
 * AI Chat panel in Agent Pipeline can drive a real Goose coding session.
 *
 * Deliberate differences from VibeStudioService:
 *  • Does NOT auto-call /sessions/{id}/preview — deployment is user-triggered
 *    via a "Deploy" button (see deployNow()).
 *  • Persists generated files to the pipeline's DB (folder/upload) every time
 *    a generation round completes, so the codespace tab stays in sync.
 */
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AiChatFile {
  path: string;
  content: string;
}

export interface AiChatChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type AiChatStatus = 'idle' | 'generating' | 'error';
export type AiChatDeployStatus = 'idle' | 'deploying' | 'success' | 'error';
export type AiChatPushPhase = 'idle' | 'pushing' | 'success' | 'failed';

export interface AiChatPushState {
  phase: AiChatPushPhase;
  /** Session id used for the push. */
  sessionId?: string;
  /** Full repo URL (may be edited by the user via updateRepoUrl). */
  repoUrl?: string;
  /** Branch that the push targeted. */
  branch?: string;
  /** SHA of the commit produced on success. */
  commitSha?: string;
  /** Organisation (backend parameter). */
  org?: string;
  /** Backend push-record id (uuid/primary key), when available. */
  configId?: string | number;
  /** Human-readable status message from the backend. */
  message?: string;
  /** Populated when phase='failed'. */
  errorMessage?: string;
  /** ISO timestamp of the last status update. */
  updatedAt?: string;
}

function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

/** Same recipe as Vibe Studio — teaches Goose the expected project structure. */
const CODER_INSTRUCTIONS = `
You build web applications, backends, data apps, and MCP servers. Always
generate MULTIPLE files (source, requirements.txt / package.json, Dockerfile).
Never produce a single .html file as output for a backend, MCP server, or
Streamlit app — such projects cannot be deployed. Bind servers to 0.0.0.0 and
read the port from an environment variable so containers can expose them.
`;

const CODER_RECIPE = {
  version: '1.0.0',
  title: 'Agent Pipeline Coding Session',
  description: 'Generates multi-file projects for the agent pipeline codespace.',
  instructions: CODER_INSTRUCTIONS,
};

@Injectable()
export class AiChatCoderService implements OnDestroy {

  // ─── Session state ─────────────────────────────────────────────────────────
  private sessionId: string | null = null;
  private replyAbortController: AbortController | null = null;
  private streamingAssistantIndex: number | null = null;
  private messages: AiChatChatMessage[] = [];
  private files: AiChatFile[] = [];
  private pushInFlight = false;
  /** cname of the current pipeline card — needed for DB persistence. */
  private pipelineCname: string | null = null;
  /** current organisation for DB persistence. */
  private organisation: string = 'leo1311';

  // ─── Public streams ───────────────────────────────────────────────────────
  readonly messages$          = new BehaviorSubject<AiChatChatMessage[]>([]);
  readonly files$             = new BehaviorSubject<AiChatFile[]>([]);
  readonly status$            = new BehaviorSubject<AiChatStatus>('idle');
  readonly sessionId$         = new BehaviorSubject<string | null>(null);
  readonly tokenStream$       = new Subject<string>();
  readonly generationComplete$ = new Subject<AiChatFile[]>();
  readonly deploymentStatus$  = new BehaviorSubject<AiChatDeployStatus>('idle');
  readonly deploymentResult$  = new BehaviorSubject<any>(null);
  /** Emits once the current file list has been persisted to the pipeline card. */
  readonly persistComplete$    = new Subject<void>();
  /** GitHub push lifecycle — updated after every auto push and when the user
   *  manually retries. UI shows a toast + expandable details panel. */
  readonly pushStatus$         = new BehaviorSubject<AiChatPushState>({ phase: 'idle' });

  /** Handle for the active status-polling interval so we can cancel it. */
  private pushPollingTimer: any = null;
  /** User-overridable repo URL (falls back to the default derived from files). */
  private customRepoUrl: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject('envi') private baseUrl: string,
  ) {}

  ngOnDestroy(): void {
    this.cancelReply();
    this.stopPushPolling();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Bind this service instance to a specific pipeline card. */
  configureForPipeline(cname: string, organisation: string): void {
    this.pipelineCname = cname;
    this.organisation = organisation || 'leo1311';
  }

  getSessionId(): string | null { return this.sessionId; }
  getMessages(): AiChatChatMessage[] { return [...this.messages]; }
  getFiles(): AiChatFile[] { return [...this.files]; }

  /**
   * Sends a user prompt and streams the Goose reply back via SSE.
   * Lazily starts a session on first call.
   *
   * @param prompt      The FULL prompt sent to the agent (may include codebase
   *                    context, instructions, attached-skill hints, etc.).
   * @param provider    Agent provider (ollama, azure_openai, ...).
   * @param model       Model id (qwen3:4b, gpt-4o-mini, ...).
   * @param displayText Optional shorter text to show in the user's chat bubble.
   *                    When provided, keeps the injected context out of the UI.
   */
  sendMessage(prompt: string, provider: string, model: string, displayText?: string): void {
    const trimmed = (prompt || '').trim();
    if (!trimmed) return;

    const bubble = (displayText ?? trimmed).trim();
    this.messages.push({ role: 'user', content: bubble, timestamp: new Date() });
    this.messages$.next([...this.messages]);
    this.status$.next('generating');
    this.pushInFlight = false;
    this.cancelReply();

    // Reset the tracked file list at the start of each turn so list-apps
    // becomes fully authoritative for this round. Prevents stale entries
    // (deleted files, obsolete content) from carrying across generations.
    this.files = [];
    this.files$.next([]);

    this.ensureAgentStarted(provider, model)
      .then((sid) => this.openReplyStream(sid, trimmed + ' - send all code files generated here'))
      .catch(() => {
        this.messages.push({
          role: 'assistant',
          content: '⚠️ Failed to start the AI agent session. Please refresh the page and try again.',
          timestamp: new Date(),
        });
        this.messages$.next([...this.messages]);
        this.status$.next('error');
      });
  }

  /** Clear chat, files, and stop any in-flight stream. */
  reset(): void {
    this.cancelReply();
    this.stopAgent();
    this.sessionId = null;
    this.sessionId$.next(null);
    this.messages = [];
    this.messages$.next([]);
    this.files = [];
    this.files$.next([]);
    this.status$.next('idle');
    this.deploymentStatus$.next('idle');
    this.deploymentResult$.next(null);
  }

  /** Cancel any in-flight streaming reply. */
  cancelReply(): void {
    if (this.replyAbortController) {
      this.replyAbortController.abort();
      this.replyAbortController = null;
    }
    if (this.streamingAssistantIndex !== null) {
      this.messages.splice(this.streamingAssistantIndex, 1);
      this.streamingAssistantIndex = null;
      this.messages$.next([...this.messages]);
    }
  }

  /** Stop the running Goose session. */
  stopAgent(): void {
    if (!this.sessionId) return;
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/stop`;
    this.http.post(url, { session_id: this.sessionId }, { headers: this.getHeaders() })
      .subscribe({ error: () => {} });
    this.sessionId = null;
  }

  /**
   * MANUAL deployment trigger — called from the "Deploy" button in the UI.
   * Hits /sessions/{id}/preview, same endpoint Vibe Studio uses automatically.
   */
  deployNow(workingDir: string = '/home/engne2/essedum/goose'): void {
    if (!this.sessionId) {
      this.deploymentStatus$.next('error');
      return;
    }
    this.deploymentStatus$.next('deploying');
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${this.sessionId}/preview`;
    const body = { working_dir: workingDir };
    this.http.post<any>(url, body, { headers: this.getHeaders() as any }).subscribe({
      next: (result) => {
        const deployUrl = result?.deployUrl ?? result;
        this.deploymentResult$.next(deployUrl);
        this.deploymentStatus$.next('success');
      },
      error: () => this.deploymentStatus$.next('error'),
    });
  }

  // ─── Goose lifecycle ──────────────────────────────────────────────────────

  private ensureAgentStarted(provider: string, model: string): Promise<string> {
    if (this.sessionId) return Promise.resolve(this.sessionId);

    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/service/v1/vibe-coding/agent/start`;
      const body = { working_dir: '.', recipe: CODER_RECIPE };
      this.http.post<any>(url, body, { headers: this.getHeaders() }).subscribe({
        next: (resp) => {
          const sid: string | undefined = resp?.id ?? resp?.session_id ?? resp?.sessionId;
          if (!sid) { reject(new Error('Goose did not return a session ID')); return; }
          this.sessionId = sid;
          this.sessionId$.next(sid);
          this.applyProvider(sid, provider, model)
            .then(() => resolve(sid))
            .catch(() => resolve(sid));
        },
        error: reject,
      });
    });
  }

  private applyProvider(sid: string, provider: string, model: string): Promise<void> {
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/update-provider`;
    return new Promise((resolve, reject) => {
      this.http.post(url,
        { session_id: sid, provider, model },
        { headers: this.getHeaders() },
      ).subscribe({ next: () => resolve(), error: reject });
    });
  }

  // ─── SSE reply stream ─────────────────────────────────────────────────────

  private openReplyStream(sid: string, prompt: string): void {
    const url = `${this.baseUrl}/service/v1/vibe-coding/reply`;
    const userMessage = {
      id: generateRequestId(),
      role: 'user',
      created: Math.floor(Date.now() / 1000),
      content: [{ type: 'text', text: prompt }],
      metadata: { agentVisible: true, userVisible: true },
    };
    const body = { session_id: sid, user_message: userMessage };

    this.replyAbortController = new AbortController();
    const { signal } = this.replyAbortController;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...this.getHeaders(),
    };

    let assistantText = '';
    this.startStreamingAssistantMessage();

    fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include', signal })
      .then((response) => {
        if (!response.ok || !response.body) {
          const msg = response.status === 403
            ? 'Access denied (403 Forbidden). Your session may have expired — please refresh the page and try again.'
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
              this.processSseChunk(buffer, (chunk) => {
                assistantText += chunk;
                this.tokenStream$.next(chunk);
                this.updateStreamingAssistantMessage(assistantText);
              });
              if (!assistantText.trim()) {
                assistantText = '⚠️ The agent did not return a response. Please check your agent/model selection and try again.';
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

  private startStreamingAssistantMessage(): void {
    this.streamingAssistantIndex = this.messages.length;
    this.messages.push({ role: 'assistant', content: '', timestamp: new Date() });
    this.messages$.next([...this.messages]);
  }

  private updateStreamingAssistantMessage(text: string): void {
    if (this.streamingAssistantIndex === null) return;
    this.messages[this.streamingAssistantIndex].content = text;
    this.messages$.next([...this.messages]);
  }

  private processSseChunk(chunk: string, emit: (text: string) => void): { remaining: string } {
    const normalized = chunk.replace(/\r\n/g, '\n');
    const events = normalized.split('\n\n');
    const remaining = events.pop() ?? '';
    for (const rawEvent of events) {
      const dataLines: string[] = [];
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
      }
      if (!dataLines.length) continue;
      const data = dataLines.join('\n').trim();
      if (!data || data === '[DONE]') continue;
      this.extractAndEmit(data, emit);
    }
    return { remaining };
  }

  private extractAndEmit(rawData: string, emit: (text: string) => void): void {
    try {
      const parsed = JSON.parse(rawData);
      this.extractText(parsed, emit);
      this.extractFiles(parsed);
    } catch {
      emit(rawData);
    }
  }

  private extractText(event: any, emit: (text: string) => void): void {
    if (!event) return;
    if (Array.isArray(event.choices)) {
      for (const c of event.choices) {
        if (typeof c?.delta?.content === 'string') emit(c.delta.content);
        if (typeof c?.message?.content === 'string') emit(c.message.content);
      }
    }
    if (event.message && typeof event.message === 'object') this.extractText(event.message, emit);
    if (event.data && typeof event.data === 'object') this.extractText(event.data, emit);
    if (event.role && Array.isArray(event.content)) {
      for (const part of event.content) {
        if ((part.type === 'text' || part.type === 'text_delta') && part.text) emit(part.text);
        if (typeof part?.content === 'string' && part.content) emit(part.content);
      }
    }
    if (typeof event.content === 'string' && event.content) emit(event.content);
    if (typeof event.text === 'string' && event.text) emit(event.text);
    if (typeof event.delta === 'string' && event.delta) emit(event.delta);
    if ((event.type === 'text' || event.type === 'text_delta') && event.text) emit(event.text);
  }

  private extractFiles(event: any): void {
    if (!event) return;
    if (event.message && typeof event.message === 'object') this.extractFiles(event.message);
    if (event.data && typeof event.data === 'object') this.extractFiles(event.data);
    if (Array.isArray(event.content)) {
      for (const part of event.content) {
        if (part?.type === 'toolRequest' && part.toolUse) this.extractFromToolUse(part.toolUse);
      }
    }
    if (event.toolUse) this.extractFromToolUse(event.toolUse);
  }

  private extractFromToolUse(toolUse: any): void {
    if (!toolUse?.name || !toolUse?.input) return;
    const name = (toolUse.name as string).toLowerCase();
    const input = toolUse.input;
    if ((name === 'write_file' || name === 'create_file') &&
        typeof input.path === 'string' && typeof input.content === 'string') {
      this.upsertFile(input.path, input.content); return;
    }
    if ((name.includes('editor') || name.includes('text_editor')) &&
        typeof input.path === 'string' && typeof input.file_text === 'string' &&
        (input.command === 'write' || input.command === 'create' || !input.command)) {
      this.upsertFile(input.path, input.file_text); return;
    }
    if (typeof input.path === 'string' && typeof input.file_text === 'string') {
      this.upsertFile(input.path, input.file_text);
    }
  }

  private extractFilesFromMarkdown(text: string): void {
    if (!text) return;
    const FILE_PAT = '[\\w][\\w./\\-]*\\.\\w{1,10}';
    const prefixPattern = '(?:\\*{1,2}|[`]|#{1,4}\\s+)(' + FILE_PAT + ')(?:\\*{1,2}|[`])?\\s*(?::|\\s*\\n)';
    const prefixRe = new RegExp(prefixPattern, 'gm');
    const prefixes: Array<{ offset: number; name: string }> = [];
    let pm: RegExpExecArray | null;
    while ((pm = prefixRe.exec(text)) !== null) prefixes.push({ offset: pm.index, name: pm[1] });
    const blockRe = /```(?:\w+)?\n([\s\S]*?)```/g;
    let bm: RegExpExecArray | null;
    while ((bm = blockRe.exec(text)) !== null) {
      const blockStart = bm.index;
      const blockContent = bm[1];
      const nearby = prefixes.find(p => blockStart - p.offset >= 0 && blockStart - p.offset <= 120);
      if (nearby) { this.upsertFile(nearby.name, blockContent); continue; }
      const firstLine = blockContent.split('\n')[0].trim();
      const commentMatch = firstLine.match(/^(?:\/\/|#)\s*([\w][\w./\-]*\.\w{1,10})\s*$/);
      if (commentMatch) {
        const contentWithoutComment = blockContent.slice(firstLine.length).replace(/^\n/, '');
        this.upsertFile(commentMatch[1], contentWithoutComment);
      }
    }
  }

  private upsertFile(path: string, content: string): void {
    const normPath = path.replace(/^\.?\//, '');
    const idx = this.files.findIndex(f => f.path === normPath);
    if (idx >= 0) this.files[idx] = { path: normPath, content };
    else this.files.push({ path: normPath, content });
    this.files$.next([...this.files]);
  }

  // ─── After-stream: fetch files + persist + push to GitHub ─────────────────

  private finaliseAssistantMessage(text: string): void {
    this.replyAbortController = null;
    this.extractFilesFromMarkdown(text);
    if (this.streamingAssistantIndex !== null) {
      if (text) this.messages[this.streamingAssistantIndex].content = text;
      else this.messages.splice(this.streamingAssistantIndex, 1);
      this.streamingAssistantIndex = null;
      this.messages$.next([...this.messages]);
    }

    if (this.sessionId) {
      const sid = this.sessionId;
      this.listAppsAndFetchFiles(sid, () => {
        if (this.files.length) {
          this.generationComplete$.next([...this.files]);
          // Save generated files to pipeline card DB and push to GitHub.
          this.persistFilesToPipeline().then(() => this.triggerPushToGitHub(sid));
        }
        this.status$.next('idle');
      });
      return;
    }
    this.status$.next('idle');
  }

  private listAppsAndFetchFiles(sid: string, done: () => void): void {
    const url = `${this.baseUrl}/service/v1/vibe-coding/agent/list-apps`;
    this.http.get<any>(url, { params: { session_id: sid }, headers: this.getHeaders() as any })
      .subscribe({
        next: (resp) => {
          const paths = this.extractFilePathsFromListApps(resp);
          if (paths.length) this.fetchFilesFromServer(sid, paths, done);
          else done();
        },
        error: () => done(),
      });
  }

  private extractFilePathsFromListApps(resp: any): string[] {
    const paths: string[] = [];
    const isSessionApp = (app: any): boolean => {
      if (typeof app.uri === 'string' && app.uri.startsWith('ui://')) return true;
      if (typeof app.mimeType === 'string' && app.mimeType.includes('mcp-app')) return true;
      if (typeof app.text === 'string' && !app.files) return true;
      return false;
    };
    const process = (app: any): void => {
      if (isSessionApp(app)) return;
      let appDir = '';
      if (typeof app.name === 'string' && app.name.trim()) appDir = app.name.trim();
      else if (typeof app.path === 'string') appDir = app.path.split('/').pop() ?? '';
      const qualify = (fp: string): string => {
        if (fp.startsWith('/')) {
          const idx = appDir ? fp.indexOf('/' + appDir + '/') : -1;
          if (idx >= 0) return fp.slice(idx + 1);
          return fp.replace(/^\/+/, '');
        }
        if (appDir && !fp.startsWith(appDir + '/')) return appDir + '/' + fp;
        return fp;
      };
      if (app.files && typeof app.files === 'object' && !Array.isArray(app.files)) {
        for (const [fp, content] of Object.entries(app.files)) {
          if (typeof content === 'string' && content.trim()) this.upsertFile(qualify(fp), content);
          else { const p = qualify(fp); if (!paths.includes(p)) paths.push(p); }
        }
      } else if (Array.isArray(app.files)) {
        for (const f of app.files) {
          if (typeof f === 'string') { const p = qualify(f); if (!paths.includes(p)) paths.push(p); }
        }
      }
    };
    if (Array.isArray(resp)) resp.forEach(process);
    else if (resp?.apps && Array.isArray(resp.apps)) resp.apps.forEach(process);
    else if (resp && typeof resp === 'object') process(resp);
    return paths;
  }

  private fetchFilesFromServer(sid: string, paths: string[], done: () => void): void {
    const next = (i: number) => {
      if (i >= paths.length) { done(); return; }
      const path = paths[i];
      const url = `${this.baseUrl}/service/v1/vibe-coding/agent/call-tool`;
      const body = { session_id: sid, tool_name: 'developer__text_editor', input: { command: 'view', path } };
      this.http.post<any>(url, body, { headers: this.getHeaders() }).subscribe({
        next: (resp) => {
          const content = this.extractContentFromToolResponse(resp);
          if (content && content.trim() !== '') this.upsertFile(path, content);
          next(i + 1);
        },
        error: () => next(i + 1),
      });
    };
    next(0);
  }

  private extractContentFromToolResponse(resp: any): string | null {
    if (!resp) return null;
    if (typeof resp === 'string') return resp;
    if (typeof resp.output === 'string') return resp.output;
    if (typeof resp.content === 'string') return resp.content;
    if (typeof resp.result === 'string') return resp.result;
    if (typeof resp.text === 'string') return resp.text;
    if (resp.result && typeof resp.result === 'object') {
      if (typeof resp.result.content === 'string') return resp.result.content;
      if (typeof resp.result.output === 'string') return resp.result.output;
      if (typeof resp.result.text === 'string') return resp.result.text;
    }
    if (resp.toolResult) {
      if (typeof resp.toolResult.content === 'string') return resp.toolResult.content;
      if (Array.isArray(resp.toolResult.content)) {
        const parts = resp.toolResult.content.map((c: any) => c?.text ?? c?.content ?? '').filter(Boolean);
        if (parts.length) return parts.join('\n');
      }
    }
    return null;
  }

  // ─── Persist to pipeline DB (folder/upload) ───────────────────────────────

  /**
   * Bundles generated files into a ZIP and uploads them to the pipeline card
   * via /folder/upload/{cname}/{org}?zipFile=null&type=App so the codespace
   * tab sees the new files after the next refresh.
   */
  private async persistFilesToPipeline(): Promise<void> {
    if (!this.pipelineCname || !this.files.length) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const f of this.files) zip.file(f.path, f.content);
      const blob = await zip.generateAsync({ type: 'blob' });

      const url = `/api/aip/folder/upload/${this.pipelineCname}/${this.organisation}?zipFile=null&type=App`;
      const formData = new FormData();
      formData.append('zipFile', new File([blob], `${this.pipelineCname}.zip`, { type: 'application/zip' }));
      formData.append('isvibestudio', 'true');

      await new Promise<void>((resolve) => {
        this.http.post(url, formData, { headers: this.getHeaders() as any }).subscribe({
          next: () => { this.persistComplete$.next(); resolve(); },
          // Always emit persistComplete$ so the UI can refresh from the DB
          // even if this particular save round failed — the DB still holds
          // the last known good state and the codespace tree shouldn't stall.
          error: () => { this.persistComplete$.next(); resolve(); },
        });
      });
    } catch {
      // Non-fatal — user can still see files in the panel, DB save just failed.
      // Still notify listeners so the UI reload logic runs.
      this.persistComplete$.next();
    }
  }

  // ─── Push to GitHub (auto, every generation round) ────────────────────────

  private triggerPushToGitHub(sid: string): void {
    if (this.pushInFlight) return;
    this.pushInFlight = true;
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sid}/push-to-github`;
    const project = this.readProject();

    const dirCandidates = this.files
      .map(f => f.path.split('/'))
      .filter(parts => parts.length > 1)
      .map(parts => parts[0]);
    const appDir = dirCandidates.length ? dirCandidates[0] : null;

    const appFiles = appDir ? this.files.filter(f => f.path.startsWith(appDir + '/')) : this.files;
    const filePaths = appFiles.map(f => f.path);

    const branchSuffix = appDir && appDir !== sid ? `${appDir}-${sid}` : sid;
    const branch = `studio/${branchSuffix}`;
    const org = project?.name || this.organisation || 'leo1311';

    const body: any = {
      org,
      branch,
      push_dir: appDir ?? sid,
      exclude_dirs: ['vibesession'],
      files: filePaths,
    };
    // If the user has overridden the repo URL via the status panel, forward it.
    if (this.customRepoUrl) body.repoUrl = this.customRepoUrl;

    // Kick off the "pushing" phase so the toast appears immediately.
    this.pushStatus$.next({
      phase: 'pushing',
      sessionId: sid,
      branch,
      org,
      repoUrl: this.customRepoUrl ?? undefined,
      message: 'Push to GitHub initiated…',
      updatedAt: new Date().toISOString(),
    });

    this.http.post<any>(url, body, { headers: this.getHeaders() as any })
      .subscribe({
        next: (resp) => {
          this.pushStatus$.next({
            ...this.pushStatus$.value,
            phase: 'pushing',
            branch: resp?.branchName || branch,
            message: resp?.message || 'Push in progress…',
            updatedAt: new Date().toISOString(),
          });
          // Backend runs async; poll the status endpoint until SUCCESS/FAILED.
          this.startPushPolling(sid, org);
        },
        error: (err) => {
          this.pushInFlight = false;
          this.pushStatus$.next({
            ...this.pushStatus$.value,
            phase: 'failed',
            message: 'Failed to submit push request.',
            errorMessage: this.readableError(err),
            updatedAt: new Date().toISOString(),
          });
        },
      });
  }

  /** Poll GET /sessions/{id}/github-status?org=... until SUCCESS/FAILED. */
  private startPushPolling(sid: string, org: string): void {
    this.stopPushPolling();
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // ~3 min at 3s interval
    const poll = () => {
      attempts++;
      const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sid}/github-status`;
      this.http.get<any>(url, { params: { org }, headers: this.getHeaders() as any })
        .subscribe({
          next: (cfg) => {
            const status = String(cfg?.status || '').toUpperCase();
            const repoUrl = cfg?.repoUrl || this.pushStatus$.value.repoUrl;
            const branch = cfg?.branchName || this.pushStatus$.value.branch;
            const commitSha = cfg?.commitSha;
            const configId = cfg?.id;

            if (status === 'SUCCESS') {
              this.stopPushPolling();
              this.pushInFlight = false;
              this.pushStatus$.next({
                phase: 'success',
                sessionId: sid,
                org,
                repoUrl,
                branch,
                commitSha,
                configId,
                message: 'Code pushed to GitHub successfully.',
                updatedAt: new Date().toISOString(),
              });
            } else if (status === 'FAILED' || status === 'FAILURE' || status === 'ERROR') {
              this.stopPushPolling();
              this.pushInFlight = false;
              this.pushStatus$.next({
                phase: 'failed',
                sessionId: sid,
                org,
                repoUrl,
                branch,
                configId,
                message: 'Push to GitHub failed.',
                errorMessage: cfg?.errorMessage || 'The push operation reported a failure.',
                updatedAt: new Date().toISOString(),
              });
            } else if (attempts >= MAX_ATTEMPTS) {
              this.stopPushPolling();
              this.pushInFlight = false;
              this.pushStatus$.next({
                ...this.pushStatus$.value,
                phase: 'failed',
                message: 'Push status timed out.',
                errorMessage: 'The status endpoint did not report success/failure within the polling window.',
                updatedAt: new Date().toISOString(),
              });
            }
            // else still IN_PROGRESS — keep polling
          },
          error: (err) => {
            // Transient errors don't abort polling; only give up at MAX_ATTEMPTS.
            if (attempts >= MAX_ATTEMPTS) {
              this.stopPushPolling();
              this.pushInFlight = false;
              this.pushStatus$.next({
                ...this.pushStatus$.value,
                phase: 'failed',
                message: 'Could not check push status.',
                errorMessage: this.readableError(err),
                updatedAt: new Date().toISOString(),
              });
            }
          },
        });
    };
    // Poll immediately, then every 3s.
    poll();
    this.pushPollingTimer = setInterval(poll, 3000);
  }

  private stopPushPolling(): void {
    if (this.pushPollingTimer) {
      clearInterval(this.pushPollingTimer);
      this.pushPollingTimer = null;
    }
  }

  private readableError(err: any): string {
    if (!err) return 'Unknown error.';
    if (typeof err === 'string') return err;
    return err?.error?.error
        || err?.error?.message
        || err?.message
        || `HTTP ${err?.status ?? '?'}`;
  }

  /**
   * User-triggered retry — resets the "in-flight" guard and reruns the push.
   * Uses the latest customRepoUrl (may have been changed via updateRepoUrl).
   */
  retryPushToGitHub(): void {
    if (!this.sessionId) return;
    this.stopPushPolling();
    this.pushInFlight = false;
    this.triggerPushToGitHub(this.sessionId);
  }

  /**
   * Override the repo URL for subsequent push attempts. Persists on the
   * service instance so all future auto/manual pushes use it.
   */
  updateRepoUrl(newUrl: string): void {
    const trimmed = (newUrl || '').trim();
    this.customRepoUrl = trimmed || null;
    this.pushStatus$.next({
      ...this.pushStatus$.value,
      repoUrl: this.customRepoUrl ?? undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  /** Manually refresh push status (bound to a "Check status" button in the UI). */
  refreshPushStatus(): void {
    const s = this.pushStatus$.value;
    if (!s.sessionId || !s.org) return;
    this.startPushPolling(s.sessionId, s.org);
  }

  /** Dismiss the push toast/panel (does not cancel any in-flight push). */
  dismissPushStatus(): void {
    this.pushStatus$.next({ phase: 'idle' });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getHeaders(): Record<string, string> {
    const project = this.readProject();
    const role = JSON.parse(sessionStorage.getItem('role') || '{}');
    const headers: Record<string, string> = {
      Authorization: 'Bearer ' + (localStorage.getItem('jwtToken') ?? ''),
      Project: project.id?.toString() ?? '',
      Roleid: role.id?.toString() ?? '',
      Rolename: role.name?.toString() ?? '',
      'Access-Token': localStorage.getItem('accessToken') ?? '',
      'X-Requested-With': 'Leap',
    };
    const csrf = this.readCsrf();
    if (csrf) headers['X-XSRF-TOKEN'] = csrf;
    return headers;
  }

  private readProject(): any {
    try { return JSON.parse(sessionStorage.getItem('project') || '{}'); } catch { return {}; }
  }
  private readCsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  /** Load provider list from the same endpoint Vibe Studio uses. */
  getProviders(): Promise<any> {
    const url = `${this.baseUrl}/service/v1/vibe-coding/config/providers`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).toPromise();
  }
}
