import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
 selector: "app-delete",
 template: ` 
 <h2 mat-dialog-title> <span>
  <mat-icon style="color: orange; font-size: 18px; margin-bottom:-7px !important;">warning</mat-icon>
 </span>{{ data.title }} Confirmation</h2>
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
    '#cancel {background: #dadada 0% 0% no-repeat padding-box !important; color: #002966 !important;}',
 ]
})
export class DeleteComponent {
 constructor(public dialogRef: MatDialogRef<DeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}
