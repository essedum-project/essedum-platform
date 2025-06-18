import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Services } from '../../services/service';

@Component({
  selector: 'app-choose-runtime',
  templateUrl: './choose-runtime.component.html',
  styleUrls: ['./choose-runtime.component.scss'],
})
export class ChooseRuntimeComponent implements OnInit {
  runTypes: OptionsDTO[] = [];
  selectedRunType: any;
  errFlag: boolean = false;
  isEdit: boolean = false;
  default_runtime: any;

  constructor(
    public dialogRef: MatDialogRef<ChooseRuntimeComponent>,
    private service: Services,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.service.fetchJobRunTypes().subscribe((resp) => {
      resp.forEach((ele) => {
        this.runTypes.push(new OptionsDTO(ele.type + '-' + ele.dsAlias, ele));
      });
      if (this.data.default_runtime) {
        let dr = JSON.parse(this.data.default_runtime);
        this.default_runtime = dr.type + '-' + dr.dsAlias;
        let index = this.runTypes.findIndex(
          (x) => JSON.stringify(x.value) === this.data.default_runtime
        );
        if (index > -1) {
          this.selectedRunType = this.runTypes[index].value;
        }
      }
    });
  }

  dismiss() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close(this.selectedRunType);
  }

  runtimeChange($event) {
    this.selectedRunType = $event.value;
    let index = this.runTypes.findIndex(
      (option) => option.viewValue === this.selectedRunType
    );
    this.selectedRunType = this.runTypes[index].value;
  }
}
