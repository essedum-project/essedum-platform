import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { EventSourcePolyfill } from 'event-source-polyfill';
import {
  VibeSession,
  VibeGenerateRequest,
  VibeDeployRequest,
  VibeSseEvent,
  VibeFile,
  VibeModel,
  VibeChatMessage,
  VibeSessionStatus,
  AppType,
} from '../models/vibe-studio.models';

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

@Injectable()
export class VibeStudioService {
  private session: VibeSession;
  private eventSource: EventSourcePolyfill | null = null;

  readonly sseEvents$ = new Subject<VibeSseEvent>();
  readonly status$ = new BehaviorSubject<VibeSessionStatus>('idle');
  readonly files$ = new BehaviorSubject<VibeFile[]>([]);
  readonly messages$ = new BehaviorSubject<VibeChatMessage[]>([]);
  readonly previewUrl$ = new BehaviorSubject<string | null>(null);
  readonly tokenStream$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {
    this.session = this.createNewSession();
  }

  private createNewSession(): VibeSession {
    return {
      id: generateSessionId(),
      appType: null,
      model: 'claude',
      messages: [],
      files: [],
      previewUrl: null,
      status: 'idle',
    };
  }

  getSession(): VibeSession {
    return this.session;
  }

  setAppType(appType: AppType): void {
    this.session.appType = appType;
    this.status$.next('selecting');
  }

  setModel(model: VibeModel): void {
    this.session.model = model;
  }

  generate(prompt: string): void {
    const userMsg: VibeChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    this.session.messages.push(userMsg);
    this.messages$.next([...this.session.messages]);
    this.status$.next('generating');

    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${this.session.id}/generate`;

    this.closeEventSource();

    this.eventSource = new EventSourcePolyfill(
      `${url}?prompt=${encodeURIComponent(prompt)}&model=${this.session.model}`,
      {
        headers: this.getHeaders(),
        withCredentials: true,
      }
    );

    let assistantContent = '';

    this.eventSource.onmessage = (event: any) => {
      const parsed: VibeSseEvent = JSON.parse(event.data);
      this.sseEvents$.next(parsed);

      switch (parsed.type) {
        case 'token':
          assistantContent += parsed.data || '';
          this.tokenStream$.next(parsed.data || '');
          break;
        case 'file':
          if (parsed.path && parsed.content) {
            const file: VibeFile = { path: parsed.path, content: parsed.content };
            this.session.files = [
              ...this.session.files.filter(f => f.path !== parsed.path),
              file,
            ];
            this.files$.next([...this.session.files]);
          }
          break;
        case 'app_type':
          if (parsed.data) {
            this.session.appType = parsed.data as AppType;
          }
          break;
        case 'done':
          this.closeEventSource();
          const assistantMsg: VibeChatMessage = {
            role: 'assistant',
            content: assistantContent || `Generated ${parsed.fileCount || 0} files.`,
            timestamp: new Date(),
          };
          this.session.messages.push(assistantMsg);
          this.messages$.next([...this.session.messages]);
          this.status$.next('deploying');
          this.deploy();
          break;
      }
    };

    this.eventSource.onerror = () => {
      this.closeEventSource();
      this.status$.next('error');
    };
  }

  private deploy(): void {
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${this.session.id}/deploy`;
    const body: VibeDeployRequest = {
      files: this.session.files,
      appType: this.session.appType || 'streamlit',
    };

    this.http.post<any>(url, body, { observe: 'response' }).subscribe({
      next: () => {
        this.listenForPreview();
      },
      error: () => {
        this.status$.next('error');
      },
    });
  }

  private listenForPreview(): void {
    const wsUrl = `${this.baseUrl}/service/v1/vibe-coding/sessions/${this.session.id}/status`;
    const es = new EventSourcePolyfill(wsUrl, {
      headers: this.getHeaders(),
      withCredentials: true,
    });

    es.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === 'preview_ready' && data.url) {
        this.session.previewUrl = data.url;
        this.session.status = 'live';
        this.previewUrl$.next(data.url);
        this.status$.next('live');
        es.close();
      }
    };

    es.onerror = () => {
      es.close();
      this.status$.next('error');
    };
  }

  resetSession(): void {
    this.closeEventSource();
    this.session = this.createNewSession();
    this.status$.next('idle');
    this.files$.next([]);
    this.messages$.next([]);
    this.previewUrl$.next(null);
  }

  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private getHeaders(): Record<string, string> {
    const project = JSON.parse(sessionStorage.getItem('project') || '{}');
    const role = JSON.parse(sessionStorage.getItem('role') || '{}');
    return {
      'Content-Type': 'text/event-stream',
      Authorization: 'Bearer ' + localStorage.getItem('jwtToken'),
      Project: project.id?.toString() || '',
      Roleid: role.id?.toString() || '',
      Rolename: role.name?.toString() || '',
      'Access-Token': localStorage.getItem('accessToken') || '',
    };
  }

  ngOnDestroy(): void {
    this.closeEventSource();
  }
}
