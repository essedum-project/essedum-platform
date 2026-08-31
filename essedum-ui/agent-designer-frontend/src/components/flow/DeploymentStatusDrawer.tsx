import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Copy, ExternalLink, Trash2, RefreshCw, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { deploymentService } from '../../services/deploymentService';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import type { WorkflowDeploymentStatusResponse } from '../../models/api';

interface DeploymentStatusDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  flowName: string;
  version?: number;
  onOpenInDesigner?: () => void;
  onUnpublished?: () => void;
}

export function DeploymentStatusDrawer({
  open, onOpenChange, flowId, flowName, version, onOpenInDesigner, onUnpublished,
}: DeploymentStatusDrawerProps) {
  const [status, setStatus] = useState<WorkflowDeploymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scaling, setScaling] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [pendingReplicas, setPendingReplicas] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!flowId) return;
    setLoading(true);
    try {
      const s = await deploymentService.getStatus(flowId);
      setStatus(s);
      setPendingReplicas((prev) => prev ?? s.desired_replicas);
    } catch {
      // silently fail on background polls
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    if (!open) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 10_000);
    return () => clearInterval(interval);
  }, [open, fetchStatus]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStatus(null);
      setPendingReplicas(null);
    }
  }, [open]);

  const handleScale = async (newReplicas: number) => {
    if (newReplicas < 1 || newReplicas > 10) return;
    setPendingReplicas(newReplicas);
    setScaling(true);
    try {
      const updated = await deploymentService.scale(flowId, newReplicas);
      setStatus(updated);
      toast.success(`Scaled to ${newReplicas} replica${newReplicas !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Failed to scale deployment');
      setPendingReplicas(status?.desired_replicas ?? 1);
    } finally {
      setScaling(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      await deploymentService.unpublish(flowId);
      toast.success('Workflow unpublished');
      onUnpublished?.();
      onOpenChange(false);
    } catch {
      toast.error('Failed to unpublish workflow');
    } finally {
      setConfirmUnpublish(false);
    }
  };

  const copyEndpoint = () => {
    if (status?.service_endpoint) {
      navigator.clipboard.writeText(status.service_endpoint);
      toast.success('Endpoint copied');
    }
  };

  const displayReplicas = pendingReplicas ?? status?.desired_replicas ?? 1;
  const badgeStatus = status
    ? (status.status as 'deploying' | 'ready' | 'degraded' | 'unknown')
    : 'unknown';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-[380px] sm:w-[420px] bg-card border-border flex flex-col gap-0 p-0"
          side="right"
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" />
              Deployment Status
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Summary row */}
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{flowName}</p>
                {version !== undefined && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">v{version}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DeploymentStatusBadge
                  status={badgeStatus}
                  readyReplicas={status?.ready_replicas}
                  desiredReplicas={status?.desired_replicas}
                />
                <Button
                  size="icon" variant="ghost" className="h-7 w-7"
                  onClick={fetchStatus}
                  disabled={loading}
                  title="Refresh"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                </Button>
              </div>
            </div>

            {/* Service Endpoint */}
            {status?.service_endpoint && (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Service Endpoint
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-foreground flex-1 truncate">
                    {status.service_endpoint}
                  </code>
                  <Button
                    size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0"
                    onClick={copyEndpoint}
                    title="Copy endpoint"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Replicas */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Replicas</p>
              <div className="flex items-center gap-3">
                <Button
                  size="icon" variant="outline" className="h-8 w-8"
                  onClick={() => handleScale(displayReplicas - 1)}
                  disabled={scaling || displayReplicas <= 1}
                >−</Button>
                <div className="text-center min-w-[40px]">
                  <span className="text-sm font-mono font-semibold">{displayReplicas}</span>
                  {status && (
                    <p className="text-[10px] text-muted-foreground">
                      {status.ready_replicas} ready
                    </p>
                  )}
                </div>
                <Button
                  size="icon" variant="outline" className="h-8 w-8"
                  onClick={() => handleScale(displayReplicas + 1)}
                  disabled={scaling || displayReplicas >= 10}
                >+</Button>
                {scaling && (
                  <span className="text-xs text-muted-foreground">Scaling…</span>
                )}
              </div>
            </div>

            {/* Health conditions */}
            {status && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Deployment Health</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <span className={cn(
                      'font-mono',
                      status.ready_replicas >= status.desired_replicas
                        ? 'text-green-400'
                        : 'text-amber-400',
                    )}>
                      {status.ready_replicas} / {status.desired_replicas}
                    </span>
                  </div>
                  {status.conditions?.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{c.type}</span>
                      <span className={c.status === 'True' ? 'text-green-400' : 'text-amber-400'}>
                        {c.status === 'True' ? '✓' : '—'}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="text-foreground">
                      {status.last_updated
                        ? new Date(status.last_updated).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Deployment name */}
            {status?.deployment_name && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Deployment
                </p>
                <code className="text-xs text-muted-foreground break-all">
                  {status.deployment_name}
                </code>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 border-t border-border space-y-2">
            {onOpenInDesigner && (
              <Button
                variant="outline"
                className="w-full h-9 text-xs gap-2"
                onClick={() => { onOpenInDesigner(); onOpenChange(false); }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Designer &amp; Edit
              </Button>
            )}
            <Button
              variant="destructive"
              className="w-full h-9 text-xs gap-2"
              onClick={() => setConfirmUnpublish(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Unpublish Workflow
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm unpublish dialog */}
      <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the Kubernetes Deployment, Service, and ConfigMap for{' '}
              <strong>{flowName}</strong>. The workflow JSON will be kept as a draft.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleUnpublish}
            >
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
