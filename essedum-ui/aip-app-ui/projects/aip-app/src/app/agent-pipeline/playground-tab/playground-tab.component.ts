import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-playground-tab',
  templateUrl: './playground-tab.component.html',
  styleUrls: ['./playground-tab.component.scss']
})
export class PlaygroundTabComponent {
  @Input() pipelineMode: 'agent' | 'mcp' | 'app' = 'agent';
  @Input() isRunningAndDeploying: boolean = false;
  @Input() isDeletingDeployment: boolean = false;
  @Input() canRunAndDeploy: boolean = false;
  @Input() canDeleteDeployment: boolean = false;
  @Input() canOpenPlayground: boolean = false;
  @Input() deploymentStatusMessage: string = '';
  @Input() deploymentStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  @Input() consoleOutput: string[] = [];
  @Input() isGenerating: boolean = false;
  @Input() isLoadingFiles: boolean = false;
  @Input() hasDeploymentFormData: boolean = false;
  @Input() isCheckingDeploymentData: boolean = false;
  @Input() deploymentEnvironment: string = '';
  @Input() showAppViewer: boolean = false;
  @Input() set appUrl(url: string) {
    this._appUrl = url;
    this.safeAppUrl = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }
  
  get appUrl(): string {
    return this._appUrl;
  }
  
  private _appUrl: string = '';
  safeAppUrl: SafeResourceUrl | null = null;
  
  @Output() runAndDeployClick = new EventEmitter<void>();
  @Output() deleteDeploymentClick = new EventEmitter<void>();
  @Output() openPlaygroundClick = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  onRunAndDeploy(): void {
    this.runAndDeployClick.emit();
  }

  onDeleteDeployment(): void {
    this.deleteDeploymentClick.emit();
  }

  onOpenPlayground(): void {
    this.openPlaygroundClick.emit();
  }

  getPlaygroundTooltipMessage(): string {
    // For App Pipeline, always show launch tooltip
    if (this.pipelineMode === 'app') {
      return 'Launch Application';
    }
    
    if (this.canOpenPlayground) {
      if (this.pipelineMode === 'mcp') {
        return 'Open MCP Server Playground';
      } else {
        return 'Open Agent Playground';
      }
    }
    
    if (this.deploymentStatus === 'running') {
      return 'Deployment in progress. Please wait...';
    }
    
    if (this.deploymentStatus === 'error') {
      return 'Deployment failed. Please try running and deploying again.';
    }
    
    if (this.pipelineMode === 'mcp') {
      return 'Run and Deploy MCP server first to enable playground';
    } else {
      return 'Run and Deploy agent first to enable playground';
    }
  }
}