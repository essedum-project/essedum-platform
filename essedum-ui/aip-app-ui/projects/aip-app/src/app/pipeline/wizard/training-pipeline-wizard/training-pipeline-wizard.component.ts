import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Services } from '../../../services/service';
import { StreamingServices } from '../../../streaming-services/streaming-service';
import { GitLinkService } from '../../../services/git-link.service';
import {
  TRAINING_JOB_TYPES,
  FRAMEWORKS_BY_JOB_TYPE,
  METHODS_BY_JOB_TYPE,
  QUANTIZATION_OPTIONS,
  FALLBACK_SLM_BASE_MODELS,
  TEACHER_MODELS,
  EXECUTORS,
  GitLinkValue,
  emptyGitLink,
} from '../shared/pipeline-options.constants';

@Component({
  selector: 'app-training-pipeline-wizard',
  templateUrl: './training-pipeline-wizard.component.html',
  styleUrls: ['./training-pipeline-wizard.component.scss'],
})
export class TrainingPipelineWizardComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  jobTypes = TRAINING_JOB_TYPES;
  datasets: string[] = [];
  datasetsLoaded = false;
  private allDatasetObjects: any[] = [];   // full dataset objects (have datasource info)
  private datasetObjectMap = new Map<string, any>(); // alias → full object
  datasetColumns: string[] = [];           // columns fetched from selected dataset
  datasetColumnsLoaded = false;
  private datasetRows: any[] = [];         // schema sample rows
  slmBaseModels = FALLBACK_SLM_BASE_MODELS;
  teacherModels = TEACHER_MODELS;
  executors = EXECUTORS;
  quantOptions = QUANTIZATION_OPTIONS;

  modeForm: FormGroup;
  identityForm: FormGroup;
  dataExecForm: FormGroup;
  gitLink: GitLinkValue = emptyGitLink();
  gitValid = false;
  creating = false;

  constructor(
    private fb: FormBuilder,
    private services: Services,
    private gitSvc: GitLinkService,
    public dialogRef: MatDialogRef<TrainingPipelineWizardComponent>,
  ) {}

  ngOnInit(): void {
    this.modeForm = this.fb.group({
      jobType: ['traditional', Validators.required],
    });

    this.identityForm = this.fb.group({
      name:        ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      alias:       ['', Validators.required],
      description: [''],
      framework:   ['XGBoost 1.7', Validators.required],
      baseModel:   ['xgboost.XGBClassifier', Validators.required],
      method:      [''],
      quantization:[''],
      teacher:     [''],
    });

    this.dataExecForm = this.fb.group({
      dataset:   ['', Validators.required],
      executor:  ['py-job-executor', Validators.required],
      epochs:    [3, [Validators.required, Validators.min(1)]],
      batchSize: [4, [Validators.required, Validators.min(1)]],
      lr:        ['2e-4', Validators.required],
      loraRank:  [16],
      loraAlpha: [32],
      maxLen:    [2048],
    });

    this.gitLink = this.gitSvc.defaultLinkFor('new-training', 'training-job');

    this.identityForm.get('name').valueChanges.subscribe(name => {
      if (name) this.gitLink = { ...this.gitLink, filePath: `training-jobs/${name}/train.py` };
    });

    // Cascade: when dataset changes → fetch schema columns
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
      const dsourceRef  = { type: obj.datasource.type, alias: obj.datasource.alias };
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
        // Build lookup map: alias → full object
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

  get frameworks(): string[] {
    return FRAMEWORKS_BY_JOB_TYPE[this.modeForm.value.jobType] ?? [];
  }
  get methods(): string[] {
    return METHODS_BY_JOB_TYPE[this.modeForm.value.jobType] ?? [];
  }
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

  onGitLinkChange(v: GitLinkValue): void { this.gitLink = v; }
  onGitValidity(v: boolean): void { this.gitValid = v; }
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
          files: [`${cfg.name}_train.py`],
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
        git: cfg.git,
        kind: 'training-job',
        datasetColumns: this.datasetColumns,
        datasetSample: this.datasetRows,
        freshlyCreated: true,
      },
    });

    this.creating = true;
    this.services.create(newSs).subscribe({
      next: (data) => {
        this.services.message('Training job created!', 'success');
        // Parent (PipelineComponent) reads { pipeline, kind } and navigates
        // relatively so the shell's mount prefix is preserved.
        this.dialogRef.close({ pipeline: data, kind: 'training-job' });
      },
      error: () => {
        this.creating = false;
        this.services.message('Could not create training job', 'error');
      },
    });
  }
}
