import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
 selector: "app-delete",
 template: `
  <h2 mat-dialog-title>{{ data.title }} Confirmation</h2>
  <mat-dialog-content>
   {{ data.message }}
  </mat-dialog-content>
  <mat-dialog-actions style="display:flex !important;justify-content:left !important; margin-left: 15px !important;">
   <button id="ok" mat-raised-button (click)="dialogRef.close('yes')">Delete</button>&nbsp;
   <button id="cancel" mat-raised-button (click)="dialogRef.close('no')">Cancel</button>
  </mat-dialog-actions>
 `,
 styles:[
    'button {background: #0052cc !important; color: white !important; height: 30px !important;}',
 ]
})
export class DeleteComponent {
 constructor(public dialogRef: MatDialogRef<DeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}
