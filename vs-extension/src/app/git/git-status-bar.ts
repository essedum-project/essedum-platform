/**
 * Git Status Bar Item
 *
 * Shows the active session branch / PR number in the VS Code status bar.
 * Click → essedum.github.showSessionActions quick pick.
 */

import * as vscode from 'vscode';
import { SessionBranchState } from '../../interfaces/github.interfaces';
import { GITHUB_COMMANDS } from '../../constants/github-constants';

export class GitStatusBarItem implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = GITHUB_COMMANDS.SHOW_SESSION_ACTIONS;
  }

  /**
   * Updates the status bar text/tooltip to reflect the current session state.
   * Pass undefined to hide the item.
   */
  update(state?: SessionBranchState, pendingCount = 0): void {
    if (!state) {
      this.item.hide();
      return;
    }

    const short = (b: string) => (b.length > 30 ? `${b.slice(0, 27)}…` : b);

    if (state.branchCreationStatus === 'creating') {
      this.item.text    = '$(sync~spin) Creating branch…';
      this.item.tooltip = 'Creating session branch';
    } else if (state.branchCreationStatus === 'failed') {
      this.item.text    = '$(warning) Essedum Git';
      this.item.tooltip = 'Session branch creation failed. Click for actions.';
    } else if (state.prStatus === 'merged') {
      this.item.text    = `$(git-merge) #${state.prNumber} merged`;
      this.item.tooltip = new vscode.MarkdownString(
        `**PR #${state.prNumber}** merged into \`${state.mainBranch}\``
      );
    } else if (state.prStatus === 'open') {
      this.item.text    = `$(git-pull-request) #${state.prNumber} • ${short(state.sessionBranch)}`;
      this.item.tooltip = this.buildTooltip(state, pendingCount);
    } else if (state.sessionBranch) {
      const dot = pendingCount > 0 ? ' $(circle-filled)' : '';
      this.item.text    = `$(git-branch) ${short(state.sessionBranch)}${dot}`;
      this.item.tooltip = this.buildTooltip(state, pendingCount);
    } else {
      this.item.text    = `$(git-branch) Essedum: ${state.repoName}`;
      this.item.tooltip = new vscode.MarkdownString(
        `**Repo:** ${state.repoName}\n\n**Base:** ${state.mainBranch}`
      );
    }

    this.item.show();
  }

  private buildTooltip(state: SessionBranchState, pendingCount: number): vscode.MarkdownString {
    const lines = [
      `**Repo:** ${state.repoName}`,
      `**Base:** \`${state.mainBranch}\``,
      `**Session:** \`${state.sessionBranch || '*(not created yet)*'}\``,
    ];
    if (state.prStatus === 'open' && state.prNumber) {
      lines.push(`**PR:** [#${state.prNumber}](${state.prUrl || ''})`);
    }
    if (pendingCount > 0) {
      lines.push(`**Pending:** ${pendingCount} file(s)`);
    }
    const md = new vscode.MarkdownString(lines.join('\n\n'));
    md.isTrusted = true;
    return md;
  }

  dispose(): void {
    this.item.dispose();
  }
}
