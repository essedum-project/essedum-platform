import { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Download, Search, Clock, Layers, Rocket, Activity, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { LABELS } from '../../lib/labels';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import { PublishModal } from './PublishModal';
import { DeploymentStatusDrawer } from './DeploymentStatusDrawer';
import type { SavedFlow } from '../../types/flow';

export function FlowManager() {
  const {
    savedFlows, showFlowManager, setShowFlowManager,
    loadFlow, deleteFlow, newFlow, currentFlowId,
    saveFlow,
  } = useFlowStore();

  const [search, setSearch] = useState('');
  const [publishTarget, setPublishTarget] = useState<SavedFlow | null>(null);
  const [statusTarget, setStatusTarget] = useState<SavedFlow | null>(null);

  const filtered = savedFlows.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = savedFlows.filter((f) => f.status === 'published').length;
  const draftCount = savedFlows.filter((f) => !f.status || f.status === 'draft').length;

  const handleLoadFlow = (flowId: string, name: string) => {
    loadFlow(flowId)
      .then(() => toast.success(`Loaded "${name}"`))
      .catch(() => toast.error(LABELS.FLOW_MANAGER_TOAST_LOAD_FAILED));
  };

  return (
    <>
      <Dialog open={showFlowManager} onOpenChange={setShowFlowManager}>
        <DialogContent className="max-w-xl bg-card border-border p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Layers className="w-4 h-4 text-primary" />
              {LABELS.FLOW_MANAGER_TITLE}
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 py-3 border-b border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder={LABELS.FLOW_MANAGER_SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
              <Button
                size="sm" className="h-8 text-xs gap-1.5"
                onClick={() => { newFlow(); setShowFlowManager(false); toast.info(LABELS.FLOW_MANAGER_TOAST_NEW_FLOW); }}
              >
                <Plus className="w-3 h-3" /> {LABELS.FLOW_MANAGER_NEW_FLOW}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-80">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6 gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Layers className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {search ? `No flows matching "${search}"` : LABELS.FLOW_MANAGER_NO_FLOWS}
                </p>
                <p className="text-xs text-muted-foreground">{LABELS.FLOW_MANAGER_SAVE_HINT}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filtered.map((flow) => {
                  const isActive = flow.id === currentFlowId;
                  const badgeStatus = flow.status === 'published'
                    ? 'ready' as const
                    : ((flow.status ?? 'draft') as 'draft' | 'deprecated');
                  return (
                    <div
                      key={flow.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg border transition-all cursor-pointer group',
                        isActive
                          ? 'bg-primary/10 border-primary/30'
                          : 'border-transparent hover:bg-muted/70 hover:border-border/50',
                      )}
                      onClick={() => handleLoadFlow(flow.id, flow.name)}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? 'bg-primary/20' : 'bg-muted',
                      )}>
                        <Layers className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">{flow.name}</span>
                          {isActive && (
                            <Badge className="text-[9px] h-4 px-1.5 bg-primary text-primary-foreground">
                              {LABELS.FLOW_MANAGER_ACTIVE_BADGE}
                            </Badge>
                          )}
                          <DeploymentStatusBadge status={badgeStatus} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(flow.updatedAt).toLocaleDateString()}{' '}
                            {new Date(flow.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>{flow.nodes.length} nodes · {flow.edges.length} connections</span>
                        </div>
                        {flow.status === 'published' && flow.service_endpoint && (
                          <code className="text-[9px] text-muted-foreground truncate block mt-0.5">
                            {flow.service_endpoint}
                          </code>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(!flow.status || flow.status === 'draft') && (
                          <Button
                            size="icon" variant="ghost"
                            className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setPublishTarget(flow)}
                            title={LABELS.TOPBAR_PUBLISH_WORKFLOW}
                          >
                            <Rocket className="w-3 h-3" />
                          </Button>
                        )}
                        {flow.status === 'published' && (
                          <Button
                            size="icon" variant="ghost"
                            className="h-7 w-7 text-green-400 hover:text-green-300"
                            onClick={() => setStatusTarget(flow)}
                            title={LABELS.TOPBAR_VIEW_DEPLOYMENT}
                          >
                            <Activity className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => handleLoadFlow(flow.id, flow.name)}
                          title={LABELS.DEPLOYMENTS_OPEN_IN_DESIGNER}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${flow.name.replace(/\s+/g, '_')}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          title={LABELS.FLOW_MANAGER_EXPORT_TITLE}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            deleteFlow(flow.id)
                              .then(() => toast.info(`Deleted "${flow.name}"`))
                              .catch(() => toast.error(LABELS.FLOW_MANAGER_TOAST_DELETE_FAILED));
                          }}
                          title={LABELS.FLOW_MANAGER_DELETE_TITLE}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedFlows.length} {LABELS.FLOW_MANAGER_SAVED_FLOWS_SUFFIX}
              {publishedCount > 0 && (
                <span className="ml-1 text-green-400">· {publishedCount} published</span>
              )}
              {draftCount > 0 && (
                <span className="ml-1 text-muted-foreground/60">· {draftCount} drafts</span>
              )}
            </span>
            <Button
              size="sm" variant="outline" className="h-8 text-xs gap-1.5"
              onClick={() => {
                saveFlow()
                  .then(() => toast.success(LABELS.FLOW_MANAGER_TOAST_FLOW_SAVED))
                  .catch(() => toast.error(LABELS.FLOW_MANAGER_TOAST_FLOW_SAVE_FAILED));
              }}
            >
              <Plus className="w-3 h-3" /> {LABELS.FLOW_MANAGER_SAVE_CURRENT}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {publishTarget !== null && (
        <PublishModal
          open={true}
          onOpenChange={(o) => { if (!o) setPublishTarget(null); }}
          flowId={publishTarget.id}
          flowName={publishTarget.name}
          nodeCount={publishTarget.nodes.length}
          edgeCount={publishTarget.edges.length}
          currentStatus={publishTarget.status ?? 'draft'}
          currentVersion={publishTarget.version}
        />
      )}

      {statusTarget !== null && (
        <DeploymentStatusDrawer
          open={true}
          onOpenChange={(o) => { if (!o) setStatusTarget(null); }}
          flowId={statusTarget.id}
          flowName={statusTarget.name}
          version={statusTarget.version}
          onOpenInDesigner={() => {
            handleLoadFlow(statusTarget.id, statusTarget.name);
            setStatusTarget(null);
            setShowFlowManager(false);
          }}
        />
      )}
    </>
  );
}
