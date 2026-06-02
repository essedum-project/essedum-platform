import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-aip-delete-confirmation',
  templateUrl: './aip-delete-confirmation.component.html',
  styleUrls: ['./aip-delete-confirmation.component.scss'],
})
export class AipDeleteConfirmationComponent {
  constructor(public dialogRef: MatDialogRef<AipDeleteConfirmationComponent>) {}
}
