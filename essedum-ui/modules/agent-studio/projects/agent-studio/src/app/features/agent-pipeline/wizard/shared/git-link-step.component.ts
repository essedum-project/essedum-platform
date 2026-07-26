import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GitHubService } from '../../../sharedModule/services/github.service';
import { GitHubRepository } from '../../../sharedModule/models/github.models';

export interface GitLinkValue {
  repo: string;
  branch: string;
  filePath: string;
  syncStatus?: string;
}

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
          <mat-icon style="font-size:48px;width:48px;height:48px">code</mat-icon>
        </div>
        <p class="git-auth-desc">Authenticate with GitHub to specify where the generated pipeline code will be committed.</p>
        <button mat-flat-button color="primary" class="github-login-btn" (click)="login()">
          Login with GitHub
        </button>
      </div>

      <!-- Authenticated -->
      <div *ngIf="isAuthenticated && !isLoading" class="git-config">
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
    .git-loading { display:flex; align-items:center; gap:12px; padding:24px 0; color:#6b7280; }
    .git-error { display:flex; align-items:center; gap:8px; color:#ef4444; padding:10px 12px;
      background:rgba(239,68,68,0.06); border-radius:8px; margin-bottom:12px; font-size:13px; }
    .git-auth-prompt { display:flex; flex-direction:column; align-items:center; gap:14px; padding:24px 0; }
    .git-auth-icon { color:#9ca3af; }
    .git-auth-desc { color:#6b7280; font-size:13px; text-align:center; max-width:380px; margin:0; }
    .github-login-btn { border-radius:8px !important; font-weight:600; }
    .git-config { display:flex; flex-direction:column; gap:6px; }
    .git-user-bar { display:flex; align-items:center; gap:8px; padding:6px 0 10px;
      border-bottom:1px solid rgba(0,0,0,0.06); margin-bottom:8px; }
    .git-user-icon { color:#7c3aed; font-size:18px !important; height:18px !important; width:18px !important; }
    .git-username { font-weight:600; font-size:13px; color:#1f2937; flex:1; }
    .git-logout-btn { font-size:12px !important; color:#9ca3af !important; padding:0 4px !important; }
    .git-full { width:100%; }

    :host-context(body.header-dark-theme) {
      .step-title { color:#cbd5e1; mat-icon { color:#a78bfa !important; } }
      .git-loading { color:#94a3b8; }
      .git-auth-icon { color:#475569; }
      .git-auth-desc { color:#94a3b8; }
      .git-user-bar { border-bottom-color:rgba(79,142,247,0.12); }
      .git-user-icon { color:#a78bfa !important; }
      .git-username { color:#e2e8f0; }
      .git-logout-btn { color:#64748b !important; }
    }
  `],
  standalone: false
})
export class GitLinkStepLocalComponent implements OnInit {
  @Input() initialValue: GitLinkValue;
  @Output() valueChange = new EventEmitter<GitLinkValue>();
  @Output() validityChange = new EventEmitter<boolean>();

  isAuthenticated = false;
  isLoading = false;
  username = '';
  errorMessage = '';

  repositories: GitHubRepository[] = [];
  branches: string[] = [];
  loadingRepos = false;
  loadingBranches = false;

  repoCtrl = new FormControl('');
  branchCtrl = new FormControl('');
  filePathCtrl = new FormControl('');

  constructor(private githubService: GitHubService) {}

  ngOnInit(): void {
    if (this.initialValue?.filePath) {
      this.filePathCtrl.setValue(this.initialValue.filePath);
    }

    const emitChange = () => {
      const valid = this.isAuthenticated
        && !!this.repoCtrl.value
        && !!this.branchCtrl.value
        && !!this.filePathCtrl.value;
      this.validityChange.emit(valid);
      this.valueChange.emit({
        repo: this.repoCtrl.value || '',
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
    this.githubService.getAuthorizationUrl().subscribe({
      next: (res) => {
        // Open OAuth in new window
        const authWindow = window.open(res.authorizationUrl, '_blank', 'width=600,height=700');
        // Poll for auth completion
        const pollInterval = setInterval(() => {
          this.githubService.checkAuthStatus().subscribe({
            next: (status) => {
              if (status.authenticated) {
                clearInterval(pollInterval);
                this.isLoading = false;
                this.isAuthenticated = true;
                this.username = status.githubUsername || status.username || '';
                this.loadRepositories();
              }
            },
            error: () => {},
          });
        }, 2000);
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (!this.isAuthenticated) {
            this.isLoading = false;
            this.errorMessage = 'Authentication timed out. Please try again.';
          }
        }, 120000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'GitHub authentication failed.';
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
