import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Services } from '../../services/service';
@Component({
  selector: 'app-show-output-artifacts',
  templateUrl: './show-output-artifacts.component.html',
  styleUrls: ['./show-output-artifacts.component.scss']
})
export class ShowOutputArtifactsComponent {

  outputData;
  jobId;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ShowOutputArtifactsComponent>,
    private service: Services,
  ) {
    this.outputData = this.data.outputData;
    this.jobId = this.data.jobId;
  }

  closeDialog() {    
    this.dialogRef.close();
  }
}
