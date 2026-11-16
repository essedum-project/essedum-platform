import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ModuleStat {
  label: string;
  count: number;
  sub: string;
  icon: string;
  accent: string;
  route: string;
  state?: Record<string, any>;
}

interface PipelineCard {
  alias: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  icon: string;
  accent: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {

  // Routes are absolute paths under /landing so each card navigates into the
  // owning MFE (data-ops, agent, integration).
  moduleStats: ModuleStat[] = [
    { label: 'Connections',     count: 0, sub: '0 total', icon: 'fa-plug',           accent: '#3b82f6', route: '/landing/data/connections' },
    { label: 'Datasets',        count: 0, sub: '0 total', icon: 'fa-database',       accent: '#10b981', route: '/landing/data/datasets' },
    { label: 'Models',          count: 0, sub: '0 total', icon: 'fa-cubes',          accent: '#8b5cf6', route: '/landing/data/models' },
    { label: 'Agent Pipelines', count: 0, sub: '0 total', icon: 'fa-code-fork',      accent: '#fb923c', route: '/landing/agent/pipeline', state: { pipelineMode: 'agent' } },
    { label: 'MCP Pipelines',   count: 0, sub: '0 total', icon: 'fa-server',         accent: '#06b6d4', route: '/landing/agent/pipeline', state: { pipelineMode: 'mcp'   } },
    { label: 'App Pipelines',   count: 0, sub: '0 total', icon: 'fa-window-restore', accent: '#fbbf24', route: '/landing/agent/pipeline', state: { pipelineMode: 'app'   } },
  ];

  topAgentPipelines: PipelineCard[] = [];
  topMcpPipelines: PipelineCard[]   = [];
  topAppPipelines: PipelineCard[]   = [];

  // Backend proxy prefix. Matches `baseUrl` injected into every MFE
  // (apps/<name>/src/environments/environment.ts) and the host's nginx proxy_pass.
  private readonly api = '/api/aip';

  // Max rows fetched per pipeline type; the count is the number of rows returned.
  private readonly PIPELINE_FETCH_SIZE = 500;

  constructor(private https: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  navigateTo(mod: ModuleStat): void {
    this.router.navigate([mod.route], { state: mod.state || {} });
  }

  private loadDashboardData(): void {
    forkJoin({
      connections: this.getDatasources().pipe(catchError(() => of([]))),
      datasets:    this.getDatasetsCount().pipe(catchError(() => of(0))),
      models:      this.getCountModels().pipe(catchError(() => of(0))),
      agentList:   this.getPipelineList('pipeline-agent').pipe(catchError(() => of([]))),
      mcpList:     this.getPipelineList('mcp-pipeline', 'mcpServer').pipe(catchError(() => of([]))),
      appList:     this.getPipelineList('app-pipeline', 'appPipeline').pipe(catchError(() => of([]))),
    }).subscribe(results => {
      const connCount = Array.isArray(results.connections) ? results.connections.length : 0;
      this.setStat(0, connCount);

      this.setStat(1, Number(results.datasets) || 0);
      this.setStat(2, Number(results.models) || 0);

      const agents = this.normalizeList(results.agentList);
      const mcps   = this.normalizeList(results.mcpList);
      const apps   = this.normalizeList(results.appList);

      this.setStat(3, agents.length);
      this.setStat(4, mcps.length);
      this.setStat(5, apps.length);

      this.topAgentPipelines = this.mapToPipelineCards(agents.slice(0, 3), 'fa-code-fork');
      this.topMcpPipelines   = this.mapToPipelineCards(mcps.slice(0, 3),   'fa-server');
      this.topAppPipelines   = this.mapToPipelineCards(apps.slice(0, 3),   'fa-window-restore');
    });
  }

  private setStat(index: number, count: number): void {
    this.moduleStats[index].count = count;
    this.moduleStats[index].sub   = `${count} total`;
  }

  private getDatasources() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/datasources/all`, { observe: 'response', params: { org } })
      .pipe(map(r => r.body));
  }

  // GET /api/aip/datasets/filter/advanced/count?organization=<org>
  private getDatasetsCount() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/datasets/filter/advanced/count`, {
        observe: 'response',
        params: new HttpParams().set('organization', org)
      })
      .pipe(map(r => r.body));
  }

  private getCountModels() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/service/v1/models/count/${org}`, { observe: 'response', params: new HttpParams() })
      .pipe(map(r => r.body));
  }

  // GET /api/aip/service/v1/pipelines/training/list?page=1&size=500&...
  private getPipelineList(interfacetype: string, type?: string) {
    let params = this.basePipelineParams(interfacetype)
      .set('page', '1')
      .set('size', String(this.PIPELINE_FETCH_SIZE));
    if (type) params = params.set('type', type);
    return this.https
      .get<any>(`${this.api}/service/v1/pipelines/training/list`, { observe: 'response', params })
      .pipe(map(r => r.body));
  }

  private basePipelineParams(interfacetype: string): HttpParams {
    const org = sessionStorage.getItem('organization') || '';
    return new HttpParams()
      .set('project', org)
      .set('isCached', 'true')
      .set('adapter_instance', 'internal')
      .set('interfacetype', interfacetype)
      .set('cloud_provider', 'internal');
  }

  // The list endpoint may return a JSON array or a JSON-encoded string; normalise to an array.
  private normalizeList(value: any): any[] {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed.filter(p => p != null) : [];
    } catch {
      return [];
    }
  }

  private mapToPipelineCards(pipelines: any[], defaultIcon: string): PipelineCard[] {
    return pipelines.map(p => {
      const status = this.mapStatus(p.status || p.jobStatus || p.state);
      return {
        alias:  p.alias || p.cname || 'Unknown',
        name:   p.name  || p.jobName || '',
        status: status,
        icon:   status === 'running' ? defaultIcon : status === 'failed' ? 'fa-exclamation-circle' : 'fa-check-circle',
        accent: status === 'running' ? '#22c55e'  : status === 'failed'  ? '#ef4444'              : '#94a3b8'
      };
    });
  }

  private mapStatus(raw: string): 'running' | 'completed' | 'failed' {
    if (!raw) return 'completed';
    const s = raw.toLowerCase();
    if (s === 'running' || s === 'active' || s === 'inprogress') return 'running';
    if (s === 'failed'  || s === 'error'  || s === 'failure')    return 'failed';
    return 'completed';
  }
}
