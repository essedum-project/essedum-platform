import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import {
  GitHubRepository,
  AuthStatus,
  OAuthResponse,
  PushRequest
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
            observer.error('Popup blocked. Please allow popups for this site.');
            return;
          }

          // Poll for authentication every second
          this.authCheckSubscription = interval(1000)
            .pipe(
              switchMap(() => this.checkAuthStatus()),
              take(30) // Maximum 30 seconds
            )
            .subscribe({
              next: (status) => {
                if (status.authenticated) {
                  this.authCheckSubscription?.unsubscribe();
                  popup?.close();
                  observer.next(status);
                  observer.complete();
                }
              },
              error: (error) => {
                this.authCheckSubscription?.unsubscribe();
                popup?.close();
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