import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-info',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.scss']
})
export class FileInfoComponent {

  constructor(@Inject(MAT_DIALOG_DATA)
  public data: {filename: string, filesize:number, lastmodifydate:string},
  public dialogRef: MatDialogRef<FileInfoComponent>) {}

  onClose() {
    this.dialogRef.close();
  }
}
