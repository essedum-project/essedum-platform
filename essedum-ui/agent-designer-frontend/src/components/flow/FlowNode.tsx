import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { AgentFlowNode, FlowNodeData } from '../../types/flow';
import { useFlowStore } from '../../store/flowStore';
import { CATEGORY_META } from '../../data/nodeDefinitions';
import { cn, formatOutputPreview } from '../../lib/utils';

const statusColors = {
  idle: '',
  running: 'ring-2 ring-primary ring-offset-1 ring-offset-background animate-run-pulse',
  success: 'ring-2 ring-green-400 ring-offset-1 ring-offset-background',
  error: 'ring-2 ring-destructive ring-offset-1 ring-offset-background',
  skipped: 'opacity-50',
};

const statusDot = {
  idle: 'hidden',
  running: 'bg-primary animate-pulse',
  success: 'bg-green-400',
  error: 'bg-destructive',
  skipped: 'bg-muted-foreground',
};

export const FlowNode = memo(({ id, data: rawData, selected }: NodeProps<AgentFlowNode>) => {
  const data = rawData as unknown as FlowNodeData;
  const { selectNode, selectedNodeId } = useFlowStore();
  const meta = CATEGORY_META[data.definition.category];
  const isSelected = selected || selectedNodeId === id;
  const status = data.status || 'idle';

  const categoryColorVar = {
    llm: 'var(--node-llm)',
    tool: 'var(--node-tool)',
    agent: 'var(--node-agent)',
    memory: 'var(--node-memory)',
    prompt: 'var(--node-prompt)',
    mcp: 'var(--node-mcp)',
    input: 'var(--node-input)',
    output: 'var(--node-output)',
    condition: 'var(--node-condition)',
  }[data.definition.category];

  return (
    <div
      className={cn(
        'relative min-w-[180px] max-w-[220px] rounded-xl border cursor-pointer select-none animate-node-appear',
        'bg-card border-border shadow-[var(--shadow-node)]',
        'transition-all duration-150',
        isSelected && 'border-primary/70',
        statusColors[status],
      )}
      onClick={() => selectNode(id)}
      style={{
        boxShadow: isSelected
          ? `var(--shadow-node), 0 0 0 1px hsl(${categoryColorVar?.toString()?.replace('hsl(', '').replace(')', '')} / 0.5)`
          : 'var(--shadow-node)',
      }}
    >
      {/* Top color strip */}
      <div
        className="h-1 rounded-t-xl"
        style={{ background: meta.color }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <span className="text-lg leading-none">{data.definition.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground leading-tight truncate">
            {data.label}
          </div>
          <div className="text-[10px] mt-0.5 truncate" style={{ color: meta.color }}>
            {meta.label}
          </div>
        </div>
        {/* Status dot */}
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', statusDot[status])} />
      </div>

      {/* Ports */}
      <div className="px-3 pb-3 space-y-1">
        {(data.definition.inputs?.length ?? 0) > 0 && (
          <div className="space-y-1">
            {(data.definition.inputs ?? []).map((port) => (
              <div key={port.id} className="relative flex items-center gap-1.5">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  style={{ left: -16, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
                />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">{port.label}</span>
              </div>
            ))}
          </div>
        )}

        {(data.definition.inputs?.length ?? 0) > 0 && (data.definition.outputs?.length ?? 0) > 0 && (
          <div className="h-px bg-border my-1" />
        )}

        {(data.definition.outputs?.length ?? 0) > 0 && (
          <div className="space-y-1">
            {(data.definition.outputs ?? []).map((port) => (
              <div key={port.id} className="relative flex items-center justify-end gap-1.5">
                <span className="text-[10px] text-muted-foreground truncate">{port.label}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  style={{ right: -16, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback-loop iteration badge */}
      {data.definition?.type === 'feedback-loop-agent' && status === 'success' && data.output != null && (
        <div className="mx-3 mb-1.5 flex items-center justify-center gap-2 px-2 py-1 rounded-md bg-purple-400/10 border border-purple-400/20">
          <span className="text-[9px] font-mono text-purple-400">
            {(data.output as Record<string, unknown>).iterations ?? 0} iter
          </span>
          <span className="text-[9px] text-muted-foreground">·</span>
          <span className="text-[9px] font-mono text-purple-400">
            score {(data.output as Record<string, unknown>).score ?? '?'}/10
          </span>
        </div>
      )}

      {/* Output preview */}
      {data.output != null && status === 'success' && (
        <div className="mx-3 mb-2.5 p-2 rounded-lg bg-green-400/5 border border-green-400/20">
          <p className="text-[9px] text-green-400 leading-relaxed line-clamp-2 font-mono">
            {formatOutputPreview(data.output).slice(0, 80)}…
          </p>
        </div>
      )}
    </div>
  );
});

FlowNode.displayName = 'FlowNode';
