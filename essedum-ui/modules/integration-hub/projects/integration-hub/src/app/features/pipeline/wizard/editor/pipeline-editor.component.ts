import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Services } from '../../../services/service';
import { RunHistoryTabComponent } from './tabs/run-history-tab.component';
import { OptionsDTO, StreamingServices } from '@essedum/shared-lib';

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
  defaultRuntime?: any;          // saved run type from json_content.default_runtime
}

@Component({
    selector: 'app-pipeline-editor',
    templateUrl: './pipeline-editor.component.html',
    styleUrls: ['./pipeline-editor.component.scss'],
    standalone: false
})
export class PipelineEditorComponent implements OnInit, OnDestroy {
  model: WizardPipelineModel | null = null;
  loading = true;
  hasVibePermission = true;
  activeTab = 0;
  running = false;

  // Run type selector (mirrors native-script logic exactly)
  runTypes: OptionsDTO[] = [];
  selectedRunType: any;
  defaultRuntimeFromDB: any;
  runtypesCheck = true;

  // Container deployment state
  containerDeployStatus: 'idle' | 'deploying' | 'success' | 'error' = 'idle';
  containerDeployMessage = '';
  containerInternalDnsUrl = '';
  private _containerPollInterval: any = null;

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
    // Capture org now — same value used in the API URL — so parse() always has it.
    const org = sessionStorage.getItem('organization') || '';
    this.services.getStreamingServicesByName(cname).subscribe({
      next: (ss) => {
        this.model = this.parse(ss, cname, org);
        this.defaultRuntimeFromDB = this.model.defaultRuntime ?? null;
        if (this.runtypesCheck) this.fetchRunTypes();
        this.loading = false;
      },
      error: () => {
        this.services.message('Pipeline not found', 'error');
        this.loading = false;
        this.router.navigate(['/pipelines']);
      },
    });
  }

  private parse(ss: StreamingServices, routeCname?: string, routeOrg?: string): WizardPipelineModel {
    let parsed: any = {};
    try { parsed = ss.json_content ? JSON.parse(ss.json_content) : {}; } catch { parsed = {}; }
    const el = parsed?.elements?.[0]?.attributes ?? {};
    const attrs = parsed?.pipeline_attributes ?? {};
    const kind = attrs.kind === 'training-job' || ss.type === 'TrainingPipeline'
      ? 'training-job' : 'data-pipeline';
    // Canonical filename — exact same logic as native-script's saveJson():
    //   pname  = this.streamItem.name          (from getStreamingServicesByName response)
    //   org    = this.streamItem.organization  (from getStreamingServicesByName response)
    //   targetFileName = `${pname}_${org}.py`
    // Both values come from the BE API response, just as in the legacy screen.
    // el.files[0] is intentionally ignored — may have stale/wrong naming.
    const cname = ss.name || routeCname || '';
    const org   = ss.organization || sessionStorage.getItem('organization') || '';
    const canonicalFilename = `${cname}_${org}.py`;
    return {
      raw: ss,
      name: cname,
      alias: ss.alias,
      description: ss.description,
      kind,
      type: ss.type,
      filename: canonicalFilename,
      code: el.generatedCode || '# (no code yet)\n',
      pipelineAttrs: attrs,
      defaultRuntime: parsed?.default_runtime ?? null,
    };
  }

  // ─── code persistence (used by Code & Vibe tabs) ──────────────────────
  /**
   * Mirrors native-script's saveJson() flow:
   *   1. createNativeFile(cname, org, filename, filetype, script)  ← writes physical .py on server
   *   2. Store the filename returned by the API in json_content.elements[0].attributes.files[]
   *   3. update(streamItem)                                         ← persists json_content in DB
   */
  saveCode(newCode: string): void {
    if (!this.model) return;
    this.model.code = newCode;
    const org      = this.model.raw.organization || sessionStorage.getItem('organization') || '';
    const cname    = this.model.name;  // already set to routeCname in parse()
    // Filename: use the stored one (already canonical after first save) or derive it
    const filename = this.model.filename || `${cname}_${org}.py`;

    // Step 1 — write the physical Python file (same as native-script createNativeFile call)
    this.services.createNativeFile(cname, org, filename, 'Python3', newCode)
      .subscribe({
        next: (savedFilename: string) => {
          // API returns the stored path/name — use it as the canonical filename going forward
          const storedFile = (savedFilename && savedFilename.trim()) ? savedFilename.trim() : filename;
          this.model!.filename = storedFile;
          this.persistJsonContent(newCode, storedFile);
        },
        error: () => {
          // File write failed — still persist json_content so code isn't lost
          this.persistJsonContent(newCode, filename);
        },
      });
  }

  /** Step 2+3 of the save flow: update json_content in DB (mirrors native-script update() call). */
  private persistJsonContent(newCode: string, storedFilename: string): void {
    if (!this.model) return;
    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    parsed.elements = parsed.elements?.length ? parsed.elements : [{ attributes: {} }];
    parsed.elements[0].attributes = {
      ...(parsed.elements[0].attributes || {}),
      generatedCode: newCode,
      files: [storedFilename],
      filetype: 'Python3',
    };
    // Clear freshlyCreated so re-navigation doesn't re-trigger code generation
    if (parsed.pipeline_attributes) {
      parsed.pipeline_attributes.freshlyCreated = false;
    }
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

  /** Fetch available run types from the backend — mirrors NativeScriptComponent.fetchRunTypes() */
  fetchRunTypes(): void {
    this.runTypes = [];
    this.services.fetchJobRunTypes().subscribe((resp: any[]) => {
      resp.forEach(ele => {
        this.runTypes.push(new OptionsDTO(ele.type + '-' + ele.dsAlias, ele));
      });
      if (!this.defaultRuntimeFromDB) {
        this.selectedRunType = this.runTypes[0]?.value;
      } else {
        const matchingOption = this.runTypes.find(
          (opt: any) => opt.value.dsName === this.defaultRuntimeFromDB.dsName &&
                        opt.value.type  === this.defaultRuntimeFromDB.type
        );
        this.selectedRunType = matchingOption ? matchingOption.value : this.runTypes[0]?.value;
      }
      this.runtypesCheck = false;
    });
  }

  runTypeChanged(selected: any): void {
    const data = this.runTypes.find(opt => opt.value === selected);
    if (data) this.selectedRunType = data.value;
  }

  /** Persist the currently selected run type to json_content so it is pre-selected on next load. */
  private persistDefaultRuntime(): void {
    if (!this.model || !this.selectedRunType) return;
    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    parsed.default_runtime = this.selectedRunType;
    this.model.raw.json_content = JSON.stringify(parsed);
    this.model.defaultRuntime = this.selectedRunType;
    this.services.update(this.model.raw).subscribe({ error: () => {} });
  }

  /**
   * Tab index for Run History — works for both data-pipeline and training-job.
   * Tabs: Code(0), [VibeCode(1), Git(2) if hasVibePermission], Config, [Metrics if training], RunHistory
   */
  private get runHistoryTabIndex(): number {
    if (this.model?.kind === 'data-pipeline') {
      return this.hasVibePermission ? 4 : 2;
    }
    if (this.model?.kind === 'training-job') {
      // training-job has an extra Metrics tab before Run History
      return this.hasVibePermission ? 5 : 3;
    }
    return -1;
  }

  runPipeline(): void {
    if (!this.model || this.running) return;
    this.running = true;
    const alias = this.model.alias || this.model.name;
    const cname = this.model.name;
    const isLocal    = this.selectedRunType?.type  ?? 'true';
    const datasource = this.selectedRunType?.dsName ?? undefined;
    this.persistDefaultRuntime();
    this.services.runPipeline(alias, cname, 'NativeScript', isLocal, datasource)
      .subscribe({
        next: () => {
          this.running = false;
          this.services.message('Pipeline started!', 'success');
          if (this.model?.kind === 'training-job') {
            // Navigate to Run History tab (same component as data-pipeline)
            const rhIdx = this.runHistoryTabIndex;
            if (rhIdx >= 0) {
              this.activeTab = rhIdx;
              setTimeout(() => this.runHistoryTab?.refresh(), 3000);
            }
          } else {
            const rhIdx = this.runHistoryTabIndex;
            if (rhIdx >= 0) {
              this.activeTab = rhIdx;
              setTimeout(() => this.runHistoryTab?.refresh(), 3000);
            }
          }
        },
        error: (err: any) => {
          this.running = false;
          // err = error.error (the BE response body) — extract the most descriptive message
          const msg =
            err?.details || err?.message || err?.error ||
            (typeof err === 'string' && err.length < 600 ? err : null) ||
            'Failed to start pipeline';
          this.services.message(msg, 'error');
        },
      });
  }

  deployAsContainer(): void {
    if (!this.model) return;
    this.containerDeployStatus = 'deploying';
    this.containerDeployMessage = 'Initiating container build...';
    this.containerInternalDnsUrl = '';
    this.services.deployPipelineAsContainer(this.model.name).subscribe({
      next: (res: any) => {
        let deployId: string;
        try {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          deployId = parsed.deploy_id;
        } catch {
          this.containerDeployStatus = 'error';
          this.containerDeployMessage = 'Failed to parse deploy response';
          return;
        }
        this._containerPollInterval = setInterval(() => {
          this.services.getContainerDeployStatus(deployId).subscribe((status: any) => {
            if (status.status === 'SUCCESS') {
              clearInterval(this._containerPollInterval);
              this.containerDeployStatus = 'success';
              this.containerDeployMessage = 'Deployment complete';
              this.containerInternalDnsUrl = status.internal_dns_url || '';
            } else if (status.status === 'ERROR') {
              clearInterval(this._containerPollInterval);
              this.containerDeployStatus = 'error';
              this.containerDeployMessage = status.message || 'Deployment failed';
            } else {
              this.containerDeployMessage = status.message || 'Building...';
            }
          });
        }, 5000);
      },
      error: () => {
        this.containerDeployStatus = 'error';
        this.containerDeployMessage = 'Failed to start container deployment';
      },
    });
  }
}