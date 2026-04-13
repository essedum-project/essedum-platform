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

  readonly sseEvents$   = new Subject<any>();
  readonly status$      = new BehaviorSubject<VibeSessionStatus>('idle');
  readonly files$       = new BehaviorSubject<VibeFile[]>([]);
  readonly messages$    = new BehaviorSubject<VibeChatMessage[]>([]);
  readonly previewUrl$  = new BehaviorSubject<string | null>(null);
  readonly tokenStream$ = new Subject<string>();

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
  generate(prompt: string): void {
    const userMsg: VibeChatMessage = { role: 'user', content: prompt, timestamp: new Date() };
    this.session.messages.push(userMsg);
    this.messages$.next([...this.session.messages]);
    this.status$.next('generating');

    this.cancelReply(); // cancel any in-flight reply first

    this.ensureAgentStarted().then((sessionId) => {
      this.openReplyStream(sessionId, prompt);
    }).catch(() => {
      this.status$.next('error');
    });
  }

  /** Cancel the currently streaming Goose reply (if any). */
  cancelReply(): void {
    if (this.replyAbortController) {
      this.replyAbortController.abort();
      this.replyAbortController = null;
    }
    if (this.session.id) {
      const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${this.session.id}/cancel`;
      this.http.post(url, { request_id: '' }, { headers: this.getHttpHeaders() })
        .subscribe({ error: () => {} });
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

    fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include', signal })
      .then((response) => {
        if (!response.ok || !response.body) {
          this.status$.next('error');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.finaliseAssistantMessage(assistantText);
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const data = line.slice(5).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                this.sseEvents$.next(parsed);
                this.extractText(parsed, (chunk) => {
                  assistantText += chunk;
                  this.tokenStream$.next(chunk);
                });
              } catch {
                // raw non-JSON chunk — treat as plain text
                assistantText += data;
                this.tokenStream$.next(data);
              }
            }

            read();
          }).catch((err: any) => {
            if (err?.name !== 'AbortError') {
              this.status$.next('error');
            }
          });
        };

        read();
      })
      .catch((err: any) => {
        if (err?.name !== 'AbortError') {
          this.status$.next('error');
        }
      });
  }

  /**
   * Extracts text tokens from a Goose SSE event, supporting both full-message
   * format `{ role, content: [{ type: "text", text: "..." }] }` and delta
   * formats `{ type: "text" | "text_delta", text: "..." }`.
   */
  private extractText(event: any, emit: (text: string) => void): void {
    // Full message: { role, content: [...] }
    if (event.role && Array.isArray(event.content)) {
      for (const part of event.content) {
        if ((part.type === 'text' || part.type === 'text_delta') && part.text) {
          emit(part.text);
        }
      }
      return;
    }
    // Delta: { type: 'text' | 'text_delta', text: '...' }
    if ((event.type === 'text' || event.type === 'text_delta') && event.text) {
      emit(event.text);
    }
  }

  /** Commits the accumulated assistant text as a chat message and transitions status. */
  private finaliseAssistantMessage(text: string): void {
    this.replyAbortController = null;

    if (text) {
      const msg: VibeChatMessage = { role: 'assistant', content: text, timestamp: new Date() };
      this.session.messages.push(msg);
      this.messages$.next([...this.session.messages]);

      // If Goose included a URL in the response, surface it as a preview
      const urlMatch = text.match(/https?:\/\/[^\s"')\]]+/);
      if (urlMatch) {
        this.session.previewUrl = urlMatch[0];
        this.previewUrl$.next(urlMatch[0]);
        this.status$.next('live');
        return;
      }
    }
    this.status$.next('idle');
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
}
