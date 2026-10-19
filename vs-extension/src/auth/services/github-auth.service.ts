/**
 * GitHub Authentication Service
 *
 * Token priority for silent calls (getToken(false)):
 *   1. Stored PAT  — most reliable, user explicitly granted repo scope
 *   2. VS Code built-in GitHub OAuth session
 *   3. In-memory cached session (last resort)
 *
 * Token priority for prompted calls (getToken(true) / signIn()):
 *   1. VS Code built-in GitHub OAuth (convenience – one click)
 *   2. In-memory cached session if OAuth returns nothing
 *   3. User pastes a PAT as final fallback
 *
 * Tokens are NEVER stored in globalState or logged.
 */

import * as vscode from 'vscode';
import { GITHUB, GITHUB_STORAGE_KEYS } from '../../constants/github-constants';
import { MESSAGES } from '../../messages/extension-messages';
import * as ExtensionUtils from '../../utils/extension-utils';

const logger = ExtensionUtils.createLogger('GitHubAuthService');

export class GitHubAuthService implements vscode.Disposable {
  private cachedSession: vscode.AuthenticationSession | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Returns a GitHub token.
   *
   * Silent path (promptUser=false):
   *   PAT from secrets → VS Code OAuth session → in-memory cached session
   *
   * Prompted path (promptUser=true):
   *   VS Code OAuth → in-memory cached session → PAT input box
   */
  async getToken(promptUser = false): Promise<string | undefined> {
    if (!promptUser) {
      // 1. Prefer the stored PAT — it has explicit scopes and is most reliable
      const pat = await this.context.secrets.get(GITHUB_STORAGE_KEYS.PAT);
      if (pat) { return pat; }

      // 2. Try VS Code's built-in GitHub auth silently
      try {
        const session = await vscode.authentication.getSession(
          GITHUB.AUTH_PROVIDER_ID,
          GITHUB.AUTH_SCOPES,
          { createIfNone: false, silent: true }
        );
        if (session) {
          this.cachedSession = session;
          await this.context.globalState.update(
            GITHUB_STORAGE_KEYS.LAST_GIT_USERNAME,
            session.account.label
          );
          return session.accessToken;
        }
      } catch (err) {
        logger.info('GitHub built-in auth provider unavailable (silent)');
      }

      // 3. Fall back to the in-memory cached session from the last sign-in
      if (this.cachedSession) {
        return this.cachedSession.accessToken;
      }

      return undefined;
    }

    // ── Prompted path ────────────────────────────────────────────────────────
    // 1. VS Code OAuth (one-click convenience, forceNewSession so we always get
    //    a session with the exact requested scopes and not a stale one)
    try {
      const session = await vscode.authentication.getSession(
        GITHUB.AUTH_PROVIDER_ID,
        GITHUB.AUTH_SCOPES,
        { createIfNone: true, forceNewSession: false }
      );
      if (session) {
        this.cachedSession = session;
        await this.context.globalState.update(
          GITHUB_STORAGE_KEYS.LAST_GIT_USERNAME,
          session.account.label
        );
        return session.accessToken;
      }
    } catch (err) {
      logger.info('GitHub built-in auth provider unavailable (prompted), trying PAT');
    }

    // 2. In-memory cached session
    if (this.cachedSession) {
      return this.cachedSession.accessToken;
    }

    // 3. Prompt the user to paste a PAT
    const entered = await vscode.window.showInputBox({
      prompt: MESSAGES.GITHUB.PAT_PROMPT,
      password: true,
      ignoreFocusOut: true
    });
    if (entered) {
      await this.context.secrets.store(GITHUB_STORAGE_KEYS.PAT, entered);
      return entered;
    }

    return undefined;
  }

  /**
   * Returns the cached GitHub username, or the stored fallback.
   */
  async getUsername(): Promise<string | undefined> {
    if (this.cachedSession) { return this.cachedSession.account.label; }
    return this.context.globalState.get<string>(GITHUB_STORAGE_KEYS.LAST_GIT_USERNAME);
  }

  /**
   * Prompts the user to sign in via VS Code OAuth (or PAT fallback).
   * @returns true if a token was obtained.
   */
  async signIn(): Promise<boolean> {
    this.cachedSession = undefined;
    const token = await this.getToken(true);
    const ok = !!token;
    await vscode.commands.executeCommand('setContext', 'essedum.githubSignedIn', ok);
    return ok;
  }

  /**
   * Prompts the user to enter a Personal Access Token, stores it, and clears
   * the VS Code OAuth cached session so the PAT is used going forward.
   *
   * Call this when the VS Code OAuth token has been rejected by GitHub so that
   * the user can provide an explicit PAT with the correct scopes.
   *
   * @returns true if the user entered a PAT.
   */
  async signInWithPAT(): Promise<boolean> {
    const entered = await vscode.window.showInputBox({
      prompt: 'Enter a GitHub Classic Personal Access Token with "repo" scope. Create one at: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)',
      placeHolder: 'ghp_...',
      password: true,
      ignoreFocusOut: true,
      validateInput: (v) => v?.trim() ? null : 'Token cannot be empty',
    });
    if (!entered) { return false; }

    // Store the PAT trimmed — prevents whitespace from causing rejection
    await this.context.secrets.store(GITHUB_STORAGE_KEYS.PAT, entered.trim());
    // Clear in-memory session so the stored PAT takes priority
    this.cachedSession = undefined;
    await vscode.commands.executeCommand('setContext', 'essedum.githubSignedIn', true);
    logger.info('GitHub PAT stored — will be used for all subsequent API calls');
    return true;
  }

  /**
   * Clears the in-memory cached session so the next getToken call fetches a fresh one.
   * Call this when the backend reports a token rejection.
   */
  invalidateCachedSession(): void {
    this.cachedSession = undefined;
    logger.info('GitHub cached session invalidated');
  }

  /**
   * Clears all stored GitHub credentials and updates the context key.
   */
  async signOut(): Promise<void> {
    await this.context.secrets.delete(GITHUB_STORAGE_KEYS.PAT);
    this.cachedSession = undefined;
    await this.context.globalState.update(GITHUB_STORAGE_KEYS.LAST_GIT_USERNAME, undefined);
    await vscode.commands.executeCommand('setContext', 'essedum.githubSignedIn', false);
    logger.info(MESSAGES.GITHUB.SIGN_OUT_DONE);
  }

  /** Returns true if any token source is available without prompting. */
  async isSignedIn(): Promise<boolean> {
    return !!(await this.getToken(false));
  }

  dispose(): void {}
}
