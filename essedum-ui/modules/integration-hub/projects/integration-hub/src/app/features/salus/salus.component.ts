import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GuardrailEvent, RaiservicesService } from '../services/raiservices.service';

interface TimelineBar {
  label: string;
  passed: number;
  blocked: number;
  total: number;
  passedHeight: number;
  blockedHeight: number;
}

interface CheckStat {
  name: string;
  runs: number;
  failures: number;
  failureRate: number;
  width: number;
}

interface StageSlice {
  name: string;
  count: number;
  percent: number;
  dash: string;
  offset: number;
  color: string;
}

/** `days` = look-back window in days; 0 = calendar today; null = all time. */
interface RangeOption {
  key: string;
  label: string;
  days: number | null;
}

@Component({
  selector: 'app-salus',
  templateUrl: './salus.component.html',
  styleUrls: ['./salus.component.scss'],
  standalone: false,
})
export class SalusComponent implements OnInit, OnDestroy {

  view: 'overview' | 'events' = 'overview';

  allEvents: GuardrailEvent[] = [];
  events: GuardrailEvent[] = [];
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;

  readonly rangeOptions: RangeOption[] = [
    { key: 'today', label: 'Today', days: 0 },
    { key: '24h',   label: 'Last 24 hours', days: 1 },
    { key: '7d',    label: 'Last 7 days', days: 7 },
    { key: '30d',   label: 'Last 30 days', days: 30 },
    { key: '90d',   label: 'Last 90 days', days: 90 },
    { key: 'all',   label: 'All time', days: null },
  ];
  range = 'all';

  // KPIs
  total = 0;
  blocked = 0;
  passRate = 0;
  activeGuardrails = 0;
  modelsMonitored = 0;
  windowLabel = '—';

  // Charts
  timeline: TimelineBar[] = [];
  checkStats: CheckStat[] = [];
  stages: StageSlice[] = [];
  readonly donutCircumference = 2 * Math.PI * 54;

  // Events view
  search = '';
  stageFilter = 'all';
  resultFilter = 'all';
  expanded = new Set<number>();

  private readonly salusUrl: string;
  private refreshTimer: any = null;

  constructor(private raiService: RaiservicesService) {
    const configured = (environment as any).salusUrl as string | undefined;
    this.salusUrl = !configured || configured.startsWith('__FE_') ? '/salus/' : configured;
  }

  ngOnInit(): void {
    this.load();
    this.refreshTimer = setInterval(() => this.load(true), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  load(silent = false): void {
    if (!silent) this.loading = true;
    this.error = null;
    this.raiService.guardrailEvents(this.salusUrl)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (events) => {
          this.allEvents = (events || []).slice().sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.lastUpdated = new Date();
          this.applyRange();
        },
        error: (err) => (this.error = err?.error?.detail || err?.message || 'Unable to load guardrail events'),
      });
  }

  setRange(key: string): void {
    this.range = key;
    this.expanded.clear();
    this.applyRange();
  }

  private applyRange(): void {
    const option = this.rangeOptions.find(o => o.key === this.range);
    let from: number | null = null;
    if (option?.days === 0) {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      from = midnight.getTime();
    } else if (option?.days) {
      from = Date.now() - option.days * 86400000;
    }
    this.events = from === null
      ? this.allEvents
      : this.allEvents.filter(e => new Date(e.timestamp).getTime() >= from);
    this.computeStats();
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  private computeStats(): void {
    const events = this.events;
    this.total = events.length;
    this.blocked = events.filter(e => !e.passed).length;
    this.passRate = this.total ? ((this.total - this.blocked) / this.total) * 100 : 0;

    const checks = new Map<string, { runs: number; failures: number }>();
    const models = new Set<string>();
    const stageCounts = new Map<string, number>();

    for (const e of events) {
      (e.checks || []).forEach(c => {
        const stat = checks.get(c) || { runs: 0, failures: 0 };
        stat.runs++;
        checks.set(c, stat);
      });
      (e.failed_checks || []).forEach(c => {
        const stat = checks.get(c) || { runs: 0, failures: 0 };
        stat.failures++;
        checks.set(c, stat);
      });
      if (e.model) models.add(e.model);
      stageCounts.set(e.stage, (stageCounts.get(e.stage) || 0) + 1);
    }

    this.activeGuardrails = checks.size;
    this.modelsMonitored = models.size;
    this.windowLabel = this.buildWindowLabel();

    const maxRuns = Math.max(1, ...Array.from(checks.values()).map(c => c.runs));
    this.checkStats = Array.from(checks.entries())
      .map(([name, s]) => ({
        name,
        runs: s.runs,
        failures: s.failures,
        failureRate: s.runs ? (s.failures / s.runs) * 100 : 0,
        width: (s.runs / maxRuns) * 100,
      }))
      .sort((a, b) => b.runs - a.runs);

    this.buildStages(stageCounts);
    this.buildTimeline();
  }

  private buildWindowLabel(): string {
    if (!this.events.length) return '—';
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) +
      ', ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const newest = new Date(this.events[0].timestamp);
    const oldest = new Date(this.events[this.events.length - 1].timestamp);
    return `${fmt(oldest)} - ${fmt(newest)}`;
  }

  private buildStages(stageCounts: Map<string, number>): void {
    const palette: Record<string, string> = {
      input: '#4f8ef7', output: '#a855f7', test: '#22c55e',
    };
    const fallback = ['#f59e0b', '#06b6d4', '#ec4899'];
    let offset = 0;
    let fallbackIdx = 0;
    this.stages = Array.from(stageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const percent = this.total ? (count / this.total) * 100 : 0;
        const length = (percent / 100) * this.donutCircumference;
        const slice: StageSlice = {
          name,
          count,
          percent,
          dash: `${length} ${this.donutCircumference - length}`,
          offset: -offset,
          color: palette[name] || fallback[fallbackIdx++ % fallback.length],
        };
        offset += length;
        return slice;
      });
  }

  private buildTimeline(): void {
    if (!this.events.length) { this.timeline = []; return; }
    // Only the sub-day ranges are bucketed hourly; everything else is per day.
    const hourly = this.range === 'today' || this.range === '24h';

    const buckets = new Map<string, { passed: number; blocked: number; label: string }>();
    for (const e of this.events) {
      const d = new Date(e.timestamp);
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const key = hourly ? `${day}-${String(d.getHours()).padStart(2, '0')}` : day;
      const label = hourly
        ? `${String(d.getHours()).padStart(2, '0')}:00`
        : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      const b = buckets.get(key) || { passed: 0, blocked: 0, label };
      e.passed ? b.passed++ : b.blocked++;
      buckets.set(key, b);
    }

    const ordered = Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(hourly ? -24 : -30);
    const max = Math.max(1, ...ordered.map(([, b]) => b.passed + b.blocked));
    this.timeline = ordered.map(([, b]) => ({
      label: b.label,
      passed: b.passed,
      blocked: b.blocked,
      total: b.passed + b.blocked,
      passedHeight: (b.passed / max) * 100,
      blockedHeight: (b.blocked / max) * 100,
    }));
  }

  // ── Events view ──────────────────────────────────────────────────────────

  get stageOptions(): string[] {
    return ['all', ...Array.from(new Set(this.events.map(e => e.stage)))];
  }

  get filteredEvents(): GuardrailEvent[] {
    const q = this.search.trim().toLowerCase();
    return this.events.filter(e => {
      if (this.stageFilter !== 'all' && e.stage !== this.stageFilter) return false;
      if (this.resultFilter === 'passed' && !e.passed) return false;
      if (this.resultFilter === 'blocked' && e.passed) return false;
      if (!q) return true;
      return (e.text || '').toLowerCase().includes(q)
        || (e.model || '').toLowerCase().includes(q)
        || (e.checks || []).join(' ').toLowerCase().includes(q)
        || (e.failed_checks || []).join(' ').toLowerCase().includes(q);
    });
  }

  toggleExpanded(index: number): void {
    this.expanded.has(index) ? this.expanded.delete(index) : this.expanded.add(index);
  }

  isExpanded(index: number): boolean {
    return this.expanded.has(index);
  }

  formatTime(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salus-guardrail-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
