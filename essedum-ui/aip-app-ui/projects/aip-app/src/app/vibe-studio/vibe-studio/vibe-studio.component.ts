import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, take } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import { APP_TYPE_OPTIONS, AppType, VibeFile } from '../models/vibe-studio.models';
import { Services } from '../../services/service';
import { StreamingServices } from '../../streaming-services/streaming-service';

@Component({
  selector: 'app-vibe-studio',
  templateUrl: './vibe-studio.component.html',
  styleUrls: ['./vibe-studio.component.scss'],
})
export class VibeStudioComponent implements OnInit, OnDestroy {
  readonly appTypeOptions = APP_TYPE_OPTIONS;

  selectedAppType: AppType | null = null;
  leftPanelWidth = 35;
  private isDragging = false;
  private destroy$ = new Subject<void>();
  /** cancels the per-session messages$ subscription on new-session / re-select */
  private sessionReset$ = new Subject<void>();
  /** cname returned by the streaming-services create API */
  private registeredCname: string | null = null;
  /** app name extracted from the user's requirements message */
  private appName: string | null = null;
  /** files buffered from generationComplete$ while waiting for registeredCname */
  private pendingUploadFiles: VibeFile[] | null = null;
  /** guard: upload fires at most once per generation round */
  private uploadFired = false;

  constructor(
    private vibeService: VibeStudioService,
    private services: Services,
  ) {}

  ngOnInit(): void {
    // When generation fully completes, buffer the files and attempt upload.
    // tryFlushUpload() will also be called when registeredCname arrives, so
    // whichever of the two (files, cname) is last wins — no race condition.
    this.vibeService.generationComplete$
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.selectedAppType !== 'streamlit'),
      )
      .subscribe((files) => {
        this.pendingUploadFiles = files;
        this.tryFlushUpload();
      });
  }

  private registerInStreamingServices(sessionId: string): void {
    if (!this.selectedAppType) return;

    let type: string;
    let interfacetype: string;

    if (this.selectedAppType === 'react_app' || this.selectedAppType === 'react_node') {
      type = 'appPipeline';
      interfacetype = 'app-pipeline';
    } else if (this.selectedAppType === 'agents_mcp') {
      type = 'AIAgent';
      interfacetype = 'pipeline-agent';
    } else {
      // streamlit — skip registration
      return;
    }

    const displayName = this.appName ?? this.buildUniqueName('App');
    const newCanvas = new StreamingServices();
    newCanvas.alias = displayName;
    newCanvas.description = `${displayName} — ${this.appTypeOptions.find(o => o.value === this.selectedAppType)?.label ?? this.selectedAppType} built with Vibe Studio`;
    newCanvas.type = type;
    newCanvas.interfacetype = interfacetype;
    newCanvas.is_template = false;
    newCanvas.json_content = JSON.stringify({ created_source: 'vibe_studio', session_id: sessionId });

    this.services.create(newCanvas).subscribe({
      next: (result) => {
        this.registeredCname = result.name ?? null;
        this.tryFlushUpload();
      },
      error: () => {
        // create failed (e.g. duplicate alias) — fall back to sessionId so upload still fires
        this.registeredCname = sessionId;
        this.tryFlushUpload();
      },
    });
  }

  selectAppType(appType: AppType): void {
    this.selectedAppType = appType;
    // Cancel any leftover subscription from a previous session and start a fresh one.
    this.sessionReset$.next();

    // Register in streaming services using the app name from the user's 2nd message
    // (msg[0]=card prompt, msg[1]=user requirements answer which contains the app name).
    // Re-subscribed here so it works on every new session, not just the first one.
    this.vibeService.messages$
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(this.sessionReset$),
        map(msgs => msgs.filter(m => m.role === 'user')),
        filter(userMsgs => userMsgs.length >= 2),
        take(1),
      )
      .subscribe(userMsgs => {
        const sessionId = this.vibeService.sessionId$.getValue();
        if (!sessionId || !this.selectedAppType) return;
        this.appName = this.extractAppName(userMsgs[1].content);
        this.registerInStreamingServices(sessionId);
      });

    this.vibeService.setAppType(appType);
    const label = this.appTypeOptions.find(o => o.value === appType)?.label || appType;
    // Initial prompt: gather requirements before generating any code.
    // appendCodeInstruction=false so the agent asks questions rather than immediately writing files.
    this.vibeService.generate(
      `I want to build a ${label} app. ` +
      `Do NOT write any code or generate any files yet. ` +
      `First, please ask me: ` +
      `(1) What should the app be named? ` +
      `(2) What specific features or functionality should it have? ` +
      `Wait for my answers before doing anything else.`,
      `I want to build a ${label} app`,
    );
  }

  /**
   * Upload fires once both registeredCname and pendingUploadFiles are available.
   * Called from two places — whichever arrives last triggers the actual upload.
   * Falls back to sessionId if the create API failed, so upload always fires.
   */
  private tryFlushUpload(): void {
    if (this.uploadFired) return;
    if (!this.pendingUploadFiles?.length) return;
    const cname = this.registeredCname ?? this.vibeService.sessionId$.getValue();
    if (!cname) return;
    this.uploadFired = true;
    this.vibeService.uploadFilesAsZip(this.pendingUploadFiles, cname);
  }

  /** Extracts a short noun (1–2 words) from the user's requirements message. */
  private extractAppName(message: string): string {
    // Priority 1: explicit name  →  call it X / name it X / app name: X / named X
    const explicit = /(?:call(?:ed)?\s+it|name(?:d)?\s+(?:it\s+)?|app\s+name[\s:]*)["']?([A-Za-z][A-Za-z0-9]{1,18})["']?/i;
    const m1 = message.match(explicit);
    if (m1?.[1]) return this.buildUniqueName(m1[1]);

    // Priority 2: quoted word  →  "Trello" / 'Budget'
    const quoted = /["']([A-Za-z][A-Za-z0-9]{1,18})["']/;
    const m2 = message.match(quoted);
    if (m2?.[1]) return this.buildUniqueName(m2[1]);

    // Priority 3: the core noun before " app"  →  "todo app" → "Todo"
    const beforeApp = /\b([A-Za-z][A-Za-z0-9]{2,14})\s+app\b/i;
    const m3 = message.match(beforeApp);
    if (m3?.[1]) return this.buildUniqueName(m3[1]);

    // Priority 4: first meaningful noun-like word (>3 chars, skip stopwords)
    const stops = new Set(['want','need','build','create','make','that','with','have','like','some','very','just','also','more']);
    const word = message.replace(/[^A-Za-z0-9\s]/g, ' ').split(/\s+/)
      .find(w => w.length > 3 && !stops.has(w.toLowerCase()));

    return this.buildUniqueName(word ?? 'App');
  }

  /** Title-cases a single noun and appends a 3-char unique suffix. */
  private buildUniqueName(noun: string): string {
    const titled = noun.charAt(0).toUpperCase() + noun.slice(1).toLowerCase();
    const suffix = Date.now().toString(36).slice(-3);
    return `${titled}-${suffix}`;
  }

  onNewSession(): void {
    this.sessionReset$.next();
    this.selectedAppType = null;
    this.registeredCname = null;
    this.appName = null;
    this.pendingUploadFiles = null;
    this.uploadFired = false;
    this.vibeService.resetSession();
  }

  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const container = (event.target as HTMLElement).closest('.vibe-panels') || document.querySelector('.vibe-panels');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pct = ((event.clientX - rect.left) / rect.width) * 100;
    this.leftPanelWidth = Math.min(75, Math.max(25, pct));
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  ngOnDestroy(): void {
    this.sessionReset$.next();
    this.sessionReset$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.vibeService.resetSession();
  }
}
