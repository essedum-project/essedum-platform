import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NotebookDialogData {
  message: string;
}

@Component({
    selector: 'app-notebook-dialog',
    templateUrl: './notebook-dialog.component.html',
    styleUrls: ['./notebook-dialog.component.scss'],
    standalone: false
})
export class NotebookDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<NotebookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotebookDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}