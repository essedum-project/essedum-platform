import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ApproveRejectDialogData {
  action: 'approved' | 'rejected';
  resourceType?: string;
  resourceName?: string;
}

export interface ApproveRejectDialogResult {
  comments: string;
}

@Component({
  selector: 'app-approve-reject-dialog',
  templateUrl: './approve-reject-dialog.component.html',
  styleUrls: ['./approve-reject-dialog.component.scss'],
  standalone: false,
})
export class ApproveRejectDialogComponent {
  comments = '';

  constructor(
    private readonly ref: MatDialogRef<ApproveRejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveRejectDialogData,
  ) {}

  get title(): string {
    const verb = this.data.action === 'approved' ? 'Approve' : 'Reject';
    const type = this.data.resourceType || 'Asset';
    const name = this.data.resourceName ? ` "${this.data.resourceName}"` : '';
    return `${verb} ${type}${name}`;
  }

  get valid(): boolean {
    return this.comments.trim().length > 0;
  }

  submit(): void {
    if (!this.valid) {
      return;
    }
    this.ref.close({ comments: this.comments.trim() } as ApproveRejectDialogResult);
  }

  cancel(): void {
    this.ref.close();
  }
}
