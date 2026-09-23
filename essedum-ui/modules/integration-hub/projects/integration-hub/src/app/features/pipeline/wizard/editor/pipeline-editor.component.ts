import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Services } from '../../../services/service';
import { io } from 'socket.io-client';
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
  containerDeployLogs: string[] = [];
  isDeletingContainer = false;
  codeModifiedSinceDeployed = false;
  savedAfterModify = false;
  private containerLastDeploymentName = '';
  private containerLastNamespace = 'vibe-pipelines';
  private _containerPollInterval: any = null;
  private _redeployPending = false;
  private containerSocket: any = null;

  private destroy$ = new Subject<void>();
  private modelPathPollTimer: any;
  private modelPathPollAttempts = 0;
  private lastPolledJobId: string | null = null;

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

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    this.stopModelPathPolling();
  }

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
        this.backfillModelPathIfNeeded();
        // Restore persistent container deployment state
        try {
          const parsed = JSON.parse(ss.json_content || '{}');
          const cd = parsed.containerDeployment;
          if (cd && cd.deploymentName) {
            this.containerLastDeploymentName = cd.deploymentName;
            this.containerLastNamespace = cd.namespace || 'vibe-pipelines';
            this.containerInternalDnsUrl = cd.internalDnsUrl || '';
            this.containerDeployStatus = 'success';
            this.containerDeployMessage = 'Deployment active';
            if (cd.buildLogs && cd.buildLogs.length > 0) {
              this.containerDeployLogs = cd.buildLogs;
            }
          }
        } catch {}
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
        this.services.message('Saved! Click Deploy as Container to deploy this pipeline.', 'success');
        if (this.codeModifiedSinceDeployed) { this.savedAfterModify = true; }
        if (this._redeployPending) {
          this._redeployPending = false;
          this._triggerContainerDeploy();
        }
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
          this.startModelPathPolling();
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

  get containerBusy(): boolean {
    return this.containerDeployStatus === 'deploying' || this.isDeletingContainer;
  }

  private get containerDeploymentName(): string {
    const source = this.containerLastDeploymentName || (this.model ? this.model.alias || this.model.name : '');
    return String(source).toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  get containerTabIndex(): number {
    const configIdx = this.hasVibePermission ? 3 : 1;
    const metricsOffset = this.model?.kind === 'training-job' ? 1 : 0;
    return configIdx + metricsOffset + 1;
  }

  onCodeModify(): void {
    if (this.containerDeployStatus === 'success') {
      this.codeModifiedSinceDeployed = true;
      this.savedAfterModify = false;
    }
  }

  onCodeRestore(): void {
    this.codeModifiedSinceDeployed = false;
    this.savedAfterModify = false;
  }

  get showRedeployBtn(): boolean {
    return this.containerDeployStatus === 'success' && this.codeModifiedSinceDeployed;
  }

  deployAsContainer(): void {
    if (!this.model) return;
    if (this.codeModifiedSinceDeployed) {
      // Redeploy: re-save current code first to ensure server has latest, then deploy
      this._redeployPending = true;
      this.saveCode(this.model.code);
      return;
    }
    this._triggerContainerDeploy();
  }

  private _triggerContainerDeploy(): void {
    if (!this.model) return;
    this.codeModifiedSinceDeployed = false;
    this.savedAfterModify = false;
    // Show snackbar and navigate to Container tab immediately
    this.services.message('Deployment started', 'success');
    this.activeTab = this.containerTabIndex;
    this.containerDeployStatus = 'deploying';
    this.containerDeployMessage = 'Preparing pipeline package...';
    this.containerInternalDnsUrl = '';
    this.containerDeployLogs = [];
    // Backend zips + uploads scripts to MinIO and returns the prepared config;
    // the browser then streams the build/deploy directly from the deployer's
    // WebSocket (sandbox approach, same as agent/mcp pipelines).
    this.services.deployPipelineAsContainer(this.model.name).subscribe({
      next: (res: any) => {
        let config: any;
        try {
          config = typeof res === 'string' ? JSON.parse(res) : res;
        } catch {
          this.containerDeployStatus = 'error';
          this.containerDeployMessage = 'Failed to parse deploy response';
          return;
        }
        if (!config || config.status !== 'prepared') {
          this.containerDeployStatus = 'error';
          this.containerDeployMessage = (config && config.error) || 'Failed to prepare deployment';
          return;
        }
        this.containerLastDeploymentName = config.deployment_name || '';
        this.containerLastNamespace = config.namespace || this.containerLastNamespace;
        this.streamContainerDeploy(config);
      },
      error: (err: any) => {
        this.containerDeployStatus = 'error';
        const msg =
          (typeof err === 'string' && err.length < 600 ? err : null) ||
          err?.message || err?.error || err?.details ||
          'Failed to start container deployment';
        this.containerDeployMessage = msg;
      },
    });
  }

  private addContainerLog(line: string): void {
    this.containerDeployLogs = [...this.containerDeployLogs, line];
  }

  private streamContainerDeploy(config: any): void {
    this.addContainerLog('Connecting to build service...');
    this.disconnectContainerSocket();
    this.containerSocket = io(window.location.origin, {
      path: '/apps/builder-service/socket.io',
      transports: ['websocket', 'polling'],
      timeout: 600000,
      forceNew: true,
      rejectUnauthorized: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    } as any);

    this.containerSocket.on('connect', () => {
      this.addContainerLog('Connected. Starting pipeline build & deploy...');
      const payload: any = {
        bucket_name: config.bucket_name,
        file_path: config.file_path,
        target_image_tag: config.target_image_tag,
        deployment_name: config.deployment_name,
        namespace: config.namespace,
        minio_endpoint: config.minio_endpoint,
        env_vars: config.env_vars || [],
        secrets: config.secrets || [],
      };
      if (config.node_selector) {
        payload.node_selector = config.node_selector;
      }
      this.containerSocket.emit('start_pipeline', payload);
    });

    this.containerSocket.on('pipeline_update', (data: any) => {
      this.containerDeployMessage = `[${data.step}] ${data.message}`;
      this.addContainerLog(`[${data.step}] ${data.message}`);
    });

    this.containerSocket.on('build_log', (data: any) => {
      this.addContainerLog((data.log || '').toString());
    });

    this.containerSocket.on('pipeline_status', (data: any) => {
      const status = (data.status || '').toString().toUpperCase();
      if (status === 'SUCCESS') {
        this.containerDeployStatus = 'success';
        this.containerDeployMessage = 'Deployment successful';
        this.addContainerLog('FINAL STATUS: SUCCESS');
        this.persistContainerDeployment(
          this.containerLastDeploymentName,
          this.containerLastNamespace,
          data.internal_dns_url || ''
        );
      } else {
        this.containerDeployStatus = 'error';
        this.containerDeployMessage = data.message || 'Deployment failed';
        this.addContainerLog(`FINAL STATUS: ${data.status || 'ERROR'}${data.message ? ' - ' + data.message : ''}`);
      }
      this.disconnectContainerSocket();
    });

    this.containerSocket.on('connect_error', (err: any) => {
      this.addContainerLog(`Connection error: ${err && err.message ? err.message : err}`);
    });
  }

  deleteContainerDeployment(): void {
    if (!this.model || this.containerBusy) return;
    const deploymentName = this.containerDeploymentName;
    if (!deploymentName) {
      this.containerDeployStatus = 'error';
      this.containerDeployMessage = 'Cannot determine the deployment name to delete';
      return;
    }
    this.isDeletingContainer = true;
    this.containerDeployMessage = 'Deleting deployment...';
    this.containerDeployLogs = [];
    this.addContainerLog('Starting deployment deletion process...');
    this.disconnectContainerSocket();
    this.containerSocket = io(window.location.origin, {
      path: '/apps/builder-service/socket.io',
      transports: ['websocket', 'polling'],
      timeout: 600000,
      forceNew: true,
      rejectUnauthorized: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    } as any);
    this.containerSocket.on('connect', () => {
      this.addContainerLog(`Deleting deployment: ${deploymentName} from namespace: ${this.containerLastNamespace}`);
      this.containerSocket.emit('delete_deployment', {
        deployment_name: deploymentName,
        namespace: this.containerLastNamespace,
      });
    });
    this.containerSocket.on('delete_status', (data: any) => {
      const status = (data.status || '').toString().toUpperCase();
      this.isDeletingContainer = false;
      if (status === 'SUCCESS' || status === 'NOT_FOUND') {
        this.containerDeployStatus = 'idle';
        this.containerInternalDnsUrl = '';
        this.containerDeployMessage = data.message || (status === 'SUCCESS' ? 'Deployment deleted' : 'No deployment found');
        this.clearContainerDeployment();
      } else {
        this.containerDeployStatus = 'error';
        this.containerDeployMessage = data.message || 'Failed to delete deployment';
      }
      this.addContainerLog(`FINAL STATUS: ${data.status || 'ERROR'}${data.message ? ' - ' + data.message : ''}`);
      this.disconnectContainerSocket();
    });
    this.containerSocket.on('connect_error', (err: any) => {
      this.addContainerLog(`Connection error: ${err && err.message ? err.message : err}`);
    });
  }

  private persistContainerDeployment(deploymentName: string, namespace: string, internalDnsUrl: string): void {
    if (!this.model) return;
    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    parsed.containerDeployment = {
      deploymentName, namespace, internalDnsUrl,
      buildLogs: this.containerDeployLogs.slice(-500),
    };
    this.model.raw.json_content = JSON.stringify(parsed);
    this.services.update(this.model.raw).subscribe({ error: () => {} });
  }

  private clearContainerDeployment(): void {
    if (!this.model) return;
    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    delete parsed.containerDeployment;
    this.model.raw.json_content = JSON.stringify(parsed);
    this.services.update(this.model.raw).subscribe({ error: () => {} });
  }

  private disconnectContainerSocket(): void {
    if (this.containerSocket) {
      try { this.containerSocket.disconnect(); } catch (e) {}
      this.containerSocket = null;
    }
  }
  // ─── Model path detection after a successful run ──────────────────────
  private startModelPathPolling(): void {
    this.stopModelPathPolling();
    this.modelPathPollAttempts = 0;
    // Poll for up to ~5 minutes (75 attempts × 4s) — matches typical pipeline runtime.
    this.modelPathPollTimer = setInterval(() => this.pollForModelPath(), 4000);
  }

  private stopModelPathPolling(): void {
    if (this.modelPathPollTimer) {
      clearInterval(this.modelPathPollTimer);
      this.modelPathPollTimer = null;
    }
  }

  private pollForModelPath(): void {
    if (!this.model?.name) { this.stopModelPathPolling(); return; }
    this.modelPathPollAttempts += 1;
    if (this.modelPathPollAttempts > 75) { this.stopModelPathPolling(); return; }

    this.services.fetchInternalJobByName(this.model.name, 0, 4).subscribe({
      next: (jobs: any[]) => {
        if (!Array.isArray(jobs) || jobs.length === 0) return;
        const latest = [...jobs].sort((a, b) => {
          const da = a.submittedOn ? new Date(a.submittedOn).getTime() : 0;
          const db = b.submittedOn ? new Date(b.submittedOn).getTime() : 0;
          return db - da;
        })[0];
        const status = (latest?.jobStatus ?? latest?.status ?? '').toString().toUpperCase();
        if (status !== 'COMPLETED') return;
        if (this.lastPolledJobId === latest.jobId) { this.stopModelPathPolling(); return; }
        this.lastPolledJobId = latest.jobId;
        this.stopModelPathPolling();
        this.applyModelPath(latest.jobId, true);
      },
      error: () => { /* keep polling silently until attempts exhausted */ },
    });
  }

  /** One-shot check on load: if the latest job is already COMPLETED and no modelPath is stored, populate it. */
  private backfillModelPathIfNeeded(): void {
    if (!this.model?.name) return;
    // Migrate old modelPath values that included the executor prefix (e.g. "py-job-executor container: /Jobs/…").
    const existing = this.model.pipelineAttrs?.modelPath;
    if (existing && !existing.trim().startsWith('/Jobs/')) {
      this.model.pipelineAttrs.modelPath = '';
    }
    if (this.model.pipelineAttrs?.modelPath) return;
    this.services.fetchInternalJobByName(this.model.name, 0, 4).subscribe({
      next: (jobs: any[]) => {
        if (!Array.isArray(jobs) || jobs.length === 0) return;
        const latest = [...jobs].sort((a, b) => {
          const da = a.submittedOn ? new Date(a.submittedOn).getTime() : 0;
          const db = b.submittedOn ? new Date(b.submittedOn).getTime() : 0;
          return db - da;
        })[0];
        const status = (latest?.jobStatus ?? latest?.status ?? '').toString().toUpperCase();
        if (status !== 'COMPLETED' || !latest.jobId) return;
        this.lastPolledJobId = latest.jobId;
        this.applyModelPath(latest.jobId, false);
      },
      error: () => { /* non-fatal */ },
    });
  }

  private applyModelPath(jobId: string, showToast: boolean): void {
    if (!this.model) return;
    // Try to extract the actual path the pipeline printed ("Model saved to <path>"); fall back to heuristic.
    this.services.fetchInternalJob(jobId, 0, 0, 'COMPLETED').subscribe({
      next: (resp: any) => {
        const data = (typeof resp === 'string') ? (() => { try { return JSON.parse(resp); } catch { return {}; } })() : (resp ?? {});
        const logText: string = data?.log ?? data?.consolelog ?? data?.output ?? data?.logs ?? '';
        const parsed = this.extractSavedModelPath(logText);
        this.persistModelPath(parsed || this.deriveModelPath(jobId), showToast);
      },
      error: () => this.persistModelPath(this.deriveModelPath(jobId), showToast),
    });
  }

  /** Match the last "Model saved to <path>" line the pipeline logged. */
  private extractSavedModelPath(logText: string): string | null {
    if (!logText) return null;
    const re = /Model saved to\s+(\S+)/gi;
    let match: RegExpExecArray | null;
    let last: string | null = null;
    while ((match = re.exec(logText)) !== null) { last = match[1]; }
    return last;
  }

  private persistModelPath(modelPath: string, showToast: boolean): void {
    if (!this.model) return;
    if (!this.model.pipelineAttrs) this.model.pipelineAttrs = {};
    this.model.pipelineAttrs.modelPath = modelPath;

    let parsed: any = {};
    try { parsed = JSON.parse(this.model.raw.json_content || '{}'); } catch {}
    parsed.pipeline_attributes = { ...(parsed.pipeline_attributes || {}), modelPath };
    this.model.raw.json_content = JSON.stringify(parsed);
    this.services.update(this.model.raw).subscribe({ error: () => {} });
  }

  /** Where the artifact actually lives after a successful run.
   *  Prefers durable object-storage URI when the pipeline runs against minio/s3;
   *  otherwise falls back to the executor's local (ephemeral) filesystem path. */
  private deriveModelPath(jobId: string): string {
    const a = this.model?.pipelineAttrs || {};
    const container = (a.outputContainer || '').toString().trim().toLowerCase();
    const bucket   = (a.bucket || a.connection || '').toString().trim();
    const name     = (this.model?.name || '').toString().trim();
    const version  = (a.version || 'v1').toString().trim();

    if ((container === 's3' || container === 'minio') && bucket && name) {
      const scheme = container === 's3' ? 's3' : 'minio';
      return `${scheme}://${bucket}/${name}/remote/${name}/${version}/outputartifacts/logs/outputs/model.pkl`;
    }
    return `/Jobs/${jobId}/model.pkl`;
  }
}