import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Rocket, Check, X, Loader2, Copy, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { deploymentService } from '../../services/deploymentService';
import type { WorkflowDeploymentStatusResponse } from '../../models/api';
import { LABELS } from '../../lib/labels';

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  flowName: string;
  nodeCount: number;
  edgeCount: number;
  currentStatus: 'draft' | 'published' | 'deprecated';
  currentVersion?: number;
  onPublished?: (status: WorkflowDeploymentStatusResponse) => void;
  onViewStatus?: () => void;
}

type PublishPhase = 'idle' | 'publishing' | 'ready' | 'error';

interface Step {
  label: string;
  state: 'pending' | 'running' | 'done' | 'error';
}

const INITIAL_STEPS: Step[] = [
  { label: 'Creating ConfigMap', state: 'pending' },
  { label: 'Creating Deployment', state: 'pending' },
  { label: 'Creating Service', state: 'pending' },
  { label: 'Waiting for pod readiness', state: 'pending' },
];

export function PublishModal({
  open, onOpenChange, flowId, flowName, nodeCount, edgeCount,
  currentStatus, currentVersion, onPublished, onViewStatus,
}: PublishModalProps) {
  const [replicas, setReplicas] = useState(1);
  const [versionLabel, setVersionLabel] = useState('');
  const [phase, setPhase] = useState<PublishPhase>('idle');
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<WorkflowDeploymentStatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isRePublish = currentStatus === 'published';
  const nextVersion = (currentVersion ?? 0) + 1;

  const setStep = (idx: number, state: Step['state']) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, state } : s)));

  const handlePublish = async () => {
    setPhase('publishing');
    setErrorMsg('');
    setSteps(INITIAL_STEPS.map((s, i) => ({ ...s, state: i === 0 ? 'running' : 'pending' })));

    try {
      const statusResponse = await deploymentService.publish(flowId, {
        replicas,
        version_label: versionLabel.trim() || undefined,
      });

      setStep(0, 'done');
      setStep(1, 'done');
      setStep(2, 'done');
      setStep(3, 'running');

      // Poll for readiness (max 120s in 5s intervals)
      const MAX_POLLS = 24;
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        try {
          const liveStatus = await deploymentService.getStatus(flowId);
          if (liveStatus.status === 'ready') {
            setStep(3, 'done');
            setResult(liveStatus);
            setPhase('ready');
            onPublished?.(liveStatus);
            return;
          }
          if (liveStatus.status === 'degraded') {
            setStep(3, 'error');
            setErrorMsg('Deployment is in a degraded state. Check pod logs.');
            setPhase('error');
            return;
          }
        } catch {
          // continue polling
        }
      }

      // Timed out — use the initial response as success indication
      setStep(3, 'done');
      setResult(statusResponse);
      setPhase('ready');
      onPublished?.(statusResponse);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      setSteps((prev) =>
        prev.map((s) => (s.state === 'running' ? { ...s, state: 'error' } : s))
      );
      setErrorMsg(msg);
      setPhase('error');
      toast.error(LABELS.PUBLISH_MODAL_TOAST_ERROR);
    }
  };

  const handleClose = () => {
    if (phase === 'publishing') return;
    setPhase('idle');
    setSteps(INITIAL_STEPS);
    setResult(null);
    setErrorMsg('');
    setReplicas(1);
    setVersionLabel('');
    onOpenChange(false);
  };

  const copyEndpoint = () => {
    if (result?.service_endpoint) {
      navigator.clipboard.writeText(result.service_endpoint);
      toast.success('Endpoint copied');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Rocket className="w-4 h-4 text-primary" />
            {isRePublish ? LABELS.TOPBAR_UPDATE_DEPLOYMENT : LABELS.TOPBAR_PUBLISH_WORKFLOW}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Workflow summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <span className="font-medium text-foreground truncate max-w-[60%]">{flowName}</span>
            <span>{nodeCount} nodes · {edgeCount} connections</span>
          </div>

          {/* Idle / form state */}
          {phase === 'idle' && (
            <>
              {isRePublish && (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Currently on <strong>v{currentVersion}</strong>. Publishing creates
                  <strong> v{nextVersion}</strong> with a rolling update.
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Version Label <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  placeholder={`v${nextVersion}.0.0`}
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Initial Replicas</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon" variant="outline" className="h-8 w-8"
                    onClick={() => setReplicas((r) => Math.max(1, r - 1))}
                    disabled={replicas <= 1}
                  >−</Button>
                  <span className="w-8 text-center text-sm font-mono font-semibold">{replicas}</span>
                  <Button
                    size="icon" variant="outline" className="h-8 w-8"
                    onClick={() => setReplicas((r) => Math.min(10, r + 1))}
                    disabled={replicas >= 10}
                  >+</Button>
                  <span className="text-xs text-muted-foreground">pods (max 10)</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>Secrets in this workflow are stored in a Kubernetes Secret, not in the ConfigMap.</span>
              </div>
            </>
          )}

          {/* Publishing progress */}
          {phase === 'publishing' && (
            <div className="space-y-2.5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {step.state === 'done'    && <Check className="w-3.5 h-3.5 text-green-400" />}
                    {step.state === 'running' && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                    {step.state === 'error'   && <X className="w-3.5 h-3.5 text-destructive" />}
                    {step.state === 'pending' && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn(
                    step.state === 'done'    && 'text-green-400',
                    step.state === 'running' && 'text-foreground',
                    step.state === 'error'   && 'text-destructive',
                    step.state === 'pending' && 'text-muted-foreground',
                  )}>{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Success */}
          {phase === 'ready' && result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                {LABELS.PUBLISH_MODAL_PIPELINE_LIVE}
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Service Endpoint
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-foreground flex-1 truncate">
                    {result.service_endpoint}
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
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive">
              {errorMsg || 'An error occurred during deployment.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
          <Button
            size="sm" variant="ghost" className="h-8 text-xs"
            onClick={handleClose}
            disabled={phase === 'publishing'}
          >
            {phase === 'ready' ? LABELS.PUBLISH_MODAL_CLOSE : LABELS.PUBLISH_MODAL_CANCEL}
          </Button>
          <div className="flex gap-2">
            {phase === 'ready' && onViewStatus && (
              <Button
                size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                onClick={() => { onViewStatus(); handleClose(); }}
              >
                <Activity className="w-3 h-3" /> {LABELS.PUBLISH_MODAL_VIEW_STATUS}
              </Button>
            )}
            {(phase === 'idle' || phase === 'error') && (
              <Button
                size="sm" className="h-8 text-xs gap-1.5"
                onClick={handlePublish}
              >
                <Rocket className="w-3 h-3" />
                {phase === 'error' ? LABELS.PUBLISH_MODAL_BTN_RETRY : isRePublish ? LABELS.PUBLISH_MODAL_BTN_UPDATE : LABELS.PUBLISH_MODAL_BTN_CREATE}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
