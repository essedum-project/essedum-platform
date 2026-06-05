import { Component, Input } from '@angular/core';
import { WizardPipelineModel } from '../pipeline-editor.component';

@Component({
    selector: 'app-config-tab',
    template: `
    <div class="cfg-tab">
      <h3><mat-icon>settings</mat-icon>&nbsp;Pipeline configuration</h3>
      <div class="cfg-grid">
        <div class="kv" *ngFor="let row of rows">
          <div class="k">{{ row.label }}</div>
          <div class="v">{{ row.value || '—' }}</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display:block; background: var(--cfg-page-bg, #f8fafc); min-height: 100%; }
    .cfg-tab { padding:24px; max-width: 900px; margin: 0 auto; }
    .cfg-tab h3 {
      display:flex; align-items:center; font-size:15px;
      color: var(--cfg-title, #1f2937); margin: 0 0 16px;
      mat-icon { color:#6366f1; margin-right:6px; }
    }
    .cfg-grid {
      display:grid; grid-template-columns: repeat(2, 1fr); gap: 0 32px;
      background: var(--cfg-card-bg, #ffffff);
      border:1px solid var(--cfg-border, #e5e7eb);
      border-radius:12px; padding:8px 20px;
    }
    .kv {
      display:flex; justify-content:space-between; align-items:baseline;
      padding: 10px 0; border-bottom: 1px solid var(--cfg-divider, #f1f5f9);
    }
    .kv:last-child { border-bottom: none; }
    .k  { color: var(--cfg-key, #6b7280); font-size:11px; text-transform:uppercase; letter-spacing:.06em; white-space:nowrap; }
    .v  { color: var(--cfg-val, #111827); font-size:13px; font-weight:500; max-width:62%; text-align:right; word-break:break-all; }
    :host-context(body.header-dark-theme) {
      --cfg-page-bg:  #0d1117;
      --cfg-title:    #e6edf3;
      --cfg-card-bg:  #161b22;
      --cfg-border:   #30363d;
      --cfg-divider:  #21262d;
      --cfg-key:      #6e7681;
      --cfg-val:      #e6edf3;
    }
  `],
    standalone: false
})
export class ConfigTabComponent {
  @Input() model: WizardPipelineModel;

  get rows(): { label: string; value: any }[] {
    const a = this.model?.pipelineAttrs || {};
    const base = [
      { label: 'Name',         value: this.model?.name },
      { label: 'Alias',        value: this.model?.alias },
      { label: 'Type',         value: this.model?.type },
      { label: 'Pipeline / Job', value: a.pipelineType || a.jobType },
      { label: 'Framework',    value: a.framework },
      { label: 'Base model',   value: a.baseModel },
      { label: 'Method',       value: a.method },
      { label: 'Quantization', value: a.quantization },
      { label: 'Connection',   value: a.connection },
      { label: 'Output container', value: a.outputContainer },
      { label: 'Dataset',      value: a.dataset },
      { label: 'Executor',     value: a.executor },
      { label: 'Schedule',     value: a.schedule },
      { label: 'Epochs',       value: a.epochs },
      { label: 'Batch size',   value: a.batchSize },
      { label: 'Learning rate', value: a.lr },
      { label: 'Git repo',     value: a.git?.repo },
      { label: 'Git branch',   value: a.git?.branch },
      { label: 'File path',    value: a.git?.filePath },
    ];
    return base.filter(r => r.value !== undefined && r.value !== '');
  }
}
