import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Services, StreamingServices } from '@essedum/shared-lib';

@Component({
  selector: 'app-data-pipeline-wizard',
  templateUrl: './data-pipeline-wizard.component.html',
  styleUrls: ['./data-pipeline-wizard.component.scss'],
})
export class DataPipelineWizardComponent implements OnInit {
  step = 0;
  saving = false;
  errMsg = '';

  basicForm: FormGroup;
  configForm: FormGroup;

  readonly sourceTypes = [
    { label: 'Batch', value: 'batch' },
    { label: 'Streaming', value: 'streaming' },
    { label: 'REST API', value: 'rest' },
  ];

  readonly dataFormats = [
    { label: 'JSON', value: 'json' },
    { label: 'CSV', value: 'csv' },
    { label: 'Parquet', value: 'parquet' },
    { label: 'Avro', value: 'avro' },
  ];

  constructor(
    private fb: FormBuilder,
    private services: Services,
    public dialogRef: MatDialogRef<DataPipelineWizardComponent>,
  ) {}

  ngOnInit(): void {
    this.basicForm = this.fb.group({
      alias: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    this.configForm = this.fb.group({
      sourceType: ['batch', Validators.required],
      dataFormat: ['json', Validators.required],
      schedule: [''],
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
    canvas.type = 'DataPipeline';
    canvas.interfacetype = 'pipeline';
    canvas.is_template = false;
    canvas.json_content = JSON.stringify({
      pipeline_attributes: {
        wizard_version: 1,
        source_type: this.configForm.value.sourceType,
        data_format: this.configForm.value.dataFormat,
        schedule: this.configForm.value.schedule || null,
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
        this.errMsg = err?.error?.message || 'Failed to create pipeline. Please try again.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
