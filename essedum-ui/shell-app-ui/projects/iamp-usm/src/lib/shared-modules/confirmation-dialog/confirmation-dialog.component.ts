import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
 selector: "app-confirmation-dialog",
 template: `
  <h5 mat-dialog-title>{{ data.title }}</h5>
  <mat-dialog-content>
   {{ data.message }}
  </mat-dialog-content>
  <mat-dialog-actions>
   <button mat-raised-button (click)="dialogRef.close('yes')">Yes</button>
  </mat-dialog-actions>
 `,
})
export class ConfirmationDialogComponent {
 constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}
