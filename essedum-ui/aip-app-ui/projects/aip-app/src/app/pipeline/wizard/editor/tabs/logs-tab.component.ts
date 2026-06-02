import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Services } from '../../../../services/service';
import { WizardPipelineModel } from '../pipeline-editor.component';

const ACTIVE_STATUSES   = new Set(['STARTED', 'RUNNING']);
const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'ERROR', 'STOPPED', 'CANCELLED']);

@Component({
  selector: 'app-logs-tab',
  template: `
    <div class="logs-tab">
      <header>
        <h3><mat-icon>terminal</mat-icon>&nbsp;Logs</h3>
        <div class="ctrls">
          <span *ngIf="jobStatus" class="status-chip" [class.chip-running]="isActive" [class.chip-done]="isSuccess" [class.chip-failed]="isFailed">
            <mat-icon *ngIf="isActive">pending</mat-icon>
            <mat-icon *ngIf="isSuccess">check_circle</mat-icon>
            <mat-icon *ngIf="isFailed">error</mat-icon>
            {{ jobStatus }}
          </span>
          <span *ngIf="submittedOn" class="submitted-on">Started: {{ submittedOn }}</span>
          <button mat-stroked-button (click)="clear()"><mat-icon>delete_sweep</mat-icon>&nbsp;Clear</button>
          <button mat-stroked-button (click)="refresh()"><mat-icon>refresh</mat-icon>&nbsp;Refresh</button>
        </div>
      </header>

      <!-- Polling indicator -->
      <div class="poll-hint" *ngIf="isActive">
        <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
        <span>Live logs — polling every 4 s&hellip;</span>
      </div>

      <!-- Terminal completion banners -->
      <div class="banner banner-done"   *ngIf="isSuccess"><mat-icon>check_circle</mat-icon>&nbsp;Training job completed successfully.</div>
      <div class="banner banner-failed" *ngIf="isFailed" ><mat-icon>error</mat-icon>&nbsp;Training job ended with status: {{ jobStatus }}.</div>

      <!-- No run yet -->
      <div class="empty-state" *ngIf="noJobs && !lines.length">
        <mat-icon>hourglass_empty</mat-icon>
        <p>No runs found for this training job yet.</p>
        <p class="hint">Click <strong>Run</strong> in the toolbar to start execution.</p>
      </div>

      <!-- Log area -->
      <pre class="log-area" *ngIf="lines.length">{{ lines.join('\n') }}</pre>

      <!-- Waiting for first log -->
      <div class="empty-state" *ngIf="!noJobs && isActive && !lines.length">
        <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        <p>Waiting for log output&hellip;</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; height:100%; }
    .logs-tab {
      padding: 20px 24px;
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      height: calc(100% - 40px);
      gap: 10px;
      box-sizing: border-box;
    }
    /* ── Header ── */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      flex-shrink: 0;
    }
    header h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 600;
      color: var(--lt-title, #111827);
      margin: 0;
    }
    header h3 mat-icon { color: #0ea5e9; font-size: 20px; height: 20px; width: 20px; }
    .ctrls { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    /* ── Stroked buttons adapt to theme ── */
    .ctrls button[mat-stroked-button] {
      color: var(--lt-btn-fg, #374151);
      border-color: var(--lt-btn-border, #d1d5db);
      font-size: 12px;
    }
    /* ── Status chip ── */
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
    }
    .status-chip mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .chip-running { background: var(--lt-chip-run-bg, #e0f2fe); color: var(--lt-chip-run-fg, #0369a1); }
    .chip-done    { background: var(--lt-chip-ok-bg,  #d1fae5); color: var(--lt-chip-ok-fg,  #065f46); }
    .chip-failed  { background: var(--lt-chip-err-bg, #fee2e2); color: var(--lt-chip-err-fg, #991b1b); }
    /* ── Submitted-on label ── */
    .submitted-on { font-size: 11px; color: var(--lt-muted, #6b7280); }
    /* ── Poll progress row ── */
    .poll-hint {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: var(--lt-muted, #6b7280);
      flex-shrink: 0;
    }
    .poll-hint mat-progress-bar { flex: 1; max-width: 200px; }
    /* ── Terminal banners ── */
    .banner {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      flex-shrink: 0;
    }
    .banner mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .banner-done   { background: var(--lt-banner-ok-bg,  #d1fae5); color: var(--lt-banner-ok-fg,  #065f46); }
    .banner-failed { background: var(--lt-banner-err-bg, #fee2e2); color: var(--lt-banner-err-fg, #991b1b); }
    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 10px;
      text-align: center;
      padding: 32px;
    }
    .empty-state mat-icon {
      font-size: 44px;
      height: 44px;
      width: 44px;
      color: var(--lt-muted, #9ca3af);
      opacity: .5;
    }
    .empty-state p { margin: 0; font-size: 14px; color: var(--lt-title, #374151); }
    .empty-state .hint { font-size: 12px; color: var(--lt-muted, #6b7280); }
    .empty-state strong { color: var(--lt-title, #374151); }
    /* ── Log pre area ── */
    .log-area {
      flex: 1;
      background: #0d1117;
      color: #a7f3d0;
      padding: 14px 16px;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow: auto;
      border-radius: 10px;
      margin: 0;
      white-space: pre-wrap;
      min-height: 160px;
    }
    /* ── Dark theme overrides ── */
    :host-context(body.header-dark-theme) {
      --lt-title:          #e6edf3;
      --lt-muted:          #8b949e;
      --lt-btn-fg:         #c9d1d9;
      --lt-btn-border:     #30363d;
      --lt-chip-run-bg:    #0c2d3e;
      --lt-chip-run-fg:    #7dd3fc;
      --lt-chip-ok-bg:     #0a2a1a;
      --lt-chip-ok-fg:     #6ee7b7;
      --lt-chip-err-bg:    #2c0a0a;
      --lt-chip-err-fg:    #fca5a5;
      --lt-banner-ok-bg:   #0a2a1a;
      --lt-banner-ok-fg:   #6ee7b7;
      --lt-banner-err-bg:  #2c0a0a;
      --lt-banner-err-fg:  #fca5a5;
    }
  `],
})
export class LogsTabComponent implements OnInit, OnDestroy {
  @Input() model: WizardPipelineModel;

  lines: string[] = [];
  jobStatus: string | null = null;
  submittedOn: string | null = null;
  jobId: string | null = null;
  noJobs = false;

  private pollTimer: any;

  constructor(private services: Services) {}

  /** On init: do a single one-shot fetch to display any existing run status.
   *  No interval is started here — polling only begins after Run is clicked. */
  ngOnInit(): void { this.poll(); }
  ngOnDestroy(): void { this.stopPolling(); }

  /** Called by the parent editor after the Run button is clicked and the pipeline starts. */
  startPolling(): void {
    this.stopPolling();
    this.poll();
    this.pollTimer = setInterval(() => this.poll(), 4000);
  }

  private stopPolling(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  private poll(): void {
    if (!this.model?.name) return;
    this.services.fetchInternalJobByName2(this.model.name, 0, 4).subscribe({
      next: (jobs: any[]) => {
        if (!Array.isArray(jobs) || jobs.length === 0) {
          this.noJobs = true;
          // No runs yet — stop polling to avoid repeated API calls and snackbars.
          // User can click Refresh to check again.
          this.stopPolling();
          return;
        }
        this.noJobs = false;
        const latest = [...jobs].sort((a, b) => {
          const da = a.submittedOn ? new Date(a.submittedOn).getTime() : 0;
          const db = b.submittedOn ? new Date(b.submittedOn).getTime() : 0;
          return db - da;
        })[0];
        this.jobId      = latest.jobId;
        this.jobStatus  = latest.jobStatus ?? latest.status ?? null;
        this.submittedOn = latest.submittedOn ? latest.submittedOn.split('+')[0] : null;
        if (this.jobId) { this.fetchLog(this.jobId, this.jobStatus ?? ''); }
        if (this.jobStatus && TERMINAL_STATUSES.has(this.jobStatus.toUpperCase())) {
          this.stopPolling();
        }
      },
      error: () => {
        // Stop polling on error to prevent repeated snackbar notifications.
        // The service layer already shows an error message; further polls would just repeat it.
        this.stopPolling();
      },
    });
  }

  private fetchLog(jobId: string, status: string): void {
    this.services.fetchInternalJob(jobId, 0, 0, status).subscribe({
      next: (resp: any) => {
        const data = (typeof resp === 'string') ? (() => { try { return JSON.parse(resp); } catch { return {}; } })() : (resp ?? {});
        const logText: string = data?.log ?? data?.consolelog ?? data?.output ?? data?.logs ?? '';
        if (logText) {
          this.lines = logText.split('\n').filter((l: string) => l.trim()).slice(-500);
        }
        const cs = data?.status ?? data?.jobStatus;
        if (cs) {
          this.jobStatus = cs;
          if (TERMINAL_STATUSES.has(cs.toUpperCase())) { this.stopPolling(); }
        }
      },
      error: () => { /* log fetch failure is non-fatal — job list status still shows */ },
    });
  }

  refresh(): void {
    this.lines = []; this.jobStatus = null; this.jobId = null;
    this.submittedOn = null; this.noJobs = false;
    this.startPolling();
  }

  clear(): void { this.lines = []; }

  get isActive():  boolean { return !!this.jobStatus && ACTIVE_STATUSES.has(this.jobStatus.toUpperCase()); }
  get isSuccess(): boolean { return this.jobStatus?.toUpperCase() === 'COMPLETED'; }
  get isFailed():  boolean { return ['FAILED','ERROR'].includes(this.jobStatus?.toUpperCase() ?? ''); }
}
