import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
})
export class AgentComponent implements OnInit {
  // Embedded Langflow interface URL
  currentIframeUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {
    // Initialize the iframe URL to Langflow directly
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://langflow.az.ad.idemo-ppc.com/');
  }
}