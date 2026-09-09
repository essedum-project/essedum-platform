import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  GitHubRepository,
  AuthStatus,
  OAuthResponse,
  PushRequest,
  PullRequest,
  BranchToBranchPushRequest,
  BranchPushResponse
} from '../models/github.models';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly API_BASE = '/api/github';
  private readonly TOKEN_KEY = 'github_token';
  private authCheckSubscription?: Subscription;

  constructor(private http: HttpClient) { }

  private getStoredToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string): void {
    if (token && token.startsWith('gh')) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private clearStoredToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem('git_github_token'); // clear old key name if present
  }

  private githubHeaders(): { headers?: { [key: string]: string } } {
    const token = this.getStoredToken();
    return token ? { headers: { 'X-GitHub-Token': token } } : {};
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): Observable<OAuthResponse> {
    return this.http.get<OAuthResponse>(
      `${this.API_BASE}/oauth/authorize`,
      { withCredentials: true }
    );
  }

  /**
   * Check authentication status
   */
  checkAuthStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(
      `${this.API_BASE}/oauth/status`,
      { withCredentials: true }
    );
  }

  /**
   * Logout
   */
  logout(): Observable<any> {
    this.clearStoredToken();
    return this.http.post(
      `${this.API_BASE}/oauth/logout`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Get user's repositories
   */
  getRepositories(): Observable<GitHubRepository[]> {
    return this.http.get<GitHubRepository[]>(
      `${this.API_BASE}/repos`,
      { withCredentials: true, ...this.githubHeaders() }
    );
  }

  /**
   * Get branches for a repository
   */
  getBranches(repoName: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.API_BASE}/branches`,
      {
        params: { repo: repoName },
        withCredentials: true,
        ...this.githubHeaders()
      }
    );
  }

  /**
   * Push files to GitHub
   */
  pushToGitHub(request: PushRequest): Observable<string> {
    return this.http.post(
      `${this.API_BASE}/push`,
      request,
      {
        withCredentials: true,
        responseType: 'text',
        ...this.githubHeaders()
      }
    );
  }

  /**
   * Pull files from GitHub
   */
  pullFromGitHub(request: PullRequest): Observable<any> {
    return this.http.post(
      `${this.API_BASE}/pull`,
      request,
      { withCredentials: true, ...this.githubHeaders() }
    );
  }

  /**
   * Push code from source branch to destination branch
   */
  pushBranchToBranch(request: BranchToBranchPushRequest): Observable<BranchPushResponse> {
    return this.http.post<BranchPushResponse>(
      `${this.API_BASE}/push-branch-to-branch`,
      request,
      { withCredentials: true, ...this.githubHeaders() }
    );
  }

  /**
   * Save git configuration (repo, branch, etc.) to database
   */
  saveGitConfig(config: any): Observable<any> {
    return this.http.post(
      '/api/aip/git-configs/save',
      config,
      { withCredentials: true }
    );
  }

  /**
   * Get collaborators/reviewers for a repository
   */
  getCollaborators(repo: string): Observable<any> {
    return this.http.get<any>(
      `${this.API_BASE}/collaborators`,
      {
        params: { repo: repo },
        withCredentials: true,
        ...this.githubHeaders()
      }
    );
  }

  /**
   * Create a pull request
   */
  createPullRequest(request: {
    repoName: string;
    title: string;
    sourceBranch: string;
    targetBranch: string;
    reviewers?: string[];
  }): Observable<any> {
    return this.http.post<any>(
      `${this.API_BASE}/create-pull-request`,
      request,
      { withCredentials: true, ...this.githubHeaders() }
    );
  }

  /**
   * Open OAuth popup. Receives the GitHub token via postMessage from the callback
   * page (primary, stateless — works across AKS pods) and falls back to polling
   * /oauth/status (secondary, catches edge cases where postMessage is blocked).
   */
  initiateOAuthFlow(): Observable<AuthStatus> {
    return new Observable(observer => {
      this.getAuthorizationUrl().subscribe({
        next: (response) => {
          const popup = window.open(
            response.authorizationUrl,
            'GitHub Login',
            'width=600,height=700,left=100,top=100'
          );

          if (!popup) {
            observer.error({ message: 'Popup blocked. Please allow popups for this site.' });
            return;
          }

          let completed = false;

          // Primary path: receive token directly from the OAuth callback popup.
          // After storing the token, fetch /status once to get githubUsername so the
          // component can store git_username in sessionStorage.
          const messageHandler = (event: MessageEvent) => {
            if (event.data?.type === 'github-oauth-success' && event.data?.token) {
              const token = event.data.token as string;
              if (token.startsWith('gh')) {
                completed = true;
                this.storeToken(token);
                window.removeEventListener('message', messageHandler);
                this.authCheckSubscription?.unsubscribe();
                if (!popup.closed) { popup.close(); }
                this.checkAuthStatus().subscribe({
                  next: (status) => {
                    observer.next({ ...status, authenticated: true, githubToken: token });
                    observer.complete();
                  },
                  error: () => {
                    observer.next({ authenticated: true, sessionId: '', githubToken: token });
                    observer.complete();
                  }
                });
              }
            }
          };
          window.addEventListener('message', messageHandler);

          let pollCount = 0;
          const maxPolls = 60;

          // Fallback: poll /oauth/status in case postMessage was blocked.
          this.authCheckSubscription = interval(1000)
            .pipe(switchMap(() => this.checkAuthStatus()))
            .subscribe({
              next: (status) => {
                if (completed) { return; }
                if (status?.authenticated) {
                  completed = true;
                  window.removeEventListener('message', messageHandler);
                  this.authCheckSubscription?.unsubscribe();
                  if (status.githubToken) { this.storeToken(status.githubToken); }
                  if (!popup.closed) { popup.close(); }
                  observer.next(status);
                  observer.complete();
                  return;
                }

                pollCount++;
                if (popup.closed && !completed) {
                  window.removeEventListener('message', messageHandler);
                  this.authCheckSubscription?.unsubscribe();
                  observer.error({ message: 'Authentication cancelled. Login window was closed.' });
                  return;
                }
                if (pollCount >= maxPolls) {
                  completed = true;
                  window.removeEventListener('message', messageHandler);
                  this.authCheckSubscription?.unsubscribe();
                  if (!popup.closed) { popup.close(); }
                  observer.error({ message: 'Authentication timeout. Please try again.' });
                }
              },
              error: (error) => {
                window.removeEventListener('message', messageHandler);
                this.authCheckSubscription?.unsubscribe();
                if (popup && !popup.closed) { popup.close(); }
                observer.error(error);
              }
            });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Clean up subscriptions
   */
  ngOnDestroy() {
    this.authCheckSubscription?.unsubscribe();
  }
}
