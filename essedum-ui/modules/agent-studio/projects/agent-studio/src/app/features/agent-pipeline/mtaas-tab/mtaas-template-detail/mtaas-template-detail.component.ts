import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MtaasResources, MtaasSchemaField, MtaasTemplate, schemaToFields } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-template-detail',
  templateUrl: './mtaas-template-detail.component.html',
  styleUrls: ['./mtaas-template-detail.component.scss'],
  standalone: false,
})
export class MtaasTemplateDetailComponent {
  readonly template: MtaasTemplate;
  readonly fields: MtaasSchemaField[];
  readonly resources: MtaasResources;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { template: MtaasTemplate },
    private dialogRef: MatDialogRef<MtaasTemplateDetailComponent>
  ) {
    this.template = data.template;
    this.fields = schemaToFields(data.template.paramSchema);
    this.resources = {
      gpus: data.template.defaultGpus,
      gpuType: data.template.defaultGpuType,
      cpu: data.template.defaultCpu,
      memory: data.template.defaultMemory,
    };
  }

  startRun(): void {
    this.dialogRef.close({ startTemplate: this.template });
  }

  close(): void {
    this.dialogRef.close();
  }
}
