
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title class="confirm-title">Delete Confirmation</h2>
    <mat-dialog-content class="confirm-content">
      <ng-container *ngIf="entityName; else defaultDeleteMessage">
        Do you want to delete
        <span class="entity-name">{{ entityName }}</span>?
      </ng-container>
      <ng-template #defaultDeleteMessage>
        Do you want to delete?
      </ng-template>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="confirm-actions">
      <button mat-raised-button class="confirm-btn" (click)="dialogRef.close('delete')">Yes</button>
      <button mat-raised-button class="confirm-btn" (click)="dialogRef.close('cancel')">No</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .confirm-actions {
        gap: 10px;
      }

      .entity-name {
        font-weight: 700;
        color: inherit;
      }

      :host-context(body.header-dark-theme) .confirm-title,
      :host-context(body.header-dark-theme) .confirm-content {
        color: #e6efff !important;
      }

      :host-context(body.header-dark-theme) .entity-name {
        color: #ff7da3 !important;
      }

      :host-context(body.header-dark-theme) .confirm-btn {
        color: #e6efff !important;
        background: rgba(44, 73, 122, 0.35) !important;
        border: 1px solid rgba(84, 129, 202, 0.45) !important;
      }

      :host-context(body.header-dark-theme) .confirm-btn:hover {
        background: rgba(55, 90, 148, 0.45) !important;
      }
    `,
  ],
  standalone: false
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { entityName?: string }
  ) {}

  get entityName(): string {
    return this.data?.entityName?.trim() || '';
  }
 
}
