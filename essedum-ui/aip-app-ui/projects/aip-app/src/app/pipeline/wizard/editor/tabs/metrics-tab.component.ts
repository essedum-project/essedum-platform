import { Component, Input, OnInit } from '@angular/core';
import { WizardPipelineModel } from '../pipeline-editor.component';

// Metrics tab — uses plotly (already a dep) for loss / accuracy curves. Until a
// real metrics endpoint exists, this renders an illustrative placeholder.
@Component({
  selector: 'app-metrics-tab',
  template: `
    <div class="m-tab">
      <header><h3><mat-icon>analytics</mat-icon>&nbsp;Training metrics</h3></header>

      <div class="cards">
        <div class="card" *ngFor="let s of summary">
          <div class="lbl">{{ s.label }}</div>
          <div class="val">{{ s.value }}</div>
        </div>
      </div>

      <div class="plot-wrap">
        <plotly-plot *ngIf="lossData" [data]="lossData" [layout]="lossLayout" [config]="{responsive: true}"></plotly-plot>
        <plotly-plot *ngIf="accData"  [data]="accData"  [layout]="accLayout"  [config]="{responsive: true}"></plotly-plot>
      </div>
      <p class="hint">Live metrics will populate once a training run completes.</p>
    </div>
  `,
  styles: [`
    .m-tab { padding:24px; max-width: 1080px; margin: 0 auto; }
    h3 { display:flex; align-items:center; font-size:15px; color:#1f2937; margin:0 0 14px;
         mat-icon { color:#0ea5e9; } }
    .cards { display:grid; grid-template-columns: repeat(4,1fr); gap:12px; margin-bottom:14px; }
    .card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:14px; }
    .card .lbl { color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:.04em; }
    .card .val { color:#0f172a; font-size:20px; font-weight:600; margin-top:4px; }
    .plot-wrap { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
    .plot-wrap > plotly-plot { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
    .hint { color:#94a3b8; font-size:12px; margin-top:10px; }
  `],
})
export class MetricsTabComponent implements OnInit {
  @Input() model: WizardPipelineModel;
  summary = [
    { label: 'Epochs',     value: '—' },
    { label: 'Best loss',  value: '—' },
    { label: 'Best acc',   value: '—' },
    { label: 'Step / sec', value: '—' },
  ];
  lossData: any = null;
  lossLayout: any = null;
  accData:  any = null;
  accLayout: any = null;

  ngOnInit(): void {
    const a = this.model?.pipelineAttrs || {};
    this.summary = [
      { label: 'Epochs',     value: a.epochs ?? '—' },
      { label: 'Batch size', value: a.batchSize ?? '—' },
      { label: 'LR',         value: a.lr ?? '—' },
      { label: 'Executor',   value: a.executor ?? '—' },
    ];
    // Placeholder demo curves
    const xs = Array.from({ length: 20 }, (_, i) => i + 1);
    this.lossData  = [{ x: xs, y: xs.map(i => +(2 / i + Math.random() * 0.05).toFixed(3)),
                       type: 'scatter', mode: 'lines+markers', line: { color: '#0ea5e9' }, name: 'loss' }];
    this.lossLayout = { title: 'Training loss', height: 280, margin: { l: 40, r: 20, t: 32, b: 32 } };
    this.accData   = [{ x: xs, y: xs.map(i => +(1 - 1 / i + Math.random() * 0.02).toFixed(3)),
                       type: 'scatter', mode: 'lines+markers', line: { color: '#10b981' }, name: 'accuracy' }];
    this.accLayout  = { title: 'Validation accuracy', height: 280, margin: { l: 40, r: 20, t: 32, b: 32 } };
  }
}
