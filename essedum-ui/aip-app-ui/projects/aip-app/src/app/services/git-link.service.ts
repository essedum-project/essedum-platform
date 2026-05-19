import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GitLinkValue } from '../pipeline/wizard/shared/pipeline-options.constants';

// Thin wrapper around the existing VibeGitHubController endpoints
// (sv/icip-lib-vibe). The wizards' Step 4 and the editor's Git tab call this.
// We deliberately do NOT introduce a new backend API surface for MVP — every
// method maps to an endpoint that already exists in production.
// Module-scoped (not root) because the 'envi' base-url token is supplied by
// AipModule, not the application root injector.
@Injectable()
export class GitLinkService {
  constructor(
    private http: HttpClient,
    @Inject('envi') private baseUrl: string,
  ) {}

  // ─── Push code to GitHub (session-based) ──────────────────────────────
  pushToGitHub(sessionId: string, payload: {
    repoUrl?: string;
    branch?: string;
    push_dir?: string;
    files?: string[];
    exclude_dirs?: string[];
  }): Observable<any> {
    const org = sessionStorage.getItem('organization');
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sessionId}/push-to-github`;
    return this.http.post(url, { org, ...payload });
  }

  // ─── Poll push status ─────────────────────────────────────────────────
  getStatus(sessionId: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    const url = `${this.baseUrl}/service/v1/vibe-coding/sessions/${sessionId}/github-status`;
    const params = new HttpParams().set('org', org || '');
    return this.http.get(url, { params }).pipe(
      catchError(() => of(null)),
    );
  }

  // ─── List previous GitHub push records for this org ───────────────────
  listConfigs(): Observable<any[]> {
    const org = sessionStorage.getItem('organization');
    const url = `${this.baseUrl}/service/v1/vibe-coding/github-configs`;
    const params = new HttpParams().set('org', org || '');
    return this.http.get<any[]>(url, { params }).pipe(
      catchError(() => of([])),
    );
  }

  // ─── Derive a default repo+filePath for a new pipeline ────────────────
  defaultLinkFor(name: string, kind: 'data-pipeline' | 'training-job'): GitLinkValue {
    const folder = kind === 'data-pipeline' ? 'data-pipelines' : 'training-jobs';
    const file   = kind === 'data-pipeline' ? 'pipeline.py'   : 'train.py';
    return {
      repo: '',
      branch: 'main',
      filePath: `${folder}/${name}/${file}`,
      syncStatus: 'unlinked',
    };
  }

  // ─── Commit & push: maps to push-to-github (creates session branch) ───
  commitAndPush(sessionId: string, repoUrl: string, branch: string, filePath: string,
                content: string, message: string): Observable<any> {
    // The existing backend writes the session working dir to a branch — it does
    // not yet support per-file content. We delegate to push-to-github with the
    // session's full directory, restricted to the single file via `files`.
    return this.pushToGitHub(sessionId, {
      repoUrl, branch,
      files: [filePath],
    }).pipe(
      map(resp => ({ ...resp, message, content })),
    );
  }
}
