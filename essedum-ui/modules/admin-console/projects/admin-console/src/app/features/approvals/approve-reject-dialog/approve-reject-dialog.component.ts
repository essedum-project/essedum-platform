import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ApproveRejectDialogData {
  action: 'approved' | 'rejected';
}

export interface ApproveRejectDialogResult {
  note: string;
}

@Component({
  selector: 'app-approve-reject-dialog',
  templateUrl: './approve-reject-dialog.component.html',
  standalone: false,
})
export class ApproveRejectDialogComponent {
  note = '';

  constructor(
    private readonly ref: MatDialogRef<ApproveRejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveRejectDialogData,
  ) {}

  get title(): string {
    return this.data.action === 'approved' ? 'Approve Asset' : 'Reject Asset';
  }

  get label(): string {
    return this.data.action === 'approved' ? 'Approval' : 'Rejection';
  }

  get valid(): boolean {
    return this.note.trim().length > 0;
  }

  submit(): void {
    if (!this.valid) {
      return;
    }
    this.ref.close({ note: this.note.trim() } as ApproveRejectDialogResult);
  }

  cancel(): void {
    this.ref.close();
  }
}
