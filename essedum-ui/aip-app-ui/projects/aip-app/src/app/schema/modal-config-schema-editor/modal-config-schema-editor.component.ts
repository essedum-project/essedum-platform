import { Component, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';

export interface UsersData {
  columntype: string;
  recordcolumnname: string;
  recordcolumndisplayname: string;
  isprimarykey: boolean;
  isrequired: boolean;
  isunique: boolean;
  isencrypted: boolean;
  isvisible: boolean;
}

@Component({
  selector: 'lib-modal-config-schema-editor',
  templateUrl: './modal-config-schema-editor.component.html',
  styleUrls: ['./modal-config-schema-editor.component.scss'],
})
export class ModalConfigSchemaEditorComponent {
  action: string;
  local_data: UsersData;
  tabValue: string;
  propertieslist: string[];
  displaynamelist: string[];
  disableSave: boolean = true;
  disableSaveCopy: boolean = false;
  isAuth: boolean = true;
  ctype: string;
  columnTypeArr = [
    'bigint',
    'binary',
    'bit',
    'boolean',
    'char',
    'date',
    'datetime',
    'double',
    'file',
    'float',
    'int',
    'text',
    'varchar',
    'string',
    'timestamp',
  ];
  message: string;
  constructor(
    public dialogRef: MatDialogRef<ModalConfigSchemaEditorComponent>,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tabValue = this.data.tabValue;
    this.action = this.data.action;
    this.local_data = _.cloneDeep(data.obj);
    this.propertieslist = this.data.propertiesList;
    this.displaynamelist = this.data.displaynameList;
    if (this.action == 'Delete') {
      this.disableSave = false;
    } else if (this.action == 'Update') {
      this.ctype = this.local_data.columntype;
    }
  }

  doAction() {
    console.log(this.local_data);
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  validateForm() {
    if (this.action != 'Update') {
      if (
        this.local_data.columntype?.replace(/\s/g, '').length > 0 &&
        this.local_data.recordcolumnname?.replace(/\s/g, '').length > 0 &&
        this.local_data.recordcolumndisplayname?.replace(/\s/g, '').length >
          0 &&
        this.propertieslist.filter(
          (word) => word == this.local_data.recordcolumnname
        ).length == 0 &&
        this.displaynamelist.filter(
          (word) => word == this.local_data.recordcolumndisplayname
        ).length == 0
      ) {
        this.disableSave = false;
      } else {
        this.disableSave = true;
      }
    } else {
      this.message = '';
      this.disableSave = false;
      for (let i = 0; i < this.propertieslist.length; i++) {
        for (let j = 0; j < this.displaynamelist.length; j++) {
          if (
            this.local_data.recordcolumnname == '' ||
            this.local_data.recordcolumndisplayname == '' ||
            this.propertieslist[i] == this.local_data.recordcolumnname ||
            this.displaynamelist[j] == this.local_data.recordcolumndisplayname
          ) {
            this.disableSave = true;
            this.message = 'Duplicate/Empty column name';
            break;
          }
        }
      }
    }
  }
}
