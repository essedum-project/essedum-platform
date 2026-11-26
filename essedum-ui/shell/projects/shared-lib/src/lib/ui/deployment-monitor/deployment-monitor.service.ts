import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ApiErrorDto,
  CheckpointDto,
  DeploymentEventDto,
  DeploymentEventsDto,
  DeploymentState,
  DeploymentStatusDto,
  DeploymentStep,
  MetricSeriesDto,
  OperationAcceptedDto,
} from './deployment-monitor.models';

/*
 * DUMMY implementation. Each method maps 1:1 to an endpoint in docs/FRONTEND-DEPLOY-APIS.txt:
 *   getStatus        GET  /api/aip/training/deployments/{id}
 *   getEvents        GET  /api/aip/training/deployments/{id}/events
 *   getMetrics       GET  /api/aip/training/deployments/{id}/metrics
 *   getCheckpoints   GET  /api/aip/training/deployments/{id}/checkpoints
 *   stop             POST /api/aip/training/deployments/{id}/stop
 *   resume           POST /api/aip/training/deployments/{id}/resume
 *   retryRegistration POST /api/aip/training/deployments/{id}/registration/retry
 * Replace the bodies with HttpClient calls when the backend is ready. Components do not change.
 */

interface DummyRecord {
  status: DeploymentStatusDto;
  checkpoints: CheckpointDto[];
  metrics: MetricSeriesDto;
  events: DeploymentEventDto[];
  latestSequence: number;
  attempt: number;
}

const LATENCY_MS = 350;

@Injectable({ providedIn: 'root' })
export class DeploymentMonitorService {
  private readonly records = new Map<string, DummyRecord>();

  /** Until the backend returns deploymentId on pipeline_status, derive a stable dummy id from the deployment name. */
  dummyIdFor(deploymentName: string): string {
    const slug = (deploymentName || 'pipeline').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();
    return `dep-${slug}`;
  }

  getStatus(id: string): Observable<DeploymentStatusDto> {
    const r = this.record(id);
    // Dummy only: each read moves a transitional state forward, mimicking the backend reconciler.
    this.advance(r);
    return this.ok(this.clone(r.status));
  }

  getEvents(id: string, afterSequence: number, limit = 50): Observable<DeploymentEventsDto> {
    const r = this.record(id);
    const events = r.events.filter(e => e.sequence > afterSequence).slice(0, limit);
    return this.ok({ events: this.clone(events), latestSequence: r.latestSequence });
  }

  getMetrics(id: string, name: string): Observable<MetricSeriesDto> {
    const r = this.record(id);
    const series = name === r.metrics.name ? r.metrics : { name, unit: 'none', points: [] };
    return this.ok(this.clone(series));
  }

  getCheckpoints(id: string): Observable<{ checkpoints: CheckpointDto[] }> {
    const r = this.record(id);
    return this.ok({ checkpoints: this.clone(r.checkpoints) });
  }

  stop(id: string): Observable<OperationAcceptedDto> {
    const r = this.record(id);
    if (!r.status.allowedActions.includes('STOP')) {
      return this.fail(409, 'STATE_CONFLICT', 'Deployment is not running');
    }
    this.setState(r, 'STOPPING', 'Stopping container...');
    return this.ok({ operationId: this.opId(), deploymentId: id, state: 'STOPPING', version: r.status.version });
  }

  resume(id: string, checkpointId: string): Observable<OperationAcceptedDto> {
    const r = this.record(id);
    if (!r.status.allowedActions.includes('RESUME')) {
      return this.fail(409, 'STATE_CONFLICT', 'Deployment cannot be resumed in its current state');
    }
    const checkpoint = r.checkpoints.find(c => c.checkpointId === checkpointId);
    if (!checkpoint || !checkpoint.valid) {
      return this.fail(422, 'INVALID_CHECKPOINT', 'Checkpoint is not valid for resume');
    }
    r.attempt += 1;
    this.setState(r, 'DEPLOYING', `Resuming from checkpoint ${checkpointId}`);
    return this.ok({
      operationId: this.opId(), deploymentId: id, attempt: r.attempt, state: 'DEPLOYING', version: r.status.version,
    });
  }

  retryRegistration(id: string): Observable<OperationAcceptedDto> {
    const r = this.record(id);
    if (r.status.registration.state !== 'FAILED') {
      return this.fail(409, 'STATE_CONFLICT', 'Models registration has not failed');
    }
    r.status.registration = { state: 'REGISTERING', modelId: null, failureReason: null };
    r.status.version += 1;
    return this.ok({
      operationId: this.opId(), deploymentId: id, registration: { state: 'REGISTERING', modelId: null },
    });
  }

  private record(id: string): DummyRecord {
    let r = this.records.get(id);
    if (!r) {
      const started = new Date().toISOString();
      r = {
        status: {
          deploymentId: id,
          state: 'RUNNING',
          message: 'Container is running',
          startedAt: started,
          finishedAt: null,
          failureReason: null,
          steps: this.stepsFor('RUNNING'),
          registration: { state: 'PENDING', modelId: null, failureReason: null },
          allowedActions: this.actionsFor('RUNNING'),
          version: 4,
        },
        checkpoints: [
          { checkpointId: 'ck-002', step: 2, createdAt: started, valid: true },
          { checkpointId: 'ck-004', step: 4, createdAt: started, valid: true },
        ],
        metrics: {
          name: 'loss',
          unit: 'none',
          points: [
            { step: 1, value: 0.91, timestamp: started },
            { step: 2, value: 0.62, timestamp: started },
            { step: 3, value: 0.42, timestamp: started },
            { step: 4, value: 0.35, timestamp: started },
            { step: 5, value: 0.30, timestamp: started },
          ],
        },
        events: [{ sequence: 1, type: 'STATE_CHANGED', state: 'RUNNING', timestamp: started }],
        latestSequence: 1,
        attempt: 1,
      };
      this.records.set(id, r);
    }
    return r;
  }

  private advance(r: DummyRecord): void {
    const state = r.status.state;
    if (state === 'DEPLOYING') {
      this.setState(r, 'RUNNING', 'Container is running');
    } else if (state === 'STOPPING') {
      this.setState(r, 'STOPPED', 'Container stopped');
    }
    // Dummy registration: PENDING -> REGISTERING -> REGISTERED, one step per read.
    const reg = r.status.registration;
    if (reg.state === 'PENDING') {
      r.status.registration = { state: 'REGISTERING', modelId: null, failureReason: null };
      r.status.version += 1;
    } else if (reg.state === 'REGISTERING') {
      r.status.registration = { state: 'REGISTERED', modelId: `model-${r.status.deploymentId}`, failureReason: null };
      r.status.version += 1;
    }
  }

  private setState(r: DummyRecord, state: DeploymentState, message: string): void {
    const s = r.status;
    s.state = state;
    s.message = message;
    s.steps = this.stepsFor(state);
    s.allowedActions = this.actionsFor(state);
    if (state === 'STOPPED' || state === 'COMPLETED' || state === 'FAILED') {
      s.finishedAt = new Date().toISOString();
    }
    s.version += 1;
    r.latestSequence += 1;
    r.events.push({ sequence: r.latestSequence, type: 'STATE_CHANGED', state, timestamp: new Date().toISOString() });
  }

  private stepsFor(state: DeploymentState): DeploymentStep[] {
    return [
      { name: 'INIT', state: 'DONE' },
      { name: 'DOWNLOAD', state: 'DONE' },
      { name: 'BUILD', state: 'DONE' },
      { name: 'DEPLOY', state: state === 'DEPLOYING' ? 'RUNNING' : 'DONE' },
    ];
  }

  private actionsFor(state: DeploymentState): string[] {
    if (state === 'RUNNING') return ['STOP'];
    if (state === 'STOPPED' || state === 'FAILED') return ['RESUME'];
    return [];
  }

  private ok<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }

  private fail<T>(status: number, code: string, detail: string): Observable<T> {
    const err: ApiErrorDto = { status, code, detail, retryable: false };
    return throwError(() => err).pipe(delay(LATENCY_MS));
  }

  private opId(): string {
    return `op-${Math.random().toString(36).slice(2, 8)}`;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
