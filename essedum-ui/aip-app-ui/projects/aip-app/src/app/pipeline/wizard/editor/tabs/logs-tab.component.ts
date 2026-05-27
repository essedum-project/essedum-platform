import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WizardPipelineModel } from '../pipeline-editor.component';

// Streaming-logs viewer. The real STOMP wiring lives in dataset.description.component;
// for MVP we surface a poller-friendly skeleton with a sample stream so the tab
// is usable end-to-end while the backend STOMP integration is plumbed in.
@Component({
  selector: 'app-logs-tab',
  template: `
    <div class="logs-tab">
      <header>
        <h3><mat-icon>terminal</mat-icon>&nbsp;Logs</h3>
        <div class="ctrls">
          <button mat-stroked-button (click)="clear()"><mat-icon>delete_sweep</mat-icon>&nbsp;Clear</button>
          <button mat-stroked-button color="primary" (click)="toggle()">
            <mat-icon>{{ streaming ? 'pause_circle' : 'play_circle' }}</mat-icon>&nbsp;{{ streaming ? 'Pause' : 'Resume' }}
          </button>
        </div>
      </header>
      <pre class="log-area">{{ lines.join('\n') }}</pre>
    </div>
  `,
  styles: [`
    .logs-tab { padding:24px; max-width: 1100px; margin: 0 auto; display:flex; flex-direction:column; height: calc(100vh - 200px); }
    header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    header h3 { display:flex; align-items:center; font-size:15px; color:#1f2937; margin:0;
                mat-icon { color:#0ea5e9; } }
    .ctrls { display:flex; gap:6px; }
    .log-area { flex:1; background:#0b1220; color:#a7f3d0; padding:14px;
                font-family:'Fira Code',monospace; font-size:12px; overflow:auto;
                border-radius:10px; margin:0; white-space:pre-wrap; }
  `],
})
export class LogsTabComponent implements OnInit, OnDestroy {
  @Input() model: WizardPipelineModel;
  lines: string[] = [];
  streaming = true;
  private timer: any;
  private step = 0;

  ngOnInit(): void {
    this.lines.push(`[${this.now()}] training job '${this.model.name}' bootstrapping...`);
    this.lines.push(`[${this.now()}] executor: ${this.model.pipelineAttrs?.executor}`);
    this.lines.push(`[${this.now()}] dataset:  ${this.model.pipelineAttrs?.dataset}`);
    this.lines.push(`[${this.now()}] model:    ${this.model.pipelineAttrs?.baseModel}`);
    this.timer = setInterval(() => this.tick(), 1500);
  }

  ngOnDestroy(): void { clearInterval(this.timer); }

  private tick(): void {
    if (!this.streaming) return;
    this.step++;
    const epochs = this.model.pipelineAttrs?.epochs ?? 3;
    if (this.step % 6 === 0) {
      const e = Math.min(epochs, Math.ceil(this.step / 6));
      this.lines.push(`[${this.now()}] epoch ${e}/${epochs} | loss=${(2/this.step).toFixed(3)} | lr=${this.model.pipelineAttrs?.lr}`);
    } else if (this.step % 3 === 0) {
      this.lines.push(`[${this.now()}] step ${this.step * 10} | grad_norm=${(Math.random()*2+0.1).toFixed(2)}`);
    }
    if (this.lines.length > 200) this.lines = this.lines.slice(-200);
  }

  private now(): string { return new Date().toISOString().substring(11, 19); }

  clear(): void { this.lines = []; }
  toggle(): void { this.streaming = !this.streaming; }
}
