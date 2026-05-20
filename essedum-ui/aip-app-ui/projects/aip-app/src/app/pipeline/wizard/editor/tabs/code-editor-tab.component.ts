import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { VibeStudioService } from "../../../../vibe-studio/services/vibe-studio.service";
import {
  VibeChatMessage,
  VibeFile,
  VibeModel,
  GOOSE_PROVIDER_MAP,
} from "../../../../vibe-studio/models/vibe-studio.models";
import { WizardPipelineModel } from "../pipeline-editor.component";

@Component({
  selector: "app-code-editor-tab",
  template: `
    <div class="code-tab-shell">

      <!-- ===== LEFT: Pipeline Chat Panel ===== -->
      <aside class="chat-panel">
        <header class="cp-head">
          <mat-icon class="cp-logo">auto_awesome</mat-icon>
          <span class="cp-title">Pipeline Assistant</span>
          <span class="spacer"></span>
          <mat-select class="cp-model-sel" [(value)]="selectedProvider" (selectionChange)="onProviderChange()">
            <mat-option *ngFor="let p of providers" [value]="p">{{ p }}</mat-option>
          </mat-select>
          <button mat-icon-button (click)="clearChat()" matTooltip="Clear chat" class="cp-clear-btn">
            <mat-icon>delete_sweep</mat-icon>
          </button>
        </header>

        <ul class="cp-messages" #msgList>
          <li class="cp-empty" *ngIf="!messages.length">
            <mat-icon>tips_and_updates</mat-icon>
            <p>Describe the changes you want in this pipeline. The agent will return an updated Python file.</p>
            <div class="cp-suggestions">
              <button class="cp-chip" *ngFor="let s of suggestions" (click)="prefill(s)">{{ s }}</button>
            </div>
          </li>
          <li *ngFor="let m of messages"
              class="cp-msg"
              [class.cp-user]="m.role === 'user'"
              [class.cp-ai]="m.role === 'assistant'">
            <span class="cp-avatar">
              <mat-icon>{{ m.role === "user" ? "person" : "auto_awesome" }}</mat-icon>
            </span>
            <div class="cp-bubble">{{ m.content }}</div>
          </li>
          <li class="cp-typing" *ngIf="busy">
            <mat-icon>auto_awesome</mat-icon>
            <div class="cp-dots"><span></span><span></span><span></span></div>
          </li>
        </ul>

        <footer class="cp-foot">
          <mat-form-field appearance="outline" class="cp-input">
            <textarea
              matInput
              #promptInput
              rows="3"
              [(ngModel)]="prompt"
              placeholder="What should change? (Ctrl+Enter to send)"
              (keydown.control.enter)="send()"
              [disabled]="busy">
            </textarea>
          </mat-form-field>
          <button
            mat-flat-button
            color="primary"
            class="cp-send-btn"
            (click)="send()"
            [disabled]="!prompt.trim() || busy">
            <mat-icon>send</mat-icon>
          </button>
        </footer>
      </aside>

      <!-- ===== RIGHT: Code Editor ===== -->
      <section class="editor-panel">

        <!-- AI initial-generation overlay -->
        <div class="init-overlay" *ngIf="initializing">
          <mat-spinner diameter="52"></mat-spinner>
          <p class="init-msg">Generating your pipeline with AI…</p>
          <span class="init-sub">
            The agent is writing your
            <strong>{{ model.pipelineAttrs?.jobType || model.pipelineAttrs?.pipelineType || 'pipeline' }}</strong>
            for dataset
            <strong>{{ model.pipelineAttrs?.dataset || model.name }}</strong>
          </span>
        </div>

        <!-- Save + Run banner (shown after every Vibe agent update) -->
        <div class="save-run-banner" *ngIf="showSaveBanner && !initializing">
          <mat-icon class="banner-icon">auto_awesome</mat-icon>
          <span class="banner-msg">Pipeline Assistant updated the code &mdash; <strong>save</strong> to persist, then <strong>run</strong> to apply.</span>
          <span class="banner-spacer"></span>
          <button mat-flat-button class="banner-save-btn" (click)="save()">
            <mat-icon>save</mat-icon>&nbsp;Save
          </button>
          <button mat-icon-button class="banner-dismiss-btn" (click)="showSaveBanner = false" matTooltip="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <header class="ed-head">
          <mat-icon>insert_drive_file</mat-icon>
          <span class="filename">{{ model.filename }}</span>
          <span class="spacer"></span>
          <span class="dirty-badge" *ngIf="dirty">unsaved</span>
          <button mat-stroked-button color="primary" (click)="save()" [disabled]="!dirty">
            <mat-icon>save</mat-icon>&nbsp;Save
          </button>
        </header>
        <div class="ed-body">
          <app-enl-code-editor
            id="ele"
            [script]="scriptLines"
            [lang]="'python'"
            [langEnable]="false"
            style="height: 100%; width: 100%;"
            (scriptChange)="onScriptChange($event)">
          </app-enl-code-editor>
        </div>
      </section>

    </div>
  `,
  styles: [
    `
    /* ─────────────────────── Layout ─────────────────────── */
    .code-tab-shell {
      display: grid;
      grid-template-columns: 320px 1fr;
      height: calc(100vh - 148px);
    }

    /* ─────────────────────── Chat panel (light) ─────────── */
    .chat-panel {
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--cp-border, #e5e7eb);
      background: var(--cp-bg, #ffffff);
    }

    .cp-head {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--cp-border, #e5e7eb);
      background: var(--cp-head-bg, #f8fafc);
    }
    .cp-logo { color: #7c3aed; font-size: 20px; height: 20px; width: 20px; }
    .cp-title { font-weight: 600; font-size: 13px; color: var(--cp-title-fg, #1e293b); }
    .spacer { flex: 1; }
    /* Compact borderless model selector */
    .cp-model-sel {
      background: transparent;
      border: none;
      font-size: 12px;
      font-weight: 500;
      color: var(--cp-title-fg, #1e293b);
      min-width: 90px;
    }
    ::ng-deep .cp-model-sel.mat-mdc-select .mat-mdc-select-trigger { padding: 2px 0; }
    ::ng-deep .cp-model-sel.mat-mdc-select .mat-mdc-select-value { font-size: 12px; color: var(--cp-title-fg, #1e293b); }
    ::ng-deep .cp-model-sel.mat-mdc-select .mat-mdc-select-arrow { color: var(--cp-muted, #94a3b8); }
    .cp-clear-btn { color: var(--cp-muted, #94a3b8) !important; }

    /* Messages */
    .cp-messages {
      list-style: none;
      flex: 1;
      margin: 0;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px 12px;
      text-align: center;
      color: var(--cp-muted, #94a3b8);
    }
    ::ng-deep .cp-empty mat-icon, ::ng-deep .cp-empty .mat-icon {
      font-size: 32px; height: 32px; width: 32px; color: #a78bfa;
    }
    .cp-empty p { font-size: 13px; margin: 0; line-height: 1.5; color: var(--cp-muted, #64748b); }
    .cp-suggestions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .cp-chip {
      font-size: 11px; padding: 4px 10px; border-radius: 999px;
      border: 1px solid var(--cp-chip-border, #ddd6fe);
      background: var(--cp-chip-bg, #ede9fe);
      color: var(--cp-chip-fg, #6d28d9);
      cursor: pointer;
    }
    .cp-chip:hover { opacity: 0.8; }

    .cp-msg {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .cp-user { flex-direction: row-reverse; }
    ::ng-deep .cp-avatar mat-icon, ::ng-deep .cp-avatar .mat-icon {
      font-size: 18px; height: 18px; width: 18px;
      color: var(--cp-avatar-fg, #7c3aed);
    }
    .cp-bubble {
      max-width: 82%;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .cp-user .cp-bubble {
      background: var(--cp-user-bg, #ede9fe);
      color: var(--cp-user-fg, #4c1d95);
      border-bottom-right-radius: 2px;
    }
    .cp-ai .cp-bubble {
      background: var(--cp-ai-bg, #f1f5f9);
      color: var(--cp-ai-fg, #0f172a);
      border-bottom-left-radius: 2px;
    }

    /* Typing indicator */
    .cp-typing {
      display: flex; align-items: center; gap: 10px; padding: 4px 0;
    }
    ::ng-deep .cp-typing mat-icon, ::ng-deep .cp-typing .mat-icon {
      font-size: 18px; height: 18px; width: 18px; color: #a78bfa;
    }
    .cp-dots { display: flex; gap: 4px; }
    .cp-dots span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #a78bfa; display: inline-block;
      animation: cp-bounce 1.2s infinite ease-in-out;
    }
    .cp-dots span:nth-child(1) { animation-delay: 0s; }
    .cp-dots span:nth-child(2) { animation-delay: .2s; }
    .cp-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes cp-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40%            { transform: scale(1.2); opacity: 1; }
    }

    /* Footer */
    .cp-foot {
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      border-top: 1px solid var(--cp-border, #e5e7eb);
      align-items: flex-end;
      background: var(--cp-head-bg, #f8fafc);
    }
    .cp-input { flex: 1; }
    ::ng-deep .cp-input .mat-mdc-text-field-wrapper { background: var(--cp-input-bg, #fff); }
    .cp-send-btn { min-width: 40px !important; padding: 0 10px !important; }

    /* ─────────────────────── Code editor (right) ─────────── */
    .editor-panel {
      display: flex;
      flex-direction: column;
      background: var(--ed-bg, #1e1e1e);
    }
    .ed-head {
      display: flex; align-items: center; gap: 8px; padding: 8px 14px;
      background: var(--ed-head-bg, #252526);
      border-bottom: 1px solid var(--ed-border, #3c3c3c);
      color: var(--ed-head-fg, #cccccc);
    }
    .ed-head .filename {
      font-family: "Fira Code", monospace; font-size: 13px;
      color: var(--ed-head-fg, #cccccc);
    }
    .ed-head mat-icon { font-size: 18px; height: 18px; width: 18px; color: #6366f1; }
    .dirty-badge {
      font-size: 11px; padding: 2px 7px; border-radius: 999px;
      background: #f59e0b22; color: #f59e0b; font-weight: 600;
    }
    .ed-body { flex: 1; overflow: auto; background: #1e1e1e; }
    ::ng-deep .ed-body .editorscript { height: 100%; min-height: 480px; }

    /* AI generation overlay on the editor panel */
    /* No overflow:hidden — ACE editor must own its scroll/input area */
    .editor-panel { position: relative; display: flex; flex-direction: column; }
    .init-overlay {
      position: absolute; inset: 0; z-index: 20;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 18px;
      background: rgba(13, 17, 23, 0.80);
      backdrop-filter: blur(6px);
    }
    .init-msg {
      color: #e6edf3; font-size: 16px; font-weight: 600; margin: 0;
    }
    .init-sub {
      color: #8b949e; font-size: 13px; text-align: center; max-width: 320px; line-height: 1.5;
      strong { color: #c9d1d9; }
    }
    .ed-blur { filter: blur(3px); pointer-events: none; user-select: none; }

    /* Save + Run banner */
    .save-run-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px;
      background: #1e3a5f;
      border-bottom: 1px solid #2d5a8e;
      flex-shrink: 0;
    }
    .banner-icon { color: #60a5fa; font-size: 18px; height: 18px; width: 18px; }
    .banner-msg { font-size: 13px; color: #bfdbfe; }
    .banner-msg strong { color: #93c5fd; }
    .banner-spacer { flex: 1; }
    .banner-save-btn {
      background: #2563eb !important; color: #fff !important;
      font-size: 12px; height: 30px; line-height: 30px;
    }
    ::ng-deep .banner-save-btn .mat-icon { font-size: 15px; height: 15px; width: 15px; }
    .banner-dismiss-btn { color: #93c5fd !important; width: 30px; height: 30px; }

    :host-context(body.header-dark-theme) .save-run-banner { background: #0d2137; border-bottom-color: #1e3a5f; }

    /* ─────────────────────── Dark theme ─────────────────── */
    :host-context(body.header-dark-theme) {
      --cp-bg:          #0d1117;
      --cp-head-bg:     #161b22;
      --cp-border:      #30363d;
      --cp-title-fg:    #e6edf3;
      --cp-muted:       #6e7681;
      --cp-avatar-fg:   #a78bfa;
      --cp-chip-border: #3d2b5e;
      --cp-chip-bg:     #1e1428;
      --cp-chip-fg:     #c084fc;
      --cp-user-bg:     #1e1428;
      --cp-user-fg:     #c084fc;
      --cp-ai-bg:       #21262d;
      --cp-ai-fg:       #e6edf3;
      --cp-input-bg:    #0d1117;
      --ed-head-bg:     #0d1117;
      --ed-border:      #30363d;
      --ed-head-fg:     #8b949e;
    }
    `,
  ],
})
export class CodeEditorTabComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked
{
  @Input() model: WizardPipelineModel;
  @Output() codeChange = new EventEmitter<string>();

  @ViewChild("msgList") msgListEl: ElementRef<HTMLUListElement>;

  // Code state
  scriptLines: string[] = [];
  dirty = false;
  private originalCode = "";

  // Chat state
  prompt = "";
  busy = false;
  initializing = false;       // true while AI is generating the initial file on creation
  showSaveBanner = false;     // show after Vibe updates code on follow-up prompts
  private wasInitialGen = false;  // tracks whether the current generation is the first one
  messages: VibeChatMessage[] = [];
  selectedProvider: VibeModel = "claude";
  providers: VibeModel[] = [];
  private seeded = false;
  private scrollPending = false;

  private destroy$ = new Subject<void>();

  get suggestions(): string[] {
    if (this.model?.kind === 'training-job') {
      return [
        'Add early stopping callback',
        'Add gradient clipping',
        'Add learning rate scheduler',
        'Log metrics to MLflow',
      ];
    }
    return [
      'Add data validation checks',
      'Add error handling and retries',
      'Add feature normalization',
      'Add logging to each step',
    ];
  }

  constructor(public vibe: VibeStudioService) {}

  ngOnInit(): void {
    this.providers =
      (Object.keys(GOOSE_PROVIDER_MAP || {}) as VibeModel[]).length > 0
        ? (Object.keys(GOOSE_PROVIDER_MAP) as VibeModel[])
        : ["claude", "gemini", "azure-oai"];

    // Mirror messages from VibeStudioService
    this.vibe.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        this.messages = msgs;
        this.scrollPending = true;
      });

    // When agent finishes — extract Python file and update editor
    this.vibe.generationComplete$
      .pipe(takeUntil(this.destroy$))
      .subscribe((files: VibeFile[]) => {
        this.busy = false;
        const wasInitial = this.wasInitialGen;
        this.initializing = false;
        this.wasInitialGen = false;
        const py = files?.find((f) => /\.py$/i.test(f.path));
        if (py) {
          this.scriptLines = py.content.split("\n");
          this.dirty = py.content !== this.originalCode;
          if (wasInitial) {
            // Auto-save the AI-generated file so it persists without user action
            this.save();
          } else {
            // Subsequent Vibe update — show save+run banner
            this.showSaveBanner = true;
          }
        }
        this.scrollPending = true;
      });

    // Reflect busy state + clear initializing overlay when agent goes idle (failsafe)
    this.vibe.status$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.busy = s === "generating";
      // If status leaves 'generating' but generationComplete$ never fired
      // (i.e. Goose returned only text, no file artifacts), unblock the editor.
      if ((s === 'idle' || s === 'error') && this.initializing) {
        const wasInit = this.wasInitialGen;
        this.initializing = false;
        this.wasInitialGen = false;
        // Fallback: extract Python from the last assistant message text
        const msgs = this.vibe.messages$.value;
        const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
        if (lastAssistant) {
          const match = lastAssistant.content.match(/```python\n([\s\S]*?)```/);
          if (match && match[1].trim()) {
            this.scriptLines = match[1].split('\n');
            this.dirty = this.scriptLines.join('\n') !== this.originalCode;
            if (wasInit) {
              this.save();
            } else {
              this.showSaveBanner = true;
            }
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && this.model) {
      this.scriptLines = (this.model.code || "").split("\n");
      this.originalCode = this.model.code || "";
      this.dirty = false;
      this.seeded = false;

      // Freshly created pipeline → auto-generate initial code via Goose
      if (this.model.pipelineAttrs?.freshlyCreated) {
        this.vibe.resetSession();
        this.scheduleAutoGenerate();
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.scrollPending) {
      this.scrollToBottom();
      this.scrollPending = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.vibe.cancelReply?.();
  }

  onProviderChange(): void {
    this.vibe.setModel(this.selectedProvider);
  }

  prefill(text: string): void {
    this.prompt = text;
  }

  /**
   * Called once on freshly-created pipelines.
   * Sends a comprehensive internal prompt (not shown verbatim) to Goose to generate the initial file.
   */
  private scheduleAutoGenerate(): void {
    const attrs = this.model.pipelineAttrs || {};
    const columns: string[] = attrs.datasetColumns || [];
    const sample: any[] = attrs.datasetSample || [];
    const isTraining = this.model.kind === 'training-job';

    const prompt = isTraining
      ? this.buildTrainingPrompt(attrs, columns, sample)
      : this.buildDataPipelinePrompt(attrs, columns, sample);

    // Show only a clean indicator in chat — hide the verbose internal prompt
    const typeLabel = isTraining
      ? (attrs.jobType || 'training job')
      : (attrs.pipelineType || 'pipeline');
    const displayText = `⚡ Generating initial ${typeLabel} code from your configuration…`;

    this.initializing = true;
    this.busy = true;
    this.seeded = true;
    this.wasInitialGen = true;
    this.vibe.generate(prompt, displayText);
  }

  private buildDataPipelinePrompt(attrs: any, columns: string[], sample: any[]): string {
    return `You are an Essedum ML pipeline code generator. Generate a complete, production-ready Python pipeline script.

## Pipeline Specification
- Name: ${this.model.name}
- Alias: ${this.model.alias || this.model.name}
- Pipeline Type: ${attrs.pipelineType || 'feature-engineering'}
- Problem Type: ${attrs.problemType || 'classification'}
- Executor: ${attrs.executor || 'py-job-executor'}
- Output Format: ${attrs.outputFormat || ''}

## Data Source
- Connection Type: ${attrs.outputContainer || ''}
- Connection Alias: ${attrs.connection || ''}
- Dataset: ${attrs.dataset || ''}
- Target Column: ${attrs.targetCol || ''}
- Available Columns: ${columns.length ? columns.join(', ') : '(not specified)'}
${sample.length ? `\n## Dataset Sample (first rows):\n${JSON.stringify(sample, null, 2)}\n` : ''}
## Implementation Requirements
1. Follow the Essedum DataContainer pattern — accept DataContainer input, return DataContainer output
2. Load data from the ${attrs.outputContainer || 'datasource'} connection "${attrs.connection || ''}", dataset "${attrs.dataset || ''}"
3. Implement ${attrs.problemType || 'classification'} ML task (pipeline type: ${attrs.pipelineType || 'feature-engineering'})
4. Target/label column is "${attrs.targetCol || ''}" — predict or transform this column
5. Use all available feature columns: ${columns.join(', ') || 'all columns except target'}
6. Use scikit-learn (or most appropriate library) for the task
7. Include: data validation, missing-value handling, feature engineering, model training, evaluation metrics, model artifact saving
8. Add logging using Python's logging module throughout
9. Main entry function must be named run_pipeline()
10. Return the COMPLETE Python file — do not omit or truncate any section

Return the full Python script inside a fenced \`\`\`python block.`;
  }

  private buildTrainingPrompt(attrs: any, columns: string[], sample: any[]): string {
    return `You are an Essedum ML training job code generator. Generate a complete, production-ready Python training script.

## Training Job Specification
- Name: ${this.model.name}
- Alias: ${this.model.alias || this.model.name}
- Job Type: ${attrs.jobType || 'traditional'}
- Framework: ${attrs.framework || 'scikit-learn'}
- Base Model / Algorithm: ${attrs.baseModel || ''}
- Fine-tuning Method: ${attrs.method || ''}
- Quantization: ${attrs.quantization || 'none'}
- Teacher Model (distillation): ${attrs.teacher || 'N/A'}
- Executor: ${attrs.executor || 'py-job-executor'}

## Hyperparameters
- Epochs: ${attrs.epochs ?? 3}
- Batch Size: ${attrs.batchSize ?? 4}
- Learning Rate: ${attrs.lr || '2e-4'}
${attrs.loraRank ? `- LoRA Rank: ${attrs.loraRank}\n- LoRA Alpha: ${attrs.loraAlpha}` : ''}
${attrs.maxLen ? `- Max Sequence Length: ${attrs.maxLen}` : ''}

## Dataset
- Dataset Alias: ${attrs.dataset || ''}
- Available Columns: ${columns.length ? columns.join(', ') : '(all columns)'}
${sample.length ? `\n## Dataset Sample (first rows):\n${JSON.stringify(sample, null, 2)}\n` : ''}
## Implementation Requirements
1. Follow the Essedum DataContainer pattern — load data via DataContainer input
2. Implement a ${attrs.jobType || 'traditional'} training job using ${attrs.framework || 'the appropriate framework'}
3. Use the ${attrs.baseModel || 'specified algorithm/model'} as the base
4. Use columns: ${columns.join(', ') || 'all available columns'}
5. Include: data loading, preprocessing, train/validation split, model initialisation, training loop, evaluation metrics, model saving as artifact
6. Add logging using Python's logging module throughout
7. Main entry function must be named run_training()
8. Handle the hyperparameters (epochs, batch size, lr) as configurable parameters
9. Return the COMPLETE Python file — do not omit or truncate any section

Return the full Python script inside a fenced \`\`\`python block.`;
  }

  send(): void {
    const userPrompt = this.prompt.trim();
    if (!userPrompt) return;
    this.prompt = "";
    this.busy = true;

    const attrs = this.model.pipelineAttrs || {};
    const pipelineKind = this.model.kind === "training-job" ? "training" : "data";

    if (!this.seeded) {
      // First user message without prior auto-generate: include full file context
      const seedHeader = `You are modifying an Essedum ${pipelineKind} pipeline.
Return the FULL updated Python file inside a fenced \`\`\`python block.
Preserve the auto-generated header comment and the input/output DataContainer schema.

Current file (${this.model.filename}):
\`\`\`python
${this.model.code}
\`\`\`
`;
      this.seeded = true;
      this.vibe.generate(`${seedHeader}\n\nInstruction: ${userPrompt}`, userPrompt);
    } else {
      // Subsequent messages — wrap with lightweight internal context (not shown in chat)
      const isTraining = this.model.kind === 'training-job';
      const ctxParts = isTraining
        ? `pipeline: "${this.model.name}", type: "${attrs.jobType || 'traditional'}", framework: "${attrs.framework || ''}", dataset: "${attrs.dataset || ''}", columns: [${(attrs.datasetColumns || []).join(', ')}]`
        : `pipeline: "${this.model.name}", type: "${attrs.pipelineType || 'data'}", dataset: "${attrs.dataset || ''}", target column: "${attrs.targetCol || ''}", available columns: [${(attrs.datasetColumns || []).join(', ')}]`;
      const internalCtx = `\n\n[Internal context — ${ctxParts}. Always return the FULL updated Python file inside a \`\`\`python block. Do not truncate.]`;
      this.vibe.generate(userPrompt + internalCtx, userPrompt);
    }
  }

  clearChat(): void {
    this.vibe.cancelReply?.();
    // Reset vibe session messages by creating a fresh session
    this.vibe["session"] = this.vibe["createNewSession"]?.() ?? this.vibe["session"];
    this.vibe.messages$.next([]);
    this.seeded = false;
  }

  onScriptChange(lines: string[]): void {
    this.scriptLines = lines;
    const joined = lines.join("\n");
    this.dirty = joined !== this.originalCode;
  }

  save(): void {
    const code = this.scriptLines.join("\n");
    this.codeChange.emit(code);
    this.originalCode = code;
    this.dirty = false;
    this.showSaveBanner = false;
  }

  private scrollToBottom(): void {
    try {
      const el = this.msgListEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
