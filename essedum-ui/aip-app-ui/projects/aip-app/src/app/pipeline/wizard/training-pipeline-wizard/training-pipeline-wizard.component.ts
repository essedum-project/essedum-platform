import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Services } from '../../../services/service';
import { StreamingServices } from '../../../streaming-services/streaming-service';
import { CodeTemplateService } from '../shared/code-template.service';
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
    private templates: CodeTemplateService,
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

    this.applyTypeDefaults('traditional');
    this.loadLiveOptions();
  }

  private loadLiveOptions(): void {
    const org = sessionStorage.getItem('organization') || '';
    // getDatasetNames returns all dataset objects for the org from /datasets/dataset
    this.services.getDatasetNames(org).subscribe({
      next: (res: any) => {
        // response can be array of datasets or { content: [...] }
        const items: any[] = Array.isArray(res) ? res : (res?.content ?? []);
        this.datasets = items
          .map((d: any) => d.alias || d.name)
          .filter(Boolean)
          .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
        this.datasetsLoaded = true;
      },
      error: () => {
        // fallback: try getDatasources which at least has connection names
        this.datasetsLoaded = true;
      },
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

    const pythonCode = this.templates.generateTrainingCode(cfg as any);

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
          generatedCode: pythonCode,
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
