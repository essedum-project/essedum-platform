import { Component } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
 selector: "app-confirm-project-delete-dialog",
 template: `
  <h2 mat-dialog-title>Delete Confirmation</h2>
  <mat-dialog-content>
   All the Mappings related to this record will be deleted!
  </mat-dialog-content>

  <mat-dialog-actions>
   <button mat-raised-button (click)="dialogRef.close('cancel')">Cancel</button>&nbsp;
   <button mat-raised-button (click)="dialogRef.close('delete')">Delete</button>
  </mat-dialog-actions>
 `,
})
export class ConfirmProjectDeleteDialogComponent {
 constructor(public dialogRef: MatDialogRef<ConfirmProjectDeleteDialogComponent>) {}
}
