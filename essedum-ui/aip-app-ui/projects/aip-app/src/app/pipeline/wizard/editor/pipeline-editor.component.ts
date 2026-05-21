import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Services } from '../../../services/service';
import { StreamingServices } from '../../../streaming-services/streaming-service';
import { RunHistoryTabComponent } from './tabs/run-history-tab.component';

export interface WizardPipelineModel {
  raw: StreamingServices;
  name: string;
  alias: string;
  description: string;
  kind: 'data-pipeline' | 'training-job';
  type: string;                  // 'DataPipeline' | 'TrainingPipeline'
  filename: string;
  code: string;
  pipelineAttrs: any;            // metadata
}

@Component({
  selector: 'app-pipeline-editor',
  templateUrl: './pipeline-editor.component.html',
  styleUrls: ['./pipeline-editor.component.scss'],
})
export class PipelineEditorComponent implements OnInit, OnDestroy {
  model: WizardPipelineModel | null = null;
  loading = true;
  hasVibePermission = true;
  activeTab = 0;
  running = false;
  private destroy$ = new Subject<void>();

  @ViewChild(RunHistoryTabComponent) runHistoryTab: RunHistoryTabComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private services: Services,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(p => {
      const cname = p.get('cname');
      if (cname) this.load(cname);
    });

    this.services.getPermission('vibe').subscribe({
      next: (perms) => { this.hasVibePermission = (perms || '').toString().includes('vibe'); },
      error: () => { this.hasVibePermission = false; },
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private load(cname: string): void {
    this.loading = true;
    this.services.getStreamingServicesByName(cname).subscribe({
      next: (ss) => {
        this.model = this.parse(ss);
        this.loading = false;
      },
      error: () => {
        this.services.message('Pipeline not found', 'error');
        this.loading = false;
        this.router.navigate(['/pipelines']);
      },
    });
  }

  private parse(ss: StreamingServices): WizardPipelineModel {
    let parsed: any = {};
    try { parsed = ss.json_content ? JSON.parse(ss.json_content) : {}; } catch { parsed = {}; }
    const el = parsed?.elements?.[0]?.attributes ?? {};
    const attrs = parsed?.pipeline_attributes ?? {};
    const kind = attrs.kind === 'training-job' || ss.type === 'TrainingPipeline'
      ? 'training-job' : 'data-pipeline';
    return {
      raw: ss,
      name: ss.name,
      alias: ss.alias,
      description: ss.description,
      kind,
      type: ss.type,
      filename: (Array.isArray(el.files) ? el.files[0] : el.files) || `${ss.name}.py`,
      code: el.generatedCode || '# (no code yet)\n',
      pipelineAttrs: attrs,
    };
  }

  // ─── code persistence (used by Code & Vibe tabs) ──────────────────────
  saveCode(newCode: string): void {
    if (!this.model) return;
    this.model.code = newCode;
    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    parsed.elements = parsed.elements?.length ? parsed.elements : [{ attributes: {} }];
    parsed.elements[0].attributes = {
      ...(parsed.elements[0].attributes || {}),
      generatedCode: newCode,
      files: [this.model.filename],
      filetype: 'Python3',
    };
    // Clear freshlyCreated so re-navigation doesn't re-trigger code generation
    if (parsed.pipeline_attributes) {
      parsed.pipeline_attributes.freshlyCreated = false;
    }
    // Update in-memory model so current session also stops triggering re-generation
    if (this.model.pipelineAttrs) {
      this.model.pipelineAttrs.freshlyCreated = false;
    }
    this.model.raw.json_content = JSON.stringify(parsed);
    this.services.update(this.model.raw).subscribe({
      next: () => {
        this.services.message('Saved! Click ▶ Run to execute the pipeline.', 'success');
      },
      error: () => this.services.message('Save failed', 'error'),
    });
  }

  back(): void {
    // Use browser history back — same as the legacy pipeline view (NativeScriptComponent).
    // This avoids broken relative routing when the component is opened from different entry points.
    this.location.back();
  }

  /** Compute Run History tab index at runtime based on visible tabs. */
  private get runHistoryTabIndex(): number {
    if (this.model?.kind !== 'data-pipeline') return -1;
    // Tabs order: Code(0), [VibeCode(1), Git(2) if hasVibePermission], Config, RunHistory
    return this.hasVibePermission ? 4 : 2;
  }

  runPipeline(): void {
    if (!this.model || this.running) return;
    this.running = true;
    const alias = this.model.alias || this.model.name;
    const cname = this.model.name;
    this.services.runPipeline(alias, cname, 'NativeScript', 'true', undefined)
      .subscribe({
        next: () => {
          this.running = false;
          this.services.message('Pipeline started!', 'success');
          const rhIdx = this.runHistoryTabIndex;
          if (rhIdx >= 0) {
            this.activeTab = rhIdx;
            // Refresh run history after a short delay so the backend registers the run
            setTimeout(() => this.runHistoryTab?.refresh(), 3000);
          }
        },
        error: () => {
          this.running = false;
          this.services.message('Failed to start pipeline', 'error');
        },
      });
  }
}
