import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Secret } from '../../../core/api-models';

@Component({
  selector: 'app-secret-dialog',
  templateUrl: './secret-dialog.component.html',
  standalone: false,
})
export class SecretDialogComponent {
  isEdit = !!this.existing;
  key = this.existing?.key ?? '';
  value = '';
  showValue = false;

  constructor(
    private readonly ref: MatDialogRef<SecretDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly existing: Secret | null,
  ) {}

  save(): void {
    if (!this.key.trim() || !this.value.trim()) {
      return;
    }
    this.ref.close({ key: this.key.trim(), value: this.value });
  }

  cancel(): void {
    this.ref.close();
  }
}
