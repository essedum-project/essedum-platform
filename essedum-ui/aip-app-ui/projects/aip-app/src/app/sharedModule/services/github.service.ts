import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
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
  private authCheckSubscription?: Subscription;

  constructor(private http: HttpClient) { }

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
      { withCredentials: true }
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
        withCredentials: true
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
        responseType: 'text'
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
      { withCredentials: true }
    );
  }

  /**
   * Push code from source branch to destination branch
   * This performs a merge/copy operation from source to destination
   */
  pushBranchToBranch(request: BranchToBranchPushRequest): Observable<BranchPushResponse> {
    return this.http.post<BranchPushResponse>(
      `${this.API_BASE}/push-branch-to-branch`,
      request,
      { withCredentials: true }
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
   * @param repo - Repository name in format 'owner/repo'
   * Returns array of collaborators with various possible field formats
   */
  getCollaborators(repo: string): Observable<any> {
    return this.http.get<any>(
      `${this.API_BASE}/collaborators`,
      {
        params: { repo: repo },
        withCredentials: true
      }
    );
  }

  /**
   * Create a pull request
   * @param request - Pull request details
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
      { withCredentials: true }
    );
  }

  /**
   * Open OAuth popup and poll for authentication
   */
  initiateOAuthFlow(): Observable<AuthStatus> {
    return new Observable(observer => {
      this.getAuthorizationUrl().subscribe({
        next: (response) => {
          // Open popup window
          const popup = window.open(
            response.authorizationUrl,
            'GitHub Login',
            'width=600,height=700,left=100,top=100'
          );

          if (!popup) {
            observer.error({ message: 'Popup blocked. Please allow popups for this site.' });
            return;
          }

          let pollCount = 0;
          const maxPolls = 60; // Maximum 60 seconds

          // Poll for authentication status and check if popup is closed
          this.authCheckSubscription = interval(1000)
            .pipe(
              switchMap(() => {
                // Check if popup was closed by user
                if (popup.closed) {
                  this.authCheckSubscription?.unsubscribe();
                  observer.error({ message: 'Authentication cancelled. Login window was closed.' });
                  return [];
                }
                
                pollCount++;
                
                // Check for timeout
                if (pollCount >= maxPolls) {
                  this.authCheckSubscription?.unsubscribe();
                  if (!popup.closed) {
                    popup.close();
                  }
                  observer.error({ message: 'Authentication timeout. Please try again.' });
                  return [];
                }
                
                return this.checkAuthStatus();
              })
            )
            .subscribe({
              next: (status) => {
                if (status && status.authenticated) {
                  this.authCheckSubscription?.unsubscribe();
                  if (!popup.closed) {
                    popup.close();
                  }
                  observer.next(status);
                  observer.complete();
                }
              },
              error: (error) => {
                this.authCheckSubscription?.unsubscribe();
                if (popup && !popup.closed) {
                  popup.close();
                }
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