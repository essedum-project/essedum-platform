import { Component, Input } from '@angular/core';

/**
 * Displays the current Git context for the editor session:
 * repository name, main branch, session branch, and PR status.
 * All data is passed in via @Input — this component is purely presentational.
 */
@Component({
  selector: 'app-git-info-panel',
  templateUrl: './git-info-panel.component.html',
  styleUrls: ['./git-info-panel.component.scss'],
  standalone: false,
})
export class GitInfoPanelComponent {
  @Input() repoName: string = '';
  @Input() mainBranch: string = '';
  @Input() sessionBranch: string = '';
  @Input() sessionBranchStatus: 'creating' | 'ready' | 'none' = 'none';
  @Input() prStatus: 'none' | 'open' | 'merged' = 'none';
  @Input() prNumber: number | null = null;

  get sessionBranchLabel(): string {
    if (!this.sessionBranch) return '—';
    return this.sessionBranch;
  }

  get prLabel(): string {
    if (this.prStatus === 'open') return `Raised #${this.prNumber ?? ''}`;
    if (this.prStatus === 'merged') return 'Merged';
    return 'None';
  }

  get prBadgeClass(): string {
    if (this.prStatus === 'open') return 'pr-badge pr-badge--open';
    if (this.prStatus === 'merged') return 'pr-badge pr-badge--merged';
    return 'pr-badge pr-badge--none';
  }
}
