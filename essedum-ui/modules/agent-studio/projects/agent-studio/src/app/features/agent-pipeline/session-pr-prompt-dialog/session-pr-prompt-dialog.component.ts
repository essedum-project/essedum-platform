import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SessionPrPromptDialogData {
  repoName: string;
  /** The per-session branch that received the saved changes. */
  sourceBranch: string;
  /** The originally active branch the session branch was derived from. */
  targetBranch: string;
  /** Explicit main branch name (same as targetBranch, exposed for template clarity). */
  mainBranch?: string;
  /** Current PR status; shown if a PR was already raised. */
  prStatus?: 'none' | 'open' | 'merged';
  /** 'raise-pr': full PR creation form; 'navigate-away': pending-changes warning */
  mode?: 'raise-pr' | 'navigate-away';
  /** Pre-filled PR title (editable by user). */
  prTitle?: string;
  /** PR body/description (editable by user). */
  prDescription?: string;
  /** Short commit SHA shown as context. */
  commitSha?: string;
  /** GitHub username of the author. */
  username?: string;
}

export type SessionPrPromptAction = 'raise-pr' | 'skip' | 'discard';

export interface SessionPrPromptDialogResult {
  action: SessionPrPromptAction;
  prTitle?: string;
  prDescription?: string;
}

@Component({
  selector: 'app-session-pr-prompt-dialog',
  templateUrl: './session-pr-prompt-dialog.component.html',
  styleUrls: ['./session-pr-prompt-dialog.component.scss'],
  standalone: false,
})
export class SessionPrPromptDialogComponent implements OnInit {
  isCreatingPr = false;
  prTitleValue = '';
  prDescriptionValue = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SessionPrPromptDialogData,
    private dialogRef: MatDialogRef<SessionPrPromptDialogComponent, SessionPrPromptDialogResult>,
  ) {}

  ngOnInit(): void {
    this.prTitleValue =
      this.data.prTitle ||
      `Merge ${this.data.sourceBranch} into ${this.displayMainBranch}`;
    this.prDescriptionValue = this.data.prDescription || '';
  }

  get displayMainBranch(): string {
    return this.data.mainBranch || this.data.targetBranch || 'main';
  }

  get prAlreadyOpen(): boolean {
    return this.data.prStatus === 'open';
  }

  /** True when opened from the "Raise PR" toolbar button — shows the full PR form. */
  get isPrMode(): boolean {
    return this.data.mode === 'raise-pr';
  }

  get shortCommitSha(): string {
    return this.data.commitSha ? this.data.commitSha.slice(0, 8) : '';
  }

  skip(): void {
    this.dialogRef.close({ action: 'skip' });
  }

  later(): void {
    this.skip();
  }

  discard(): void {
    this.dialogRef.close({ action: 'discard' });
  }

  raisePr(): void {
    this.dialogRef.close({
      action: 'raise-pr',
      prTitle: this.prTitleValue.trim() || undefined,
      prDescription: this.prDescriptionValue.trim() || undefined,
    });
  }
}
