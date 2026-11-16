import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AcSnackbarComponent } from './ac-snackbar/ac-snackbar.component';

const BASE: MatSnackBarConfig = {
  horizontalPosition: 'center',
  verticalPosition: 'top',
};

// panelClass must include 'snackbar-<type>' (not just 'ac-snackbar'): when this
// module runs as a shell remote (module federation), admin-console's own
// src/styles.scss — which resets the MDC container for '.ac-snackbar' — isn't
// loaded, only the shell's global shell/src/styles.scss is. That stylesheet
// already strips the MDC container's background/border/shadow for
// '.mat-mdc-snack-bar-container.snackbar-success|error|warning|info' (same
// classes the agent-studio/data-ops "AipSnackbarCustomService" snackbars use),
// so reusing them here is what makes the outer Material box render transparent
// instead of showing a dark box behind the themed pill.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 5000, panelClass: ['ac-snackbar', 'snackbar-success'], data: { message, type: 'success' },
    });
  }

  error(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 6000, panelClass: ['ac-snackbar', 'snackbar-error'], data: { message, type: 'error' },
    });
  }

  warning(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 5000, panelClass: ['ac-snackbar', 'snackbar-warning'], data: { message, type: 'warning' },
    });
  }

  info(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 4000, panelClass: ['ac-snackbar', 'snackbar-info'], data: { message, type: 'info' },
    });
  }
}
