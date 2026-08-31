import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Services } from '@essedum/shared-lib';
import { StreamingServices } from '@essedum/shared-lib';
import {
  TRAINING_JOB_TYPES,
  FRAMEWORKS_BY_JOB_TYPE,
  METHODS_BY_JOB_TYPE,
  QUANTIZATION_OPTIONS,
  FALLBACK_SLM_BASE_MODELS,
  TEACHER_MODELS,
  EXECUTORS,
} from '../pipeline-options.constants';
import { GitLinkValue } from '../shared/git-link-step.component';

@Component({
  selector: 'app-training-pipeline-wizard-local',
  templateUrl: './training-pipeline-wizard.component.html',
  styleUrls: ['./training-pipeline-wizard.component.scss'],
  standalone: false
})
export class TrainingPipelineWizardLocalComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  jobTypes = TRAINING_JOB_TYPES;
  datasets: string[] = [];
  datasetsLoaded = false;
  private allDatasetObjects: any[] = [];
  private datasetObjectMap = new Map<string, any>();
  datasetColumns: string[] = [];
  datasetColumnsLoaded = false;
  private datasetRows: any[] = [];
  slmBaseModels = FALLBACK_SLM_BASE_MODELS;
  readonly traditionalBaseModels = [
    'Logistic Regression', 'Linear Regression', 'Decision Tree', 'Random Forest',
  ];
  teacherModels = TEACHER_MODELS;
  executors = EXECUTORS;
  quantOptions = QUANTIZATION_OPTIONS;

  modeForm: FormGroup;
  identityForm: FormGroup;
  dataExecForm: FormGroup;
  gitLink: GitLinkValue = { repo: '', branch: 'main', filePath: '' };
  gitValid = false;
  creating = false;

  // Agent + Model pre-selection (auto-defaulted, user can change via settings gear)
  selectionDone = true;
  showSettings = false;
  selectedAgent: string | null = null;
  selectedModel: string | null = null;
  readonly agentOptions = [
    { label: 'Ollama', value: 'ollama' },
    { label: 'Azure OpenAI', value: 'azure_openai' },
    { label: 'Anthropic', value: 'anthropic' },
  ];
  readonly modelOptions = [
    { label: 'qwen3.6:27b', value: 'qwen3.6:27b' },
    { label: 'gemma4:latest', value: 'gemma4:latest' },
    { label: 'gpt-oss:latest', value: 'gpt-oss:latest' },
    { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
    { label: 'phi3:mini', value: 'phi3:mini' },
    { label: 'gemma3:latest', value: 'gemma3:latest' },
    { label: 'llama3:latest', value: 'llama3:latest' },
    { label: 'qwen3:4b', value: 'qwen3:4b' },
  ];

  onAgentSelect(agent: string): void { this.selectedAgent = agent; this.showSettings = false; }
  onModelSelect(model: string): void { this.selectedModel = model; this.showSettings = false; }
  toggleSettings(): void { this.showSettings = !this.showSettings; }

  private applyDefaultAgentModel(): void {
    const origin = window.location.origin || '';
    if (origin.includes('essedum.az.ad.idemo-ppc.com')) {
      this.selectedAgent = 'azure_openai';
      this.selectedModel = 'gpt-4o-mini';
    } else if (origin.includes('localhost') || origin.includes('essedum-lfn.infosys.com')) {
      this.selectedAgent = 'ollama';
      this.selectedModel = 'qwen3:4b';
    } else {
      this.selectedAgent = 'ollama';
      this.selectedModel = 'qwen3:4b';
    }
  }
  onGitLinkChange(v: GitLinkValue): void { this.gitLink = v; }
  onGitValidity(v: boolean): void { this.gitValid = v; }

  constructor(
    private fb: FormBuilder,
    private services: Services,
    public dialogRef: MatDialogRef<TrainingPipelineWizardLocalComponent>,
  ) {}

  ngOnInit(): void {
    this.applyDefaultAgentModel();

    this.modeForm = this.fb.group({
      jobType: ['traditional', Validators.required],
    });

    this.identityForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 _-]+$/)]],
      alias: ['', Validators.required],
      description: [''],
      framework: ['XGBoost 1.7', Validators.required],
      baseModel: ['Logistic Regression', Validators.required],
      method: [''],
      quantization: [''],
      teacher: [''],
    });

    this.dataExecForm = this.fb.group({
      dataset: ['', Validators.required],
      executor: ['py-job-executor', Validators.required],
      epochs: [3, [Validators.required, Validators.min(1)]],
      batchSize: [4, [Validators.required, Validators.min(1)]],
      lr: ['2e-4', Validators.required],
      loraRank: [16],
      loraAlpha: [32],
      maxLen: [2048],
      containerImage: [''],
      containerRegistry: [''],
      useGpu: [false],
    });

    // Keep git file path in sync with name
    this.identityForm.get('name').valueChanges.subscribe(name => {
      if (name) {
        this.gitLink = { ...this.gitLink, filePath: `training-jobs/${name}/train.py` };
      }
    });

    // Cascade: dataset → columns
    this.dataExecForm.get('dataset').valueChanges.subscribe(datasetAlias => {
      this.datasetColumns = [];
      this.datasetRows = [];
      this.datasetColumnsLoaded = false;
      if (!datasetAlias) return;
      const obj = this.datasetObjectMap.get(datasetAlias);
      if (!obj?.datasource?.type || !obj?.datasource?.alias) {
        this.datasetColumnsLoaded = true;
        return;
      }
      const org = sessionStorage.getItem('organization') || '';
      const datasetRef = { alias: datasetAlias };
      const dsourceRef = { type: obj.datasource.type, alias: obj.datasource.alias };
      this.services.getProxyDbDatasetDetails(datasetRef as any, dsourceRef, { page: 0, size: 50 }, org, true).subscribe({
        next: (rows: any[]) => {
          if (rows && rows.length > 0) {
            this.datasetColumns = Object.keys(rows[0]);
            this.datasetRows = rows.slice(0, 3);
          }
          this.datasetColumnsLoaded = true;
        },
        error: () => { this.datasetColumnsLoaded = true; },
      });
    });

    this.applyTypeDefaults('traditional');
    this.loadLiveOptions();
  }

  private loadLiveOptions(): void {
    const org = sessionStorage.getItem('organization') || '';
    this.services.getDatasetNames(org).subscribe({
      next: (res: any) => {
        const items: any[] = Array.isArray(res) ? res : (res?.content ?? []);
        this.allDatasetObjects = items;
        this.datasetObjectMap.clear();
        items.forEach((d: any) => {
          const key = d.alias || d.name;
          if (key) this.datasetObjectMap.set(key, d);
        });
        this.datasets = items
          .map((d: any) => d.alias || d.name)
          .filter(Boolean)
          .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
        this.datasetsLoaded = true;
      },
      error: () => { this.datasetsLoaded = true; },
    });
  }

  get frameworks(): string[] { return FRAMEWORKS_BY_JOB_TYPE[this.modeForm.value.jobType] ?? []; }
  get methods(): string[] { return METHODS_BY_JOB_TYPE[this.modeForm.value.jobType] ?? []; }
  get isLLM(): boolean {
    const t = this.modeForm.value.jobType;
    return t === 'slm-finetune' || t === 'reasoning' || t === 'distillation';
  }

  selectJobType(value: string): void {
    this.modeForm.patchValue({ jobType: value });
    this.applyTypeDefaults(value);
  }

  private applyTypeDefaults(jobType: string): void {
    const meta = TRAINING_JOB_TYPES.find(t => t.value === jobType);
    if (meta) {
      this.identityForm.patchValue({
        framework: meta.defaultFramework,
        baseModel: meta.defaultBaseModel,
        method: METHODS_BY_JOB_TYPE[jobType]?.[0] || '',
        quantization: jobType === 'slm-finetune' ? '4-bit' : '',
        teacher: jobType === 'distillation' ? 'gpt-4o' : '',
      });
    }
  }

  cancel(): void { this.dialogRef.close(); }

  createJob(): void {
    if (this.creating) return;
    if (this.modeForm.invalid || this.identityForm.invalid || this.dataExecForm.invalid) return;

    const cfg = {
      ...this.modeForm.value,
      ...this.identityForm.value,
      ...this.dataExecForm.value,
      git: this.gitLink,
    };

    const newSs = new StreamingServices();
    newSs.name = cfg.name;
    newSs.alias = cfg.alias;
    newSs.description = cfg.description || '';
    newSs.type = 'TrainingPipeline';
    newSs.interfacetype = 'pipeline';
    newSs.json_content = JSON.stringify({
      elements: [{
        attributes: {
          filetype: 'Python3',
          files: [],
          generatedCode: '',
        },
      }],
      pipeline_attributes: {
        wizard_version: 1,
        jobType: cfg.jobType,
        framework: cfg.framework,
        baseModel: cfg.baseModel,
        method: cfg.method,
        quantization: cfg.quantization,
        teacher: cfg.teacher,
        dataset: cfg.dataset,
        executor: cfg.executor,
        epochs: cfg.epochs,
        batchSize: cfg.batchSize,
        lr: cfg.lr,
        loraRank: cfg.loraRank,
        loraAlpha: cfg.loraAlpha,
        maxLen: cfg.maxLen,
        containerImage: cfg.containerImage || '',
        containerRegistry: cfg.containerRegistry || '',
        useGpu: cfg.useGpu || false,
        kind: 'training-job',
        datasetColumns: this.datasetColumns,
        datasetSample: this.datasetRows,
        freshlyCreated: true,
        selectedAgent: this.selectedAgent,
        selectedModel: this.selectedModel,
        git: cfg.git,
      },
    });

    this.creating = true;
    this.services.create(newSs).subscribe({
      next: (data) => {
        const org = data.organization || sessionStorage.getItem('organization') || '';
        const canonicalFile = `${data.name}_${org}.py`;
        try {
          const pc = JSON.parse(data.json_content || '{}');
          if (pc.elements?.[0]?.attributes) {
            pc.elements[0].attributes.files = [canonicalFile];
            data.json_content = JSON.stringify(pc);
          }
        } catch { /* non-critical */ }
        this.services.update(data).subscribe();
        this.services.message('Training job created!', 'success');
        this.dialogRef.close({ pipeline: data, kind: 'training-job' });
      },
      error: (err: any) => {
        this.creating = false;
        const msg = err?.details || err?.message || err?.error ||
          (typeof err === 'string' && err.length < 600 ? err : null) ||
          'Could not create training job';
        this.services.message(msg, 'error');
      },
    });
  }
}
