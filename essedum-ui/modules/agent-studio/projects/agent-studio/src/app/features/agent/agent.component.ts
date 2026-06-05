import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-agent',
    templateUrl: './agent.component.html',
    styleUrls: ['./agent.component.scss'],
    standalone: false
})
export class AgentComponent implements OnInit, AfterViewInit {
  // Embedded Langflow interface URL - loaded from environment
  currentIframeUrl: SafeResourceUrl;
  private readonly langflowUrl = environment.langflowUrl;

  @ViewChild('langflowIframeRef') langflowIframeRef!: ElementRef<HTMLIFrameElement>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.langflowUrl);
  }

  ngAfterViewInit(): void {
    const token = localStorage.getItem('access_token') || '';
    const parentOrg = localStorage.getItem('organization') || '';

    console.log('Agent Component: Retrieved values', {
      token: token ? 'present' : 'empty',
      organisation: parentOrg ? `'${parentOrg}'` : 'null/empty'
    });

    const iframeEl = this.langflowIframeRef?.nativeElement;
    const childOrigin = (() => {
      try { return new URL(this.langflowUrl).origin; } catch { return this.langflowUrl; }
    })();

    const postToIframe = () => {
      if (!iframeEl || !iframeEl.contentWindow) return;
      try {
        // log masked token for debugging
        const mask = (s: string) => s ? `${s.substring(0,20)}...${s.slice(-6)}` : '<empty>';
        console.log('Parent: posting token to iframe', { name: 'access_token', value: mask(token) });
            // helper to safely post messages to iframe
            const sendToIframe = (msg: any) => {
              if (!iframeEl || !iframeEl.contentWindow) return;
              try {
                iframeEl.contentWindow.postMessage(msg, childOrigin);
                console.log('Parent: posted message to iframe', msg);
              } catch (err) {
                console.warn('Parent: failed to post message to iframe', err, msg);
              }
            };

            // send token
            sendToIframe({ type: 'SET_TOKEN', token });
            sendToIframe({ type: 'SET_ORGANISATION', organisation: parentOrg });
            console.log('Parent: sent SET_ORGANISATION message', { organisation: parentOrg });


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
        console.log('Parent received TOKEN_RECEIVED from child:', msg.status || 'ok', { tokenName: 'access_token' });
      }

      if (msg.type === 'ORG_RECEIVED') {
        console.log('Parent received ORG_RECEIVED from child:', msg.status || 'ok', { organisation: parentOrg });
      }

      if (msg.type === 'PARENT_SESSION_RECEIVED') {
        console.log('Parent received PARENT_SESSION_RECEIVED from child:', msg.status || 'ok');
      }
    };
    window.addEventListener('message', ackHandler);

 
  }


}