import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { DeploymentStatusBadge } from '../components/flow/DeploymentStatusBadge';
import { DeploymentStatusDrawer } from '../components/flow/DeploymentStatusDrawer';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/sonner';
import { Copy, ExternalLink, Search, RefreshCw, Rocket, Activity, ArrowLeft, Layers, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { flowService } from '../services/flowService';
import { deploymentService } from '../services/deploymentService';
import type { SavedFlow } from '../types/flow';
import type { WorkflowDeploymentStatusResponse } from '../models/api';
import { LABELS } from '../lib/labels';
import { cn } from '../lib/utils';

type FilterStatus = 'all' | 'ready' | 'deploying' | 'degraded' | 'draft';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'ready',     label: 'Ready' },
  { value: 'deploying', label: 'Deploying' },
  { value: 'degraded',  label: 'Degraded' },
  { value: 'draft',     label: 'Drafts' },
];

export default function Deployments() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<SavedFlow[]>([]);
  const [statuses, setStatuses] = useState<Record<string, WorkflowDeploymentStatusResponse>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<{
    flowId: string; flowName: string; version?: number;
  } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const apiFlows = await flowService.list();
      const mapped: SavedFlow[] = apiFlows.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description ?? undefined,
        nodes: f.nodes,
        edges: f.edges,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
        tags: f.tags,
        // Fields added by the backend publish phase — safe cast with fallback
        status: ((f as unknown as Record<string, unknown>).status as string ?? 'draft') as 'draft' | 'published' | 'deprecated',
        version: ((f as unknown as Record<string, unknown>).version as number) ?? 1,
        service_endpoint: ((f as unknown as Record<string, unknown>).service_endpoint as string) ?? undefined,
        published_at: ((f as unknown as Record<string, unknown>).published_at as string) ?? undefined,
        replicas: ((f as unknown as Record<string, unknown>).replicas as number) ?? 1,
      }));
      setFlows(mapped);

      // Fetch live K8s status for all published flows in parallel
      const published = mapped.filter((f) => f.status === 'published');
      const settled = await Promise.allSettled(
        published.map(async (f) => {
          const s = await deploymentService.getStatus(f.id);
          return [f.id, s] as const;
        })
      );
      const newStatuses: Record<string, WorkflowDeploymentStatusResponse> = {};
      settled.forEach((r) => {
        if (r.status === 'fulfilled') newStatuses[r.value[0]] = r.value[1];
      });
      setStatuses(newStatuses);
    } catch {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const openInDesigner = (flowId: string) => navigate(`/?flowId=${flowId}`);

  /**
   * Navigate the host shell to Agent Studio's pipeline view.
   *
   * Strategy:
   *  - When running **inside the shell iframe** (`window.self !== window.top`),
   *    post a message to the parent Angular app so it uses its own Router to
   *    navigate without opening a new tab.
   *  - When running **standalone** (direct localhost:3000 dev), fall back to
   *    window.open so the shell is still reachable.
   */
  const viewInAgentStudio = (pipelineId: string) => {
    const path = `/landing/agent/pipeline/view/${pipelineId}`;
    // Prefer session values injected by the parent shell (via SET_PARENT_SESSION).
    // Fall back to env vars for standalone dev mode only.
    const org    = sessionStorage.getItem('organisation');
    const roleId = sessionStorage.getItem('roleId');
    const queryParams = `page=1&search=&pipelineType=&org=${org}&roleId=${roleId}`;

    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
      // Tell the Angular shell (AgentComponent) to navigate via its Router.
      window.parent.postMessage(
        { type: 'NAVIGATE_TO_AGENT_STUDIO', path, queryParams },
        '*'
      );
    } else {
      // Standalone dev — shell origin from env, falls back to current origin.
      const devPort      = import.meta.env.VITE_PORT        ?? '3000';
      const shellOrigin  = import.meta.env.VITE_SHELL_ORIGIN ?? 'http://localhost:8087';
      const origin = window.location.port === devPort
        ? shellOrigin
        : window.location.origin;
      window.open(`${origin}/#${path}?${queryParams}`, '_blank');
    }
  };

  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    toast.success('Endpoint copied');
  };

  const filteredFlows = flows.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'all') return true;
    if (filter === 'draft') return !f.status || f.status === 'draft';
    const deployStatus = statuses[f.id]?.status ?? (f.status === 'published' ? 'deploying' : 'draft');
    return deployStatus === filter;
  });

  const publishedCount = flows.filter((f) => f.status === 'published').length;
  const draftCount = flows.filter((f) => !f.status || f.status === 'draft').length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        {/* Header */}
        <header className="h-12 flex items-center gap-2 px-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <Button
            size="icon" variant="ghost" className="h-8 w-8"
            onClick={() => navigate('/')}
            title="Back to Designer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground hidden sm:block">
            {LABELS.DEPLOYMENTS_TITLE}
          </span>
          <div className="flex-1" />
          <Button
            size="icon" variant="ghost" className="h-8 w-8"
            onClick={fetchAll}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </header>

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={LABELS.DEPLOYMENTS_SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
          <div className="flex items-center gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={filter === opt.value ? 'default' : 'ghost'}
                className="h-8 text-xs"
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {publishedCount} published · {draftCount} drafts
          </span>
        </div>

        {/* Flow list */}
        <ScrollArea className="flex-1">
          {filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search ? `No pipelines matching "${search}"` : LABELS.DEPLOYMENTS_EMPTY}
              </p>
              <p className="text-xs text-muted-foreground">
                {LABELS.DEPLOYMENTS_EMPTY_HINT}
              </p>
              <Button
                size="sm" variant="outline" className="h-8 text-xs gap-1.5 mt-2"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-3 h-3" /> {LABELS.DEPLOYMENTS_BACK_TO_DESIGNER}
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3 max-w-4xl mx-auto">
              {filteredFlows.map((flow) => {
                const deployStatus = statuses[flow.id];
                const badgeStatus = flow.status === 'published'
                  ? ((deployStatus?.status ?? 'deploying') as 'deploying' | 'ready' | 'degraded' | 'unknown')
                  : 'draft';
                const endpoint = deployStatus?.service_endpoint ?? flow.service_endpoint;

                return (
                  <div
                    key={flow.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {flow.name}
                          </span>
                          {flow.status === 'published' && flow.version !== undefined && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              v{flow.version}
                            </span>
                          )}
                          <DeploymentStatusBadge
                            status={badgeStatus}
                            readyReplicas={deployStatus?.ready_replicas}
                            desiredReplicas={deployStatus?.desired_replicas}
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                          <span>{flow.nodes.length} nodes · {flow.edges.length} connections</span>
                          {flow.published_at && (
                            <span>
                              Published: {new Date(flow.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Endpoint chip */}
                    {endpoint && (
                      <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5">
                        <code className="text-[10px] text-muted-foreground flex-1 truncate">
                          {endpoint}
                        </code>
                        <Button
                          size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0"
                          onClick={() => copyEndpoint(endpoint)}
                          title="Copy endpoint"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {flow.status === 'published' && (
                        <Button
                          size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                          onClick={() =>
                            setDrawerTarget({
                              flowId: flow.id,
                              flowName: flow.name,
                              version: flow.version,
                            })
                          }
                        >
                          <Activity className="w-3 h-3" /> {LABELS.DEPLOYMENTS_STATUS_BTN}
                        </Button>
                      )}
                      <Button
                        size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                        onClick={() => {
                          // TODO: replace 'LEOTSTNG51718' with flow.pipeline_id
                          // once the backend returns a pipeline_id on each flow.
                          const pipelineId = 'LEOTSTNG51718';
                          viewInAgentStudio(pipelineId);
                        }}
                      >
                        <Code2 className="w-3 h-3" /> {LABELS.DEPLOYMENTS_VIEW_IN_AGENT_STUDIO}
                      </Button>
                      <Button
                        size="sm" variant="ghost" className="h-7 text-xs gap-1.5"
                        onClick={() => openInDesigner(flow.id)}
                      >
                        <ExternalLink className="w-3 h-3" /> {LABELS.DEPLOYMENTS_OPEN_IN_DESIGNER}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Deployment status drawer */}
      {drawerTarget && (
        <DeploymentStatusDrawer
          open={!!drawerTarget}
          onOpenChange={(o) => { if (!o) setDrawerTarget(null); }}
          flowId={drawerTarget.flowId}
          flowName={drawerTarget.flowName}
          version={drawerTarget.version}
          onOpenInDesigner={() => openInDesigner(drawerTarget.flowId)}
          onUnpublished={fetchAll}
        />
      )}

      <Toaster position="top-right" theme="dark" richColors />
    </TooltipProvider>
  );
}
