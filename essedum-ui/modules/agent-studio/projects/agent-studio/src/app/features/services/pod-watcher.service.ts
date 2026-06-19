import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type PodPhase = 'Running' | 'Queued' | 'Success' | 'Failed' | 'Inactive';

/** Shape returned by GET /apps/vibe-pod-watcher/api/pods?namespace=all */
export interface PodRecord {
  pod_name:         string;
  container_name:   string;
  deployment_name:  string;
  namespace:        string;
  type:             string;
  description:      string;
  execution_status: string;
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

/** Shape returned by GET /apps/vibe-pod-watcher/api/deployments */
export interface DeploymentStatus {
  name:     string;
  namespace: string;
  ready:    number;
  desired:  number;
}

@Injectable({ providedIn: 'root' })
export class PodWatcherService {

  /** Routes through the Angular dev-proxy to https://192.168.28.41 */
  private readonly BASE = '/apps/vibe-pod-watcher';

  /** Java backend used only for operations not exposed by vibe-pod-watcher (e.g. delete) */
  private readonly JAVA_BASE = '/api/aip';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all pods across namespaces.
   * Used as the primary data source for the Pipelines in Execution table.
   * GET /apps/vibe-pod-watcher/api/pods?namespace=all
   */
  getPods(namespace = 'all'): Observable<PodRecord[]> {
    return this.http
      .get<PodRecord[]>(`${this.BASE}/api/pods`, { params: { namespace } })
      .pipe(catchError(() => of([] as PodRecord[])));
  }

  /**
   * Returns a Map<deployment-name, PodPhase> for all namespaces.
   * GET /apps/vibe-pod-watcher/api/deployments?namespace=all
   */
  getDeploymentStatusMap(): Observable<Map<string, PodPhase>> {
    return this.http
      .get<DeploymentStatus[]>(`${this.BASE}/api/deployments`, {
        params: { namespace: 'all' },
      })
      .pipe(
        catchError(() => of([] as DeploymentStatus[])),
        map(deps => {
          const m = new Map<string, PodPhase>();
          for (const d of deps) {
            const phase: PodPhase =
              d.ready > 0   ? 'Running' :
              d.desired > 0 ? 'Queued'  :
                              'Inactive';
            m.set(d.name, phase);
          }
          return m;
        })
      );
  }

  /**
   * Fetches live logs for a specific pod.
   * GET /apps/vibe-pod-watcher/api/pods/{pod_name}/logs?namespace=...&tail=...
   * pod_name is the full K8s pod name (e.g. "agent-pipeline-demo-7d6b4c9f5-xkp2n").
   */
  getPodLogs(podName: string, namespace: string, tail = 200): Observable<string> {
    return this.http
      .get(`${this.BASE}/api/pods/${encodeURIComponent(podName)}/logs`, {
        params: { namespace, tail: String(tail) },
        responseType: 'text',
      })
      .pipe(
        map(text => (text?.trim() ? text : 'No logs available.')),
        catchError(() => of('Failed to fetch logs. Check that the pod is Running.'))
      );
  }

  /**
   * Deletes the K8s deployment via the Java backend (vibe-pod-watcher exposes no DELETE).
   */
  deleteContainer(cname: string, namespace: string): Observable<void> {
    const sanitized = this.sanitizeCname(cname);
    return this.http
      .delete<void>(`${this.JAVA_BASE}/containers/${sanitized}`, {
        params: { namespace },
      })
      .pipe(catchError(() => of(undefined as void)));
  }

  /** Converts a pipeline name to a valid K8s deployment name. */
  sanitizeCname(cname: string): string {
    let n = (cname ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (/^[\d-]/.test(n)) { n = 'app-' + n; }
    return n.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /** Returns the K8s namespace that corresponds to a given pipelineMode. */
  namespaceForMode(mode: 'agent' | 'mcp' | 'app'): string {
    const nsMap: Record<string, string> = {
      agent: 'vibe-agents',
      mcp:   'vibe-mcp',
      app:   'vibe-apps',
    };
    return nsMap[mode] ?? 'vibe-agents';
  }
}
