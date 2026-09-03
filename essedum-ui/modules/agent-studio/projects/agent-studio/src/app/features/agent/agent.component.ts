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

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // Sync main-app theme → Langflow before iframe loads so the init script picks it up.
    const isDark = document.body.classList.contains('header-dark-theme') ||
      localStorage.getItem('aip-header-theme') === 'dark';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const iframeUrl = this.langflowUrl.replace(/\/?$/, '/');
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
  }

  /** Apply current main-app theme into the iframe via postMessage + direct DOM. */
  private syncThemeToIframe(): void {
    const iframeEl = this.langflowIframeRef?.nativeElement;
    if (!iframeEl) return;
    const isDark = document.body.classList.contains('header-dark-theme') ||
      localStorage.getItem('aip-header-theme') === 'dark';
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    // postMessage so the React app's listener updates its own state
    try {
      iframeEl.contentWindow?.postMessage({ type: 'SET_THEME', theme }, window.location.origin);
    } catch { /* cross-origin guard */ }
    // Direct DOM: works immediately for same-origin iframes
    try {
      const htmlEl = iframeEl.contentDocument?.documentElement;
      if (htmlEl) {
        htmlEl.classList.toggle('dark', isDark);
        htmlEl.style.colorScheme = theme;
      }
    } catch { /* cross-origin guard */ }
  }

  ngAfterViewInit(): void {
    const token = localStorage.getItem('access_token') || '';
    const parentOrg = localStorage.getItem('organization') || '';

    // console.log('Agent Component: Retrieved values', {
    //   token: token ? 'present' : 'empty',
    //   organisation: parentOrg ? `'${parentOrg}'` : 'null/empty'
    // });

    const iframeEl = this.langflowIframeRef?.nativeElement;
    const childOrigin = (() => {
      try { return new URL(this.langflowUrl, window.location.origin).origin; } catch { return this.langflowUrl; }
    })();

    const postToIframe = () => {
      if (!iframeEl || !iframeEl.contentWindow) return;
      try {
        // log masked token for debugging
        const mask = (s: string) => s ? `${s.substring(0, 20)}...${s.slice(-6)}` : '<empty>';
        // console.log('Parent: posting token to iframe', { name: 'access_token', value: mask(token) });
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
        // console.log('Parent: sent SET_ORGANISATION message', { organisation: parentOrg });


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
            token, userId,
            userName,
          };
          // console.log('Parent: posting parentSessionDetails to iframe', { parentSessionDetails });
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
        // Apply theme each time the iframe (re)loads
        this.syncThemeToIframe();
      });
    }

    // Watch body class changes so Light/Dark toggle propagates live into the iframe
    const themeObserver = new MutationObserver(() => this.syncThemeToIframe());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

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