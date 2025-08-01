import { Component } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
 selector: "app-confirm-delete-dialog",
 template: `
  <h2 mat-dialog-title>Delete Confirmation</h2>
  <div mat-dialog-content>
   Do you want to delete this record?
</div>

  <div mat-dialog-actions>
   <button mat-raised-button (click)="dialogRef.close('cancel')">No</button>&nbsp;
   <button mat-raised-button (click)="dialogRef.close('delete')">Yes</button>
</div>
 `,
})
export class ConfirmDeleteDialogComponent {
 constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}
}
