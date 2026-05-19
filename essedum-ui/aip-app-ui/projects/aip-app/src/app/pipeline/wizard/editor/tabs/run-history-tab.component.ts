import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Services } from "../../../../services/service";
import { WizardPipelineModel } from "../pipeline-editor.component";

@Component({
  selector: "app-run-history-tab",
  template: `
    <div class="rh-tab">
      <header class="rh-head">
        <h3><mat-icon>history</mat-icon>&nbsp;Run history</h3>
        <span class="rh-spacer"></span>
        <mat-spinner *ngIf="loading" diameter="18" class="rh-spinner"></mat-spinner>
        <button mat-stroked-button (click)="refresh()" [disabled]="loading">
          <mat-icon>refresh</mat-icon>&nbsp;Refresh
        </button>
      </header>

      <table class="rh-table" *ngIf="!loading && runs.length; else emptyTpl">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Task</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Finished</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of runs">
            <td class="mono">{{ r.jobid || r.id || '—' }}</td>
            <td class="mono">{{ r.agenttaskname || '—' }}</td>
            <td>
              <span class="status-badge" [ngClass]="statusClass(r.jobstatus || r.status)">
                {{ r.jobstatus || r.status || '—' }}
              </span>
            </td>
            <td>{{ r.submittedOn || '—' }}</td>
            <td>{{ r.finishtime || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <ng-template #emptyTpl>
        <div class="empty" *ngIf="!loading">
          <mat-icon>inbox</mat-icon>
          <p>No runs yet. Use the <strong>Run</strong> button in the header to start the pipeline.</p>
        </div>
        <div class="empty" *ngIf="loading">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Loading run history…</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
    :host { display:block; background: var(--rh-page-bg, #f8fafc); min-height: 100%; }

    .rh-tab { padding: 24px; max-width: 980px; margin: 0 auto; }

    .rh-head {
      display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
      h3 {
        display: flex; align-items: center; gap: 6px;
        font-size: 15px; color: var(--rh-title, #1f2937); margin: 0;
        mat-icon { color: #6366f1; }
      }
    }
    .rh-spacer { flex: 1; }
    ::ng-deep .rh-spinner { display: inline-block; }

    .rh-table {
      width: 100%; border-collapse: collapse;
      background: var(--rh-card-bg, #ffffff);
      border: 1px solid var(--rh-border, #e5e7eb);
      border-radius: 10px; overflow: hidden;
    }
    .rh-table th, .rh-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--rh-row-border, #f1f5f9);
      text-align: left; font-size: 13px;
      color: var(--rh-cell, #374151);
    }
    .rh-table tr:last-child td { border-bottom: none; }
    .rh-table th {
      background: var(--rh-thead-bg, #f9fafb);
      color: var(--rh-thead-fg, #6b7280);
      font-size: 11px; text-transform: uppercase; letter-spacing: .05em; font-weight: 600;
    }

    .mono { font-family: "Fira Code", monospace; font-size: 12px; color: var(--rh-mono, #475569); }

    .status-badge {
      display: inline-block; padding: 2px 9px; border-radius: 999px;
      font-size: 11px; font-weight: 600; text-transform: capitalize;
    }
    .status-badge.success, .status-badge.finished, .status-badge.completed { background: #dcfce7; color: #15803d; }
    .status-badge.running, .status-badge.started, .status-badge.pending    { background: #dbeafe; color: #1d4ed8; }
    .status-badge.failed, .status-badge.error                               { background: #fee2e2; color: #b91c1c; }
    .status-badge.stopped, .status-badge.cancelled                          { background: #fef9c3; color: #92400e; }

    .empty {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 56px 24px; text-align: center;
      background: var(--rh-card-bg, #ffffff);
      border: 1px dashed var(--rh-border, #e5e7eb); border-radius: 12px;
      color: var(--rh-empty-fg, #94a3b8);
    }
    ::ng-deep .empty mat-icon, ::ng-deep .empty .mat-icon {
      font-size: 40px; height: 40px; width: 40px; color: var(--rh-empty-fg, #94a3b8);
    }
    .empty p { margin: 0; font-size: 13px; color: var(--rh-empty-fg, #94a3b8); }
    .empty strong { color: var(--rh-cell, #374151); }

    :host-context(body.header-dark-theme) {
      --rh-page-bg:    #0d1117;
      --rh-title:      #e6edf3;
      --rh-card-bg:    #161b22;
      --rh-border:     #30363d;
      --rh-row-border: #21262d;
      --rh-thead-bg:   #0d1117;
      --rh-thead-fg:   #8b949e;
      --rh-cell:       #c9d1d9;
      --rh-mono:       #8b949e;
      --rh-empty-fg:   #6e7681;
    }

    /* Dark theme: force all buttons and icons in the header to be visible */
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button.mat-mdc-button-base,
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button.mat-stroked-button,
    :host-context(body.header-dark-theme) ::ng-deep .rh-head .mat-mdc-outlined-button {
      color: #c9d1d9 !important;
      border-color: #30363d !important;
    }
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button .mat-icon,
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button .mdc-button__label mat-icon {
      color: #c9d1d9 !important;
    }
    :host-context(body.header-dark-theme) ::ng-deep .rh-head h3 mat-icon,
    :host-context(body.header-dark-theme) ::ng-deep .rh-head h3 .mat-icon {
      color: #818cf8 !important;
    }
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button:disabled,
    :host-context(body.header-dark-theme) ::ng-deep .rh-head button[disabled] {
      color: #6e7681 !important;
      border-color: #21262d !important;
    }
    `,
  ],
})
export class RunHistoryTabComponent implements OnChanges {
  @Input() model: WizardPipelineModel;

  runs: any[] = [];
  loading = false;

  constructor(private services: Services) {}

  ngOnChanges(_: SimpleChanges): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.model?.name) return;
    this.loading = true;
    this.runs = [];

    // First get total count, then fetch the page
    this.services.getJobsByStreamingServiceLen(this.model.name).subscribe({
      next: (total: any) => {
        const count = Number(total) || 0;
        if (count === 0) {
          this.loading = false;
          return;
        }
        this.services.fetchInternalJobByName(this.model.name, 0, 20).subscribe({
          next: (resp: any) => {
            const list: any[] = Array.isArray(resp) ? resp : (resp?.content ?? []);
            // Normalize date strings
            this.runs = list.slice(0, 20).map((j) => ({
              ...j,
              submittedOn: j.submittedOn ? j.submittedOn.split("+")[0].replace("T", " ") : null,
              finishtime:  j.finishtime  ? j.finishtime.split("+")[0].replace("T", " ")  : null,
            }));
            this.loading = false;
          },
          error: () => { this.loading = false; },
        });
      },
      error: () => {
        // Fallback: try fetching directly even without count
        this.services.fetchInternalJobByName(this.model.name, 0, 20).subscribe({
          next: (resp: any) => {
            const list: any[] = Array.isArray(resp) ? resp : [];
            this.runs = list.slice(0, 20).map((j) => ({
              ...j,
              submittedOn: j.submittedOn ? j.submittedOn.split("+")[0].replace("T", " ") : null,
              finishtime:  j.finishtime  ? j.finishtime.split("+")[0].replace("T", " ")  : null,
            }));
            this.loading = false;
          },
          error: () => { this.loading = false; },
        });
      },
    });
  }

  statusClass(status: string): string {
    return (status || "").toLowerCase().trim();
  }
}
