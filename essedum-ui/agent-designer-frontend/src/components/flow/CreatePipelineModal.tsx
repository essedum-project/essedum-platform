import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { GitBranch, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LABELS } from '../../lib/labels';
import { useFlowStore } from '../../store/flowStore';
import { pipelineService } from '../../services/pipelineService';
import type { PipelineResponse } from '../../models/api';

interface CreatePipelineModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (pipeline: PipelineResponse) => void;
}

export function CreatePipelineModal({ open, onClose, onCreated }: CreatePipelineModalProps) {
  const { currentFlowId, currentFlowName } = useFlowStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill name from flow name when modal opens
  useEffect(() => {
    if (open) {
      setName(currentFlowName || '');
      setDescription('');
    }
  }, [open, currentFlowName]);

  const handleSubmit = async () => {
    if (!currentFlowId) return;
    if (!name.trim()) {
      toast.error('Pipeline name is required');
      return;
    }

    setSubmitting(true);
    try {
      const pipeline = await pipelineService.create({
        flow_id: currentFlowId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(LABELS.PIPELINE_TOAST_SUCCESS);
      onCreated?.(pipeline);
      onClose();
    } catch {
      toast.error(LABELS.PIPELINE_TOAST_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !submitting) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            {LABELS.PIPELINE_MODAL_TITLE}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {LABELS.PIPELINE_MODAL_DESCRIPTION}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Flow source badge */}
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground">Source flow:</span>
            <Badge variant="secondary" className="text-xs font-mono">{currentFlowName}</Badge>
          </div>

          {/* Pipeline name */}
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-name" className="text-sm font-medium">
              {LABELS.PIPELINE_MODAL_NAME_LABEL}
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="pipeline-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={LABELS.PIPELINE_MODAL_NAME_PLACEHOLDER}
              className="h-9"
              autoFocus
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-desc" className="text-sm font-medium">
              {LABELS.PIPELINE_MODAL_DESC_LABEL}
            </Label>
            <Textarea
              id="pipeline-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={LABELS.PIPELINE_MODAL_DESC_PLACEHOLDER}
              className="resize-none h-20 text-sm"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            {LABELS.PIPELINE_MODAL_CANCEL}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <GitBranch className="w-3 h-3" />
                {LABELS.PIPELINE_MODAL_SUBMIT}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
