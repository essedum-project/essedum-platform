import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, take } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import { APP_TYPE_OPTIONS, AppType, VibeFile, VibeModel } from '../models/vibe-studio.models';
import { Services } from '@essedum/shared-lib';
import { StreamingServices } from '@essedum/shared-lib';

@Component({
  selector: 'app-vibe-studio',
  templateUrl: './vibe-studio.component.html',
  styleUrls: ['./vibe-studio.component.scss'],
})
export class VibeStudioComponent implements OnInit, OnDestroy {
  readonly appTypeOptions = APP_TYPE_OPTIONS;

  /** Agent options loaded from the /config/providers API (Step 1). */
  providerOptions: { label: string; value: string }[] = [];
  providersLoading = true;
  /** Selected agent value from the Step 1 dropdown. */
  selectedAgent: VibeModel | null = null;

  /** Fixed model options for Step 2. */
  readonly modelOptions: { label: string; value: string }[] = [
    { label: 'qwen3.6:27b',    value: 'qwen3.6:27b'    },
    { label: 'gemma4:latest',  value: 'gemma4:latest'   },
    { label: 'gpt-oss:latest', value: 'gpt-oss:latest'  },
    { label: 'gpt-4o-mini',    value: 'gpt-4o-mini'     },
  ];

  selectedAppType: AppType | null = null;
  /** Selected model value from the Step 2 dropdown. */
  selectedModel: VibeModel | null = null;
  /** True when both agent (Step 1) and model (Step 2) are selected. */
  get stepsDone(): boolean { return !!this.selectedAgent && !!this.selectedModel; }
  /** Display label for the selected agent, shown in the left panel. */
  get selectedAgentLabel(): string {
    return this.providerOptions.find(p => p.value === this.selectedAgent)?.label ?? this.selectedAgent ?? '';
  }
  leftPanelWidth = 28;
  private isDragging = false;
  private destroy$ = new Subject<void>();
  /** cancels the per-session messages$ subscription on new-session / re-select */
  private sessionReset$ = new Subject<void>();
  /** cname returned by the streaming-services create API */
  registeredCname: string | null = null;
  /** app name extracted from the user's requirements message */
  private appName: string | null = null;
  /** files buffered from generationComplete$ while waiting for registeredCname */
  private pendingUploadFiles: VibeFile[] | null = null;
  /** guard: upload fires at most once per generation round */
  private uploadFired = false;
  /** Pipeline registration banner shown after a card is created in ESSEDUM Pipelines */
  registrationBanner: { name: string; pipelineScreen: string; type: 'created' | 'files-pushed' } | null = null;
  registrationBannerDismissed = false;

  constructor(
    private vibeService: VibeStudioService,
    private services: Services,
  ) {}

  ngOnInit(): void {
    // Load agent options from the /config/providers endpoint (Step 1 dropdown).
    this.vibeService.getProviders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.providerOptions = this.normalizeProviders(data);
          this.providersLoading = false;
        },
        error: () => { this.providersLoading = false; },
      });

    // When generation fully completes, buffer the files and attempt upload.
    // tryFlushUpload() will also be called when registeredCname arrives, so
    // whichever of the two (files, cname) is last wins — no race condition.
    this.vibeService.generationComplete$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((files) => {
        this.uploadFired = false;          // allow re-upload on every generation round
        this.pendingUploadFiles = files;
        this.tryFlushUpload();
      });

    // When files are successfully stored in the pipeline card, upgrade the banner colour.
    this.vibeService.fileUploadSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.registrationBanner) {
          this.registrationBanner = { ...this.registrationBanner, type: 'files-pushed' };
          this.registrationBannerDismissed = false;
        }
      });
  }

  private registerInStreamingServices(sessionId: string): void {
    if (!this.selectedAppType) return;

    let type: string;
    let interfacetype: string;
    let pipelineScreen: string;

    if (this.selectedAppType === 'react_app' || this.selectedAppType === 'streamlit') {
      type = 'appPipeline';
      interfacetype = 'app-pipeline';
      pipelineScreen = 'App Pipelines';
    } else if (this.selectedAppType === 'agent') {
      type = 'AIAgent';
      interfacetype = 'pipeline-agent';
      pipelineScreen = 'Agent Pipelines';
    } else if (this.selectedAppType === 'mcp_server') {
      type = 'MCPServer';
      interfacetype = 'mcp-pipeline';
      pipelineScreen = 'MCP Pipelines';
    } else {
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
        this.registrationBanner = { name: displayName, pipelineScreen, type: 'created' };
        this.registrationBannerDismissed = false;
        this.tryFlushUpload();
      },
      error: () => {
        // create failed (e.g. duplicate alias) — fall back to sessionId so upload still fires
        this.registeredCname = sessionId;
        this.registrationBanner = { name: displayName, pipelineScreen, type: 'created' };
        this.registrationBannerDismissed = false;
        this.tryFlushUpload();
      },
    });
  }

  onAgentNameChange(name: string): void {
    // Keep the service session in sync so update-provider always has the latest agent name.
    this.vibeService.setAgentProvider(name);
  }

  /** Normalises the /config/providers API response into a flat label+value list. */
  private normalizeProviders(data: any): { label: string; value: string }[] {
    const arr: any[] = Array.isArray(data) ? data : (data?.providers ?? data?.data ?? []);
    return arr.map((item: any) => ({
      label: this.toTitleCase(item.name ?? item.displayName ?? item.label ?? item.id ?? item.value ?? String(item)),
      value: item.id ?? item.value ?? item.provider ?? item.name ?? String(item),
    }));
  }

  /** Converts snake_case, kebab-case, camelCase or plain strings to Title Case. */
  private toTitleCase(s: string): string {
    return s
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  /** Called when user picks an agent from the Step 1 dropdown. */
  onAgentSelect(agent: VibeModel): void {
    this.selectedAgent = agent;
    this.vibeService.setAgentProvider(agent);
  }

  onModelSelect(model: VibeModel): void {
    this.selectedModel = model;
    this.vibeService.setModel(model);
  }

  selectAppType(appType: AppType): void {
    if (!this.stepsDone) return;
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

  dismissRegistrationBanner(): void {
    this.registrationBannerDismissed = true;
  }

  onNewSession(): void {
    this.sessionReset$.next();
    this.selectedAppType = null;
    this.selectedAgent = null;
    this.selectedModel = null;
    this.registeredCname = null;
    this.appName = null;
    this.pendingUploadFiles = null;
    this.uploadFired = false;
    this.registrationBanner = null;
    this.registrationBannerDismissed = false;
    this.vibeService.resetSession();
  }

  private dragContainerRect: DOMRect | null = null;

  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    const container = (event.target as HTMLElement).closest('.vibe-panels') || document.querySelector('.vibe-panels');
    this.dragContainerRect = container ? container.getBoundingClientRect() : null;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.dragContainerRect) return;
    const rect = this.dragContainerRect;
    const pct = ((event.clientX - rect.left) / rect.width) * 100;
    this.leftPanelWidth = Math.min(75, Math.max(20, pct));
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.dragContainerRect = null;
  }

  ngOnDestroy(): void {
    this.sessionReset$.next();
    this.sessionReset$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.vibeService.resetSession();
  }
}
