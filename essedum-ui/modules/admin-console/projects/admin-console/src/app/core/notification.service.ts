import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AcSnackbarComponent } from './ac-snackbar/ac-snackbar.component';

const BASE: MatSnackBarConfig = {
  horizontalPosition: 'center',
  verticalPosition: 'top',
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 5000, panelClass: ['ac-snackbar'], data: { message, type: 'success' },
    });
  }

  error(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 6000, panelClass: ['ac-snackbar'], data: { message, type: 'error' },
    });
  }

  warning(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 5000, panelClass: ['ac-snackbar'], data: { message, type: 'warning' },
    });
  }

  info(message: string): void {
    this.snackBar.openFromComponent(AcSnackbarComponent, {
      ...BASE, duration: 4000, panelClass: ['ac-snackbar'], data: { message, type: 'info' },
    });
  }
}
