/**
 * Session Branch Manager
 *
 * State machine that manages the lifecycle of a session branch for one pipeline:
 *   Idle → Linked → Creating → Ready/PrOpen → Pushing → ...
 *
 * Key invariants:
 *   - Auto-push fires only AFTER a successful save-to-DB (onFileSavedToServer)
 *   - Push files are always fetched from GET /api/aip/folder/list, never local disk
 *   - Debounced 1 500 ms; pushes are serialized per pipeline via a promise queue
 *   - Session state persisted in workspaceState so sessions survive extension reload
 *   - Token never stored in SessionBranchState
 */

import * as vscode from 'vscode';
import {
  SessionBranchState,
  PrStatus,
  BranchCreationStatus,
  SessionHistoryEntry,
} from '../interfaces/github.interfaces';
import { GitHubService } from './github.service';
import { GitHubAuthService } from '../auth/services/github-auth.service';
import { GitStatusBarItem } from '../app/git/git-status-bar';
import {
  buildSessionBranchName,
  buildSessionStateKey,
  parseCommitShaFromPushResponse,
  generateSessionId,
  sanitizeCommitMessage,
} from '../utils/git-utils';
import {
  GITHUB,
  GITHUB_STORAGE_KEYS,
  GITHUB_CONTEXT_KEYS,
  SESSION_HISTORY_ACTIONS,
} from '../constants/github-constants';
import { MESSAGES } from '../messages/extension-messages';
import * as ExtensionUtils from '../utils/extension-utils';

const logger = ExtensionUtils.createLogger('SessionBranchManager');

export class SessionBranchManager implements vscode.Disposable {
  // Active in-memory sessions keyed by pipelineKey
  private sessions = new Map<string, SessionBranchState>();

  // Pending file paths per pipeline (cleared on each flush)
  private pendingSaves = new Map<string, Set<string>>();

  // Debounce timers per pipeline
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  // Serialized push queues per pipeline
  private pushQueues = new Map<string, Promise<void>>();

  // Re-entrancy guard for ensureSessionBranch
  private branchInFlight = new Map<string, Promise<boolean>>();

  // PR polling interval handle
  private prPollHandle: NodeJS.Timeout | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly github: GitHubService,
    private readonly githubAuth: GitHubAuthService,
    private readonly statusBar: GitStatusBarItem
  ) {}

  // ─── Config helpers ───────────────────────────────────────────────────────

  private get cfg() {
    const ws = vscode.workspace.getConfiguration('essedum.github');
    return {
      autoPushOnSave:  ws.get<boolean>('autoPushOnSave', true),
      autoRaisePr:     ws.get<boolean>('autoRaisePr', true),
      debounceMs:      Math.max(500, Math.min(30000, ws.get<number>('autoPushDebounceMs', GITHUB.AUTO_PUSH_DEBOUNCE_MS))),
      prPollMs:        ws.get<number>('prPollIntervalMs', GITHUB.PR_POLL_INTERVAL_MS),
      promptOnEnd:     ws.get<boolean>('promptOnSessionEnd', true),
    };
  }

  // ─── State persistence ────────────────────────────────────────────────────

  private persistState(state: SessionBranchState): void {
    state.updatedAt = new Date().toISOString();
    const key = buildSessionStateKey(state.gitUsername, state.sessionId, state.pipelineKey);
    this.context.workspaceState.update(key, state);
    this.sessions.set(state.pipelineKey, state);
    this.updateContextKeys(state);
    this.statusBar.update(state, this.pendingCount(state.pipelineKey));
  }

  private restoreState(pipelineKey: string): SessionBranchState | undefined {
    // Check in-memory first
    const cached = this.sessions.get(pipelineKey);
    if (cached) { return cached; }
    // Scan workspaceState for a matching key
    const prefix = `${GITHUB_STORAGE_KEYS.SESSION_BRANCH_STATE_PREFIX}:`;
    // workspaceState keys() is not available in all VS Code versions — use a known key pattern
    const sessionId = this.context.workspaceState.get<string>(
      `${GITHUB_STORAGE_KEYS.SESSION_ID}:${pipelineKey}`
    );
    if (!sessionId) { return undefined; }
    const gitUser = this.context.globalState.get<string>(GITHUB_STORAGE_KEYS.LAST_GIT_USERNAME) || 'user';
    const stateKey = buildSessionStateKey(gitUser, sessionId, pipelineKey);
    return this.context.workspaceState.get<SessionBranchState>(stateKey);
  }

  private updateContextKeys(state: SessionBranchState): void {
    const active = state.branchCreationStatus === 'ready';
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.SESSION_BRANCH_ACTIVE, active);
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.PR_OPEN, state.prStatus === 'open');
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.HAS_UNPUSHED_CHANGES,
      (this.pendingCount(state.pipelineKey) > 0));
  }

  private pendingCount(pipelineKey: string): number {
    return this.pendingSaves.get(pipelineKey)?.size ?? 0;
  }

  // ─── Session lifecycle ────────────────────────────────────────────────────

  /**
   * Called from handleViewAdk() after files are written to disk.
   * Loads or creates the SessionBranchState for this pipeline.
   * Feature is dormant (returns quietly) if no git config exists.
   */
  async startSession(pipelineName: string, org: string): Promise<void> {
    const pipelineKey = pipelineName;

    try {
      // Try to restore a persisted session
      let state = this.restoreState(pipelineKey);

      if (!state) {
        // Look up git config — if absent, feature is dormant for this agent
        const gitConfig = await this.github.getGitConfig(pipelineName, org);
        if (!gitConfig?.repo) {
          logger.info(`No git config for ${pipelineName} — session branch dormant`);
          return;
        }

        // Obtain or create a sessionId
        const sessionIdKey = `${GITHUB_STORAGE_KEYS.SESSION_ID}:${pipelineKey}`;
        let sessionId = this.context.workspaceState.get<string>(sessionIdKey);
        if (!sessionId) {
          sessionId = generateSessionId();
          await this.context.workspaceState.update(sessionIdKey, sessionId);
        }

        const gitUser = await this.githubAuth.getUsername() || 'user';

        state = {
          sessionId,
          pipelineKey,
          org,
          repoName: gitConfig.repo,
          mainBranch: gitConfig.bname || 'main',
          sessionBranch: '',
          gitUsername: gitUser,
          prStatus: 'none',
          prNumber: null,
          lastCommitId: '',
          branchCreationStatus: 'pending',
          updatedAt: new Date().toISOString(),
        };
      }

      this.persistState(state);

      // If we already have a branch, refresh the PR status
      if (state.sessionBranch && state.branchCreationStatus === 'ready') {
        void this.refreshPrStatus(pipelineKey);
      }

      logger.info(`Session started for ${pipelineName}: branch=${state.sessionBranch || '(pending)'}`);

    } catch (err: any) {
      logger.warn('startSession error (non-fatal):', err?.message);
    }
  }

  // ─── Save hook ────────────────────────────────────────────────────────────

  /**
   * Called by pipeline-agent.ts after every successful save-to-DB.
   * Debounces and enqueues the push.
   */
  onFileSavedToServer(pipelineName: string, filePath: string): void {
    const state = this.sessions.get(pipelineName);
    if (!state) { return; }
    if (!this.cfg.autoPushOnSave) { return; }

    // Accumulate pending files
    if (!this.pendingSaves.has(pipelineName)) {
      this.pendingSaves.set(pipelineName, new Set());
    }
    this.pendingSaves.get(pipelineName)!.add(filePath);
    this.statusBar.update(state, this.pendingCount(pipelineName));

    // Debounce
    const existing = this.debounceTimers.get(pipelineName);
    if (existing) { clearTimeout(existing); }
    const timer = setTimeout(() => {
      this.debounceTimers.delete(pipelineName);
      void this.flushPush(pipelineName);
    }, this.cfg.debounceMs);
    this.debounceTimers.set(pipelineName, timer);
  }

  // ─── Branch creation ──────────────────────────────────────────────────────

  /**
   * Idempotent — safe to call multiple times; uses a re-entrancy guard.
   * Returns true if the session branch is (or becomes) ready.
   */
  async ensureSessionBranch(pipelineKey: string): Promise<boolean> {
    const state = this.sessions.get(pipelineKey);
    if (!state) { return false; }
    if (state.branchCreationStatus === 'ready') { return true; }

    // Re-entrancy guard
    const inflight = this.branchInFlight.get(pipelineKey);
    if (inflight) { return inflight; }

    const work = this._doCreateBranch(state);
    this.branchInFlight.set(pipelineKey, work);
    const result = await work;
    this.branchInFlight.delete(pipelineKey);
    return result;
  }

  private async _doCreateBranch(state: SessionBranchState): Promise<boolean> {
    state.branchCreationStatus = 'creating';
    this.persistState(state);
    vscode.window.setStatusBarMessage(MESSAGES.GITHUB.SESSION_BRANCH_CREATING, 5000);

    try {
      const branchName = buildSessionBranchName(
        state.sessionId,
        state.pipelineKey,
        state.gitUsername
      );

      const resp = await this.github.createBranch({
        repoName: state.repoName,
        branchName,
        sourceBranch: state.mainBranch,
      });

      if (!resp.success) {
        state.branchCreationStatus = 'failed';
        this.persistState(state);
        vscode.window.showErrorMessage(MESSAGES.GITHUB.BRANCH_CREATE_FAILED + 'server returned success=false');
        return false;
      }

      state.sessionBranch        = resp.branchName;
      state.lastCommitId         = resp.commitSha;
      state.branchCreationStatus = 'ready';
      this.persistState(state);
      vscode.window.setStatusBarMessage(MESSAGES.GITHUB.SESSION_BRANCH_READY(resp.branchName), 5000);

      if (!resp.alreadyExisted && this.cfg.autoRaisePr) {
        void this.seedSessionHistoryAndAutoRaisePr(state.pipelineKey);
      } else {
        void this.refreshPrStatus(state.pipelineKey);
      }
      return true;

    } catch (err: any) {
      state.branchCreationStatus = 'failed';
      this.persistState(state);
      vscode.window.showErrorMessage(MESSAGES.GITHUB.BRANCH_CREATE_FAILED + (err?.message || ''));
      return false;
    }
  }

  // ─── Push ─────────────────────────────────────────────────────────────────

  /**
   * Serialized push: enqueued so concurrent saves produce one commit each
   * (no interleaved requests for the same pipeline).
   */
  flushPush(pipelineKey: string, customMessage?: string): Promise<void> {
    const existing = this.pushQueues.get(pipelineKey) ?? Promise.resolve();
    const next = existing.then(() => this._doPush(pipelineKey, customMessage));
    this.pushQueues.set(pipelineKey, next.catch(() => {}));
    return next;
  }

  private async _doPush(pipelineKey: string, customMessage?: string): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state) { return; }

    if (!(await this.ensureSessionBranch(pipelineKey))) { return; }

    const changed = [...(this.pendingSaves.get(pipelineKey) ?? [])];
    this.pendingSaves.get(pipelineKey)?.clear();

    if (changed.length === 0 && !customMessage) { return; }

    // Build files from server — never local disk (AD-GH7)
    const files = await this.buildPushFiles(pipelineKey);
    if (!files || files.length === 0) { return; }

    const totalBytes = files.reduce((s, f) => s + (f.content?.length ?? 0), 0);
    if (totalBytes > GITHUB.MAX_PUSH_PAYLOAD_BYTES) {
      vscode.window.showErrorMessage(`Push skipped: payload ${(totalBytes / 1024 / 1024).toFixed(1)} MB exceeds 25 MB limit`);
      return;
    }

    const actor = state.gitUsername || 'vscode';
    const commitMessage = sanitizeCommitMessage(
      customMessage || `${MESSAGES.GITHUB.AUTO_PUSH_PREFIX} [${changed.join(', ')}]`
    );

    const sessionHistoryEntry: SessionHistoryEntry = {
      actor,
      source: 'vscode',
      action: SESSION_HISTORY_ACTIONS.FILE_SAVE as 'file-save',
      message: commitMessage,
      filesChanged: changed,
      timestamp: new Date().toISOString(),
    };

    try {
      const rawResult = await this.github.push({
        repoName: state.repoName,
        branch: state.sessionBranch,
        commitMessage,
        files,
        sessionHistoryEntry,
      });

      const sha = parseCommitShaFromPushResponse(rawResult) ?? '';
      state.lastCommitId = sha || state.lastCommitId;
      this.persistState(state);

      vscode.window.showInformationMessage(
        MESSAGES.GITHUB.PUSH_SUCCESS(files.length, state.sessionBranch, sha.slice(0, 7) || '?'),
        ...(state.prStatus !== 'open' ? [MESSAGES.GITHUB.RAISE_PR] : [MESSAGES.GITHUB.VIEW_PR])
      ).then(choice => {
        if (choice === MESSAGES.GITHUB.RAISE_PR) { void this.raisePullRequest(pipelineKey); }
        if (choice === MESSAGES.GITHUB.VIEW_PR && state.prUrl) {
          vscode.env.openExternal(vscode.Uri.parse(state.prUrl));
        }
      });

      void this.refreshPrStatus(pipelineKey);

    } catch (err: any) {
      // Restore pending files so they are included in the next push
      const pending = this.pendingSaves.get(pipelineKey) ?? new Set<string>();
      changed.forEach(f => pending.add(f));
      this.pendingSaves.set(pipelineKey, pending);
      vscode.window.showErrorMessage(MESSAGES.GITHUB.PUSH_FAILED + (err?.message || ''));
    }
  }

  /**
   * Fetches all files for a pipeline from the server (GET /api/aip/folder/list).
   * Returns null if the fetch fails.
   */
  private async buildPushFiles(pipelineKey: string): Promise<Array<{ path: string; fileName: string; id?: number | string; content: string }> | null> {
    try {
      // Re-use the stored ADK context for org
      const adkContext = this.context.globalState.get<any>('adkContext');
      const org = adkContext?.organization || '';

      // We delegate to GitHubService-level: the backend returns the file list
      // which is the same data returned by listAdkFiles() in PipelineAgentService.
      // We get it here by calling the folder/list endpoint directly.
      const { getApiEndpoints } = require('../constants/api-config');
      const { makeSecureRequest } = require('../constants/api-config');
      const endpoints = getApiEndpoints();
      const url = `${endpoints.FOLDER_LIST}/${pipelineKey}/${org}`;

      const result = await makeSecureRequest('GET', url, this.context, {
        headers: {
          authorization: `Bearer ${adkContext?.token || ''}`,
          project:       String(adkContext?.project?.id || ''),
          projectname:   String(adkContext?.project?.name || org),
          roleid:        String(adkContext?.role?.id || ''),
          rolename:      String(adkContext?.role?.name || ''),
        },
      });

      const data = result?.data;
      if (!Array.isArray(data)) { return []; }

      return data.map((f: any) => ({
        path:     f.filePath || f.path || f.fileName,
        fileName: f.fileName || (f.filePath || '').split('/').pop() || '',
        id:       f.id,
        content:  f.filescript || f.content || '',
      }));
    } catch (err: any) {
      logger.warn('buildPushFiles error:', err?.message);
      return null;
    }
  }

  // ─── Pull Request ─────────────────────────────────────────────────────────

  private async seedSessionHistoryAndAutoRaisePr(pipelineKey: string): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state) { return; }

    try {
      const files = await this.buildPushFiles(pipelineKey);
      if (files && files.length > 0) {
        const actor = state.gitUsername || 'vscode';
        await this.github.push({
          repoName: state.repoName,
          branch: state.sessionBranch,
          commitMessage: MESSAGES.GITHUB.SESSION_START_COMMIT,
          files,
          sessionHistoryEntry: {
            actor,
            source: 'vscode',
            action: SESSION_HISTORY_ACTIONS.SESSION_START as 'session-start',
            message: MESSAGES.GITHUB.SESSION_START_COMMIT,
            filesChanged: files.map(f => f.path),
            timestamp: new Date().toISOString(),
          },
        });
      }

      const resp = await this.github.createPullRequest({
        repoName: state.repoName,
        sourceBranch: state.sessionBranch,
        targetBranch: state.mainBranch,
        title: `Merge ${state.sessionBranch} into ${state.mainBranch}`,
        body: MESSAGES.GITHUB.AUTO_PR_BODY(state.pipelineKey, 'VS Code'),
      });

      state.prStatus = 'open';
      state.prNumber = resp.pullRequestNumber;
      state.prUrl    = resp.pullRequestUrl;
      this.persistState(state);

      const msg = MESSAGES.GITHUB.PR_RAISED(resp.pullRequestNumber);
      vscode.window.showInformationMessage(msg, MESSAGES.GITHUB.PR_OPEN_IN_BROWSER).then(choice => {
        if (choice && state.prUrl) {
          vscode.env.openExternal(vscode.Uri.parse(state.prUrl));
        }
      });

    } catch (err: any) {
      logger.warn('seedSessionHistoryAndAutoRaisePr error:', err?.message);
      void this.refreshPrStatus(pipelineKey);
    }
  }

  /**
   * Manually raises a PR for the current session branch.
   * Guards: branch must be ready, at least one commit pushed, no open PR.
   */
  async raisePullRequest(pipelineKey: string, customTitle?: string, customBody?: string): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state) {
      vscode.window.showWarningMessage(MESSAGES.GITHUB.NO_SESSION_BRANCH);
      return;
    }

    if (state.branchCreationStatus !== 'ready') {
      vscode.window.showWarningMessage(MESSAGES.GITHUB.NO_SESSION_BRANCH);
      return;
    }

    if (state.prStatus === 'open') {
      const choice = await vscode.window.showInformationMessage(
        MESSAGES.GITHUB.PR_ALREADY_OPEN,
        MESSAGES.GITHUB.VIEW_PR
      );
      if (choice && state.prUrl) {
        vscode.env.openExternal(vscode.Uri.parse(state.prUrl));
      }
      return;
    }

    const title = customTitle || await vscode.window.showInputBox({
      prompt: 'Pull Request title',
      value: `Merge ${state.sessionBranch} into ${state.mainBranch}`,
      ignoreFocusOut: true,
    });
    if (!title) { return; }

    const body = customBody || `Automated PR for Essedum agent **${state.pipelineKey}** opened from VS Code.`;

    try {
      const resp = await this.github.createPullRequest({
        repoName: state.repoName,
        sourceBranch: state.sessionBranch,
        targetBranch: state.mainBranch,
        title,
        body,
      });

      state.prStatus = 'open';
      state.prNumber = resp.pullRequestNumber;
      state.prUrl    = resp.pullRequestUrl;
      this.persistState(state);

      vscode.window.showInformationMessage(
        MESSAGES.GITHUB.PR_RAISED(resp.pullRequestNumber),
        MESSAGES.GITHUB.PR_OPEN_IN_BROWSER
      ).then(choice => {
        if (choice && state.prUrl) {
          vscode.env.openExternal(vscode.Uri.parse(state.prUrl));
        }
      });

    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to create PR: ${err?.message || ''}`);
    }
  }

  async refreshPrStatus(pipelineKey: string): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state || !state.sessionBranch) { return; }

    try {
      const status = await this.github.getPullRequestStatus(
        state.repoName,
        state.sessionBranch,
        state.mainBranch
      );
      state.prStatus = status.prStatus;
      state.prNumber = status.pullRequestNumber ?? state.prNumber;
      if (status.pullRequestUrl) { state.prUrl = status.pullRequestUrl; }
      this.persistState(state);
    } catch { /* non-fatal */ }
  }

  // ─── Commit & Push (manual) ───────────────────────────────────────────────

  /**
   * Manual commit & push with custom message prompt.
   * Cancels the debounce timer and flushes immediately.
   */
  async commitAndPush(pipelineKey: string): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state) {
      vscode.window.showWarningMessage(MESSAGES.GITHUB.REPO_NOT_LINKED);
      return;
    }

    const defaultMsg = MESSAGES.GITHUB.COMMIT_MSG_PLACEHOLDER(state.pipelineKey);
    const message = await vscode.window.showInputBox({
      prompt: 'Commit message',
      value: defaultMsg,
      ignoreFocusOut: true,
      validateInput: v => v?.trim() ? null : 'Commit message cannot be empty',
    });
    if (!message) { return; }

    // Cancel pending debounce
    const timer = this.debounceTimers.get(pipelineKey);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(pipelineKey);
    }

    await this.flushPush(pipelineKey, sanitizeCommitMessage(message));
  }

  // ─── End session ──────────────────────────────────────────────────────────

  /**
   * Ends the session for a pipeline. Optionally prompts the user.
   */
  async endSession(
    pipelineKey: string,
    reason: 'switch-pipeline' | 'folder-removed' | 'explicit' | 'logout' | 'deactivate' = 'explicit'
  ): Promise<void> {
    const state = this.sessions.get(pipelineKey);
    if (!state) { return; }

    // If PR is already open, just clear in-memory state — no prompt needed
    if (state.prStatus === 'open') {
      this._clearInMemorySession(pipelineKey);
      return;
    }

    // If there are commits pushed and user should be prompted
    if (state.lastCommitId && this.cfg.promptOnEnd && reason !== 'deactivate' && reason !== 'logout') {
      const choice = await vscode.window.showWarningMessage(
        MESSAGES.GITHUB.END_SESSION_PROMPT(state.sessionBranch),
        { modal: true },
        'Raise PR',
        'Keep for Later',
        'Discard Session'
      );

      if (choice === 'Raise PR') {
        await this.raisePullRequest(pipelineKey);
        this._clearInMemorySession(pipelineKey);
        return;
      }
      if (choice === 'Keep for Later') {
        this._clearInMemorySession(pipelineKey);
        return;
      }
      if (choice === 'Discard Session') {
        this._discardSession(pipelineKey, state);
        return;
      }
      // User dismissed the modal → keep for later
      this._clearInMemorySession(pipelineKey);
      return;
    }

    this._clearInMemorySession(pipelineKey);
  }

  private _clearInMemorySession(pipelineKey: string): void {
    const timer = this.debounceTimers.get(pipelineKey);
    if (timer) { clearTimeout(timer); }
    this.debounceTimers.delete(pipelineKey);
    this.pendingSaves.delete(pipelineKey);
    this.sessions.delete(pipelineKey);
    this.statusBar.update(undefined);
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.SESSION_BRANCH_ACTIVE, false);
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.PR_OPEN, false);
    vscode.commands.executeCommand('setContext', GITHUB_CONTEXT_KEYS.HAS_UNPUSHED_CHANGES, false);
  }

  private _discardSession(pipelineKey: string, state: SessionBranchState): void {
    // Remove from workspaceState — remote branch is NOT deleted (per AD-GH9)
    const key = buildSessionStateKey(state.gitUsername, state.sessionId, state.pipelineKey);
    this.context.workspaceState.update(key, undefined);
    const sessionIdKey = `${GITHUB_STORAGE_KEYS.SESSION_ID}:${pipelineKey}`;
    this.context.workspaceState.update(sessionIdKey, undefined);
    this._clearInMemorySession(pipelineKey);
  }

  // ─── Getters for external use ─────────────────────────────────────────────

  getState(pipelineKey: string): SessionBranchState | undefined {
    return this.sessions.get(pipelineKey);
  }

  hasActiveSession(pipelineKey: string): boolean {
    const s = this.sessions.get(pipelineKey);
    return !!s && s.branchCreationStatus === 'ready';
  }

  // ─── Dispose ──────────────────────────────────────────────────────────────

  dispose(): void {
    // Cancel all debounce timers
    this.debounceTimers.forEach(t => clearTimeout(t));
    this.debounceTimers.clear();
    if (this.prPollHandle) { clearInterval(this.prPollHandle); }
  }
}
