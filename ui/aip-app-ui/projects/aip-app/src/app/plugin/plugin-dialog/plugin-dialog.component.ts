import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Services } from '../../services/service';
import { OptionsDTO } from '../../DTO/OptionsDTO';

@Component({
  selector: 'app-plugin-dialog',
  templateUrl: './plugin-dialog.component.html',
  styleUrls: ['./plugin-dialog.component.scss']
})
export class PluginDialogComponent {

  paramKey: any;
  paramObjValue: any;
  paramObjKey: any;
  paramValueType:any;
  valueTypes : OptionsDTO[] = [];
  protected _onDestroy = new Subject<void>();
  forValue: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private service: Services,
    public dialogRef: MatDialogRef<PluginDialogComponent>,
  ) { }

  ngOnInit() {
    this.valueTypes = [{ viewValue: "Array", value: "Array" }, { viewValue: "String", value: "String" }];
    if(this.data) this.valueTypes.push({viewValue: "Code", value: "Code"})
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  close() {
    this.dialogRef.close();
  }

  add() {
    if (this.paramKey) {
      this.paramValueType = this.paramValueType? this.paramValueType : "String";
      this.dialogRef.close({
        "key": this.paramKey,
        "type": this.paramValueType,
        "objKey": this.paramObjKey,
        "objValue": this.paramObjValue
      });
    }
    else {
      this.service.message('Please enter required details', 'error');
    }
  }
}
