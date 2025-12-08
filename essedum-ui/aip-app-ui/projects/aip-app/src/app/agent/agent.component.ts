import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
})
export class AgentComponent implements OnInit, AfterViewInit {
  // Embedded Langflow interface URL
  currentIframeUrl: SafeResourceUrl;

  @ViewChild('langflowIframeRef') langflowIframeRef!: ElementRef<HTMLIFrameElement>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.langflowUrl);
  }

  ngAfterViewInit(): void {
    const token = localStorage.getItem('jwtToken') || '';
    const iframeEl = this.langflowIframeRef?.nativeElement;
    const childOrigin = (() => {
      try { return new URL(environment.langflowUrl).origin; } catch { return environment.langflowUrl; }
    })();

    const postToIframe = () => {
      if (!iframeEl || !iframeEl.contentWindow) return;
      try {
        // log masked token for debugging
        const mask = (s: string) => s ? `${s.substring(0,20)}...${s.slice(-6)}` : '<empty>';
        console.log('Parent: posting token to iframe', { name: 'jwtToken', value: mask(token) });
            // helper to safely post messages to iframe
            const sendToIframe = (msg: any) => {
              if (!iframeEl || !iframeEl.contentWindow) return;
              try {
                iframeEl.contentWindow.postMessage(msg, childOrigin);
                console.log('Parent: posted message to iframe', msg.type);
              } catch (err) {
                console.warn('Parent: failed to post message to iframe', err, msg.type);
              }
            };

            // send token
            sendToIframe({ type: 'SET_TOKEN', token });

            // Build parent session details and send to iframe (do not remove existing token logic)
            try {
              const project = sessionStorage.getItem('project');
              const role = sessionStorage.getItem('role');
              const portfoliodata = sessionStorage.getItem('portfoliodata');  
              const user = sessionStorage.getItem('user');
              const projectId = project ? JSON.parse(String(project)).id : undefined;
              const projectName = project ? JSON.parse(String(project)).name : undefined;
              const roleId = role ? JSON.parse(String(role)).id : undefined;
              const roleName = role ? JSON.parse(String(role)).name : undefined;
              const portfolioId = portfoliodata ? JSON.parse(String(portfoliodata)).id : undefined;
              const portfolioName = portfoliodata ? JSON.parse(String(portfoliodata)).portfolioName : undefined;
              const userId = user ? JSON.parse(String(user)).id : undefined;
              const userName = user ? JSON.parse(String(user)).user_login : undefined;
              const parentSessionDetails = {
                projectId,
                projectName,
                roleId,
                roleName,
                portfolioId,
                portfolioName,
                token,userId,
                userName,
              };
              console.log('Parent: posting parentSessionDetails to iframe', { parentSessionDetails });
              sendToIframe({ type: 'SET_PARENT_SESSION', parentSessionDetails });
            } catch (err) {
              console.warn('Parent: failed to build/post parentSessionDetails', err);
            }
      } catch (e) {
      }
    };

    // Post once immediately (in case iframe already loaded)
    postToIframe();
    if (iframeEl) {
      iframeEl.addEventListener('load', () => {
        postToIframe();
      });
    }

    // Listen for acknowledgement from child iframe
    const ackHandler = (event: MessageEvent) => {
      if (event.origin !== childOrigin) return;
      const msg = event.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'TOKEN_RECEIVED') {
        // token received ack from child
        console.log('Parent received TOKEN_RECEIVED from child:', msg.status || 'ok', { tokenName: 'jwtToken' });
      }

      if (msg.type === 'PARENT_SESSION_RECEIVED') {
        console.log('Parent received PARENT_SESSION_RECEIVED from child:', msg.status || 'ok');
      }
    };
    window.addEventListener('message', ackHandler);

 
  }


}