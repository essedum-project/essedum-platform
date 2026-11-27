import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Services } from '../../legacy/services/service';
import { DeploymentMonitorService } from './deployment-monitor.service';
import {
  ApiErrorDto,
  CheckpointDto,
  DeploymentEventDto,
  DeploymentState,
  DeploymentStatusDto,
  MetricSeriesDto,
  OperationAcceptedDto,
} from './deployment-monitor.models';

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATES: DeploymentState[] = ['COMPLETED', 'FAILED', 'STOPPED'];
const RECENT_EVENT_LIMIT = 6;
export const NO_RECORDS = 'No records available';

@Component({
  selector: 'app-deployment-monitor',
  templateUrl: './deployment-monitor.component.html',
  styleUrls: ['./deployment-monitor.component.scss'],
  standalone: false,
})
export class DeploymentMonitorComponent implements OnChanges, OnDestroy {
  @Input() deploymentId = '';
  /** True when the host pipeline reports a successful container deployment. */
  @Input() deployed = false;

  readonly noRecords = NO_RECORDS;
  status: DeploymentStatusDto | null = null;
  metrics: MetricSeriesDto | null = null;
  checkpoints: CheckpointDto[] = [];
  recentEvents: DeploymentEventDto[] = [];
  selectedCheckpointId = '';
  loadError: ApiErrorDto | null = null;
  loading = false;
  busy = false;
  refreshing = false;

  private lastVersion = -1;
  private lastSequence = 0;
  private fetching = false;
  private pollSub: Subscription | null = null;

  constructor(private monitor: DeploymentMonitorService, private services: Services) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deploymentId']) this.start();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  get hasId(): boolean {
    return !!this.deploymentId;
  }

  /** Why the monitor has no deployment id to query, shown to the user instead of a generic message. */
  get unavailableReason(): string {
    if (this.hasId) return '';
    return this.deployed
      ? 'The deployment is active, but the backend has not sent a deployment ID yet. ' +
        'The monitor APIs need that ID, so no request was made. Expected: pipeline_status includes "deploymentId".'
      : 'No active deployment. Use "Deploy as Container" to start a deployment and monitor it here.';
  }

  get idLabel(): string {
    if (this.hasId) return this.deploymentId;
    return this.deployed ? 'Active, waiting for deployment ID' : 'No active deployment';
  }

  get isTerminal(): boolean {
    return !!this.status && TERMINAL_STATES.includes(this.status.state);
  }

  get canStop(): boolean {
    return !this.busy && !!this.status?.allowedActions.includes('STOP');
  }

  get canResume(): boolean {
    return !this.busy && !!this.selectedCheckpointId && !!this.status?.allowedActions.includes('RESUME');
  }

  get canRetryRegistration(): boolean {
    return !this.busy && this.status?.registration.state === 'FAILED';
  }

  get latestMetric(): number | null {
    const points = this.metrics?.points ?? [];
    return points.length ? points[points.length - 1].value : null;
  }

  get registrationView(): { icon: string; text: string } {
    const reg = this.status?.registration;
    switch (reg?.state) {
      case 'REGISTERED': return { icon: 'verified', text: `Saved to Models${reg.modelId ? ' (' + reg.modelId + ')' : ''}` };
      case 'REGISTERING': return { icon: 'sync', text: 'Saving to Models...' };
      case 'PENDING': return { icon: 'hourglass_top', text: 'Waiting to save to Models' };
      case 'FAILED': return { icon: 'error', text: `Failed: ${reg.failureReason || 'unknown error'}` };
      default: return { icon: 'inbox', text: NO_RECORDS };
    }
  }

  /** Sparkline geometry in a 300x90 viewBox. */
  get chart(): { line: string; area: string } {
    const points = this.metrics?.points ?? [];
    if (points.length < 2) return { line: '', area: '' };
    const values = points.map(p => p.value);
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    const W = 300, H = 90, PAD = 8;
    const coords = points.map((p, i) => ({
      x: PAD + (i * (W - 2 * PAD)) / (points.length - 1),
      y: PAD + (1 - (p.value - min) / span) * (H - 2 * PAD),
    }));
    const line = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const first = coords[0];
    const last = coords[coords.length - 1];
    return { line, area: `${first.x.toFixed(1)},${H} ${line} ${last.x.toFixed(1)},${H}` };
  }

  refresh(): void {
    if (!this.hasId) {
      this.services.message(this.unavailableReason, 'error');
      return;
    }
    this.refreshing = true;
    this.services.message('Refreshing deployment status...', 'success');
    this.fetchStatus();
  }

  stop(): void {
    this.runAction(this.monitor.stop(this.deploymentId), 'Stop requested');
  }

  resume(): void {
    this.runAction(
      this.monitor.resume(this.deploymentId, this.selectedCheckpointId),
      `Resuming from ${this.selectedCheckpointId}`,
    );
  }

  retryRegistration(): void {
    this.runAction(this.monitor.retryRegistration(this.deploymentId), 'Retrying Models registration');
  }

  private start(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
    this.clearData();
    this.loadError = null;
    this.lastVersion = -1;
    this.lastSequence = 0;
    if (!this.hasId) return;

    this.loading = true;
    this.fetchStatus();
    // Keeps polling while the deployment is not yet known to the backend, so data appears once the API is up.
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(filter(() => this.hasId && !this.busy && !this.isTerminal))
      .subscribe(() => this.fetchStatus());
  }

  private fetchStatus(): void {
    const id = this.deploymentId;
    if (!id || this.fetching) return;
    this.fetching = true;
    this.monitor.getStatus(id).subscribe({
      next: s => {
        this.fetching = false;
        this.refreshing = false;
        if (id === this.deploymentId) this.applyStatus(s);
      },
      error: (e: ApiErrorDto) => {
        this.fetching = false;
        this.refreshing = false;
        if (id === this.deploymentId) this.onLoadError(e);
      },
    });
  }

  private applyStatus(s: DeploymentStatusDto): void {
    this.loading = false;
    this.loadError = null;
    this.status = s;
    if (s.version !== this.lastVersion) {
      this.lastVersion = s.version;
      this.loadSeriesAndCheckpoints();
    }
    this.fetchEvents();
  }

  private onLoadError(e: ApiErrorDto): void {
    this.loading = false;
    this.loadError = e;
    this.clearData();
  }

  private clearData(): void {
    this.status = null;
    this.metrics = null;
    this.checkpoints = [];
    this.recentEvents = [];
    this.selectedCheckpointId = '';
  }

  private loadSeriesAndCheckpoints(): void {
    const id = this.deploymentId;
    this.monitor.getMetrics(id, 'loss').subscribe({
      next: m => { if (id === this.deploymentId) this.metrics = m; },
      error: () => { if (id === this.deploymentId) this.metrics = null; },
    });
    this.monitor.getCheckpoints(id).subscribe({
      next: res => {
        if (id !== this.deploymentId) return;
        this.checkpoints = res.checkpoints;
        const selectionValid = this.checkpoints.some(c => c.checkpointId === this.selectedCheckpointId && c.valid);
        if (!selectionValid) {
          this.selectedCheckpointId = this.checkpoints.find(c => c.valid)?.checkpointId ?? '';
        }
      },
      error: () => {
        if (id !== this.deploymentId) return;
        this.checkpoints = [];
        this.selectedCheckpointId = '';
      },
    });
  }

  private fetchEvents(): void {
    const id = this.deploymentId;
    this.monitor.getEvents(id, this.lastSequence).subscribe({
      next: res => {
        if (id !== this.deploymentId || res.events.length === 0) return;
        this.lastSequence = res.latestSequence;
        this.recentEvents = [...res.events.reverse(), ...this.recentEvents].slice(0, RECENT_EVENT_LIMIT);
      },
      error: () => { /* activity list is best-effort; status errors are shown by fetchStatus */ },
    });
  }

  private runAction(op: Observable<OperationAcceptedDto>, successMessage: string): void {
    this.busy = true;
    op.subscribe({
      next: () => {
        this.busy = false;
        this.services.message(successMessage, 'success');
        this.fetchStatus();
      },
      error: (e: ApiErrorDto) => {
        this.busy = false;
        this.services.message(e.detail, 'error');
      },
    });
  }
}
