import { Component, Input } from '@angular/core';

// Plan §13 Pitfall #14 — fallback UI shown when a remote MFE's remoteEntry.js
// fails to load (network outage, stale manifest, broken deploy). Rendered by
// buildRoutes() in mfe-config-route.ts when the loadRemoteModule promise rejects.
@Component({
    selector: 'app-mfe-error-boundary',
    template: `
    <div class="mfe-error">
      <i class="fa fa-exclamation-triangle"></i>
      <h2>This section is temporarily unavailable</h2>
      <p>
        We couldn't load the
        <strong *ngIf="mfeName">{{ mfeName }}</strong>
        module. It may be deploying, or there may be a temporary network issue.
      </p>
      <button class="retry-btn" (click)="reload()">Retry</button>
    </div>
  `,
    styles: [`
    :host { display: block; padding: 48px 32px; }
    .mfe-error {
      max-width: 480px;
      margin: 64px auto;
      padding: 32px;
      border-radius: 12px;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.18);
      text-align: center;
    }
    .mfe-error i { font-size: 36px; color: #ef4444; margin-bottom: 12px; }
    .mfe-error h2 { font-size: 1.15rem; font-weight: 700; margin: 0 0 8px; color: #0f172a; }
    .mfe-error p  { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px; }
    .retry-btn {
      height: 32px;
      padding: 0 18px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .retry-btn:hover { transform: translateY(-1px); }
  `],
    standalone: false
})
export class MfeErrorBoundaryComponent {
  @Input() mfeName?: string;

  reload(): void {
    window.location.reload();
  }
}
