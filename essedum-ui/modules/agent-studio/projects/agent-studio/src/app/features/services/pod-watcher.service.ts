import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/** Normalised shape used by components — matches the new /api/pipeline-pods record shape */
export interface PodRecord {
  pod_name:         string;
  container_name:   string;   // derived: deployment base name
  deployment_name:  string;   // derived: deployment base name
  namespace:        string;
  type:             string;   // derived from namespace
  description:      string;
  execution_status: string;   // normalised from phase
  container_status: string;
  pod_phase:        string;
  ready:            boolean;
  restarts:         number;
  image:            string;
  node:             string;
  pod_ip:           string;
  created_at:       string;
  updated_at:       string;
  age:              string;
}

/** Response envelope from GET /apps/vibe-pod-watcher/api/pipeline-pods */
export interface PipelinePodsResponse {
  status:    string;
  total:     number;
  namespace: string;
  filter:    string;
  type?:     string;
  page:      number;
  size:      number;
  records:   PodRecord[];
  summary:   Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class PodWatcherService {

  /** Routes through the Angular dev-proxy to https://192.168.28.41 */
  private readonly BASE = '/apps/vibe-pod-watcher';

  /** Java backend used only for operations not exposed by vibe-pod-watcher (e.g. delete) */
  private readonly JAVA_BASE = '/api/aip';

  constructor(private http: HttpClient) {}

  /**
   * Fetches pipeline pods with server-side pagination and optional filters.
   * GET /apps/vibe-pod-watcher/api/pipeline-pods?namespace=all&page=1&size=10
   */
  getPipelinePods(
    namespace  = 'all',
    page       = 1,
    size       = 10,
    status?: string,
    type?:   string
  ): Observable<PipelinePodsResponse> {
    const params: Record<string, string> = {
      namespace,
      page: String(page),
      size: String(size),
    };
    if (status && status !== 'all') {
      params['status'] = status;
    }
    if (type && type !== 'all') {
      params['type'] = this.capitalise(type);   // Agent | MCP | App
    }
    return this.http
      .get<PipelinePodsResponse>(`${this.BASE}/api/pipeline-pods`, { params })
      .pipe(
        map(res => ({
          ...res,
          records: (res.records || []).map(r => ({
            ...r,
            execution_status: this.mapApiStatus(r.execution_status),
          })),
        })),
        catchError(() => of({
          status: 'ERROR', total: 0, namespace, filter: '', page, size,
          records: [], summary: {},
        } as PipelinePodsResponse))
      );
  }

  /** Lowercases execution_status from API response for consistent comparison. */
  private mapApiStatus(s: string): string {
    return (s || '').toLowerCase();
  }

  /** Capitalises type label for API filter param (mcp→MCP, agent→Agent). */
  private capitalise(s: string): string {
    if (!s) { return s; }
    const up = s.toUpperCase();
    return up === 'MCP' ? 'MCP' : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  /**
   * Fetches live logs for a specific pod.
   * GET /apps/vibe-pod-watcher/api/pods/{pod_name}/logs?namespace=...&tail=...
   * Returns { logs: string[], namespace: string, pod: string }
   */
  getPodLogs(podName: string, namespace: string, tail = 200): Observable<string> {
    return this.http
      .get<{ logs: string[]; namespace: string; pod: string }>(
        `${this.BASE}/api/pods/${encodeURIComponent(podName)}/logs`,
        { params: { namespace, tail: String(tail) } }
      )
      .pipe(
        map(res => {
          const lines = res?.logs;
          if (!lines || lines.length === 0) { return 'No logs available.'; }
          return lines.join('\n');
        }),
        catchError(() => of('Failed to fetch logs. Check that the pod is Running.'))
      );
  }

  /**
   * Deletes a single pod — K8s automatically recreates it via the ReplicaSet.
   * DELETE /apps/vibe-pod-watcher/api/pods/{pod_name}?namespace=vibe-agents|vibe-mcp|vibe-apps
   */
  deletePod(podName: string, namespace: string): Observable<any> {
    return this.http
      .delete<any>(`${this.BASE}/api/pods/${encodeURIComponent(podName)}`, {
        params: { namespace },
      })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Deletes the full deployment + its Service + its Secret ({name}-secrets). Full teardown.
   * DELETE /apps/vibe-pod-watcher/api/deployments/{deployment_name}?namespace=vibe-agents|vibe-mcp|vibe-apps
   */
  deleteDeployment(deploymentName: string, namespace: string): Observable<any> {
    return this.http
      .delete<any>(`${this.BASE}/api/deployments/${encodeURIComponent(deploymentName)}`, {
        params: { namespace },
      })
      .pipe(catchError(() => of(null)));
  }

  /** @deprecated Use deleteDeployment() instead. Retained for backward compatibility. */
  deleteContainer(cname: string, namespace: string): Observable<any> {
    return this.deleteDeployment(cname, namespace);
  }

  /** Converts a pipeline name to a valid K8s deployment name. */
  sanitizeCname(cname: string): string {
    let n = (cname ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (/^[\d-]/.test(n)) { n = 'app-' + n; }
    return n.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

}

