import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation',
  // templateUrl: './confirmation.component.html',
  template: `
  <h1 mat-dialog-title>Confirmation</h1>
  <div mat-dialog-content>{{ data.message }}</div>
  <mat-dialog-actions>
    <button mat-raised-button [mat-dialog-close]="true">Yes</button>&nbsp;
    <button mat-raised-button (click)="onNoClick()">No</button>
  </mat-dialog-actions>
`,
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
