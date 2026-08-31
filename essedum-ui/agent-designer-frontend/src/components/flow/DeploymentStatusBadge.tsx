import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type BadgeStatus = 'draft' | 'deploying' | 'ready' | 'degraded' | 'deprecated' | 'unknown';

interface DeploymentStatusBadgeProps {
  status: BadgeStatus;
  readyReplicas?: number;
  desiredReplicas?: number;
  className?: string;
}

const CONFIG: Record<BadgeStatus, { label: string; dot?: string; cls: string }> = {
  draft:      { label: 'Draft',       cls: 'border border-border text-muted-foreground bg-transparent' },
  deploying:  { label: 'Deploying…',  cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  ready:      { label: 'Ready',       dot: 'bg-green-400',  cls: 'bg-green-500/15 text-green-400 border border-green-500/30' },
  degraded:   { label: 'Degraded',    dot: 'bg-red-400',    cls: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  deprecated: { label: 'Deprecated',  cls: 'border border-border text-muted-foreground bg-transparent line-through' },
  unknown:    { label: 'Unknown',     cls: 'border border-border text-muted-foreground bg-transparent' },
};

export function DeploymentStatusBadge({
  status, readyReplicas, desiredReplicas, className,
}: DeploymentStatusBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.unknown;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
      cfg.cls, className,
    )}>
      {status === 'deploying' ? (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      ) : cfg.dot ? (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      ) : null}
      {cfg.label}
      {status === 'ready' && readyReplicas !== undefined && desiredReplicas !== undefined && (
        <span className="opacity-60">{readyReplicas}/{desiredReplicas}</span>
      )}
    </span>
  );
}
