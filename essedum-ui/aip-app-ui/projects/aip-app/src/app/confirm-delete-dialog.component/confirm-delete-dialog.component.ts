
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Delete Confirmation</h2>
    <mat-dialog-content>
    Do you want to delete?
  </mat-dialog-content>
  
  <mat-dialog-actions>
    <button mat-raised-button (click)="dialogRef.close('delete')">Yes</button>&nbsp;
    <button mat-raised-button (click)="dialogRef.close('cancel')">No</button>
  </mat-dialog-actions>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}
 
}
