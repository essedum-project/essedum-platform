import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-playground-tab',
  templateUrl: './playground-tab.component.html',
  styleUrls: ['./playground-tab.component.scss']
})
export class PlaygroundTabComponent {
  @Input() pipelineMode: 'agent' | 'mcp' = 'agent';
  @Input() isRunningAndDeploying: boolean = false;
  @Input() canRunAndDeploy: boolean = false;
  @Input() canOpenPlayground: boolean = false;
  @Input() deploymentStatusMessage: string = '';
  @Input() deploymentStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  @Input() consoleOutput: string[] = [];
  @Input() isGenerating: boolean = false;
  @Input() isLoadingFiles: boolean = false;
  
  @Output() runAndDeployClick = new EventEmitter<void>();
  @Output() openPlaygroundClick = new EventEmitter<void>();

  onRunAndDeploy(): void {
    this.runAndDeployClick.emit();
  }

  onOpenPlayground(): void {
    this.openPlaygroundClick.emit();
  }

  getPlaygroundTooltipMessage(): string {
    if (this.canOpenPlayground) {
      return this.pipelineMode === 'mcp' 
        ? 'Open MCP Server Playground' 
        : 'Open Agent Playground';
    }
    
    if (this.deploymentStatus === 'running') {
      return 'Deployment in progress. Please wait...';
    }
    
    if (this.deploymentStatus === 'error') {
      return 'Deployment failed. Please try running and deploying again.';
    }
    
    return this.pipelineMode === 'mcp'
      ? 'Run and Deploy MCP server first to enable playground'
      : 'Run and Deploy agent first to enable playground';
  }
}
