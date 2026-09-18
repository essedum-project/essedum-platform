import { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import type { NodeField } from '../../types/flow';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { CATEGORY_META, NODE_DEFINITIONS } from '../../data/nodeDefinitions';
import { cn, formatOutputPreview } from '../../lib/utils';
import { toast } from 'sonner';
import { LABELS } from '../../lib/labels';
import { llmService, SUPPORTED_PROVIDERS } from '../../services/llmService';

// Node types whose model list is fetched live from the backend /llm/models endpoint.
const LLM_NODE_DEFAULT_PROVIDER: Record<string, string> = {
  'ollama-llm': 'ollama',
  'litellm-llm': 'litellm',
};

export function NodeInspector() {
  const { nodes, selectedNodeId, updateNodeConfig, updateNodeLabel, deleteNode, duplicateNode } = useFlowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // LLM-specific: dynamic model list (providers exposing a /models endpoint)
  const nodeDefaultProvider = LLM_NODE_DEFAULT_PROVIDER[node?.data.definition.type ?? ''];
  const isLlmNode = Boolean(nodeDefaultProvider);
  const llmProvider = isLlmNode
    ? String(node!.data.config.llm_provider ?? nodeDefaultProvider)
    : 'ollama';
  const [llmModels, setLlmModels] = useState<string[]>([]);
  const [llmModelsLoading, setLlmModelsLoading] = useState(false);

  useEffect(() => {
    if (!isLlmNode) return;
    let cancelled = false;
    setLlmModels([]);
    setLlmModelsLoading(true);

    const currentModel = String(node!.data.config.model ?? '');

    llmService
      .listModels(llmProvider)
      .then((res) => {
        if (!cancelled) {
          const fetched = res.models;
          // Always include the already-saved model so the dropdown shows it even if
          // the API returns a list that doesn't include it (e.g. manually entered name)
          const enriched = currentModel && !fetched.includes(currentModel)
            ? [currentModel, ...fetched]
            : fetched;
          setLlmModels(enriched);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // API unreachable — still show the saved model so the value isn't lost
          setLlmModels(currentModel ? [currentModel] : []);
        }
      })
      .finally(() => { if (!cancelled) setLlmModelsLoading(false); });
    return () => { cancelled = true; };
  }, [isLlmNode, llmProvider]);

  if (!node) {
    return (
      <aside className="w-72 flex flex-col bg-card border-l border-border h-full animate-slide-in-right flex-shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">{LABELS.INSPECTOR_TITLE}</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg">🔍</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {LABELS.INSPECTOR_EMPTY_STATE}
          </p>
        </div>
      </aside>
    );
  }

  const { data } = node;
  const { definition, config, status, output } = data;
  // Prefer the live library definition (so additions to ``fields`` propagate to
  // nodes that were created before the library was extended). Fall back to the
  // snapshot stored on the node if the type is unknown.
  const liveDefinition =
    NODE_DEFINITIONS.find((d) => d.type === definition.type) ?? definition;
  const meta = CATEGORY_META[definition.category];

  // Group fields
  const groups = (liveDefinition.fields ?? []).reduce((acc, field) => {
    const g = field.group || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(field);
    return acc;
  }, {} as Record<string, NodeField[]>);

  const updateField = (fieldId: string, value: unknown) => {
    updateNodeConfig(node.id, { [fieldId]: value });
  };

  const renderField = (field: NodeField) => {
    const value = config[field.id] ?? field.default ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 text-xs bg-background"
          />
        );
      case 'textarea':
      case 'code':
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn('text-xs bg-background min-h-[72px] resize-y', field.type === 'code' && 'font-mono text-[11px]')}
            rows={3}
          />
        );
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPasswords[field.id] ? 'text' : 'password'}
              value={String(value)}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder || '••••••••'}
              className="h-8 text-xs bg-background pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, [field.id]: !p[field.id] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords[field.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={String(value)}
            onChange={(e) => updateField(field.id, Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            className="h-8 text-xs bg-background"
          />
        );
      case 'slider':
        return (
          <div className="space-y-1">
            <Slider
              value={[Number(value)]}
              onValueChange={([v]) => updateField(field.id, v)}
              min={field.min || 0}
              max={field.max || 1}
              step={field.step || 0.01}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{field.min ?? 0}</span>
              <span className="font-mono text-foreground font-semibold">{Number(value).toFixed(2)}</span>
              <span>{field.max ?? 1}</span>
            </div>
          </div>
        );
      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(v) => updateField(field.id, v)}
          />
        );
      case 'select':
        return (
          <Select value={String(value)} onValueChange={(v) => updateField(field.id, v)}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-72 flex flex-col bg-card border-l border-border h-full animate-slide-in-right flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{definition.icon}</span>
          <div className="flex-1 min-w-0">
            <input
              className="w-full text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:bg-muted/50 rounded px-1 -mx-1 truncate"
              value={data.label}
              onChange={(e) => updateNodeLabel(node.id, e.target.value)}
            />
            <p className="text-[10px] mt-0.5" style={{ color: meta.color }}>{meta.label} · {definition.type}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{definition.description}</p>

        {/* Status */}
        {status && status !== 'idle' && (
          <div className={cn(
            'mt-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium',
            status === 'running' && 'bg-primary/10 text-primary',
            status === 'success' && 'bg-green-400/10 text-green-400',
            status === 'error' && 'bg-destructive/10 text-destructive',
            status === 'skipped' && 'bg-muted text-muted-foreground',
          )}>
            {status === 'running' && LABELS.INSPECTOR_STATUS_RUNNING}
            {status === 'success' && LABELS.INSPECTOR_STATUS_SUCCESS}
            {status === 'error' && LABELS.INSPECTOR_STATUS_ERROR}
            {status === 'skipped' && LABELS.INSPECTOR_STATUS_SKIPPED}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 mt-2">
          <Button
            size="sm" variant="outline"
            className="h-7 text-[11px] gap-1 flex-1"
            onClick={() => { duplicateNode(node.id); toast.success(LABELS.INSPECTOR_TOAST_DUPLICATED); }}
          >
            <Copy className="w-3 h-3" /> {LABELS.INSPECTOR_BTN_DUPLICATE}
          </Button>
          <Button
            size="sm" variant="outline"
            className="h-7 text-[11px] gap-1 flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={() => { deleteNode(node.id); toast.info(LABELS.INSPECTOR_TOAST_DELETED); }}
          >
            <Trash2 className="w-3 h-3" /> {LABELS.INSPECTOR_BTN_DELETE}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2 space-y-1">

          {/* ── LLM API section: provider + dynamic model picker ── */}
          {isLlmNode && (
            <div>
              <div className="py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                LLM API
              </div>
              <div className="space-y-2.5 mb-2">
                {/* Provider */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-foreground font-medium">Provider</Label>
                  <Select
                    value={llmProvider}
                    onValueChange={(v) => updateField('llm_provider', v)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_PROVIDERS.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model — dynamic from API */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-foreground font-medium">
                    Model <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Select
                    value={String(config.model ?? '')}
                    onValueChange={(v) => updateField('model', v)}
                    disabled={llmModelsLoading || llmModels.length === 0}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder={llmModelsLoading ? 'Loading…' : 'Select model'} />
                    </SelectTrigger>
                    <SelectContent>
                      {llmModels.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="my-1" />
            </div>
          )}

          {Object.entries(groups).map(([group, fields]) => {
            // The 'model' field is rendered by the LLM API section above
            const visibleFields = isLlmNode
              ? fields.filter((f) => f.id !== 'model')
              : fields;
            if (visibleFields.length === 0) return null;
            const isCollapsed = collapsedGroups[group];
            return (
              <div key={group}>
                <button
                  onClick={() => setCollapsedGroups((p) => ({ ...p, [group]: !p[group] }))}
                  className="w-full flex items-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {group}
                </button>

                {!isCollapsed && (
                  <div className="space-y-2.5 mb-2">
                    {visibleFields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] text-foreground font-medium">
                            {field.label}
                            {field.required && <span className="text-destructive ml-0.5">*</span>}
                          </Label>
                          {field.type === 'boolean' && renderField(field)}
                        </div>
                        {field.description && (
                          <p className="text-[10px] text-muted-foreground">{field.description}</p>
                        )}
                        {field.type !== 'boolean' && renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
                <Separator className="my-1" />
              </div>
            );
          })}

          {/* Output preview */}
          {output != null && (
            <div className="mt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{LABELS.INSPECTOR_OUTPUT_PREVIEW}</p>
              <div className="code-block text-[10px] leading-relaxed max-h-32 overflow-auto whitespace-pre-wrap">
                {formatOutputPreview(output)}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
