//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

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
