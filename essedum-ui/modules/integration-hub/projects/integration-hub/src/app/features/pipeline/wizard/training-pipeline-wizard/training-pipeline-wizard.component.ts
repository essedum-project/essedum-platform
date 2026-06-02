import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Services, StreamingServices } from '@essedum/shared-lib';

@Component({
  selector: 'app-training-pipeline-wizard',
  templateUrl: './training-pipeline-wizard.component.html',
  styleUrls: ['./training-pipeline-wizard.component.scss'],
})
export class TrainingPipelineWizardComponent implements OnInit {
  step = 0;
  saving = false;
  errMsg = '';

  basicForm: FormGroup;
  configForm: FormGroup;

  readonly frameworks = [
    { label: 'PyTorch', value: 'pytorch' },
    { label: 'TensorFlow', value: 'tensorflow' },
    { label: 'Scikit-learn', value: 'sklearn' },
    { label: 'XGBoost', value: 'xgboost' },
    { label: 'Hugging Face', value: 'huggingface' },
  ];

  readonly computeTargets = [
    { label: 'Local', value: 'local' },
    { label: 'GPU Cluster', value: 'gpu_cluster' },
    { label: 'CPU Cluster', value: 'cpu_cluster' },
    { label: 'Serverless', value: 'serverless' },
  ];

  constructor(
    private fb: FormBuilder,
    private services: Services,
    public dialogRef: MatDialogRef<TrainingPipelineWizardComponent>,
  ) {}

  ngOnInit(): void {
    this.basicForm = this.fb.group({
      alias: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    this.configForm = this.fb.group({
      framework: ['pytorch', Validators.required],
      computeTarget: ['local', Validators.required],
      epochs: [10, [Validators.min(1), Validators.max(10000)]],
    });
  }

  next(): void {
    if (this.step === 0 && this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return;
    }
    this.step++;
  }

  back(): void {
    this.step--;
  }

  create(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errMsg = '';

    const canvas = new StreamingServices();
    canvas.alias = this.basicForm.value.alias.trim();
    canvas.description = this.basicForm.value.description?.trim() || '';
    canvas.type = 'TrainingPipeline';
    canvas.interfacetype = 'pipeline';
    canvas.is_template = false;
    canvas.json_content = JSON.stringify({
      pipeline_attributes: {
        wizard_version: 1,
        framework: this.configForm.value.framework,
        compute_target: this.configForm.value.computeTarget,
        epochs: this.configForm.value.epochs,
      },
      elements: [],
    });

    this.services.create(canvas).subscribe({
      next: (data: any) => {
        this.saving = false;
        this.dialogRef.close({ pipeline: data });
      },
      error: (err: any) => {
        this.saving = false;
        this.errMsg = err?.error?.message || 'Failed to create training pipeline. Please try again.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
