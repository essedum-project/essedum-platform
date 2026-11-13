import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { RoleMenu } from '../../../core/api-models';

// Edit/add a single live sidebar item for a role (usm_constant). Only the
// top-level label/icon/url are editable here; any nested children in the
// stored JSON are preserved untouched by the backend on save.
@Component({
  selector: 'app-role-menu-dialog',
  templateUrl: './role-menu-dialog.component.html',
  styleUrls: ['./role-menu-dialog.component.scss'],
  standalone: false,
})
export class RoleMenuDialogComponent {
  label = this.existing?.label ?? '';
  icon = this.existing?.icon ?? '';
  url = this.existing?.url ?? '';

  readonly isEdit: boolean;

  constructor(
    private readonly ref: MatDialogRef<RoleMenuDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly existing: RoleMenu | null,
  ) {
    this.isEdit = !!existing;
  }

  save(): void {
    if (!this.label.trim()) {
      return;
    }
    this.ref.close({
      label: this.label.trim(),
      icon: this.icon?.trim() || null,
      url: this.url?.trim() || null,
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
