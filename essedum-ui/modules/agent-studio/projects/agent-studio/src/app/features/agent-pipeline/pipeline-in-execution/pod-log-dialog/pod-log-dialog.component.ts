import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PodLogDialogData {
  pipelineName: string;
  logText: string;
}

@Component({
  selector: 'app-pod-log-dialog',
  templateUrl: './pod-log-dialog.component.html',
  styleUrls: ['./pod-log-dialog.component.scss'],
})
export class PodLogDialogComponent {
  copied = false;

  // Dynamic labels
  readonly TITLESUFFIX   = 'Pod Logs';
  readonly PANELTITLE    = 'Log Details';
  readonly PIPELINEKEY   = 'Pipeline';
  readonly LOGLABEL      = 'Log :';
  readonly EMPTYLOG      = 'No log content available.';
  readonly COPYTOOLTIP   = 'Copy to clipboard';
  readonly COPIEDTOOLTIP = 'Copied!';
  readonly CLOSETOOLTIP  = 'Close';

  get dialogTitle(): string {
    return `${this.data.pipelineName} — ${this.TITLESUFFIX}`;
  }

  constructor(
    public dialogRef: MatDialogRef<PodLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PodLogDialogData
  ) {}

  copyText(): void {
    navigator.clipboard.writeText(this.data.logText || '').then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
