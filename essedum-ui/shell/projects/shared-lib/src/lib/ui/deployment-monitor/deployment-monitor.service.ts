import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ApiErrorDto,
  CheckpointDto,
  DeploymentEventsDto,
  DeploymentStatusDto,
  MetricSeriesDto,
  OperationAcceptedDto,
} from './deployment-monitor.models';

/*
 * Maps 1:1 to the endpoints in docs/FRONTEND-DEPLOY-APIS.txt.
 *   getStatus         GET  /api/aip/training/deployments/{id}
 *   getEvents         GET  /api/aip/training/deployments/{id}/events
 *   getMetrics        GET  /api/aip/training/deployments/{id}/metrics
 *   getCheckpoints    GET  /api/aip/training/deployments/{id}/checkpoints
 *   stop              POST /api/aip/training/deployments/{id}/stop
 *   resume            POST /api/aip/training/deployments/{id}/resume
 *   retryRegistration POST /api/aip/training/deployments/{id}/registration/retry
 */
const BASE_URL = '/api/aip/training/deployments';

const UNAVAILABLE_DETAIL = 'Deployment monitoring service is not available';
const FORBIDDEN_DETAIL = 'Access denied. You do not have permission to view this deployment';

@Injectable({ providedIn: 'root' })
export class DeploymentMonitorService {
  constructor(private http: HttpClient) {}

  getStatus(id: string): Observable<DeploymentStatusDto> {
    return this.get<DeploymentStatusDto>(this.url(id));
  }

  getEvents(id: string, afterSequence: number, limit = 50): Observable<DeploymentEventsDto> {
    const params = new HttpParams()
      .set('afterSequence', String(afterSequence))
      .set('limit', String(limit));
    return this.get<DeploymentEventsDto>(this.url(id, 'events'), params);
  }

  getMetrics(id: string, name: string): Observable<MetricSeriesDto> {
    return this.get<MetricSeriesDto>(this.url(id, 'metrics'), new HttpParams().set('name', name));
  }

  getCheckpoints(id: string): Observable<{ checkpoints: CheckpointDto[] }> {
    return this.get<{ checkpoints: CheckpointDto[] }>(this.url(id, 'checkpoints'));
  }

  stop(id: string): Observable<OperationAcceptedDto> {
    return this.post<OperationAcceptedDto>(this.url(id, 'stop'), {});
  }

  resume(id: string, checkpointId: string): Observable<OperationAcceptedDto> {
    return this.post<OperationAcceptedDto>(this.url(id, 'resume'), { checkpointId });
  }

  retryRegistration(id: string): Observable<OperationAcceptedDto> {
    return this.post<OperationAcceptedDto>(this.url(id, 'registration', 'retry'), {});
  }

  private url(id: string, ...segments: string[]): string {
    return [BASE_URL, encodeURIComponent(id), ...segments].join('/');
  }

  private get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(url, { params }).pipe(catchError(e => this.toApiError(e)));
  }

  private post<T>(url: string, body: unknown): Observable<T> {
    const headers = new HttpHeaders({ 'Idempotency-Key': this.newKey() });
    return this.http.post<T>(url, body, { headers }).pipe(catchError(e => this.toApiError(e)));
  }

  private toApiError(e: HttpErrorResponse): Observable<never> {
    const status = e?.status ?? 0;
    const err: ApiErrorDto = {
      status,
      code: e?.error?.code ?? (status === 403 ? 'FORBIDDEN' : 'UNAVAILABLE'),
      detail: status === 403 ? FORBIDDEN_DETAIL : e?.error?.detail || UNAVAILABLE_DETAIL,
      retryable: status === 0 || status >= 500,
    };
    return throwError(() => err);
  }

  private newKey(): string {
    const c = (globalThis as any).crypto;
    return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
