import { ChangeDetectorRef, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Services } from '@essedum/shared-lib';
import {
  MtaasComputeTarget,
  MtaasDataset,
  MtaasProblemDetails,
  MtaasQuotaCapacity,
  MtaasRunDetail,
  MtaasSchemaField,
  MtaasService,
  MtaasTemplate,
  MtaasWizardStepKey,
  buildSchemaFormGroup,
  currentProjectId,
  mapProblemDetails,
  schemaToFields,
  stepForFieldErrors,
} from '../mtaas.service';

export interface MtaasWizardData {
  templateId?: number;
  clone?: MtaasRunDetail;
}

const FRAMEWORK_ICONS: Record<string, string> = {
  PYTORCH: 'local_fire_department',
  HF: 'psychology',
  XGBOOST: 'account_tree',
  CUSTOM: 'code',
};

// Kubernetes-style quantities: CPU "4", "500m", "2.5"; memory "16Gi", "512Mi", "1G".
const CPU_PATTERN = /^\d+(\.\d+)?m?$/;
const MEMORY_PATTERN = /^\d+(\.\d+)?(Ki|Mi|Gi|Ti|K|M|G|T)?$/;

const STEP_INDEX: Record<MtaasWizardStepKey, number> = {
  template: 0,
  dataset: 1,
  parameters: 1,
  resources: 2,
  review: 2,
};

@Component({
  selector: 'app-mtaas-wizard',
  templateUrl: './mtaas-wizard.component.html',
  styleUrls: ['./mtaas-wizard.component.scss'],
  standalone: false,
})
export class MtaasWizardComponent implements OnInit {
  @ViewChild('stepper') stepper?: MatStepper;

  templates: MtaasTemplate[] = [];
  datasets: MtaasDataset[] = [];
  computeTargets: MtaasComputeTarget[] = [];
  quota: MtaasQuotaCapacity | null = null;
  paramFields: MtaasSchemaField[] = [];
  loaded = false;
  submitting = false;
  submitted = false;
  problem: MtaasProblemDetails | null = null;

  readonly priorities = [1, 2, 3, 4, 5];
  readonly projectId = currentProjectId();

  templateForm: FormGroup;
  dataParamsForm: FormGroup;
  resourcesForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mtaas: MtaasService,
    private services: Services,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<MtaasWizardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: MtaasWizardData | null
  ) {}

  ngOnInit(): void {
    this.templateForm = this.fb.group({ templateId: [null, Validators.required] });

    this.dataParamsForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 _-]+$/)]],
      datasetId: ['', Validators.required],
      datasetVersion: ['', Validators.required],
      params: this.fb.group({}),
    });

    this.resourcesForm = this.fb.group({
      computeTargetId: [null, Validators.required],
      gpus: [0, [Validators.required, Validators.min(0), Validators.max(1024), Validators.pattern(/^\d+$/)]],
      gpuType: [''],
      cpu: ['', [Validators.required, Validators.pattern(CPU_PATTERN)]],
      memory: ['', [Validators.required, Validators.pattern(MEMORY_PATTERN)]],
      priority: [3, Validators.required],
    });

    this.dataParamsForm.get('datasetId').valueChanges.subscribe(() => {
      this.dataParamsForm.patchValue({ datasetVersion: this.datasetVersions[0] ?? '' });
    });

    this.mtaas.getDatasets().subscribe((d) => (this.datasets = d));
    this.mtaas.getQuotaCapacity(this.projectId).subscribe({
      next: (q) => (this.quota = q),
      error: () => (this.quota = null),
    });
    this.mtaas.getComputeTargets().subscribe((c) => (this.computeTargets = c));
    this.mtaas.getTemplates().subscribe({
      next: (t) => {
        this.templates = t;
        this.loaded = true;
        this.preselect();
      },
      error: (err) => {
        this.loaded = true;
        this.problem = mapProblemDetails(err);
      },
    });
  }

  get paramsForm(): FormGroup {
    return this.dataParamsForm.get('params') as FormGroup;
  }

  get selectedTemplate(): MtaasTemplate | undefined {
    return this.templates.find((t) => t.id === this.templateForm.value.templateId);
  }

  get datasetVersions(): string[] {
    return this.datasets.find((d) => d.id === this.dataParamsForm.value.datasetId)?.versions ?? [];
  }

  get gpuTypes(): string[] {
    return this.computeTargets.find((c) => c.id === this.resourcesForm.value.computeTargetId)?.gpuTypes ?? [];
  }

  /** GPUs the project has free right now (quota minus in use), or null if quota is unknown. */
  get gpusAvailable(): number | null {
    return this.quota ? Math.max(0, this.quota.quotaGpus - this.quota.usedGpus) : null;
  }

  /** Requesting more GPUs than the project quota can never fit, so the run is rejected up front. */
  get gpuQuotaError(): string | null {
    const requested = Number(this.resourcesForm?.value.gpus ?? 0);
    if (this.quota && requested > this.quota.quotaGpus) {
      return `Exceeds the project GPU quota of ${this.quota.quotaGpus}.`;
    }
    return null;
  }

  /** Between free and quota the run is accepted but will wait in the queue. */
  get gpuQueueHint(): string | null {
    const requested = Number(this.resourcesForm?.value.gpus ?? 0);
    const free = this.gpusAvailable;
    if (free !== null && requested > free && !this.gpuQuotaError) {
      return `Only ${free} GPU(s) free now; the run will queue until capacity is released.`;
    }
    return null;
  }

  /** A target that advertises GPU types needs one picked when GPUs are requested. */
  get gpuTypeMissing(): boolean {
    const r = this.resourcesForm?.value;
    return Number(r?.gpus ?? 0) > 0 && this.gpuTypes.length > 0 && !r?.gpuType;
  }

  get allValid(): boolean {
    return (
      this.templateForm.valid &&
      this.dataParamsForm.valid &&
      this.resourcesForm.valid &&
      !this.gpuQuotaError &&
      !this.gpuTypeMissing
    );
  }

  iconFor(template: MtaasTemplate): string {
    return FRAMEWORK_ICONS[template.framework] ?? 'model_training';
  }

  selectTemplate(template: MtaasTemplate): void {
    if (template.enabled) {
      this.applyTemplate(template);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const template = this.selectedTemplate;
    this.submitted = true;
    if (this.submitting || !template || !this.allValid) {
      this.paramsForm.markAllAsTouched();
      return;
    }
    const d = this.dataParamsForm.value;
    const r = this.resourcesForm.value;
    this.submitting = true;
    this.problem = null;
    this.mtaas
      .submitRun({
        projectId: this.projectId,
        templateId: template.id,
        templateVersion: template.version,
        computeTargetId: r.computeTargetId,
        displayName: d.displayName,
        dataset: { id: d.datasetId, version: d.datasetVersion },
        params: d.params,
        resources: { gpus: r.gpus, gpuType: r.gpus > 0 && r.gpuType ? r.gpuType : undefined, cpu: r.cpu, memory: r.memory },
        priority: r.priority,
      })
      .subscribe({
        next: (res) => {
          this.services.message('MTaaS run submitted!', 'success');
          this.dialogRef.close({ run: res });
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.problem = mapProblemDetails(err);
          this.showServerErrors(this.problem);
          this.cdr.markForCheck();
        },
      });
  }

  private preselect(): void {
    const wanted = this.data?.clone?.templateId ?? this.data?.templateId;
    const template = this.templates.find((t) => t.id === wanted && t.enabled);
    if (template) {
      this.applyTemplate(template, this.data?.clone);
    }
  }

  private applyTemplate(summary: MtaasTemplate, clone?: MtaasRunDetail): void {
    this.mtaas.getTemplate(summary.id).subscribe((template) => {
      this.templateForm.patchValue({ templateId: template.id });
      const idx = this.templates.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        this.templates[idx] = template;
      }
      this.paramFields = schemaToFields(template.paramSchema);
      this.dataParamsForm.setControl('params', buildSchemaFormGroup(template.paramSchema));
      this.resourcesForm.patchValue({
        gpus: template.defaultGpus,
        gpuType: template.defaultGpuType ?? '',
        cpu: template.defaultCpu,
        memory: template.defaultMemory,
      });
      if (clone) {
        this.applyClone(clone);
      }
      if (clone || this.data?.templateId === template.id) {
        setTimeout(() => this.stepper?.next());
      }
      this.cdr.markForCheck();
    });
  }

  private applyClone(run: MtaasRunDetail): void {
    const name = `${run.displayName || run.runId}-copy`.replace(/[^a-zA-Z0-9 _-]/g, '-');
    this.dataParamsForm.patchValue({ displayName: name, datasetId: run.datasetId });
    this.dataParamsForm.patchValue({ datasetVersion: run.datasetVersion });
    this.paramsForm.patchValue(run.params ?? {});
    this.resourcesForm.patchValue({
      computeTargetId: run.computeTargetId ?? null,
      gpus: run.gpus,
      gpuType: run.gpuType ?? '',
      cpu: run.cpu,
      memory: run.memory,
      priority: run.priority,
    });
  }

  private showServerErrors(problem: MtaasProblemDetails): void {
    const fieldErrors = problem.fieldErrors ?? {};
    for (const key of Object.keys(fieldErrors)) {
      const control = this.controlForField(key);
      control?.setErrors({ server: fieldErrors[key] });
      control?.markAsTouched();
    }
    const step = stepForFieldErrors(fieldErrors);
    if (step && this.stepper) {
      this.stepper.selectedIndex = STEP_INDEX[step];
    }
  }

  private controlForField(key: string) {
    if (key.startsWith('params.')) {
      return this.paramsForm.get(key.slice('params.'.length));
    }
    if (key.startsWith('resources.')) {
      return this.resourcesForm.get(key.slice('resources.'.length));
    }
    const aliases: Record<string, string> = { 'dataset.id': 'datasetId', 'dataset.version': 'datasetVersion' };
    const name = aliases[key] ?? key;
    return this.dataParamsForm.get(name) ?? this.resourcesForm.get(name);
  }
}
