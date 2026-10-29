import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface AcSnackbarData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'ac-snackbar',
  template: `
    <div class="ac-sb-inner">
      <span class="ac-sb-icon material-icons">{{ icon }}</span>
      <span class="ac-sb-msg">{{ data.message }}</span>
      <button class="ac-sb-close material-icons" (click)="ref.dismiss()" type="button">close</button>
    </div>
  `,
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
