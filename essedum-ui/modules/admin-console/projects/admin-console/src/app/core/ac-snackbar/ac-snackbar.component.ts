import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface AcSnackbarData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'ac-snackbar',
  template: `
    <div class="custom-snackbar" [ngClass]="'snackbar-' + data.type">
      <mat-icon class="snackbar-icon">{{ icon }}</mat-icon>
      <span class="snackbar-message">{{ data.message }}</span>
      <mat-icon class="snackbar-close-btn" (click)="ref.dismiss()" aria-label="Close">close</mat-icon>
    </div>
  `,
  styles: [`
    :host { display: block !important; width: max-content !important; min-width: 0; max-width: min(90vw, 720px); }
    .custom-snackbar {
      display: flex !important; flex-direction: row !important; align-items: center !important;
      gap: 10px; padding: 12px 16px; border-radius: 12px;
      background: rgba(30,41,59,0.95);
      border: 1px solid rgba(79,142,247,0.25);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(129,140,248,0.12);
      backdrop-filter: blur(16px);
      min-width: 280px; max-width: min(90vw, 720px); width: max-content;
    }
    .snackbar-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; flex-shrink: 0; line-height: 1 !important; }
    .snackbar-message { flex: 1; font-size: 13px; font-weight: 500; color: #e2e8f0; line-height: 1.4; white-space: normal; word-break: break-word; }
    .snackbar-close-btn { font-size: 18px !important; width: 18px !important; height: 18px !important; color: #64748b; cursor: pointer; flex-shrink: 0; border-radius: 6px; padding: 3px !important; box-sizing: content-box; transition: color 0.15s, background 0.15s; }
    .snackbar-close-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.1); }
    .snackbar-success { border-color: rgba(16,185,129,0.35); }
    .snackbar-success .snackbar-icon { color: #34d399; }
    .snackbar-error { border-color: rgba(239,68,68,0.35); }
    .snackbar-error .snackbar-icon { color: #f87171; }
    .snackbar-warning { border-color: rgba(250,204,21,0.35); }
    .snackbar-warning .snackbar-icon { color: #fbbf24; }
    .snackbar-info { border-color: rgba(79,142,247,0.35); }
    .snackbar-info .snackbar-icon { color: #60a5fa; }
    body.header-light-theme .custom-snackbar { background: rgba(255,255,255,0.97); border-color: rgba(35,79,153,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    body.header-light-theme .snackbar-message { color: #0f172a; }
    body.header-light-theme .snackbar-close-btn { color: #64748b; }
    body.header-light-theme .snackbar-close-btn:hover { color: #0f172a; background: rgba(0,0,0,0.06); }
  `],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AcSnackbarComponent {
  constructor(
    public ref: MatSnackBarRef<AcSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: AcSnackbarData,
  ) {}

  get icon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }
}
