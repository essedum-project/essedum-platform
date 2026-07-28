import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GitHubService } from '../../../sharedModule/services/github.service';
import { GitHubRepository } from '../../../sharedModule/models/github.models';
import { GitLinkValue } from './pipeline-options.constants';

@Component({
    selector: 'app-git-link-step',
    template: `
    <div class="git-step">
      <h3 class="step-title"><mat-icon>cloud_sync</mat-icon> Push to GitHub</h3>

      <!-- Loading -->
      <div *ngIf="isLoading" class="git-loading">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Connecting to GitHub…</span>
      </div>

      <!-- Error -->
      <div *ngIf="errorMessage && !isLoading" class="git-error">
        <mat-icon>error_outline</mat-icon> {{ errorMessage }}
      </div>

      <!-- Not authenticated -->
      <div *ngIf="!isAuthenticated && !isLoading" class="git-auth-prompt">
        <div class="git-auth-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522
              0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554
              -.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907
              .096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956
              -.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371
              c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915
              .701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035
              0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12
              c0-6.077-4.922-11-11-11Z"/>
          </svg>
        </div>
        <p class="git-auth-desc">Authenticate with GitHub to specify where the generated pipeline code will be committed.</p>
        <button mat-flat-button color="primary" class="github-login-btn" (click)="login()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right:6px;vertical-align:middle">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53
              .63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
              0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
              1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07
              -1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38
              A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Login with GitHub
        </button>
      </div>

      <!-- Authenticated -->
      <div *ngIf="isAuthenticated && !isLoading" class="git-config">
        <!-- User info bar -->
        <div class="git-user-bar">
          <mat-icon class="git-user-icon">account_circle</mat-icon>
          <span class="git-username">{{ username }}</span>
          <button mat-button class="git-logout-btn" (click)="logout()">Logout</button>
        </div>

        <!-- Repository -->
        <mat-form-field appearance="fill" class="git-full">
          <mat-label>Repository</mat-label>
          <mat-select [formControl]="repoCtrl" (selectionChange)="onRepoChange($event.value)">
            <mat-option *ngFor="let r of repositories" [value]="r.fullName">{{ r.name }}</mat-option>
            <mat-option *ngIf="repositories.length === 0" [value]="null" disabled>No repositories found</mat-option>
          </mat-select>
          <mat-spinner matSuffix diameter="16" *ngIf="loadingRepos"></mat-spinner>
        </mat-form-field>

        <!-- Branch -->
        <mat-form-field appearance="fill" class="git-full">
          <mat-label>Branch</mat-label>
          <mat-select [formControl]="branchCtrl">
            <mat-option *ngFor="let b of branches" [value]="b">{{ b }}</mat-option>
            <mat-option *ngIf="!repoCtrl.value" [value]="null" disabled>Select a repository first</mat-option>
            <mat-option *ngIf="repoCtrl.value && branches.length === 0" [value]="null" disabled>No branches found</mat-option>
          </mat-select>
          <mat-spinner matSuffix diameter="16" *ngIf="loadingBranches"></mat-spinner>
        </mat-form-field>

        <!-- File path -->
        <mat-form-field appearance="fill" class="git-full">
          <mat-label>File path in repo</mat-label>
          <input matInput [formControl]="filePathCtrl" placeholder="data-pipelines/my-pipeline/pipeline.py">
          <mat-icon matSuffix>insert_drive_file</mat-icon>
        </mat-form-field>

        <!-- Commit message -->
        <div class="git-commit-row">
          <mat-checkbox [(ngModel)]="useCustomMessage" color="primary">Custom commit message</mat-checkbox>
        </div>
        <mat-form-field appearance="fill" class="git-full" *ngIf="useCustomMessage">
          <mat-label>Commit message</mat-label>
          <input matInput [(ngModel)]="commitMessage" placeholder="feat: add generated pipeline">
        </mat-form-field>
        <p class="git-commit-hint" *ngIf="!useCustomMessage">Default: <em>Automated commit — {{ today }}</em></p>
      </div>
    </div>
  `,
    styles: [`
    .git-step { padding: 4px 0; }
    .step-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 16px;
      mat-icon { color: #7c3aed; font-size: 16px !important; height: 16px !important; width: 16px !important; }
    }

    /* Loading */
    .git-loading { display:flex; align-items:center; gap:12px; padding:24px 0; color:#6b7280; }

    /* Error */
    .git-error { display:flex; align-items:center; gap:8px; color:#ef4444; padding:10px 12px;
      background:rgba(239,68,68,0.06); border-radius:8px; margin-bottom:12px; font-size:13px; }

    /* Auth prompt */
    .git-auth-prompt { display:flex; flex-direction:column; align-items:center; gap:14px; padding:24px 0; }
    .git-auth-icon { color:#9ca3af; }
    .git-auth-desc { color:#6b7280; font-size:13px; text-align:center; max-width:380px; margin:0; }
    .github-login-btn { border-radius:8px !important; font-weight:600; display:flex; align-items:center; }

    /* Config */
    .git-config { display:flex; flex-direction:column; gap:6px; }
    .git-user-bar { display:flex; align-items:center; gap:8px; padding:6px 0 10px;
      border-bottom:1px solid rgba(0,0,0,0.06); margin-bottom:8px; }
    .git-user-icon { color:#7c3aed; font-size:18px !important; height:18px !important; width:18px !important; }
    .git-username { font-weight:600; font-size:13px; color:#1f2937; flex:1; }
    .git-logout-btn { font-size:12px !important; color:#9ca3af !important; padding:0 4px !important; }
    .git-full { width:100%; }
    .git-commit-row { display:flex; align-items:center; gap:8px; margin:2px 0 4px; }
    .git-commit-hint { font-size:12px; color:#9ca3af; margin:0 0 8px; padding-left:2px; }

    /* Dark theme */
    :host-context(body.header-dark-theme) {
      .step-title { color:#cbd5e1; mat-icon { color:#a78bfa !important; } }
      .git-loading { color:#94a3b8; }
      .git-auth-icon { color:#475569; }
      .git-auth-desc { color:#94a3b8; }
      .git-user-bar { border-bottom-color:rgba(79,142,247,0.12); }
      .git-user-icon { color:#a78bfa !important; }
      .git-username { color:#e2e8f0; }
      .git-logout-btn { color:#64748b !important; }
      .git-commit-hint { color:#475569; }
    }
  `],
    standalone: false
})
export class GitLinkStepComponent implements OnInit {
  @Input() initialValue: GitLinkValue;
  @Output() valueChange  = new EventEmitter<GitLinkValue>();
  @Output() validityChange = new EventEmitter<boolean>();

  // Auth state
  isAuthenticated = false;
  isLoading = false;
  username = '';
  errorMessage = '';

  // Repo/branch state
  repositories: GitHubRepository[] = [];
  branches: string[] = [];
  loadingRepos = false;
  loadingBranches = false;

  // Form controls
  repoCtrl     = new FormControl('');
  branchCtrl   = new FormControl('');
  filePathCtrl = new FormControl('');

  // Commit message
  useCustomMessage = false;
  commitMessage = '';
  today = new Date().toLocaleDateString();

  constructor(private githubService: GitHubService) {}

  ngOnInit(): void {
    if (this.initialValue?.filePath) {
      this.filePathCtrl.setValue(this.initialValue.filePath);
    }

    // Subscribe to form controls to emit validity/value
    const emitChange = () => {
      const valid = this.isAuthenticated
        && !!this.repoCtrl.value
        && !!this.branchCtrl.value
        && !!this.filePathCtrl.value;
      this.validityChange.emit(valid);
      this.valueChange.emit({
        repo:   this.repoCtrl.value || '',
        branch: this.branchCtrl.value || '',
        filePath: this.filePathCtrl.value || '',
        syncStatus: 'unlinked',
      });
    };

    this.repoCtrl.valueChanges.subscribe(emitChange);
    this.branchCtrl.valueChanges.subscribe(emitChange);
    this.filePathCtrl.valueChanges.subscribe(emitChange);

    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isLoading = true;
    this.githubService.checkAuthStatus().subscribe({
      next: (status) => {
        this.isLoading = false;
        this.isAuthenticated = status.authenticated;
        if (status.authenticated) {
          this.username = status.githubUsername || status.username || '';
          this.loadRepositories();
        }
      },
      error: () => { this.isLoading = false; },
    });
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.githubService.initiateOAuthFlow().subscribe({
      next: (status) => {
        this.isLoading = false;
        this.isAuthenticated = status.authenticated !== false;
        this.username = status.githubUsername || status.username || '';
        this.loadRepositories();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'GitHub authentication failed. Please try again.';
      },
    });
  }

  logout(): void {
    this.githubService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.username = '';
        this.repositories = [];
        this.branches = [];
        this.repoCtrl.reset();
        this.branchCtrl.reset();
        this.validityChange.emit(false);
      },
      error: () => {
        this.isAuthenticated = false;
        this.validityChange.emit(false);
      },
    });
  }

  loadRepositories(): void {
    this.loadingRepos = true;
    this.githubService.getRepositories().subscribe({
      next: (repos) => {
        this.loadingRepos = false;
        this.repositories = repos || [];
        // Restore previously selected repo if any
        if (this.initialValue?.repo) {
          const match = repos.find(r => r.cloneUrl === this.initialValue.repo || r.fullName === this.initialValue.repo);
          if (match) {
            this.repoCtrl.setValue(match.fullName);
            this.onRepoChange(match.fullName);
          }
        }
      },
      error: () => { this.loadingRepos = false; },
    });
  }

  onRepoChange(fullName: string): void {
    this.branchCtrl.reset();
    this.branches = [];
    if (!fullName) return;
    this.loadingBranches = true;
    this.githubService.getBranches(fullName).subscribe({
      next: (branches) => {
        this.loadingBranches = false;
        this.branches = branches || [];
        if (this.branches.length > 0) {
          this.branchCtrl.setValue(
            this.branches.includes('main') ? 'main' :
            this.branches.includes('master') ? 'master' :
            this.branches[0]
          );
        }
      },
      error: () => { this.loadingBranches = false; },
    });
  }
}
