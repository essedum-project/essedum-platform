import { Component, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Interface for Column Config data
export interface ColumnConfigData {
  columntype: string;
  recordcolumnname: string;
  recordcolumndisplayname: string;
  isprimarykey: boolean;
  isrequired: boolean;
  isunique: boolean;
  isencrypted: boolean;
  isvisible: boolean;
}

// Interface for dialog data
export interface DialogData {
  tabValue: string;
  action: string;
  obj: ColumnConfigData;
  propertiesList: string[];
  displaynameList: string[];
}

// Enum for actions to avoid string literals
export enum DialogAction {
  ADD = 'Add',
  UPDATE = 'Update',
  DELETE = 'Delete',
  CANCEL = 'Cancel',
}

// Enum for column types
export enum ColumnType {
  BIGINT = 'bigint',
  BINARY = 'binary',
  BIT = 'bit',
  BOOLEAN = 'boolean',
  CHAR = 'char',
  DATE = 'date',
  DATETIME = 'datetime',
  DOUBLE = 'double',
  FILE = 'file',
  FLOAT = 'float',
  INT = 'int',
  TEXT = 'text',
  VARCHAR = 'varchar',
  STRING = 'string',
  TIMESTAMP = 'timestamp',
}

@Component({
  selector: 'lib-modal-config-schema-editor',
  templateUrl: './modal-config-schema-editor.component.html',
  styleUrls: ['./modal-config-schema-editor.component.scss'],
})
export class ModalConfigSchemaEditorComponent {
  readonly action: string;
  readonly tabValue: string;
  readonly propertiesList: string[];
  readonly displayNameList: string[];
  readonly columnTypeOptions = Object.values(ColumnType);

  localData: ColumnConfigData;
  disableSave = true;
  disableSaveCopy = false;
  isAuth = true;
  originalColumnType?: string;
  validationMessage = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ModalConfigSchemaEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data: DialogData
  ) {
    this.tabValue = this.data.tabValue;
    this.action = this.data.action;
    this.localData = this.deepClone(this.data.obj);
    this.propertiesList = this.data.propertiesList;
    this.displayNameList = this.data.displaynameList;

    this.initializeComponent();
  }

  private initializeComponent(): void {
    switch (this.action) {
      case DialogAction.DELETE:
        this.disableSave = false;
        break;
      case DialogAction.UPDATE:
        this.originalColumnType = this.localData.columntype;
        break;
    }
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  doAction(): void {
    this.dialogRef.close({
      event: this.action,
      data: this.localData,
    });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: DialogAction.CANCEL });
  }

  validateForm(): void {
    this.resetValidation();

    if (this.action === DialogAction.UPDATE) {
      this.validateUpdateAction();
    } else {
      this.validateAddAction();
    }
  }

  private resetValidation(): void {
    this.validationMessage = '';
    this.disableSave = false;
  }

  private validateAddAction(): void {
    const hasValidInputs = this.hasValidRequiredFields();
    const hasNoDuplicates = !this.hasDuplicateNames();

    this.disableSave = !(hasValidInputs && hasNoDuplicates);
  }

  private validateUpdateAction(): void {
    if (this.hasEmptyFields()) {
      this.setValidationError('Column name cannot be empty');
      return;
    }

    if (this.hasDuplicateNames()) {
      this.setValidationError('Duplicate column name found');
      return;
    }
  }

  private hasValidRequiredFields(): boolean {
    return (
      this.isNotEmptyString(this.localData.columntype) &&
      this.isNotEmptyString(this.localData.recordcolumnname) &&
      this.isNotEmptyString(this.localData.recordcolumndisplayname)
    );
  }

  private hasEmptyFields(): boolean {
    return (
      !this.localData.recordcolumnname.trim() ||
      !this.localData.recordcolumndisplayname.trim()
    );
  }

  private hasDuplicateNames(): boolean {
    return (
      this.propertiesList.includes(this.localData.recordcolumnname) ||
      this.displayNameList.includes(this.localData.recordcolumndisplayname)
    );
  }

  private isNotEmptyString(value: string | undefined): boolean {
    return Boolean(value?.trim()?.length);
  }

  private setValidationError(message: string): void {
    this.validationMessage = message;
    this.disableSave = true;
  }
}
