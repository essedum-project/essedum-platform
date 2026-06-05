import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { marked } from 'marked';
import { VibeStudioService } from '../../../../services/vibe-studio.service';
import { WizardPipelineModel } from '../pipeline-editor.component';

// In-place AI rewrite tab — agent+model selection mirrors Vibe Studio exactly,
// then hands off to VibeStudioService (Goose) for all AI work.
@Component({
    selector: 'app-vibe-code-tab',
    template: `
    <div class="vibe-shell">

      <!-- ── Left: Chat Panel ── -->
      <aside class="chat-panel" [style.width.px]="chatWidth">

        <!-- ═══ SETUP SCREEN: select agent + model (like Vibe Studio) ═══ -->
        <div *ngIf="!setupDone" class="setup-screen">
          <div class="setup-hero">
            <div class="setup-icon-wrap"><i class="bi bi-stars"></i></div>
            <h3>Pipeline Assistant</h3>
            <p>Select an agent and model to start editing this pipeline with AI.</p>
          </div>

          <!-- Step 1: Agent -->
          <div class="setup-step">
            <div class="setup-step-label">
              <span class="step-badge">1</span>
              <span>Agent</span>
            </div>
            <div class="provider-select-wrap">
              <select class="provider-select"
                      [(ngModel)]="selectedAgent"
                      (ngModelChange)="onAgentSelect($event)">
                <option [ngValue]="null" disabled>Select agent…</option>
                <option *ngFor="let p of agentOptions" [value]="p.value">{{ p.label }}</option>
              </select>
              <i class="bi bi-chevron-down select-chevron"></i>
            </div>
          </div>

          <!-- Step 2: Model (locked until agent chosen) -->
          <div class="setup-step" [class.step-locked]="!selectedAgent">
            <div class="setup-step-label" [class.label-inactive]="!selectedAgent">
              <span class="step-badge" [class.badge-inactive]="!selectedAgent">2</span>
              <span>Model</span>
              <span *ngIf="!selectedAgent" class="step-hint">← pick agent first</span>
            </div>
            <div class="provider-select-wrap">
              <select class="provider-select"
                      [(ngModel)]="selectedModel"
                      (ngModelChange)="onModelSelect($event)"
                      [disabled]="!selectedAgent">
                <option [ngValue]="null" disabled>Select model…</option>
                <option *ngFor="let m of modelOptions" [value]="m.value">{{ m.label }}</option>
              </select>
              <i class="bi bi-chevron-down select-chevron"></i>
            </div>
          </div>
        </div>

        <!-- ═══ CHAT PANEL: active after agent + model selected ═══ -->
        <ng-container *ngIf="setupDone">

          <!-- Model indicator bar (identical to vibe-left-panel) -->
          <div class="model-indicator-bar">
            <i class="bi bi-robot model-indicator-icon"></i>
            <span class="model-indicator-label">{{ selectedAgentLabel }}</span>
            <span class="mib-spacer"></span>
            <button class="clear-btn" (click)="clearChat()" title="Clear chat"
                    [disabled]="!messages.length && !busy">
              <i class="bi bi-trash3"></i>
            </button>
          </div>

          <!-- Messages area (scrollable) -->
          <div class="messages-area" #chatContainer>

            <!-- Welcome state -->
            <div *ngIf="!messages.length" class="welcome-state">
              <div class="welcome-glow-ring">
                <span class="welcome-avatar"><i class="bi bi-robot"></i></span>
              </div>
              <div class="welcome-text-group">
                <h3>Pipeline Assistant</h3>
                <p>Describe the changes you want in this pipeline. The agent will return an updated Python file.</p>
              </div>
              <div class="welcome-capabilities">
                <div class="cap-chip" (click)="sendChip('Add data validation checks')">
                  <i class="bi bi-shield-check"></i> Data validation
                </div>
                <div class="cap-chip" (click)="sendChip('Add error handling and retries')">
                  <i class="bi bi-arrow-repeat"></i> Error handling
                </div>
                <div class="cap-chip" (click)="sendChip('Add feature normalization')">
                  <i class="bi bi-sliders"></i> Normalization
                </div>
                <div class="cap-chip" (click)="sendChip('Add logging to each step')">
                  <i class="bi bi-journal-text"></i> Logging
                </div>
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
                  <span class="turn-label">Pipeline AI</span>
                  <span class="ai-badge">AI</span>
                </div>
                <div class="assistant-card">
                  <div *ngIf="busy && last && !m.content" class="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div *ngIf="m.content" class="markdown-content"
                       [innerHTML]="renderMarkdown(m.content)"></div>
                  <span *ngIf="last && busy && m.content" class="stream-cursor"></span>
                </div>
              </ng-container>

            </div>
          </div>

          <!-- Input area -->
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
              <button class="send-btn" (click)="send()" [disabled]="!prompt.trim() || busy"
                      title="Send (Ctrl+Enter)">
                <mat-icon>arrow_upward</mat-icon>
              </button>
            </div>
            <div class="input-hint">Ctrl+⏎&nbsp;Send</div>
          </div>

        </ng-container>

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
    :host { display: block; overflow: hidden; }
    .vibe-shell { display: flex; height: calc(100vh - 148px); overflow: hidden; user-select: none; }

    /* ── Chat Panel (structural) ─────────────────────────────────────────────── */
    .chat-panel { display: flex; flex-direction: column; overflow: hidden; min-height: 0; flex-shrink: 0; }

    /* ── SETUP SCREEN ─────────────────────────────────────────────────────────── */
    .setup-screen { display: flex; flex-direction: column; align-items: stretch; padding: 28px 20px 20px; gap: 20px; flex: 1; overflow-y: auto; }
    .setup-hero { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
    .setup-icon-wrap { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .setup-hero h3 { margin: 0; font-size: 15px; font-weight: 700; }
    .setup-hero p  { margin: 0; font-size: 12px; line-height: 1.6; max-width: 220px; }
    .setup-step { display: flex; flex-direction: column; gap: 8px; }
    .setup-step-label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
    .step-badge { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
    .step-hint { font-size: 10px; font-weight: 400; opacity: 0.7; }
    .badge-inactive { opacity: 0.4; }
    .label-inactive { opacity: 0.5; }
    .step-locked { pointer-events: none; opacity: 0.5; }
    .provider-select-wrap { position: relative; display: flex; align-items: center; }
    .provider-select { width: 100%; appearance: none; -webkit-appearance: none; border-radius: 8px; padding: 9px 32px 9px 12px; font-size: 13px; font-weight: 500; outline: none; cursor: pointer; font-family: inherit; transition: border-color 0.15s; background: #f9fafb; border: 1.5px solid #d1d5db; color: #111827; }
    .provider-select:focus { box-shadow: 0 0 0 3px rgba(79,142,247,0.2); border-color: #4f8ef7; }
    .provider-select:disabled { cursor: not-allowed; opacity: 0.5; }
    .provider-select option { background: #fff; color: #111827; }
    .select-chevron { position: absolute; right: 10px; font-size: 10px; pointer-events: none; color: #6b7280; }

    /* ── Model indicator bar ─────────────────────────────────────────────────── */
    .model-indicator-bar { display: flex; align-items: center; gap: 6px; padding: 6px 14px; flex-shrink: 0; border-bottom: 1px solid; }
    .model-indicator-icon { font-size: 12px; }
    .model-indicator-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .mib-spacer { flex: 1; }
    .clear-btn { width: 26px; height: 26px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; background: transparent; transition: all 0.15s; }
    .clear-btn:disabled { opacity: 0.3; cursor: default; }

    /* ── Messages Area ───────────────────────────────────────────────────────── */
    .messages-area { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 14px; scrollbar-width: thin; }
    .messages-area::-webkit-scrollbar { width: 4px; }
    .messages-area::-webkit-scrollbar-thumb { border-radius: 4px; }

    /* ── Keyframes ───────────────────────────────────────────────────────────── */
    @keyframes glow-ring-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(79,142,247,0.35), 0 0 20px rgba(79,142,247,0.18); }
      50%       { box-shadow: 0 0 0 8px rgba(79,142,247,0), 0 0 32px rgba(79,142,247,0.35); }
    }
    @keyframes tdot { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes msg-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Welcome State ───────────────────────────────────────────────────────── */
    .welcome-state { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 40px 16px 24px; text-align: center; flex: 1; justify-content: center; animation: msg-enter 0.4s ease both; }
    .welcome-glow-ring { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: glow-ring-pulse 2.8s ease-in-out infinite; }
    .welcome-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .welcome-text-group { display: flex; flex-direction: column; gap: 6px; }
    .welcome-text-group h3 { margin: 0; font-size: 16px; font-weight: 700; }
    .welcome-text-group p  { margin: 0; font-size: 13px; line-height: 1.65; max-width: 240px; }
    .welcome-capabilities { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
    .cap-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 100px; font-size: 11px; font-weight: 600; border: 1px solid; cursor: pointer; transition: all 0.18s; }
    .cap-chip i { font-size: 10px; }

    /* ── Message Turns ───────────────────────────────────────────────────────── */
    .message-turn { display: flex; flex-direction: column; gap: 6px; animation: msg-enter 0.22s ease both; }
    .user-turn      { align-items: flex-end; }
    .assistant-turn { align-items: flex-start; }
    .turn-meta { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; }
    .user-meta  { flex-direction: row-reverse; }
    .user-meta .turn-label { opacity: 0.7; }
    .user-avatar  { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
    .assistant-avatar { width: 26px; height: 26px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff; }
    .ai-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.6px; background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff; }
    .user-card    { max-width: 82%; border-radius: 16px 4px 16px 16px; padding: 10px 14px; }
    .user-card .user-text { font-size: 13px; line-height: 1.6; word-break: break-word; }
    .assistant-card { max-width: 95%; border-radius: 4px 16px 16px 16px; padding: 12px 14px; }

    /* ── Markdown ────────────────────────────────────────────────────────────── */
    .markdown-content { font-size: 13px; line-height: 1.65; word-break: break-word; }
    .markdown-content ::ng-deep p { margin: 0 0 8px; color: inherit; }
    .markdown-content ::ng-deep p:last-child { margin-bottom: 0; }
    .markdown-content ::ng-deep h1, .markdown-content ::ng-deep h2,
    .markdown-content ::ng-deep h3, .markdown-content ::ng-deep h4 { margin: 10px 0 5px; font-weight: 700; color: inherit; }
    .markdown-content ::ng-deep ul, .markdown-content ::ng-deep ol { margin: 6px 0; padding-left: 18px; }
    .markdown-content ::ng-deep li { margin: 3px 0; }
    .markdown-content ::ng-deep strong { font-weight: 700; }
    .markdown-content ::ng-deep a { color: #4f8ef7; text-decoration: none; }
    .markdown-content ::ng-deep a:hover { text-decoration: underline; }
    .markdown-content ::ng-deep pre { border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 12px; margin: 8px 0; }
    .markdown-content ::ng-deep code { font-family: 'Fira Code','Consolas',monospace; font-size: 12px; padding: 2px 5px; border-radius: 4px; }
    .markdown-content ::ng-deep blockquote { border-left: 3px solid rgba(79,142,247,0.5); margin: 8px 0; padding: 4px 12px; border-radius: 0 6px 6px 0; }

    /* ── Typing / cursor ─────────────────────────────────────────────────────── */
    .typing-dots { display: flex; gap: 5px; padding: 6px 0; align-items: center; }
    .typing-dots span { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #4f8ef7, #7c3aed); animation: tdot 1.2s infinite; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    .stream-cursor { display: inline-block; width: 2px; height: 14px; background: linear-gradient(180deg, #4f8ef7, #7c3aed); margin-left: 2px; vertical-align: text-bottom; border-radius: 2px; animation: blink 0.7s steps(1) infinite; }

    /* ── Input Area ──────────────────────────────────────────────────────────── */
    .input-area { padding: 10px 12px 12px; flex-shrink: 0; border-top: 1px solid; }
    .input-shell { display: flex; align-items: flex-end; gap: 8px; border: 1px solid; border-radius: 12px; padding: 10px 10px 10px 14px; transition: border-color 0.15s, box-shadow 0.15s; }
    .input-shell.is-generating { opacity: 0.75; }
    .prompt-input { flex: 1; background: transparent; border: none; outline: none; resize: none; font-size: 13px; line-height: 1.55; max-height: 160px; overflow-y: auto; font-family: inherit; }
    .send-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff; transition: all 0.18s; flex-shrink: 0; }
    .send-btn mat-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; }
    .send-btn:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(79,142,247,0.5); transform: translateY(-1px); }
    .send-btn:disabled { opacity: 0.4; cursor: default; }
    .input-hint { font-size: 10px; text-align: right; margin-top: 6px; letter-spacing: 0.1px; }

    /* ── Diff / Code Panel (Right) ───────────────────────────────────────────── */
    .diff-panel { display: flex; flex-direction: column; overflow: hidden; min-height: 0; flex: 1; }
    .diff-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid; flex-shrink: 0; font-size: 13px; font-weight: 600; }
    .diff-head-icon mat-icon { font-size: 16px; height: 16px; width: 16px; vertical-align: middle; }
    .spacer { flex: 1; }
    .discard-btn { color: #94a3b8; font-size: 12px; min-width: unset; }
    .apply-btn { font-size: 12px; }
    .proposal-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: #fff; letter-spacing: 0.5px; }
    .code-area { flex: 1; min-height: 0; overflow: auto; scrollbar-width: thin; }
    .code-area::-webkit-scrollbar { width: 5px; height: 5px; }
    .code-area::-webkit-scrollbar-thumb { border-radius: 4px; }
    .code-preview { margin: 0; padding: 14px 16px; font-family: 'Fira Code','Consolas',monospace; font-size: 12.5px; white-space: pre; line-height: 1.6; }

    /* ── Panel Divider ───────────────────────────────────────────────────────── */
    .panel-divider { width: 4px; flex-shrink: 0; cursor: col-resize; position: relative; transition: background 0.15s; }
    .panel-divider:hover { background: rgba(79,142,247,0.45) !important; }
    .panel-divider::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 2px; height: 32px; border-radius: 2px; background: rgba(79,142,247,0.7); opacity: 0; transition: opacity 0.15s; }
    .panel-divider:hover::after { opacity: 1; }

    /* ══ Dark theme (matches vibe-left-panel exactly) ══════════════════════════ */
    :host-context(body.header-dark-theme) .chat-panel { background: #0f172a; border-right: 1px solid rgba(79,142,247,0.12); color: #e2e8f0; }
    :host-context(body.header-dark-theme) .panel-divider { background: rgba(79,142,247,0.12); }
    :host-context(body.header-dark-theme) .diff-panel { background: #0b1220; color: #e5e7eb; }
    :host-context(body.header-dark-theme) .diff-head { background: #0f172a; border-bottom-color: #1e293b; color: #a5b4fc; }
    :host-context(body.header-dark-theme) .code-preview { color: #e5e7eb; }
    :host-context(body.header-dark-theme) .code-area::-webkit-scrollbar-thumb { background: rgba(165,180,252,0.3); }
    /* setup screen */
    :host-context(body.header-dark-theme) .setup-screen { background: #0f172a; }
    :host-context(body.header-dark-theme) .setup-icon-wrap { background: linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,58,237,0.12)); border: 1px solid rgba(79,142,247,0.2); color: #7c3aed; }
    :host-context(body.header-dark-theme) .setup-hero h3 { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .setup-hero p  { color: #94a3b8; }
    :host-context(body.header-dark-theme) .setup-step-label { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .step-badge { background: rgba(79,142,247,0.15); color: #60a5fa; }
    :host-context(body.header-dark-theme) .step-hint { color: #64748b; }
    :host-context(body.header-dark-theme) .provider-select { background: #1e293b; border: 1.5px solid rgba(79,142,247,0.25); color: #e2e8f0; }
    :host-context(body.header-dark-theme) .provider-select:focus { border-color: rgba(79,142,247,0.6); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
    :host-context(body.header-dark-theme) .provider-select:hover { border-color: rgba(79,142,247,0.45); }
    :host-context(body.header-dark-theme) .provider-select option { background: #1e293b; color: #e2e8f0; }
    :host-context(body.header-dark-theme) .select-chevron { color: #94a3b8; }
    /* model indicator bar */
    :host-context(body.header-dark-theme) .model-indicator-bar { border-bottom-color: rgba(79,142,247,0.1); background: rgba(79,142,247,0.05); }
    :host-context(body.header-dark-theme) .model-indicator-icon  { color: #a78bfa; }
    :host-context(body.header-dark-theme) .model-indicator-label { color: #8faec8; }
    :host-context(body.header-dark-theme) .clear-btn { color: #64748b; }
    :host-context(body.header-dark-theme) .clear-btn:hover:not([disabled]) { background: rgba(255,255,255,0.08); color: #e2e8f0; }
    /* messages */
    :host-context(body.header-dark-theme) .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
    :host-context(body.header-dark-theme) .welcome-glow-ring { background: rgba(79,142,247,0.07); }
    :host-context(body.header-dark-theme) .welcome-avatar    { background: rgba(79,142,247,0.12); color: #4f8ef7; }
    :host-context(body.header-dark-theme) .welcome-text-group h3 { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .welcome-text-group p  { color: #94a3b8; }
    :host-context(body.header-dark-theme) .cap-chip { background: rgba(79,142,247,0.07); border-color: rgba(79,142,247,0.2); color: #94a3b8; }
    :host-context(body.header-dark-theme) .cap-chip:hover { background: rgba(79,142,247,0.14); border-color: rgba(79,142,247,0.4); color: #c9d3ff; }
    :host-context(body.header-dark-theme) .turn-meta  { color: #8faec8; }
    :host-context(body.header-dark-theme) .user-meta  { color: #94a3b8; }
    :host-context(body.header-dark-theme) .turn-label { color: #8faec8; }
    :host-context(body.header-dark-theme) .user-avatar { background: rgba(79,142,247,0.15); color: #60a5fa; }
    :host-context(body.header-dark-theme) .user-card { background: linear-gradient(135deg,rgba(79,142,247,0.16),rgba(124,58,237,0.1)); border: 1px solid rgba(79,142,247,0.28); box-shadow: 0 2px 12px rgba(79,142,247,0.12),inset 0 1px 0 rgba(255,255,255,0.05); }
    :host-context(body.header-dark-theme) .user-card .user-text { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .assistant-card { background: rgba(255,255,255,0.055); border: 1px solid rgba(79,142,247,0.18); box-shadow: 0 2px 12px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.06); color: #e2e8f0; }
    :host-context(body.header-dark-theme) .markdown-content { color: #e2e8f0 !important; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep * { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep pre { background: rgba(0,0,0,0.35); border: 1px solid rgba(79,142,247,0.1); color: #e2e8f0; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep code { background: rgba(79,142,247,0.1); color: #93c5fd !important; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep pre code { background: transparent; color: #e2e8f0 !important; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep strong { color: #f1f5f9 !important; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep a { color: #60a5fa !important; }
    :host-context(body.header-dark-theme) .markdown-content ::ng-deep blockquote { border-left-color: rgba(79,142,247,0.5); background: rgba(79,142,247,0.05); }
    /* input area */
    :host-context(body.header-dark-theme) .input-area { border-top-color: rgba(79,142,247,0.08); background: #0f172a; }
    :host-context(body.header-dark-theme) .input-shell { background: rgba(255,255,255,0.03); border-color: rgba(79,142,247,0.18); }
    :host-context(body.header-dark-theme) .input-shell:focus-within { border-color: rgba(79,142,247,0.5); box-shadow: 0 0 0 3px rgba(79,142,247,0.08); }
    :host-context(body.header-dark-theme) .prompt-input { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .prompt-input::placeholder { color: #64748b; }
    :host-context(body.header-dark-theme) .input-hint { color: #64748b; }

    /* ══ Light theme (matches vibe-left-panel exactly) ═════════════════════════ */
    :host-context(body.header-light-theme) .chat-panel { background: #fafdff; border-right: 1px solid #e5e7eb; color: #0f172a; }
    :host-context(body.header-light-theme) .panel-divider { background: #e2e8f0; }
    :host-context(body.header-light-theme) .diff-panel { background: #f8fafc; color: #1e293b; }
    :host-context(body.header-light-theme) .diff-head { background: #ffffff; border-bottom-color: #e5e7eb; color: #4f46e5; }
    :host-context(body.header-light-theme) .code-preview { color: #1e293b; }
    :host-context(body.header-light-theme) .code-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
    /* setup screen */
    :host-context(body.header-light-theme) .setup-screen { background: #fafdff; }
    :host-context(body.header-light-theme) .setup-icon-wrap { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #7c3aed; }
    :host-context(body.header-light-theme) .setup-hero h3 { color: #0f172a; }
    :host-context(body.header-light-theme) .setup-hero p  { color: #64748b; }
    :host-context(body.header-light-theme) .setup-step-label { color: #1e293b; }
    :host-context(body.header-light-theme) .step-badge { background: rgba(99,102,241,0.12); color: #4f46e5; }
    :host-context(body.header-light-theme) .step-hint { color: #94a3b8; }
    :host-context(body.header-light-theme) .provider-select { background: #ffffff; border: 1.5px solid rgba(99,102,241,0.25); color: #1e293b; }
    :host-context(body.header-light-theme) .provider-select:focus { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    :host-context(body.header-light-theme) .provider-select:hover { border-color: rgba(99,102,241,0.5); }
    :host-context(body.header-light-theme) .provider-select option { background: #ffffff; color: #1e293b; }
    :host-context(body.header-light-theme) .select-chevron { color: #64748b; }
    /* model indicator bar */
    :host-context(body.header-light-theme) .model-indicator-bar { border-bottom-color: rgba(99,102,241,0.1); background: rgba(99,102,241,0.04); }
    :host-context(body.header-light-theme) .model-indicator-icon  { color: #7c3aed; }
    :host-context(body.header-light-theme) .model-indicator-label { color: #4f46e5; }
    :host-context(body.header-light-theme) .clear-btn { color: #94a3b8; }
    :host-context(body.header-light-theme) .clear-btn:hover:not([disabled]) { background: rgba(99,102,241,0.08); color: #4f46e5; }
    /* messages */
    :host-context(body.header-light-theme) .messages-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
    :host-context(body.header-light-theme) .welcome-glow-ring { background: rgba(99,102,241,0.07); }
    :host-context(body.header-light-theme) .welcome-avatar    { background: rgba(99,102,241,0.1); color: #4f46e5; }
    :host-context(body.header-light-theme) .welcome-text-group h3 { color: #0f172a; }
    :host-context(body.header-light-theme) .welcome-text-group p  { color: #64748b; }
    :host-context(body.header-light-theme) .cap-chip { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.18); color: #64748b; }
    :host-context(body.header-light-theme) .cap-chip:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.35); color: #4f46e5; }
    :host-context(body.header-light-theme) .turn-meta  { color: #94a3b8; }
    :host-context(body.header-light-theme) .user-meta  { color: #64748b; }
    :host-context(body.header-light-theme) .turn-label { color: #64748b; }
    :host-context(body.header-light-theme) .user-avatar { background: rgba(99,102,241,0.12); color: #4f46e5; }
    :host-context(body.header-light-theme) .user-card { background: linear-gradient(135deg,rgba(99,102,241,0.1),rgba(124,58,237,0.07)); border: 1px solid rgba(99,102,241,0.22); box-shadow: 0 2px 10px rgba(99,102,241,0.1),inset 0 1px 0 rgba(255,255,255,0.8); }
    :host-context(body.header-light-theme) .user-card .user-text { color: #1e293b; }
    :host-context(body.header-light-theme) .assistant-card { background: #ffffff; border: 1px solid rgba(99,102,241,0.12); box-shadow: 0 2px 12px rgba(99,102,241,0.07),0 1px 2px rgba(0,0,0,0.04); color: #1e293b; }
    :host-context(body.header-light-theme) .markdown-content { color: #1e293b; }
    :host-context(body.header-light-theme) .markdown-content ::ng-deep pre { background: #f1f5f9; border: 1px solid #e2e8f0; color: #1e293b; }
    :host-context(body.header-light-theme) .markdown-content ::ng-deep code { background: rgba(99,102,241,0.08); color: #4f46e5; }
    :host-context(body.header-light-theme) .markdown-content ::ng-deep p,
    :host-context(body.header-light-theme) .markdown-content ::ng-deep li { color: #1e293b; }
    :host-context(body.header-light-theme) .markdown-content ::ng-deep h1,
    :host-context(body.header-light-theme) .markdown-content ::ng-deep h2,
    :host-context(body.header-light-theme) .markdown-content ::ng-deep h3,
    :host-context(body.header-light-theme) .markdown-content ::ng-deep h4 { color: #0f172a; }
    :host-context(body.header-light-theme) .markdown-content ::ng-deep strong { color: #0f172a; }
    :host-context(body.header-light-theme) .input-area { border-top-color: rgba(99,102,241,0.08); background: #fafdff; }
    :host-context(body.header-light-theme) .input-shell { background: #ffffff; border-color: rgba(99,102,241,0.2); box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
    :host-context(body.header-light-theme) .input-shell:focus-within { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
    :host-context(body.header-light-theme) .prompt-input { color: #0f172a; }
    :host-context(body.header-light-theme) .prompt-input::placeholder { color: #94a3b8; }
    :host-context(body.header-light-theme) .input-hint { color: #94a3b8; }
  `],
    standalone: false
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

  /** Agent + Model selection — identical options to Vibe Studio */
  selectedAgent: string | null = null;
  selectedModel: string | null = null;

  get setupDone(): boolean { return !!this.selectedAgent && !!this.selectedModel; }
  get selectedAgentLabel(): string {
    return this.agentOptions.find(p => p.value === this.selectedAgent)?.label ?? this.selectedAgent ?? '';
  }

  readonly agentOptions: { label: string; value: string }[] = [
    { label: 'Ollama',       value: 'ollama'       },
    { label: 'Azure OpenAI', value: 'azure_openai'  },
    { label: 'Anthropic',    value: 'anthropic'     },
  ];
  readonly modelOptions: { label: string; value: string }[] = [
    { label: 'qwen3.6:27b',    value: 'qwen3.6:27b'    },
    { label: 'gemma4:latest',  value: 'gemma4:latest'   },
    { label: 'gpt-oss:latest', value: 'gpt-oss:latest'  },
    { label: 'gpt-4o-mini',    value: 'gpt-4o-mini'     },
  ];

  chatWidth = 360;
  private isDragging = false;
  private destroy$ = new Subject<void>();
  private seeded = false;
  private codeUpdatedThisRound = false;

  constructor(
    public vibe: VibeStudioService,
    private sanitizer: DomSanitizer,
  ) {}

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
    // Pre-populate right panel with saved code; hasPendingProposal stays false.
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
        this.extractProposalFromLastMessage();
      }
    });

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

  onAgentSelect(agent: string): void {
    this.selectedAgent = agent;
    this.vibe.setAgentProvider(agent);
  }

  onModelSelect(model: string): void {
    this.selectedModel = model;
    this.vibe.setModel(model);
  }

  /** Click a cap-chip to fill the prompt and immediately send. */
  sendChip(text: string): void {
    this.prompt = text;
    this.send();
  }

  /** Clear chat history and reset session (mirrors Vibe Studio "New Session"). */
  clearChat(): void {
    this.vibe.resetSession();
    this.messages = [];
    this.seeded = false;
    this.prompt = '';
    this.hasPendingProposal = false;
  }

  renderMarkdown(text: string): SafeHtml {
    const result = marked.parse(text);
    const html = typeof result === 'string' ? result : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

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
