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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { VibeStudioService } from "../../../../vibe-studio/services/vibe-studio.service";
import {
  VibeChatMessage,
  VibeFile,
  VibeModel,
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
          <button mat-icon-button (click)="clearChat()" matTooltip="Clear chat" class="cp-clear-btn" *ngIf="setupDone">
            <mat-icon>delete_sweep</mat-icon>
          </button>
        </header>

        <!-- Setup screen: choose agent + model before chatting -->
        <div *ngIf="!setupDone" class="cp-setup-screen">
          <div class="cp-setup-icon-wrap"><mat-icon>auto_awesome</mat-icon></div>
          <div class="cp-setup-hero">
            <h3>Configure Assistant</h3>
            <p>Select an agent provider and model to begin.</p>
          </div>
          <div class="cp-setup-step">
            <label class="cp-setup-step-label">
              <span class="cp-step-badge">1</span> Agent Provider
            </label>
            <div class="cp-provider-select-wrap">
              <select class="cp-provider-select" [(ngModel)]="selectedAgent" (change)="onAgentSelect()">
                <option value="" disabled [selected]="!selectedAgent">Select agent…</option>
                <option *ngFor="let a of agentOptions" [value]="a.value">{{ a.label }}</option>
              </select>
              <span class="cp-select-chevron">▾</span>
            </div>
          </div>
          <div class="cp-setup-step">
            <label class="cp-setup-step-label" [style.opacity]="selectedAgent ? '1' : '0.45'">
              <span class="cp-step-badge">2</span> Model
            </label>
            <div class="cp-provider-select-wrap">
              <select class="cp-provider-select" [(ngModel)]="selectedModel" (change)="onModelSelect()" [disabled]="!selectedAgent">
                <option value="" disabled [selected]="!selectedModel">Select model…</option>
                <option *ngFor="let m of modelOptions" [value]="m.value">{{ m.label }}</option>
              </select>
              <span class="cp-select-chevron">▾</span>
            </div>
          </div>
        </div>

        <ul class="cp-messages" #msgList *ngIf="setupDone">
          <li class="cp-empty" *ngIf="!messages.length">
            <mat-icon>tips_and_updates</mat-icon>
            <p>Describe the changes you want in this pipeline. The agent will return an updated Python file.</p>
            <div class="cp-suggestions">
              <button class="cp-chip" *ngFor="let s of suggestions" (click)="prefill(s)">{{ s }}</button>
            </div>
          </li>

          <li *ngFor="let m of messages; let last = last"
              class="cp-msg"
              [class.cp-user]="m.role === 'user'"
              [class.cp-ai]="m.role === 'assistant'">

            <!-- User message -->
            <ng-container *ngIf="m.role === 'user'">
              <div class="cp-turn-meta cp-user-meta">
                <span class="cp-turn-label">You</span>
                <span class="cp-user-avatar"><mat-icon>person</mat-icon></span>
              </div>
              <div class="cp-bubble cp-user-bubble">{{ m.content }}</div>
            </ng-container>

            <!-- Assistant message -->
            <ng-container *ngIf="m.role === 'assistant'">
              <div class="cp-turn-meta cp-ai-meta">
                <span class="cp-ai-avatar"><mat-icon>auto_awesome</mat-icon></span>
                <span class="cp-turn-label">Pipeline Assistant</span>
                <span class="cp-ai-badge">AI</span>
              </div>
              <!-- Typing dots: only while waiting for first token -->
              <div *ngIf="busy && last && !m.content" class="cp-typing-inline">
                <div class="cp-dots"><span></span><span></span><span></span></div>
              </div>
              <!-- Rendered markdown content -->
              <div *ngIf="m.content"
                   class="cp-bubble cp-ai-bubble"
                   [innerHTML]="renderMarkdown(m.content)">
              </div>
              <span *ngIf="last && busy && m.content" class="cp-stream-cursor"></span>
            </ng-container>

          </li>
        </ul>

        <footer class="cp-foot" *ngIf="setupDone">
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

        <!-- Save + Run banner (shown after follow-up AI code update) -->
        <div class="save-run-banner" *ngIf="showSaveBanner && !initializing">
          <mat-icon class="banner-icon">check_circle</mat-icon>
          <div class="banner-body">
            <span class="banner-title">Code updated &amp; saved by AI</span>
            <span class="banner-sub">Click <strong>▶ Run</strong> in the top bar to execute the updated pipeline.</span>
          </div>
          <span class="banner-spacer"></span>
          <button mat-icon-button class="banner-dismiss-btn" (click)="showSaveBanner = false" matTooltip="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <header class="ed-head">
          <mat-icon>insert_drive_file</mat-icon>
          <span class="filename">{{ displayFilename }}</span>
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
      overflow: hidden;
      min-height: 0;
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
      min-height: 0;
      margin: 0;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(124,58,237,0.3) transparent;
    }
    .cp-messages::-webkit-scrollbar { width: 4px; }
    .cp-messages::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(124,58,237,0.3); }

    /* Message turn layout */
    .cp-msg {
      display: flex;
      flex-direction: column;
      gap: 5px;
      list-style: none;
    }
    .cp-user { align-items: flex-end; }
    .cp-ai   { align-items: flex-start; }

    .cp-turn-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--cp-muted, #64748b);
    }
    .cp-user-meta { flex-direction: row-reverse; }
    .cp-turn-label { opacity: 0.8; }

    .cp-user-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #ede9fe, #ddd6fe);
      flex-shrink: 0;
    }
    .cp-user-avatar mat-icon { font-size: 12px; height: 12px; width: 12px; color: #7c3aed; }

    .cp-ai-avatar {
      width: 24px; height: 24px; border-radius: 7px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      flex-shrink: 0;
    }
    .cp-ai-avatar mat-icon { font-size: 14px; height: 14px; width: 14px; color: #fff; }

    .cp-ai-badge {
      font-size: 9px; font-weight: 800;
      padding: 2px 5px; border-radius: 4px;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      color: #fff; letter-spacing: 0.5px;
    }

    /* Bubbles */
    .cp-bubble {
      max-width: 90%;
      padding: 10px 13px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.6;
      word-break: break-word;
    }
    .cp-user-bubble {
      background: var(--cp-user-bg, #ede9fe);
      color: var(--cp-user-fg, #4c1d95);
      border-radius: 14px 4px 14px 14px;
    }
    .cp-ai-bubble {
      background: var(--cp-ai-bg, #f1f5f9);
      color: var(--cp-ai-fg, #0f172a);
      border-radius: 4px 14px 14px 14px;
    }

    /* Markdown inside ai bubble */
    .cp-ai-bubble ::ng-deep p { margin: 0 0 8px; }
    .cp-ai-bubble ::ng-deep p:last-child { margin-bottom: 0; }
    .cp-ai-bubble ::ng-deep h1,.cp-ai-bubble ::ng-deep h2,.cp-ai-bubble ::ng-deep h3 { margin: 8px 0 4px; font-weight: 700; }
    .cp-ai-bubble ::ng-deep ul,.cp-ai-bubble ::ng-deep ol { margin: 4px 0; padding-left: 18px; }
    .cp-ai-bubble ::ng-deep li { margin: 2px 0; }
    .cp-ai-bubble ::ng-deep strong { font-weight: 700; }
    .cp-ai-bubble ::ng-deep a { color: #4f8ef7; text-decoration: none; }
    .cp-ai-bubble ::ng-deep pre {
      background: #0f172a;
      border-radius: 8px;
      padding: 10px 12px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 12px;
    }
    .cp-ai-bubble ::ng-deep pre::-webkit-scrollbar { height: 3px; }
    .cp-ai-bubble ::ng-deep pre::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(124,58,237,0.4); }
    .cp-ai-bubble ::ng-deep code {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 12px;
    }
    .cp-ai-bubble ::ng-deep pre code {
      background: transparent;
      color: #e2e8f0;
      padding: 0;
    }
    .cp-ai-bubble ::ng-deep :not(pre) > code {
      background: rgba(124,58,237,0.1);
      color: #7c3aed;
      padding: 1px 5px;
      border-radius: 4px;
    }

    /* Typing / streaming */
    .cp-typing-inline {
      padding: 6px 0 2px;
    }
    .cp-dots { display: flex; gap: 4px; }
    .cp-dots span {
      width: 7px; height: 7px; border-radius: 50%;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed); display: inline-block;
      animation: cp-bounce 1.2s infinite ease-in-out;
    }
    .cp-dots span:nth-child(1) { animation-delay: 0s; }
    .cp-dots span:nth-child(2) { animation-delay: .2s; }
    .cp-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes cp-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40%            { transform: scale(1.2); opacity: 1; }
    }

    @keyframes cp-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }
    .cp-stream-cursor {
      display: inline-block; width: 2px; height: 13px;
      background: linear-gradient(180deg, #4f8ef7, #7c3aed);
      margin-left: 2px; vertical-align: text-bottom;
      border-radius: 2px; animation: cp-blink 0.7s steps(1) infinite;
    }

    /* Empty state */
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

    /* ─────────────────────── Setup screen ─────────────────── */
    .cp-setup-screen { display: flex; flex-direction: column; align-items: stretch; padding: 24px 16px 16px; gap: 18px; flex: 1; overflow-y: auto; }
    .cp-setup-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #7c3aed; align-self: center; }
    .cp-setup-icon-wrap mat-icon { font-size: 24px; height: 24px; width: 24px; }
    .cp-setup-hero { text-align: center; }
    .cp-setup-hero h3 { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0f172a; }
    .cp-setup-hero p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }
    .cp-setup-step { display: flex; flex-direction: column; gap: 6px; }
    .cp-setup-step-label { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: #374151; }
    .cp-step-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 700; background: rgba(99,102,241,0.12); color: #4f46e5; flex-shrink: 0; }
    .cp-provider-select-wrap { position: relative; display: flex; align-items: center; }
    .cp-provider-select { width: 100%; appearance: none; -webkit-appearance: none; border-radius: 8px; padding: 9px 28px 9px 10px; font-size: 12px; font-weight: 500; outline: none; cursor: pointer; font-family: inherit; transition: border-color 0.15s; background: #ffffff; border: 1.5px solid rgba(99,102,241,0.25); color: #111827; }
    .cp-provider-select:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.6); }
    .cp-provider-select:disabled { cursor: not-allowed; opacity: 0.5; }
    .cp-provider-select option { background: #fff; color: #111827; }
    .cp-select-chevron { position: absolute; right: 8px; font-size: 10px; pointer-events: none; color: #6b7280; }

    /* ─────────────────────── Code editor (right) ─────────── */
    .editor-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
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
    .ed-body { flex: 1; min-height: 0; overflow: auto; background: #1e1e1e; }
    ::ng-deep .ed-body .editorscript { height: 100%; min-height: 480px; }

    /* AI generation overlay on the editor panel */
    .editor-panel { position: relative; }
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
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      background: linear-gradient(90deg, #052e16, #064e3b);
      border-bottom: 1px solid #166534;
      border-left: 4px solid #22c55e;
      flex-shrink: 0;
      animation: banner-slide-in 0.28s ease;
    }
    @keyframes banner-slide-in {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .banner-icon { color: #4ade80; font-size: 20px; height: 20px; width: 20px; flex-shrink: 0; }
    .banner-body { display: flex; flex-direction: column; gap: 1px; }
    .banner-title { font-size: 13px; font-weight: 700; color: #bbf7d0; }
    .banner-sub { font-size: 11px; color: #86efac; }
    .banner-sub strong { color: #4ade80; }
    .banner-spacer { flex: 1; }
    .banner-dismiss-btn { color: #4ade80 !important; width: 30px; height: 30px; }

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
    }    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep pre { background: #0d1117; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep :not(pre) > code { background: rgba(167,139,250,0.15); color: #c084fc; }
    :host-context(body.header-dark-theme) .cp-ai-bubble { color: #e6edf3 !important; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep * { color: #e6edf3; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep strong { color: #f0f6ff !important; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep a { color: #60a5fa !important; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep code { color: #c084fc !important; }
    :host-context(body.header-dark-theme) .cp-ai-bubble ::ng-deep pre code { color: #e2e8f0 !important; }
    /* Setup screen – dark */
    :host-context(body.header-dark-theme) .cp-setup-screen { background: var(--cp-bg, #0d1117); }
    :host-context(body.header-dark-theme) .cp-setup-icon-wrap { background: rgba(79,142,247,0.12); border-color: rgba(79,142,247,0.2); color: #7c3aed; }
    :host-context(body.header-dark-theme) .cp-setup-hero h3 { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .cp-setup-hero p { color: #94a3b8; }
    :host-context(body.header-dark-theme) .cp-setup-step-label { color: #e2e8f0; }
    :host-context(body.header-dark-theme) .cp-step-badge { background: rgba(79,142,247,0.15); color: #60a5fa; }
    :host-context(body.header-dark-theme) .cp-provider-select { background: #1e293b; border: 1.5px solid rgba(79,142,247,0.25); color: #e2e8f0; }
    :host-context(body.header-dark-theme) .cp-provider-select:focus { border-color: rgba(79,142,247,0.6); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
    :host-context(body.header-dark-theme) .cp-provider-select option { background: #1e293b; color: #e2e8f0; }
    :host-context(body.header-dark-theme) .cp-select-chevron { color: #94a3b8; }    `,
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
  selectedAgent: string | null = null;
  selectedModel: string | null = null;
  pendingAutoGenerate = false;
  private seeded = false;

  get setupDone(): boolean { return !!this.selectedAgent && !!this.selectedModel; }

  /** Show only the .py filename — the API may return a JSON array like
   *  ["name_org.py","name_org.ipynb"]; we extract just the .py entry. */
  get displayFilename(): string {
    const f = this.model?.filename || '';
    try {
      const arr = JSON.parse(f);
      if (Array.isArray(arr)) {
        return arr.find((x: string) => /\.py$/i.test(x)) || arr[0] || f;
      }
    } catch { /* not JSON — use as-is */ }
    return f;
  }

  readonly agentOptions = [
    { label: 'Ollama',       value: 'ollama' },
    { label: 'Azure OpenAI', value: 'azure_openai' },
    { label: 'Anthropic',    value: 'anthropic' },
  ];
  readonly modelOptions = [
    { label: 'qwen3.6:27b',   value: 'qwen3.6:27b' },
    { label: 'gemma4:latest',  value: 'gemma4:latest' },
    { label: 'gpt-oss:latest', value: 'gpt-oss:latest' },
    { label: 'gpt-4o-mini',   value: 'gpt-4o-mini' },
  ];
  private scrollPending = false;
  /** true once generationComplete$ has updated scriptLines for the current round */
  private codeUpdatedThisRound = false;

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

  constructor(
    public vibe: VibeStudioService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
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
          const processedCode = this.injectDepsIfMissing(py.content);
          this.scriptLines = processedCode.split("\n");
          this.dirty = processedCode !== this.originalCode;
          this.codeUpdatedThisRound = true;
          this.save();
          // Show the "updated & saved — click Run" banner for follow-up prompts
          if (!wasInitial) {
            this.showSaveBanner = true;
          }
        }
        this.scrollPending = true;
      });

    // Reflect busy state + clear initializing overlay when agent goes idle (failsafe)
    this.vibe.status$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      const wasBusy = this.busy;
      this.busy = s === "generating";
      // If status leaves 'generating' but generationComplete$ never updated the editor
      // (i.e. Goose returned only text with no file artifacts), extract code from chat.
      // This handles both initial generation and follow-up modification prompts.
      if (wasBusy && (s === 'idle' || s === 'error') && !this.codeUpdatedThisRound) {
        const wasInit = this.wasInitialGen;
        this.initializing = false;
        this.wasInitialGen = false;
        // Fallback: extract Python from the last assistant message text
        const msgs = this.vibe.messages$.value;
        const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
        if (lastAssistant) {
          const match = lastAssistant.content.match(/```python\n([\s\S]*?)```/);
          if (match && match[1].trim()) {
            const processedCode = this.injectDepsIfMissing(match[1]);
            this.scriptLines = processedCode.split('\n');
            this.dirty = processedCode !== this.originalCode;
            this.save();
            if (!wasInit) {
              this.showSaveBanner = true;
            }
          }
        }
      } else if (s === 'idle' || s === 'error') {
        this.initializing = false;
        this.wasInitialGen = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && this.model) {
      this.scriptLines = (this.model.code || "").split("\n");
      this.originalCode = this.model.code || "";
      this.dirty = false;
      this.seeded = false;

      // For freshly created pipelines the user already chose agent+model in the wizard
      // dialog — read the values from the singleton service so the setup screen is skipped.
      if (this.model.pipelineAttrs?.freshlyCreated) {
        const svcAgent = this.vibe.currentAgentProvider;
        const svcModel = this.vibe.currentModel;
        if (svcAgent) this.selectedAgent = svcAgent;
        if (svcModel) this.selectedModel = svcModel;
      }

      // Freshly created pipeline → auto-generate initial code via Goose
      // Guard: only trigger if code is still the placeholder (defense-in-depth for stale flags)
      if (this.model.pipelineAttrs?.freshlyCreated &&
          (!this.model.code || this.model.code.trim() === '# (no code yet)')) {
        this.vibe.resetSession();
        // Re-apply the user's selections to the fresh session
        // (resetSession() resets model to 'claude' and agentProvider to '')
        if (this.selectedAgent) this.vibe.setAgentProvider(this.selectedAgent);
        if (this.selectedModel) this.vibe.setModel(this.selectedModel as VibeModel);
        if (this.setupDone) {
          this.scheduleAutoGenerate();
        } else {
          this.pendingAutoGenerate = true;
        }
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

  renderMarkdown(text: string): SafeHtml {
    const result = marked.parse(text ?? '');
    const html = typeof result === 'string' ? result : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onAgentSelect(): void {
    if (this.selectedAgent) {
      this.vibe.setAgentProvider(this.selectedAgent);
    }
    // Reset model when agent changes so a stale model is not sent
    this.selectedModel = null;
  }

  onModelSelect(): void {
    if (this.selectedModel) {
      this.vibe.setModel(this.selectedModel as VibeModel);
      if (this.pendingAutoGenerate && this.setupDone) {
        this.pendingAutoGenerate = false;
        setTimeout(() => this.scheduleAutoGenerate(), 0);
      }
    }
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
    this.codeUpdatedThisRound = false;
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
1. CRITICAL — At the very top of the file (the first executable lines, before any other imports), include a dependency auto-installation block exactly like this:
   \`\`\`python
   import subprocess, sys
   _WIZARD_PIPELINE_DEPS = ['pandas', 'numpy', 'scikit-learn', ...ALL other packages the script needs...]
   subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', '--disable-pip-version-check'] + _WIZARD_PIPELINE_DEPS)
   \`\`\`
   Replace the list with EVERY package imported in the script (e.g. boto3, sqlalchemy, psycopg2-binary, pymysql, etc.). This block MUST be present — the executor environment may not have these packages pre-installed.
2. Follow the Essedum DataContainer pattern — accept DataContainer input, return DataContainer output
3. Load data from the ${attrs.outputContainer || 'datasource'} connection "${attrs.connection || ''}", dataset "${attrs.dataset || ''}"
4. Implement ${attrs.problemType || 'classification'} ML task (pipeline type: ${attrs.pipelineType || 'feature-engineering'})
5. Target/label column is "${attrs.targetCol || ''}" — predict or transform this column
6. Use all available feature columns: ${columns.join(', ') || 'all columns except target'}
7. Use scikit-learn (or most appropriate library) for the task
8. Include: data validation, missing-value handling, feature engineering, model training, evaluation metrics, model artifact saving
9. LOGGING — this is mandatory and critical for observability:
   - At the very top (after the pip install block) add these exact lines:
     import logging
     logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
     logger = logging.getLogger(__name__)
   - Log at the START and END of every major step (data loading, preprocessing, feature engineering, training, evaluation, saving)
   - After loading data: log shape, column names, null counts using logger.info
   - After each preprocessing step: log what changed (e.g. nulls remaining, rows dropped)
   - After training: log all evaluation metrics (accuracy, F1, RMSE, etc.)
   - On any error or skip: use logger.warning or logger.error
   - Use logger.info liberally so a user reading the run log can follow every step without reading the code
10. Main entry function must be named run_pipeline()
11. Return the COMPLETE Python file — do not omit or truncate any section

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
1. CRITICAL — At the very top of the file (the first executable lines, before any other imports), include a dependency auto-installation block exactly like this:
   \`\`\`python
   import subprocess, sys
   _WIZARD_PIPELINE_DEPS = ['pandas', 'numpy', 'scikit-learn', ...ALL other packages the script needs...]
   subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', '--disable-pip-version-check'] + _WIZARD_PIPELINE_DEPS)
   \`\`\`
   Replace the list with EVERY package imported in the script (e.g. torch, transformers, datasets, peft, trl, boto3, etc.). This block MUST be present — the executor environment may not have these packages pre-installed.
2. Follow the Essedum DataContainer pattern — load data via DataContainer input
3. Implement a ${attrs.jobType || 'traditional'} training job using ${attrs.framework || 'the appropriate framework'}
4. Use the ${attrs.baseModel || 'specified algorithm/model'} as the base
5. Use columns: ${columns.join(', ') || 'all available columns'}
6. Include: data loading, preprocessing, train/validation split, model initialisation, training loop, evaluation metrics, model saving as artifact
7. LOGGING — this is mandatory and critical for observability:
   - At the very top (after the pip install block) add these exact lines:
     import logging
     logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
     logger = logging.getLogger(__name__)
   - Log at the START and END of every major step (data loading, preprocessing, split, model init, each epoch, evaluation, saving)
   - After loading data: log shape, dtypes, null counts using logger.info
   - During training: log loss and metrics after every epoch
   - After evaluation: log all metrics (accuracy, F1, loss, perplexity, etc.)
   - Log model save path and artifact details
   - On any error or skip: use logger.warning or logger.error
   - Use logger.info liberally so a user reading the run log can follow every step without reading the code
8. Main entry function must be named run_training()
9. Handle the hyperparameters (epochs, batch size, lr) as configurable parameters
10. Return the COMPLETE Python file — do not omit or truncate any section

Return the full Python script inside a fenced \`\`\`python block.`;
  }

  /**
   * Scans generated Python code for third-party imports and injects a
   * `pip install` block at the very top when one is not already present.
   * Guarantees all packages are available in the executor environment.
   */
  private injectDepsIfMissing(code: string): string {
    // Already has a pip install block — leave untouched
    if (/_WIZARD_PIPELINE_DEPS|_DEPS\s*=\s*\[/.test(code.slice(0, 800)) ||
        /subprocess\.check_call[\s\S]{0,200}pip.*install/i.test(code.slice(0, 1000))) {
      return code;
    }

    const STDLIB = new Set([
      'os', 'sys', 'io', 'json', 're', 'time', 'datetime', 'collections',
      'functools', 'itertools', 'pathlib', 'typing', 'dataclasses', 'abc',
      'copy', 'math', 'random', 'hashlib', 'base64', 'urllib', 'http',
      'logging', 'warnings', 'traceback', 'inspect', 'struct', 'string',
      'enum', 'contextlib', 'threading', 'subprocess', 'shutil', 'tempfile',
      'uuid', 'argparse', 'configparser', 'csv', 'pickle', 'gzip', 'zipfile',
      'concurrent', 'asyncio', 'socket', 'ssl', 'email', 'html', 'xml',
      'unittest', 'pprint', 'textwrap', 'operator', 'heapq', 'bisect',
      'builtins', 'platform', 'signal', 'stat', 'glob', 'fnmatch',
      'weakref', 'gc', 'types', 'decimal', 'fractions', 'statistics',
      'multiprocessing', 'queue', 'array', 'ctypes', 'mmap',
    ]);

    const PKG_MAP: Record<string, string> = {
      'sklearn':    'scikit-learn',
      'cv2':        'opencv-python',
      'PIL':        'Pillow',
      'bs4':        'beautifulsoup4',
      'yaml':       'PyYAML',
      'dotenv':     'python-dotenv',
      'psycopg2':   'psycopg2-binary',
      'pymysql':    'PyMySQL',
      'dateutil':   'python-dateutil',
      'attr':       'attrs',
      'jwt':        'PyJWT',
      'flask':      'Flask',
      'fastapi':    'fastapi',
      'pydantic':   'pydantic',
      'sqlalchemy': 'SQLAlchemy',
    };

    const seen = new Set<string>();
    const packages: string[] = [];
    const importRe = /^(?:import|from)\s+(\w+)/gm;
    let m: RegExpExecArray | null;
    while ((m = importRe.exec(code)) !== null) {
      const mod = m[1];
      if (!STDLIB.has(mod) && !seen.has(mod)) {
        seen.add(mod);
        packages.push(PKG_MAP[mod] ?? mod);
      }
    }

    if (!packages.length) return code;

    const pkgList = packages.map(p => `'${p}'`).join(', ');
    const installBlock =
      `import subprocess, sys\n` +
      `_DEPS = [${pkgList}]\n` +
      `subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', '--disable-pip-version-check'] + _DEPS)\n`;

    // Insert after shebang / encoding comment lines (first 1-3 lines)
    const lines = code.split('\n');
    let insertAt = 0;
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const l = lines[i].trim();
      if (l.startsWith('#!') || l.startsWith('# -*-') || l.startsWith('# coding') || l.startsWith('# -*- coding')) {
        insertAt = i + 1;
      } else {
        break;
      }
    }
    lines.splice(insertAt, 0, installBlock, '');
    return lines.join('\n');
  }

  send(): void {
    const userPrompt = this.prompt.trim();
    if (!userPrompt) return;
    this.prompt = "";
    this.busy = true;
    this.codeUpdatedThisRound = false;

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
      const internalCtx = `\n\n[Internal context — ${ctxParts}. Always return the FULL updated Python file inside a \`\`\`python block. Do not truncate. Preserve and extend all logging.basicConfig / logger.info statements so the run log remains detailed and observable.]`;
      this.vibe.generate(userPrompt + internalCtx, userPrompt);
    }
  }

  clearChat(): void {
    this.vibe.cancelReply?.();
    // Reset vibe session messages by creating a fresh session
    this.vibe["session"] = this.vibe["createNewSession"]?.() ?? this.vibe["session"];
    this.vibe.messages$.next([]);
    this.seeded = false;
    // Re-apply current selections — createNewSession() resets to 'claude'/'', so we
    // must push the user's chosen agent+model back into the fresh session immediately.
    if (this.selectedAgent) this.vibe.setAgentProvider(this.selectedAgent);
    if (this.selectedModel) this.vibe.setModel(this.selectedModel as VibeModel);
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
