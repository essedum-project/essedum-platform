import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../../../../vibe-studio/services/vibe-studio.service';
import { GOOSE_PROVIDER_MAP, VibeModel } from '../../../../vibe-studio/models/vibe-studio.models';
import { WizardPipelineModel } from '../pipeline-editor.component';

// In-place AI rewrite tab. Wraps VibeStudioService (Goose client) — never talks
// to GPT-4o directly (the React reference does, we deliberately don't).
@Component({
  selector: 'app-vibe-code-tab',
  template: `
    <div class="vibe-shell">

      <!-- ── Left: Chat Panel ── -->
      <aside class="chat-panel" [style.width.px]="chatWidth">

        <!-- Model bar / header -->
        <div class="model-bar">
          <div class="model-bar-left">
            <i class="bi bi-stars model-icon"></i>
            <span class="model-label">Vibe Code</span>
          </div>
          <div class="model-selector-wrap">
            <select class="model-select" [(ngModel)]="selectedProvider" (change)="onProviderChange()">
              <option *ngFor="let p of providers" [value]="p">{{ p }}</option>
            </select>
            <i class="bi bi-chevron-down select-chevron"></i>
          </div>
        </div>

        <!-- Messages area (scrollable, fixed height) -->
        <div class="messages-area" #chatContainer>

          <!-- Welcome state -->
          <div *ngIf="!messages.length" class="welcome-state">
            <div class="welcome-glow-ring">
              <span class="welcome-avatar"><i class="bi bi-robot"></i></span>
            </div>
            <div class="welcome-text-group">
              <h3>Vibe Code</h3>
              <p>Ask the model to rewrite parts of this file. Current code is provided as context.</p>
            </div>
            <div class="welcome-tip">
              <i class="bi bi-lightbulb"></i>
              Example: "Rewrite to read from S3 instead of the SQL connection."
            </div>
          </div>

          <!-- Message turns -->
          <div *ngFor="let m of messages; let last = last"
               class="message-turn"
               [class.user-turn]="m.role === 'user'"
               [class.assistant-turn]="m.role === 'assistant'">

            <ng-container *ngIf="m.role === 'user'">
              <div class="turn-meta user-meta">
                <span class="turn-label">You</span>
                <span class="user-avatar"><i class="bi bi-person-fill"></i></span>
              </div>
              <div class="user-card">
                <div class="user-text">{{ m.content }}</div>
              </div>
            </ng-container>

            <ng-container *ngIf="m.role === 'assistant'">
              <div class="turn-meta assistant-meta">
                <span class="assistant-avatar"><i class="bi bi-stars"></i></span>
                <span class="turn-label">Vibe Code</span>
                <span class="ai-badge">AI</span>
              </div>
              <div class="assistant-card">
                <div *ngIf="busy && last && !m.content" class="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                <div *ngIf="m.content" class="msg-text">{{ m.content }}</div>
                <span *ngIf="last && busy && m.content" class="stream-cursor"></span>
              </div>
            </ng-container>

          </div>
        </div>

        <!-- Input area / footer -->
        <div class="input-area">
          <div class="input-shell" [class.is-generating]="busy">
            <textarea
              class="prompt-input"
              [(ngModel)]="prompt"
              placeholder="What should change? (Ctrl+Enter to send)"
              rows="2"
              [disabled]="busy"
              (keydown)="$event.ctrlKey && $event.key === 'Enter' && send()">
            </textarea>
            <button class="send-btn" (click)="send()" [disabled]="!prompt.trim() || busy" title="Send (Ctrl+Enter)">
              <mat-icon>arrow_upward</mat-icon>
            </button>
          </div>
          <div class="input-hint">Ctrl+⏎&nbsp;Send</div>
        </div>

      </aside>
      <div class="panel-divider" (mousedown)="onDividerMouseDown($event)"></div>

      <!-- ── Right: Proposed Code Panel ── -->
      <section class="diff-panel">
        <div class="diff-head">
          <span class="diff-head-icon"><mat-icon>{{ hasPendingProposal ? 'auto_fix_high' : 'insert_drive_file' }}</mat-icon></span>
          <b>{{ hasPendingProposal ? 'Proposed Code' : 'Saved Code' }}</b>
          <span class="proposal-badge" *ngIf="hasPendingProposal">AI proposal</span>
          <span class="spacer"></span>
          <button mat-button class="discard-btn" (click)="discard()" [disabled]="!hasPendingProposal">Discard</button>
          <button mat-flat-button color="primary" class="apply-btn" (click)="apply()" [disabled]="!hasPendingProposal">
            <mat-icon>check</mat-icon>&nbsp;Apply
          </button>
        </div>
        <div class="code-area">
          <pre class="code-preview">{{ proposedCode || '# (no code yet — send a prompt to generate)' }}</pre>
        </div>
      </section>

    </div>
  `,
  styles: [`
    /* ── Shell ─────────────────────────────────────────────────────────────── */
    /* Same height strategy as code-editor-tab — explicit calc, no parent-chain */
    :host { display: block; overflow: hidden; }
    .vibe-shell {
      display: flex;
      height: calc(100vh - 148px);
      overflow: hidden;
      user-select: none;
    }

    /* ── Chat Panel ─────────────────────────────────────────────────────────── */
    .chat-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex-shrink: 0;
      border-right: 1px solid #e5e7eb;
    }

    /* ── Model Bar (Header) ─────────────────────────────────────────────────── */
    .model-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    }
    .model-bar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .model-icon {
      font-size: 16px;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .model-label {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: #e2e8f0;
    }
    .model-selector-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .model-select {
      appearance: none;
      -webkit-appearance: none;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 5px 26px 5px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      cursor: pointer;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .model-select option { background: #1e2a3a; color: #e2e8f0; }
    .model-select:hover { border-color: rgba(79,142,247,0.5); }
    .select-chevron {
      position: absolute;
      right: 8px;
      font-size: 10px;
      pointer-events: none;
      color: #94a3b8;
    }

    /* ── Messages Area (scrollable) ─────────────────────────────────────────── */
    .messages-area {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(79,142,247,0.3) transparent;
    }
    .messages-area::-webkit-scrollbar { width: 4px; }
    .messages-area::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(79,142,247,0.3); }

    /* ── Welcome State ──────────────────────────────────────────────────────── */
    .welcome-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 32px 16px 16px;
      text-align: center;
      flex: 1;
      justify-content: center;
    }
    .welcome-glow-ring {
      width: 58px; height: 58px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, rgba(79,142,247,0.12), rgba(124,58,237,0.12));
      border: 1px solid rgba(79,142,247,0.2);
    }
    .welcome-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: #7c3aed;
    }
    .welcome-text-group h3 { margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; }
    .welcome-text-group p  { margin: 6px 0 0; font-size: 12px; line-height: 1.6; color: #64748b; max-width: 240px; }
    .welcome-tip {
      font-size: 11px;
      color: #94a3b8;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      max-width: 260px;
      line-height: 1.5;
    }
    .welcome-tip i { margin-right: 4px; color: #f59e0b; }

    /* ── Message Turns ──────────────────────────────────────────────────────── */
    .message-turn { display: flex; flex-direction: column; gap: 5px; animation: msg-enter 0.22s ease both; }
    .user-turn      { align-items: flex-end; }
    .assistant-turn { align-items: flex-start; }
    .turn-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #64748b; }
    .user-meta { flex-direction: row-reverse; }
    .user-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 11px; flex-shrink: 0;
      background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed;
    }
    .assistant-avatar {
      width: 24px; height: 24px; border-radius: 7px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff;
    }
    .ai-badge {
      font-size: 9px; font-weight: 800;
      padding: 2px 5px; border-radius: 4px;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      color: #fff; letter-spacing: 0.5px;
    }
    .user-card {
      max-width: 85%;
      background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.07));
      border: 1px solid rgba(99,102,241,0.22);
      border-radius: 16px 4px 16px 16px;
      padding: 10px 14px;
      box-shadow: 0 2px 10px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
    }
    .user-card .user-text { font-size: 13px; line-height: 1.6; color: #1e293b; word-break: break-word; }
    .assistant-card {
      max-width: 95%;
      background: #ffffff;
      border: 1px solid rgba(99,102,241,0.12);
      border-radius: 4px 16px 16px 16px;
      padding: 10px 14px;
      box-shadow: 0 2px 12px rgba(99,102,241,0.07), 0 1px 2px rgba(0,0,0,0.04);
    }
    .assistant-card .msg-text {
      font-size: 13px; line-height: 1.6; color: #1e293b;
      word-break: break-word; white-space: pre-wrap;
    }

    /* ── Typing Dots ────────────────────────────────────────────────────────── */
    @keyframes tdot {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40%            { transform: scale(1.2); opacity: 1; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }
    @keyframes msg-enter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .typing-dots { display: flex; gap: 5px; padding: 4px 0; align-items: center; }
    .typing-dots span {
      width: 6px; height: 6px; border-radius: 50%;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      animation: tdot 1.2s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    .stream-cursor {
      display: inline-block; width: 2px; height: 13px;
      background: linear-gradient(180deg, #4f8ef7, #7c3aed);
      margin-left: 2px; vertical-align: text-bottom;
      border-radius: 2px; animation: blink 0.7s steps(1) infinite;
    }

    /* ── Input Area (Footer) ────────────────────────────────────────────────── */
    .input-area {
      padding: 10px 12px 12px;
      flex-shrink: 0;
      border-top: 1px solid #e5e7eb;
    }
    .input-shell {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 10px 10px 14px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .input-shell:focus-within {
      border-color: rgba(79,142,247,0.6);
      box-shadow: 0 0 0 3px rgba(79,142,247,0.08);
    }
    .input-shell.is-generating { opacity: 0.65; pointer-events: none; }
    .prompt-input {
      flex: 1; background: transparent; border: none; outline: none;
      resize: none; font-size: 13px; line-height: 1.5;
      font-family: inherit; color: #1e293b; min-height: 20px;
    }
    .prompt-input::placeholder { color: #94a3b8; }
    .send-btn {
      width: 34px; height: 34px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%);
      color: #fff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: all 0.18s;
    }
    .send-btn mat-icon { font-size: 18px; height: 18px; width: 18px; line-height: 18px; }
    .send-btn:disabled { opacity: 0.4; cursor: default; }
    .send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(79,142,247,0.5); }
    .input-hint { font-size: 10px; color: #94a3b8; margin-top: 6px; text-align: right; }

    /* ── Diff / Code Panel (Right) ──────────────────────────────────────────── */
    .diff-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      background: #0b1220;
      color: #e5e7eb;
    }
    .diff-head {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid #1e293b;
      background: #0f172a;
      flex-shrink: 0;
      color: #a5b4fc;
      font-size: 13px;
      font-weight: 600;
    }
    .diff-head-icon mat-icon { font-size: 16px; height: 16px; width: 16px; vertical-align: middle; }
    .spacer { flex: 1; }
    .discard-btn { color: #94a3b8; font-size: 12px; min-width: unset; }
    .apply-btn { font-size: 12px; }
    .proposal-badge {
      font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff; letter-spacing: 0.5px;
    }
    .code-area {
      flex: 1;
      min-height: 0;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(165,180,252,0.3) transparent;
    }
    .code-area::-webkit-scrollbar { width: 5px; height: 5px; }
    .code-area::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(165,180,252,0.3); }
    .code-preview {
      margin: 0;
      padding: 14px 16px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 12.5px;
      white-space: pre;
      color: #e5e7eb;
      line-height: 1.6;
    }

    /* ── Panel Divider ─────────────────────────────────────────────────────── */
    .panel-divider {
      width: 4px;
      flex-shrink: 0;
      cursor: col-resize;
      background: #e2e8f0;
      transition: background 0.15s;
      position: relative;
    }
    .panel-divider:hover { background: rgba(79,142,247,0.45); }
    .panel-divider::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 2px; height: 32px;
      border-radius: 2px;
      background: rgba(79,142,247,0.7);
      opacity: 0;
      transition: opacity 0.15s;
    }
    .panel-divider:hover::after { opacity: 1; }

    /* ── Light theme ───────────────────────────────────────────────────────── */
    :host-context(body.header-light-theme) .chat-panel { background: #fafdff; }
    :host-context(body.header-light-theme) .welcome-text-group h3 { color: #0f172a; }
    :host-context(body.header-light-theme) .welcome-text-group p  { color: #64748b; }
    :host-context(body.header-light-theme) .welcome-tip { background: #f8fafc; border-color: #e2e8f0; color: #94a3b8; }
    :host-context(body.header-light-theme) .turn-meta   { color: #94a3b8; }
    :host-context(body.header-light-theme) .user-avatar { background: rgba(99,102,241,0.12); color: #4f46e5; }
    :host-context(body.header-light-theme) .prompt-input { color: #1e293b; }
    :host-context(body.header-light-theme) .prompt-input::placeholder { color: #94a3b8; }
    :host-context(body.header-light-theme) .input-shell { border-color: #e2e8f0; }
    :host-context(body.header-light-theme) .input-area { background: #fafdff; }
    :host-context(body.header-light-theme) .input-hint { color: #94a3b8; }
    :host-context(body.header-light-theme) .panel-divider { background: #e2e8f0; }

    /* ── Dark theme ────────────────────────────────────────────────────────── */
    :host-context(body.header-dark-theme) .chat-panel { background: #0f172a; border-right-color: rgba(79,142,247,0.12); }
    :host-context(body.header-dark-theme) .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
    :host-context(body.header-dark-theme) .welcome-glow-ring { background: rgba(79,142,247,0.07); border-color: rgba(79,142,247,0.15); }
    :host-context(body.header-dark-theme) .welcome-avatar { background: rgba(79,142,247,0.12); color: #4f8ef7; }
    :host-context(body.header-dark-theme) .welcome-text-group h3 { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .welcome-text-group p  { color: #94a3b8; }
    :host-context(body.header-dark-theme) .welcome-tip { background: rgba(79,142,247,0.07); border-color: rgba(79,142,247,0.2); color: #94a3b8; }
    :host-context(body.header-dark-theme) .welcome-tip i { color: #f59e0b; }
    :host-context(body.header-dark-theme) .turn-meta { color: #8faec8; }
    :host-context(body.header-dark-theme) .user-meta { color: #94a3b8; }
    :host-context(body.header-dark-theme) .user-avatar { background: rgba(79,142,247,0.15); color: #60a5fa; }
    :host-context(body.header-dark-theme) .user-card {
      background: linear-gradient(135deg, rgba(79,142,247,0.16), rgba(124,58,237,0.1));
      border-color: rgba(79,142,247,0.28);
      box-shadow: 0 2px 12px rgba(79,142,247,0.12), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    :host-context(body.header-dark-theme) .user-card .user-text { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .assistant-card {
      background: rgba(255,255,255,0.055);
      border-color: rgba(79,142,247,0.18);
      box-shadow: 0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06);
    }
    :host-context(body.header-dark-theme) .assistant-card .msg-text { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .input-area { background: #0f172a; border-top-color: rgba(79,142,247,0.1); }
    :host-context(body.header-dark-theme) .input-shell { background: rgba(255,255,255,0.03); border-color: rgba(79,142,247,0.18); }
    :host-context(body.header-dark-theme) .input-shell:focus-within { border-color: rgba(79,142,247,0.5); box-shadow: 0 0 0 3px rgba(79,142,247,0.08); }
    :host-context(body.header-dark-theme) .prompt-input { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .prompt-input::placeholder { color: #64748b; }
    :host-context(body.header-dark-theme) .input-hint { color: #64748b; }
    :host-context(body.header-dark-theme) .panel-divider { background: rgba(79,142,247,0.12); }
    :host-context(body.header-dark-theme) .panel-divider:hover { background: rgba(79,142,247,0.4); }
  `],
})
export class VibeCodeTabComponent implements OnInit, OnDestroy {
  @Input() model: WizardPipelineModel;
  @Output() codeChange = new EventEmitter<string>();
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  prompt = '';
  busy = false;
  messages: { role: string; content: string }[] = [];
  proposedCode = '';
  hasPendingProposal = false;
  selectedProvider: VibeModel = 'claude';
  providers: VibeModel[] = Object.keys(GOOSE_PROVIDER_MAP || {}) as VibeModel[];

  chatWidth = 360;
  private isDragging = false;
  private destroy$ = new Subject<void>();
  private seeded = false;
  /** true once generationComplete$ has updated proposedCode for the current round */
  private codeUpdatedThisRound = false;

  constructor(public vibe: VibeStudioService) {}

  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const container = document.querySelector('.vibe-shell') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newWidth = event.clientX - rect.left;
    this.chatWidth = Math.min(600, Math.max(240, newWidth));
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  ngOnInit(): void {
    if (this.providers.length === 0) this.providers = ['claude', 'gemini', 'azure-oai'];

    // Pre-populate the right panel with the currently saved code from the DB.
    // hasPendingProposal stays false so Apply/Discard remain disabled.
    const savedCode = this.model?.code;
    if (savedCode && savedCode.trim() !== '# (no code yet)') {
      this.proposedCode = savedCode;
    }

    this.vibe.messages$.pipe(takeUntil(this.destroy$)).subscribe(msgs => {
      this.messages = msgs.map(m => ({ role: m.role, content: m.content }));
      this.scrollToBottom();
    });

    this.vibe.generationComplete$.pipe(takeUntil(this.destroy$)).subscribe(files => {
      this.busy = false;
      const py = files?.find(f => /\.py$/i.test(f.path));
      if (py) {
        this.proposedCode = py.content;
        this.hasPendingProposal = true;
        this.codeUpdatedThisRound = true;
      } else {
        // No file artifact found — extract from the last assistant message
        this.extractProposalFromLastMessage();
      }
    });

    // Reset busy and run fallback when generationComplete$ never fires at all
    // (agent returned only chat text with no detectable file artifacts)
    this.vibe.status$.pipe(takeUntil(this.destroy$)).subscribe(s => {
      const wasBusy = this.busy;
      this.busy = s === 'generating';
      if (wasBusy && (s === 'idle' || s === 'error') && !this.codeUpdatedThisRound) {
        this.extractProposalFromLastMessage();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    this.vibe.cancelReply();
  }

  onProviderChange(): void { this.vibe.setModel(this.selectedProvider); }

  send(): void {
    if (!this.prompt.trim()) return;
    this.busy = true;
    this.codeUpdatedThisRound = false;
    const userPrompt = this.prompt.trim();
    this.prompt = '';

    const seedHeader = `I am editing this Essedum ${this.model.kind === 'training-job' ? 'training' : 'data'} pipeline.
Update the code per my instruction and return the FULL updated Python file inside
a fenced \`\`\`python block. Preserve the auto-generated header and the input/output schema.

Current ${this.model.filename}:
\`\`\`python
${this.model.code}
\`\`\`
`;
    const fullPrompt = this.seeded ? userPrompt : `${seedHeader}\n\nInstruction: ${userPrompt}`;
    this.seeded = true;
    this.vibe.generate(fullPrompt, userPrompt);
  }

  apply(): void {
    if (!this.hasPendingProposal || !this.proposedCode) return;
    this.codeChange.emit(this.proposedCode);
    // After applying, the proposed code becomes the saved code — no more pending proposal.
    this.hasPendingProposal = false;
  }

  discard(): void {
    // Revert to the last saved code and clear the pending proposal flag.
    this.proposedCode = this.model?.code || '';
    this.hasPendingProposal = false;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  /** Extracts the first fenced code block from the last assistant message and
   *  sets it as the proposed code if one is found. */
  private extractProposalFromLastMessage(): void {
    const msgs = this.vibe.messages$.value;
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
    if (lastAssistant?.content) {
      const match = lastAssistant.content.match(/```(?:python)?\n([\s\S]*?)```/);
      if (match?.[1]?.trim()) {
        this.proposedCode = match[1];
        this.hasPendingProposal = true;
        this.codeUpdatedThisRound = true;
      }
    }
  }
}
