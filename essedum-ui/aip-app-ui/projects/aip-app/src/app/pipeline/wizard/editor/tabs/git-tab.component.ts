import { Component, Input, OnInit } from '@angular/core';
import { Services } from '../../../../services/service';
import { GitLinkService } from '../../../../services/git-link.service';
import { GitLinkValue } from '../../shared/pipeline-options.constants';
import { WizardPipelineModel } from '../pipeline-editor.component';

@Component({
  selector: 'app-git-tab',
  template: `
    <div class="git-tab">
      <header class="git-head">
        <mat-icon>cloud_sync</mat-icon>
        <div>
          <h3>{{ link?.repo || 'No repository linked' }}</h3>
          <p class="muted">Branch: <b>{{ link?.branch || '—' }}</b> · {{ link?.filePath || '—' }}</p>
        </div>
        <span class="badge" [class]="badgeClass">{{ link?.syncStatus || 'unlinked' }}</span>
      </header>

      <div class="git-body">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Commit message</mat-label>
          <input matInput [(ngModel)]="commitMessage" placeholder="Update pipeline">
        </mat-form-field>

        <div class="git-actions">
          <button mat-stroked-button (click)="pull()" [disabled]="busy">
            <mat-icon>cloud_download</mat-icon>&nbsp;Pull
          </button>
          <button mat-flat-button color="primary" (click)="commitAndPush()" [disabled]="!canPush || busy">
            <mat-icon>cloud_upload</mat-icon>&nbsp;Commit &amp; Push
          </button>
        </div>

        <section class="history" *ngIf="history?.length">
          <h4>Previous pushes</h4>
          <table class="hist-table">
            <thead><tr><th>Branch</th><th>Repo</th><th>Status</th><th>When</th></tr></thead>
            <tbody>
              <tr *ngFor="let h of history">
                <td>{{ h.branchName }}</td>
                <td class="ellip">{{ h.repoUrl || h.repoName }}</td>
                <td>{{ h.status }}</td>
                <td>{{ h.modifiedDate || h.createdDate || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .git-tab { padding: 24px; max-width: 920px; margin: 0 auto; }
    .git-head { display:flex; align-items:center; gap:14px; padding:16px; background:#fff;
                border:1px solid #e5e7eb; border-radius:10px; margin-bottom:14px;
                mat-icon { color:#7c3aed; font-size:24px; height:24px; width:24px; }
                h3 { margin:0; font-size:15px; color:#111827; }
                .muted { margin:2px 0 0; font-size:12px; color:#6b7280; } }
    .badge { margin-left:auto; padding: 4px 10px; border-radius: 999px; font-size:11px; font-weight:600;
             text-transform: uppercase; }
    .badge.synced { background:#dcfce7; color:#15803d; }
    .badge.unlinked { background:#fee2e2; color:#b91c1c; }
    .badge.dirty { background:#fef3c7; color:#a16207; }
    .git-body { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; }
    .full { width:100%; }
    .git-actions { display:flex; gap:8px; }
    .history { margin-top:18px; }
    .history h4 { color:#374151; font-size:13px; margin: 0 0 8px; }
    .hist-table { width:100%; border-collapse: collapse; font-size: 12px; }
    .hist-table th, .hist-table td { padding:6px 8px; border-bottom: 1px solid #f1f5f9; text-align:left; }
    .ellip { max-width: 320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  `],
})
export class GitTabComponent implements OnInit {
  @Input() model: WizardPipelineModel;

  link: GitLinkValue;
  commitMessage = '';
  busy = false;
  history: any[] = [];

  constructor(private gitSvc: GitLinkService, private services: Services) {}

  get canPush(): boolean {
    return !!(this.link?.repo && this.link?.branch && this.link?.filePath);
  }
  get badgeClass(): string {
    return `badge ${this.link?.syncStatus || 'unlinked'}`;
  }

  ngOnInit(): void {
    this.link = this.model?.pipelineAttrs?.git
      || this.gitSvc.defaultLinkFor(this.model.name, this.model.kind);
    this.commitMessage = `Update ${this.model.filename}`;
    this.refreshHistory();
  }

  private refreshHistory(): void {
    this.gitSvc.listConfigs().subscribe(list => {
      const me = (this.model.name || '').toLowerCase();
      this.history = (list || []).filter(h =>
        (h.sessionId || '').toLowerCase().includes(me) ||
        (h.branchName || '').toLowerCase().includes(me));
    });
  }

  pull(): void {
    // Pull is a server-side feature we expose only when backend gains it.
    this.services.message('Pull is read-only in this MVP — push to update remote.', 'success');
  }

  commitAndPush(): void {
    if (!this.canPush) return;
    this.busy = true;
    const sessionId = `${this.model.kind}-${this.model.name}`.replace(/[^a-zA-Z0-9-_]/g, '-');
    this.gitSvc.commitAndPush(
      sessionId,
      this.link.repo,
      this.link.branch,
      this.link.filePath,
      this.model.code,
      this.commitMessage,
    ).subscribe({
      next: () => {
        this.link = { ...this.link, syncStatus: 'synced' };
        this.services.message('Pushed to GitHub', 'success');
        this.busy = false;
        this.refreshHistory();
      },
      error: () => {
        this.services.message('Push failed', 'error');
        this.busy = false;
      },
    });
  }
}
