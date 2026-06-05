import { Component, Input, OnInit } from '@angular/core';
import { WizardPipelineModel } from '../pipeline-editor.component';

@Component({
    selector: 'app-metrics-tab',
    template: `
    <div class="m-tab">
      <header><h3><mat-icon>analytics</mat-icon>&nbsp;Training Metrics</h3></header>

      <!-- Config summary cards (always populated from saved attributes) -->
      <div class="cards">
        <div class="card" *ngFor="let s of summary">
          <div class="lbl">{{ s.label }}</div>
          <div class="val">{{ s.value }}</div>
        </div>
      </div>

      <!-- Empty state — no real metrics yet -->
      <div class="empty-metrics">
        <mat-icon>bar_chart</mat-icon>
        <p>No metrics data available yet.</p>
        <p class="hint">Metrics will appear here after a training run completes and the job reports back results.</p>
      </div>
    </div>
  `,
    styles: [`
    :host { display:block; overflow-y:auto; height:100%; }
    .m-tab {
      padding: 24px;
      max-width: 1080px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    /* ── Header ── */
    header { margin-bottom: 20px; }
    h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 600;
      color: var(--mt-title, #111827);
      margin: 0;
    }
    h3 mat-icon { color: #0ea5e9; font-size: 20px; height: 20px; width: 20px; }
    /* ── Config summary cards ── */
    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
    }
    .card {
      flex: 0 0 auto;
      min-width: 110px;
      max-width: 180px;
      background: var(--mt-card-bg, #f8fafc);
      border: 1px solid var(--mt-border, #e2e8f0);
      border-radius: 10px;
      padding: 10px 14px;
    }
    .card .lbl {
      color: var(--mt-muted, #6b7280);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      white-space: nowrap;
    }
    .card .val {
      color: var(--mt-val, #111827);
      font-size: 15px;
      font-weight: 700;
      margin-top: 4px;
      word-break: break-word;
    }
    /* ── Empty state ── */
    .empty-metrics {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 24px;
      gap: 12px;
      color: var(--mt-muted, #6b7280);
      text-align: center;
      border: 1px dashed var(--mt-border, #e2e8f0);
      border-radius: 12px;
    }
    .empty-metrics mat-icon {
      font-size: 52px;
      height: 52px;
      width: 52px;
      color: var(--mt-muted, #9ca3af);
      opacity: .5;
    }
    .empty-metrics p { margin: 0; font-size: 14px; color: var(--mt-title, #374151); }
    .empty-metrics .hint { font-size: 12px; color: var(--mt-muted, #6b7280); max-width: 400px; line-height: 1.5; }
    /* ── Dark theme ── */
    :host-context(body.header-dark-theme) {
      --mt-title:   #e6edf3;
      --mt-val:     #e6edf3;
      --mt-muted:   #8b949e;
      --mt-card-bg: #1c2128;
      --mt-border:  #30363d;
    }
  `],
    standalone: false
})
export class MetricsTabComponent implements OnInit {
  @Input() model: WizardPipelineModel;
  summary: { label: string; value: any }[] = [];

  ngOnInit(): void {
    const a = this.model?.pipelineAttrs || {};
    this.summary = [
      { label: 'Job type',   value: a.jobType   ?? '—' },
      { label: 'Epochs',     value: a.epochs    ?? '—' },
      { label: 'Batch size', value: a.batchSize ?? '—' },
      { label: 'Learn rate', value: a.lr        ?? '—' },
      { label: 'Base model', value: a.baseModel ?? '—' },
      { label: 'Executor',   value: a.executor  ?? '—' },
      { label: 'Dataset',    value: a.dataset   ?? '—' },
      { label: 'Framework',  value: a.framework ?? '—' },
    ].filter(s => s.value && s.value !== '—');
    if (!this.summary.length) {
      this.summary = [{ label: 'Config', value: 'No attributes saved' }];
    }
  }
}
