import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MtaasSchemaField, messagesForField } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-schema-form',
  templateUrl: './mtaas-schema-form.component.html',
  styleUrls: ['./mtaas-schema-form.component.scss'],
  standalone: false,
})
export class MtaasSchemaFormComponent {
  @Input() fields: MtaasSchemaField[] = [];
  @Input() form: FormGroup;
  @Input() submitted = false;

  errorsFor(key: string): string[] {
    return messagesForField(this.form?.get(key) ?? null, this.submitted);
  }
}
