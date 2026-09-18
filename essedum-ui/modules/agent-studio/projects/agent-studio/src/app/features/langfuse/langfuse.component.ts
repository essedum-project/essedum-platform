import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';


@Component({
    selector: 'app-langfuse',
    templateUrl: './langfuse.component.html',
    styleUrls: ['./langfuse.component.scss'],
    standalone: false
})
export class LangfuseComponent implements OnInit, AfterViewInit, OnDestroy {
  // Embedded Langfuse interface URL
  currentIframeUrl: SafeResourceUrl;
  isUrlConfigured = false;
  isIframeLoaded = false;
  isDark = true;
  private readonly langfuseUrl: string = environment.langfuseUrl;
  private themeObserver: MutationObserver | null = null;

  @ViewChild('langfuseIframeRef') langfuseIframeRef!: ElementRef<HTMLIFrameElement>;

  constructor(private sanitizer: DomSanitizer) {
    this.langfuseUrl = environment.langfuseUrl?.startsWith('__FE_') ? '/langfuse/' : environment.langfuseUrl;
  }

  ngOnInit(): void {
    // Guard against unsubstituted build-time placeholders (e.g. __FE_LANGFUSE_URL__).
    this.isUrlConfigured = !!(this.langfuseUrl?.startsWith('http') || this.langfuseUrl?.startsWith('/'));
    const url = this.isUrlConfigured ? this.langfuseUrl : 'about:blank';
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    // Detect initial theme from body classes
    this.isDark = !document.body.classList.contains('header-light-theme');
    
    // Watch for theme changes on body element
    this.watchThemeChanges();
  }

  ngAfterViewInit(): void {
    const iframeEl = this.langfuseIframeRef?.nativeElement;
    if (!iframeEl) return;
    
    // Listen for iframe load event to hide spinner and enable messaging
    iframeEl.onload = () => {
      this.isIframeLoaded = true;
      this.postToIframe();
    };
    
    // Also try posting after a timeout in case onload doesn't fire
    setTimeout(() => {
      if (!this.isIframeLoaded && iframeEl?.contentWindow) {
        this.isIframeLoaded = true;
        this.postToIframe();
      }
    }, 1500);
  }

  private postToIframe(): void {
    const token = localStorage.getItem('access_token') || '';
    const parentOrg = localStorage.getItem('organization') || '';

    console.log('Langfuse Component: Retrieved values', {
      token: token ? 'present' : 'empty',
      organisation: parentOrg ? `'${parentOrg}'` : 'null/empty'
    });

    const iframeEl = this.langfuseIframeRef?.nativeElement;
    if (!iframeEl) return;
    
    // Resolve against the current location so relative URLs (e.g. '/langfuse/') yield a valid origin
    const childOrigin = (() => {
      try { return new URL(this.langfuseUrl, window.location.origin).origin; } catch { return window.location.origin; }
    })();

    const sendToIframe = (msg: any) => {
      if (!iframeEl || !iframeEl.contentWindow) return;
      try {
        iframeEl.contentWindow.postMessage(msg, childOrigin);
        console.log('Parent: posted message to iframe', msg);
      } catch (err) {
        console.warn('Parent: failed to post message to iframe', err, msg);
      }
    };

    try {
      // Send token
      sendToIframe({ type: 'SET_TOKEN', token });
      sendToIframe({ type: 'SET_ORGANISATION', organisation: parentOrg });
      console.log('Parent: sent SET_ORGANISATION message', { organisation: parentOrg });
      
      // Send current theme
      sendToIframe({ type: 'SET_THEME', isDark: this.isDark });

      // Build parent session details and send to iframe
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
        token,
        userId,
        userName, 
      };
      console.log('Parent: posting parentSessionDetails to iframe', { parentSessionDetails });
      sendToIframe({ type: 'SET_PARENT_SESSION', parentSessionDetails });
    } catch (err) {
      console.warn('Parent: failed to post messages to iframe', err);
    }
  }

  private watchThemeChanges(): void {
    // Use MutationObserver to detect changes to body classes
    this.themeObserver = new MutationObserver(() => {
      const wasDark = this.isDark;
      this.isDark = !document.body.classList.contains('header-light-theme');
      
      // Only sync if theme actually changed and iframe is loaded
      if (wasDark !== this.isDark && this.isIframeLoaded) {
        const iframeEl = this.langfuseIframeRef?.nativeElement;
        if (iframeEl?.contentWindow) {
          try {
            const childOrigin = new URL(this.langfuseUrl, window.location.origin).origin;
            iframeEl.contentWindow.postMessage({ type: 'SET_THEME', isDark: this.isDark }, childOrigin);
            console.log('Parent: synced theme to iframe - isDark:', this.isDark);
          } catch (err) {
            console.warn('Parent: failed to sync theme to iframe', err);
          }
        }
      }
    });
    
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: false
    });
  }

  ngOnDestroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }
}
