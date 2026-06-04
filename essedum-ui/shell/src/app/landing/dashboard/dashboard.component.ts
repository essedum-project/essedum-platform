import { Component, OnInit } from '@angular/core';
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
    { label: 'Agent Pipelines', count: 0, sub: '0 total', icon: 'fa-code-fork',      accent: '#fb923c', route: '/landing/agent/pipeline' },
    { label: 'MCP Pipelines',   count: 0, sub: '0 total', icon: 'fa-server',         accent: '#06b6d4', route: '/landing/integration/pipelines' },
    { label: 'App Pipelines',   count: 0, sub: '0 total', icon: 'fa-window-restore', accent: '#fbbf24', route: '/landing/integration/apps' },
  ];

  topAgentPipelines: PipelineCard[] = [];
  topMcpPipelines: PipelineCard[]   = [];
  topAppPipelines: PipelineCard[]   = [];

  // Backend proxy prefix. Matches `baseUrl` injected into every MFE
  // (apps/<name>/src/environments/environment.ts) and the host's nginx proxy_pass.
  private readonly api = '/api/aip';

  constructor(private https: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      connections:    this.getDatasources().pipe(catchError(() => of([]))),
      datasets:       this.getDatasetsLen().pipe(catchError(() => of(0))),
      models:         this.getCountModels().pipe(catchError(() => of(0))),
      agentCount:     this.getPipelinesCount('pipeline-agent').pipe(catchError(() => of(0))),
      mcpCount:       this.getPipelinesCount('mcp-pipeline', 'mcpServer').pipe(catchError(() => of(0))),
      appCount:       this.getPipelinesCount('app-pipeline', 'appPipeline').pipe(catchError(() => of(0))),
      agentPipelines: this.getPipelinesByInterfaceType('pipeline-agent', null, 1, 3).pipe(catchError(() => of([]))),
      mcpPipelines:   this.getPipelinesByInterfaceType('mcp-pipeline', 'mcpServer', 1, 3).pipe(catchError(() => of([]))),
      appPipelines:   this.getPipelinesByInterfaceType('app-pipeline', 'appPipeline', 1, 3).pipe(catchError(() => of([]))),
    }).subscribe(results => {
      const connCount = Array.isArray(results.connections) ? results.connections.length : 0;
      this.moduleStats[0].count = connCount;
      this.moduleStats[0].sub   = `${connCount} total`;

      const dsetCount = Number(results.datasets) || 0;
      this.moduleStats[1].count = dsetCount;
      this.moduleStats[1].sub   = `${dsetCount} total`;

      const mdlCount = Number(results.models) || 0;
      this.moduleStats[2].count = mdlCount;
      this.moduleStats[2].sub   = `${mdlCount} total`;

      const agentCount = Number(results.agentCount) || 0;
      this.moduleStats[3].count = agentCount;
      this.moduleStats[3].sub   = `${agentCount} total`;

      const mcpCount = Number(results.mcpCount) || 0;
      this.moduleStats[4].count = mcpCount;
      this.moduleStats[4].sub   = `${mcpCount} total`;

      const appCount = Number(results.appCount) || 0;
      this.moduleStats[5].count = appCount;
      this.moduleStats[5].sub   = `${appCount} total`;

      this.topAgentPipelines = this.mapToPipelineCards(results.agentPipelines, 'fa-code-fork');
      this.topMcpPipelines   = this.mapToPipelineCards(results.mcpPipelines,   'fa-server');
      this.topAppPipelines   = this.mapToPipelineCards(results.appPipelines,   'fa-window-restore');
    });
  }

  private getDatasources() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/datasources/all`, { observe: 'response', params: { org } })
      .pipe(map(r => r.body));
  }

  private getDatasetsLen() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/datasets/len/${org}`, { observe: 'response', params: { search: '' } })
      .pipe(map(r => r.body));
  }

  private getCountModels() {
    const org = sessionStorage.getItem('organization') || '';
    return this.https
      .get<any>(`${this.api}/service/v1/models/count/${org}`, { observe: 'response', params: new HttpParams() })
      .pipe(map(r => r.body));
  }

  private getPipelinesCount(interfacetype: string, type?: string) {
    let params = this.basePipelineParams(interfacetype);
    if (type) params = params.set('type', type);
    return this.https
      .get<any>(`${this.api}/service/v1/pipelines/count`, { observe: 'response', params })
      .pipe(map(r => r.body));
  }

  private getPipelinesByInterfaceType(interfacetype: string, type: string | null, page: number, size: number) {
    let params = this.basePipelineParams(interfacetype)
      .set('page', String(page))
      .set('size', String(size));
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

  private mapToPipelineCards(pipelines: any[], defaultIcon: string): PipelineCard[] {
    if (!Array.isArray(pipelines)) return [];
    return pipelines.slice(0, 3).map(p => {
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
