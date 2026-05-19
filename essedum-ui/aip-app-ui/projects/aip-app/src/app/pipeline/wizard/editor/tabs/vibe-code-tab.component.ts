import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
      <aside class="chat">
        <header class="chat-head">
          <mat-icon>auto_awesome</mat-icon>&nbsp;<b>Vibe Code</b>
          <span class="spacer"></span>
          <mat-form-field appearance="outline" class="provider">
            <mat-label>Provider</mat-label>
            <mat-select [(value)]="selectedProvider" (selectionChange)="onProviderChange()">
              <mat-option *ngFor="let p of providers" [value]="p">{{ p }}</mat-option>
            </mat-select>
          </mat-form-field>
        </header>

        <ul class="messages">
          <li *ngFor="let m of messages" [class.user]="m.role === 'user'"
              [class.assistant]="m.role === 'assistant'">
            <span class="role"><mat-icon>{{ m.role === 'user' ? 'person' : 'auto_awesome' }}</mat-icon></span>
            <div class="bubble">{{ m.content }}</div>
          </li>
          <li class="hint" *ngIf="!messages.length">
            Ask the model to rewrite parts of this file. The current code is provided as context.
            Example: "Rewrite to read from S3 instead of the SQL connection."
          </li>
        </ul>

        <footer class="chat-foot">
          <mat-form-field appearance="outline" class="full">
            <textarea matInput rows="2" [(ngModel)]="prompt"
                      placeholder="What should change?" (keydown.enter)="$event.ctrlKey && send()"></textarea>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="send()" [disabled]="!prompt.trim() || busy">
            <mat-icon>send</mat-icon>&nbsp;Send
          </button>
        </footer>
      </aside>

      <section class="diff">
        <header class="diff-head">
          <mat-icon>preview</mat-icon>&nbsp;<b>Proposed code</b>
          <span class="spacer"></span>
          <button mat-button (click)="discard()" [disabled]="!proposedCode">Discard</button>
          <button mat-flat-button color="primary" (click)="apply()" [disabled]="!proposedCode">
            <mat-icon>check</mat-icon>&nbsp;Apply
          </button>
        </header>
        <pre class="code-preview">{{ proposedCode || '(no proposal yet — send a prompt to generate)' }}</pre>
      </section>
    </div>
  `,
  styles: [`
    .vibe-shell { display:grid; grid-template-columns: 360px 1fr; height: calc(100vh - 200px); }
    .chat { display:flex; flex-direction:column; border-right:1px solid #e5e7eb; background:#fff; }
    .chat-head { display:flex; align-items:center; gap:6px; padding: 10px 12px; border-bottom:1px solid #f1f5f9; }
    .chat-head .spacer { flex:1; }
    .chat-head .provider { width:140px; ::ng-deep .mat-mdc-text-field-wrapper { padding:0 8px; min-height: 38px; } }
    .messages { list-style:none; flex:1; margin:0; padding:10px; overflow:auto; }
    .messages li { display:flex; gap:8px; margin: 8px 0; }
    .messages li.user .bubble    { background:#ede9fe; color:#4c1d95; }
    .messages li.assistant .bubble { background:#f1f5f9; color:#0f172a; }
    .messages .bubble { padding:8px 12px; border-radius:8px; white-space:pre-wrap; font-size:13px; }
    .messages .role mat-icon { font-size:18px; height:18px; width:18px; color:#7c3aed; }
    .messages .hint { color:#94a3b8; font-size:12px; padding:12px; }
    .chat-foot { display:flex; gap:8px; padding:8px 12px; border-top:1px solid #f1f5f9; align-items:flex-end; }
    .chat-foot .full { flex:1; }
    .diff { display:flex; flex-direction:column; background:#0b1220; color:#e5e7eb; }
    .diff-head { display:flex; align-items:center; gap:6px; padding:10px 14px; border-bottom:1px solid #1e293b;
                 background:#0f172a; color:#a5b4fc; }
    .diff-head .spacer { flex:1; }
    .code-preview { flex:1; overflow:auto; padding:14px; margin:0;
                    font-family:'Fira Code',monospace; font-size:12.5px; white-space:pre; }
  `],
})
export class VibeCodeTabComponent implements OnInit, OnDestroy {
  @Input() model: WizardPipelineModel;
  @Output() codeChange = new EventEmitter<string>();

  prompt = '';
  busy = false;
  messages: { role: string; content: string }[] = [];
  proposedCode = '';
  selectedProvider: VibeModel = 'claude';
  providers: VibeModel[] = Object.keys(GOOSE_PROVIDER_MAP || {}) as VibeModel[];

  private destroy$ = new Subject<void>();
  private seeded = false;

  constructor(public vibe: VibeStudioService) {}

  ngOnInit(): void {
    if (this.providers.length === 0) this.providers = ['claude', 'gemini', 'azure-oai'];

    this.vibe.messages$.pipe(takeUntil(this.destroy$)).subscribe(msgs => {
      this.messages = msgs.map(m => ({ role: m.role, content: m.content }));
    });

    this.vibe.generationComplete$.pipe(takeUntil(this.destroy$)).subscribe(files => {
      this.busy = false;
      const py = files?.find(f => /\.py$/i.test(f.path));
      if (py) this.proposedCode = py.content;
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
    if (!this.proposedCode) return;
    this.codeChange.emit(this.proposedCode);
    this.proposedCode = '';
  }

  discard(): void { this.proposedCode = ''; }
}
