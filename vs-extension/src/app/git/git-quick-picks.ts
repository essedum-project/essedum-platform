/**
 * Git Quick Pick helpers
 *
 * Repo picker, branch picker, commit-message input.
 * All user-facing strings come from MESSAGES.GITHUB.
 */

import * as vscode from 'vscode';
import { GitHubService } from '../../services/github.service';
import { GitHubAuthService } from '../../auth/services/github-auth.service';
import { extractRepoFromUrl } from '../../utils/git-utils';
import { GitHubRepository } from '../../interfaces/github.interfaces';

/**
 * Shows a QuickPick that lists the user's repos (requires auth) plus a
 * "Enter URL manually" escape hatch. Returns { repoName, repoUrl } or undefined
 * if the user cancelled.
 */
export async function pickRepository(
  github: GitHubService
): Promise<{ repoName: string; repoUrl: string } | undefined> {
  let repos: GitHubRepository[];
  try {
    repos = await github.getRepositories();
  } catch {
    repos = [];
  }

  const MANUAL_LABEL = '$(link) Enter repository URL…';
  const items: vscode.QuickPickItem[] = [
    { label: MANUAL_LABEL, description: 'type manually' },
    ...repos.map(r => ({
      label: r.fullName,
      description: r.private ? '$(lock) private' : '$(globe) public',
      detail: r.description || undefined,
    })),
  ];

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a GitHub repository',
    matchOnDescription: true,
    matchOnDetail: true,
  });
  if (!pick) { return undefined; }

  if (pick.label === MANUAL_LABEL) {
    return pickRepositoryByUrl();
  }

  const repo = repos.find(r => r.fullName === pick.label);
  if (!repo) { return undefined; }
  return { repoName: repo.fullName, repoUrl: repo.htmlUrl };
}

/**
 * Fallback: prompts for a raw GitHub HTTPS URL and validates it.
 */
export async function pickRepositoryByUrl(): Promise<{ repoName: string; repoUrl: string } | undefined> {
  const repoUrl = await vscode.window.showInputBox({
    prompt: 'Enter GitHub Repository URL',
    placeHolder: 'https://github.com/owner/repository',
    validateInput: (value) => {
      if (!value) { return 'Repository URL is required'; }
      try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'https:') { return 'Please enter a valid HTTPS GitHub repository URL'; }
        if (parsed.username || parsed.password) { return 'URL should not contain credentials'; }
        if (parsed.hostname !== 'github.com') { return 'Please enter a valid GitHub repository URL'; }
      } catch {
        return 'Please enter a valid GitHub repository URL';
      }
      return null;
    },
  });
  if (!repoUrl) { return undefined; }
  const repoName = extractRepoFromUrl(repoUrl);
  if (!repoName) {
    vscode.window.showErrorMessage('Could not parse repository name from URL');
    return undefined;
  }
  return { repoName, repoUrl };
}

/** Returns true if the error indicates a GitHub token rejection. */
function isTokenRejection(err: any): boolean {
  const msg: string = (err?.message || '').toLowerCase();
  return (
    msg.includes('rejected') ||
    msg.includes('bad credentials') ||
    msg.includes('unauthorized') ||
    msg.includes('401')
  );
}

/** Shows the branch picker QuickPick for a loaded branch list. */
async function showBranchPicker(
  branches: string[],
  repoName: string,
  preferred?: string
): Promise<string | undefined> {
  const items: vscode.QuickPickItem[] = branches.map(b => ({
    label: b,
    description: b === preferred ? '(previously used)' : undefined,
  }));

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: `Select a branch for ${repoName}`,
    matchOnDescription: true,
  });
  return pick?.label;
}

/**
 * Shows a QuickPick of branches for a repo. Highlights the preferred branch
 * (e.g. previously used one) if provided.
 *
 * When the GitHub token is rejected the user is prompted to set up a Personal
 * Access Token; the branch list is then retried automatically so no manual
 * entry is needed.
 */
export async function pickBranch(
  github: GitHubService,
  repoName: string,
  preferred?: string,
  githubAuth?: GitHubAuthService
): Promise<string | undefined> {
  // ── First attempt ─────────────────────────────────────────────────────────
  let branches: string[] = [];
  let firstError: any;

  try {
    branches = await github.getBranches(repoName);
  } catch (err: any) {
    firstError = err;
  }

  // ── Token rejection: set up PAT and retry automatically ───────────────────
  if (firstError && isTokenRejection(firstError) && githubAuth) {
    const detail = firstError?.message || 'GitHub rejected the current token';
    const choice = await vscode.window.showWarningMessage(
      `GitHub rejected the current token (${detail}). Set up a Personal Access Token to load branches automatically.`,
      'Set up GitHub Token',
      'Cancel'
    );

    if (choice !== 'Set up GitHub Token') { return undefined; }

    githubAuth.invalidateCachedSession();
    const ok = await githubAuth.signInWithPAT();
    if (!ok) { return undefined; }

    // Retry loading branches with the new PAT — automatic, no manual entry
    try {
      branches = await github.getBranches(repoName);
      firstError = undefined; // cleared — retry succeeded
    } catch (retryErr: any) {
      const retryChoice = await vscode.window.showErrorMessage(
        `Could not load branches — GitHub still rejected the token. ` +
        `Make sure you created a CLASSIC PAT (not fine-grained) at github.com → ` +
        `Settings → Developer settings → Personal access tokens → Tokens (classic), ` +
        `with the "repo" scope checked.`,
        'Try different token',
        'Dismiss'
      );
      if (retryChoice === 'Try different token' && githubAuth) {
        githubAuth.invalidateCachedSession();
        const ok2 = await githubAuth.signInWithPAT();
        if (!ok2) { return undefined; }
        try {
          branches = await github.getBranches(repoName);
          firstError = undefined;
        } catch {
          vscode.window.showErrorMessage(
            `Still could not load branches. Verify the repo "${repoName}" exists and the PAT has "repo" scope.`
          );
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  } else if (firstError) {
    // Non-token error (network, repo not found, etc.)
    vscode.window.showErrorMessage(
      `Could not load branches for ${repoName}: ${firstError.message || 'Unknown error'}`
    );
    return undefined;
  }

  // ── No branches returned ──────────────────────────────────────────────────
  if (!branches || branches.length === 0) {
    vscode.window.showErrorMessage(
      `No branches found for "${repoName}". ` +
      'Verify the repository exists and your token has access to it.'
    );
    return undefined;
  }

  // ── Show branch picker ────────────────────────────────────────────────────
  return showBranchPicker(branches, repoName, preferred);
}

/**
 * Prompts the user for a commit message with a sensible default.
 */
export async function promptCommitMessage(defaultMsg: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: 'Commit message',
    value: defaultMsg,
    ignoreFocusOut: true,
    validateInput: (v) => v?.trim() ? null : 'Commit message cannot be empty',
  });
}
