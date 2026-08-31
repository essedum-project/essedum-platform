import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../../store/flowStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  Play, Square, Save, Download, Upload,
  Plus, PanelLeft, PanelRight, Terminal, Edit2, Check, X,
  Layers, Zap, Rocket, Activity, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { PlaygroundModal } from './PlaygroundModal';
import { PublishModal } from './PublishModal';
import { DeploymentStatusDrawer } from './DeploymentStatusDrawer';
import { LABELS } from '../../lib/labels';

export function TopBar() {
  const {
    currentFlowName, currentFlowId, renameFlow, saveFlow, newFlow, exportFlow, importFlow,
    runFlow, stopExecution, execution,
    showNodeLibrary, showInspector, showLogs,
    toggleNodeLibrary, toggleInspector, toggleLogs,
    setShowFlowManager, nodes, edges, savedFlows,
  } = useFlowStore();

  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(currentFlowName);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);

  const isRunning = execution.status === 'running';
  const currentFlow = savedFlows.find((f) => f.id === currentFlowId);
  const isPublished = currentFlow?.status === 'published';

  const handleRename = () => {
    if (nameVal.trim()) { renameFlow(nameVal.trim()); toast.success(LABELS.TOPBAR_TOAST_FLOW_RENAMED); }
    setEditingName(false);
  };

  const handleSave = () => { saveFlow().then(() => toast.success(LABELS.TOPBAR_TOAST_FLOW_SAVED)).catch(() => toast.error(LABELS.TOPBAR_TOAST_FLOW_SAVE_FAILED)); };

  const handleRun = async () => {
    if (nodes.length === 0) { toast.error(LABELS.TOPBAR_TOAST_NO_NODES); return; }
    await runFlow();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        importFlow(e.target?.result as string);
        toast.success('Flow imported');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="h-12 flex items-center gap-2 px-3 border-b border-border bg-card/80 backdrop-blur-sm z-50 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold text-foreground font-display tracking-wide hidden sm:block">
          {LABELS.APP_NAME}
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Flow Name */}
      <div className="flex items-center gap-1 min-w-0">
        {editingName ? (
          <div className="flex items-center gap-1">
            <Input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
              className="h-7 text-sm w-40 bg-background"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRename}><Check className="w-3 h-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(false)}><X className="w-3 h-3" /></Button>
          </div>
        ) : (
          <button
            onClick={() => { setNameVal(currentFlowName); setEditingName(true); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors group"
          >
            <span className="text-sm font-medium text-foreground truncate max-w-[160px]">{currentFlowName}</span>
            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1 hidden md:flex">
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">{nodes.length}N</Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">{edges.length}E</Badge>
      </div>

      <div className="flex-1" />

      {/* Panel toggles */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon" variant="ghost"
              className={cn('h-8 w-8', showNodeLibrary && 'bg-primary/10 text-primary')}
              onClick={toggleNodeLibrary}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_NODE_LIBRARY}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon" variant="ghost"
              className={cn('h-8 w-8', showLogs && 'bg-primary/10 text-primary')}
              onClick={toggleLogs}
            >
              <Terminal className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_EXECUTION_LOGS}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon" variant="ghost"
              className={cn('h-8 w-8', showInspector && 'bg-primary/10 text-primary')}
              onClick={toggleInspector}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_NODE_INSPECTOR}</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowFlowManager(true)}>
              <Layers className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_FLOW_MANAGER}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate('/deployments')}>
              <Globe className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_DEPLOYMENTS_PAGE}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { newFlow(); toast.info(LABELS.TOPBAR_TOAST_NEW_FLOW); }}>
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_NEW_FLOW}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_SAVE_FLOW}</TooltipContent>
        </Tooltip>

        {/* Deployment Status — only when published */}
        {isPublished && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon" variant="ghost"
                className="h-8 w-8 text-green-400 hover:text-green-300"
                onClick={() => setStatusDrawerOpen(true)}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{LABELS.TOPBAR_VIEW_DEPLOYMENT}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={exportFlow}>
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_EXPORT_JSON}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleImport}>
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_IMPORT_JSON}</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Create Pipeline / Save Pipeline button */}
      <Button
        size="sm"
        variant={isPublished ? 'outline' : 'default'}
        className={cn(
          'h-8 gap-1.5 text-xs font-semibold',
          isPublished
            ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
          !currentFlowId && 'opacity-40 cursor-not-allowed',
        )}
        onClick={() => {
          if (!currentFlowId) { toast.warning(LABELS.TOPBAR_TOAST_PUBLISH_SAVE_FIRST); return; }
          setPublishOpen(true);
        }}
      >
        {isPublished
          ? <Save className="w-3 h-3" />
          : <Rocket className="w-3 h-3 fill-current" />}
        {isPublished ? LABELS.TOPBAR_SAVE_PIPELINE : LABELS.TOPBAR_PUBLISH_WORKFLOW}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Run / Stop */}
      {isRunning ? (
        <Button
          size="sm"
          variant="destructive"
          className="h-8 gap-1.5 text-xs font-semibold"
          onClick={stopExecution}
        >
          <Square className="w-3 h-3 fill-current" />
          {LABELS.TOPBAR_STOP}
        </Button>
      ) : (
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleRun}
        >
          <Play className="w-3 h-3 fill-current" />
          {LABELS.TOPBAR_RUN_FLOW}
        </Button>
      )}

      {/* Playground — only when flow is saved */}
      {currentFlowId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setPlaygroundOpen(true)}
            >
              <Play className="w-3 h-3" />
              {LABELS.TOPBAR_PLAYGROUND}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{LABELS.TOPBAR_OPEN_PLAYGROUND}</TooltipContent>
        </Tooltip>
      )}

      <PlaygroundModal open={playgroundOpen} onClose={() => setPlaygroundOpen(false)} />

      {/* Publish Modal */}
      {currentFlowId && (
        <PublishModal
          open={publishOpen}
          onOpenChange={setPublishOpen}
          flowId={currentFlowId}
          flowName={currentFlowName}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          currentStatus={currentFlow?.status ?? 'draft'}
          currentVersion={currentFlow?.version}
          onPublished={() => toast.success(LABELS.TOPBAR_TOAST_PUBLISHED)}
          onViewStatus={() => setStatusDrawerOpen(true)}
        />
      )}

      {/* Deployment Status Drawer */}
      {currentFlowId && isPublished && (
        <DeploymentStatusDrawer
          open={statusDrawerOpen}
          onOpenChange={setStatusDrawerOpen}
          flowId={currentFlowId}
          flowName={currentFlowName}
          version={currentFlow?.version}
          onOpenInDesigner={() => setStatusDrawerOpen(false)}
        />
      )}
    </header>
  );
}
