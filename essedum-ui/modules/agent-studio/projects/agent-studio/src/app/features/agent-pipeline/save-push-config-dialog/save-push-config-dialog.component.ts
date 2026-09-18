import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SavePushFileItem {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  changedLines: number;
  preview: string;
}

export interface SavePushConfigDialogData {
  username: string;
  repoName: string;
  branch: string;
  sourceLabel: string;
  commitMessage: string;
  changedFiles: SavePushFileItem[];
}

export interface SavePushConfigDialogResult {
  confirmed: boolean;
  commitMessage: string;
}

@Component({
  selector: 'app-save-push-config-dialog',
  templateUrl: './save-push-config-dialog.component.html',
  styleUrls: ['./save-push-config-dialog.component.scss'],
  standalone: false,
})
export class SavePushConfigDialogComponent {
  commitMessage: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SavePushConfigDialogData,
    private dialogRef: MatDialogRef<SavePushConfigDialogComponent, SavePushConfigDialogResult>,
  ) {
    this.commitMessage = data.commitMessage || '';
  }

  cancel(): void {
    this.dialogRef.close({ confirmed: false, commitMessage: '' });
  }

  confirm(): void {
    this.dialogRef.close({
      confirmed: true,
      commitMessage: this.commitMessage.trim(),
    });
  }
}
