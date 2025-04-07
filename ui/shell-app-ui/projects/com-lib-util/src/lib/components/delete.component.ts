import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
 selector: "app-delete",
 template: `
  <h2 mat-dialog-title>{{ data.title }} Confirmation</h2>
  <mat-dialog-content>
   {{ data.message }}
  </mat-dialog-content>
  <mat-dialog-actions style="display:flex !important;justify-content:center !important">
   <button style="min-width: 40px !important;line-height: 27px;padding: 0 16px;border-radius: 4px;background-color: var(--base-color);border-color: transparent;color: white;" id="cancel" mat-raised-button (click)="dialogRef.close('no')">Cancel</button>&nbsp;
   <button style="min-width: 40px !important;line-height: 27px;padding: 0 16px;border-radius: 4px;background-color: var(--base-color);border-color: transparent;color: white;" id="ok" mat-raised-button (click)="dialogRef.close('yes')">Ok</button>
  </mat-dialog-actions>
 `,
})
export class DeleteComponent {
 constructor(public dialogRef: MatDialogRef<DeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}
