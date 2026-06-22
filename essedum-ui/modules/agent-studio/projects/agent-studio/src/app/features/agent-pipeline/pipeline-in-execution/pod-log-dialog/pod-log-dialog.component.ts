import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PodWatcherService } from '../../../services/pod-watcher.service';

export interface PodLogDialogData {
  pipelineName: string;
  pod_name:     string;
  namespace:    string;
}

@Component({
  selector: 'app-pod-log-dialog',
  templateUrl: './pod-log-dialog.component.html',
  styleUrls: ['./pod-log-dialog.component.scss'],
})
export class PodLogDialogComponent implements OnInit {
  copied  = false;
  loading = true;
  logText = '';

  // Dynamic labels
  readonly TITLESUFFIX   = 'Pod Logs';
  readonly PANELTITLE    = 'Log Details';
  readonly PIPELINEKEY   = 'Pipeline';
  readonly PODKEY        = 'Pod';
  readonly NAMESPACEKEY  = 'Namespace';
  readonly LOGLABEL      = 'Log :';
  readonly EMPTYLOG      = 'No log content available.';
  readonly COPYTOOLTIP   = 'Copy to clipboard';
  readonly COPIEDTOOLTIP = 'Copied!';
  readonly CLOSETOOLTIP   = 'Close';
  readonly REFRESHTOOLTIP = 'Refresh logs';
  readonly LOADINGLABEL  = 'Fetching pod logs…';

  get dialogTitle(): string {
    return `${this.data.pipelineName} — ${this.TITLESUFFIX}`;
  }

  constructor(
    public dialogRef: MatDialogRef<PodLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PodLogDialogData,
    private podWatcher: PodWatcherService
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.loading = true;
    this.logText  = '';
    this.podWatcher.getPodLogs(this.data.pod_name, this.data.namespace).subscribe({
      next: text => {
        this.logText = text;
        this.loading = false;
      },
      error: () => {
        this.logText = 'Failed to fetch logs. Check that the pod is Running.';
        this.loading = false;
      },
    });
  }

  copyText(): void {
    navigator.clipboard.writeText(this.logText || '').then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
