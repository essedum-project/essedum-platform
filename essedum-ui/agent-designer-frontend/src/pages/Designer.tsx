import { useEffect } from 'react';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/sonner';
import { useFlowStore } from '../store/flowStore';
import { TopBar } from '../components/flow/TopBar';
import { NodeLibrary } from '../components/flow/NodeLibrary';
import { FlowCanvas } from '../components/flow/FlowCanvas';
import { NodeInspector } from '../components/flow/NodeInspector';
import { LogsPanel } from '../components/flow/LogsPanel';
import { FlowManager } from '../components/flow/FlowManager';
import { KeyboardShortcuts } from '../components/flow/KeyboardShortcuts';

export default function Designer() {
  const { showNodeLibrary, showInspector, showLogs, loadFlow } = useFlowStore();

  // Deep-link: ?flowId=<id> auto-loads a specific flow on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLinkId = params.get('flowId');
    if (deepLinkId) {
      loadFlow(deepLinkId).catch(() => {
        console.warn('Deep-link flow not found:', deepLinkId);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <KeyboardShortcuts />
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        {/* Top bar */}
        <TopBar />

        {/* Main layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Node Library */}
          {showNodeLibrary && <NodeLibrary />}

          {/* Center: Canvas + Logs */}
          <div className="flex flex-col flex-1 min-w-0">
            <FlowCanvas />
            {showLogs && <LogsPanel />}
          </div>

          {/* Right: Inspector */}
          {showInspector && <NodeInspector />}
        </div>

        {/* Modals */}
        <FlowManager />
      </div>
      <Toaster position="top-right" theme="dark" richColors />
    </TooltipProvider>
  );
}
