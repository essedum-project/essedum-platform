import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  action?: string;
  showAction?: boolean;
}

@Component({
  selector: 'app-aip-snackbar-custom',
  templateUrl: './aip-snackbar-custom.component.html',
  styleUrls: ['./aip-snackbar-custom.component.scss']
})
export class AipSnackbarCustomComponent {

  constructor(
    public snackBarRef: MatSnackBarRef<AipSnackbarCustomComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData
  ) { }

  onAction(): void {
    this.snackBarRef.dismissWithAction();
  }

  onDismiss(): void {
    this.snackBarRef.dismiss();
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}
