import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dynamic-controls',
  templateUrl: './dynamic-controls.component.html',
  styleUrls: ['./dynamic-controls.component.scss']
})
export class DynamicControlsComponent {
  @Input() tableColumns: string[]; //should come from service
  @Input() columnsSelected: string[];
  @Input() selectedWranglingAction;
  @Input() reset: boolean;
  @Input() columnDataType: string;
  @Output() wranglingForm = new EventEmitter();
  @Output() dynamicValue = new EventEmitter();
  @Output() dynamicBtnLabel = new EventEmitter();
  
  dynamicInputDataGroup: FormGroup;
  columnListValue: string[] = [];
  formValueSubscription: Subscription;
  selectedColumnsForDrop: Object[] = [];
  transformationFunctionAndArgs: Object = {
    function: '',
    argument: {},
  };
  newColumnName: string;
  delimiter: string;
  newDataType: Object;
  convertCase: string;
  precision: number;
  checkboxLableValue: string[] = [];
  dropDownOptions = [];
  thirdDropdownOptions = [];
  secondDropDownOptions = [];
  selectedDropDownValue: string;
  secondDropdownValue: string;
  spinnerList = ['linear_scaled', 'quantile'];
  tableColumnsActualOrder: string[] = [];
  cols: { field: string; header: string; width: string }[];
  selectedCategories: string[] = [];
  emptyStatitics = 'No statistics found';
  val;

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ){
    this.createDynamicInputForm();
  } 

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes in dynamic component',changes);
    
    // this.createDynamicInputForm();
    this.getFormChangeSubscription();
    this.secondDropdownValue = null;
    this.resetForm();
    this.cd.detectChanges();

    if (changes['tableColumns'] && changes['tableColumns'].currentValue) {
      this.tableColumnsActualOrder = this.tableColumns;
    }
    if (
      changes['selectedWranglingAction'] &&
      changes['selectedWranglingAction'].currentValue
    ) {
      if (this.selectedWranglingAction.controls.length > 0) {
        this.generateGridControlLocation();
      } else {
        this.wranglingForm.emit(true);
        this.getArguments();
        console.log(this.transformationFunctionAndArgs);        
        this.dynamicValue.emit(this.transformationFunctionAndArgs);
      }

      this.columnListValue = [];
      this.checkboxLableValue = [];

      if (
        this.selectedWranglingAction.controls.length !== 0 &&
        this.selectedWranglingAction.controls[0].controltype === 'Dropdown'
      ) {
        this.setDropDownValues();
      }
      /** This method was written to show datatype conversion based on column type selected
       * if (this.selectedWranglingAction.function === 'Change DataType') {
        this.setDropDownValuesForDataType();
      }*/
    }
    if (changes['reset'] && changes['reset'].currentValue) {
      this.resetForm();
    }
  }
  generateGridControlLocation(): void {
    this.formValueSubscription = this.selectedWranglingAction.controls.forEach(
      (element) => {
        const items = this.dynamicInputDataGroup.get(
          'dynamicValues'
        ) as FormArray;
        items.push(this.getCurrentFormControl(element));
      }
    );
  }
  getCurrentFormControl(element): FormGroup {
    return this.formBuilder.group({
      inputControl: element.controltype,
      inputValue: this.getValidator(element),
      type: element.controltype,
      class: {
        'grid-column-start': element.location[0],
        'grid-column-end': element.location[1],
        'grid-row-start': element.location[2],
        'grid-row-end': element.location[3],
      },
      label: element.label,
      value: element.value,
      toolTip: element.toolTip,
      id: element.id,
      list: [element.listDetails],
      paramName: element.paramName,
      secondLevelParamDetails: element.secondLevelParam,
      thirdLevelDropdownOptions: element.thirdLevelParam,
      options: element.options,
      displayCondition: element.conditionToDisplay,
      steps: element.steps,
      defaultValue: element.defaultValue,
    });
  }
  getValidator(element): any {
    if (
      element.label === 'Replace Value' ||
      element.controltype === 'NA' ||
      this.selectedWranglingAction.function === 'Round Column Data' ||
      this.selectedWranglingAction.function === 'Trim'
    ) {
      return [this.checkForSort(element)];
    } else if (element.controltype === 'Button') {
      return ['not clicked'];
    } else {
      return [this.checkForSort(element), Validators.required];
    }
  }
  checkForSort(el): any {
    // TO DO: exact type intersection to be defined.
    if (el.controltype === 'ListBox') {
      return [this.tableColumns];
    }
  }


  createDynamicInputForm(): void {
    this.dynamicInputDataGroup = this.formBuilder.group({
      dynamicValues: this.formBuilder.array([]),
    });
  }
  getFormArray(): AbstractControl[] {
    const array = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    //console.log('getArray',array.controls);
    
    return array.controls;
  }
  getFormChangeSubscription(): void {
    this.dynamicInputDataGroup.valueChanges.subscribe((value) => {
      let countNonNulls = 0;
      const items = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      items.controls.forEach((control) => {
        if (control.get('inputValue').value) {
          countNonNulls = countNonNulls + 1;
        }
      });
      this.wranglingForm.emit(this.dynamicInputDataGroup.valid);
      this.getArguments();
      this.dynamicValue.emit(this.transformationFunctionAndArgs);
      //checkbox cannot validate using form validity
      if (
        this.selectedWranglingAction.functionName === 'remove_column_whitespace'
      ) {
        if (countNonNulls > 0) {
          this.wranglingForm.emit(true);
          this.getArguments();
          this.dynamicValue.emit(this.transformationFunctionAndArgs);
        } else {
          this.wranglingForm.emit(false);
        }
      }
    });
  }
  getArguments() {
    let argArray = [];
    argArray = this.formFunctionParameters();
    this.setTransformArgs(argArray);
  }
  formFunctionParameters(): any[] {
    let argArray = [];
    if (this.selectedWranglingAction.type === 'table') {
      argArray = this.createTableLevelParameters();
    } else {
      argArray = this.createColumnLevelParameters();
    }
    return argArray;
  }

  createTableLevelParameters(): any[] {
    const argArray = [];
    let object = {};
    const items = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    if (this.selectedWranglingAction.functionParameters.length === 1) {
      if (
        this.selectedWranglingAction.controls[0] &&
        this.selectedWranglingAction.controls[0].controltype === 'NA'
      ) {
        object[
          this.selectedWranglingAction.functionParameters[0]
        ] = this.selectedWranglingAction.controls[0].value;
      } else {
        object = this.createSingleParamWithOutColumns(items);
      }
    } else if (this.selectedWranglingAction.functionParameters.length === 2) {
      object = this.createDubleParamsWithOutColumns(items);
    }
    argArray.push(object);
    return argArray;
  }

  createColumnLevelParameters(): any[] {
    const argArray = [];
    let object = {};
    const items = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    if (this.selectedWranglingAction.functionParameters.length === 1) {
      object =
        this.selectedWranglingAction.columnsRequired === undefined
          ? this.createSingleParam()
          : this.createSingleParamWithOutColumns(items);
    } else if (this.selectedWranglingAction.functionParameters.length === 2) {
      object =
        this.selectedWranglingAction.columnsRequired === undefined
          ? this.createDoubleParams(items)
          : this.createDubleParamsWithOutColumns(items);
    } else if (this.selectedWranglingAction.functionParameters.length === 3) {
      object = this.createTripleParams(items);
    } else if (this.selectedWranglingAction.functionParameters.length === 4) {
      object = this.createFourLevelParams(items);
    }
    argArray.push(object);
    return argArray;
  }

  createSingleParam(): Object {
    const object = {};

    if (this.selectedWranglingAction.function === 'Shuffle Columns') {
      const sortedColumns = [];
      this.columnListValue = this.tableColumns;
      object[
        this.selectedWranglingAction.functionParameters[0]
      ] = this.columnListValue;
    } else {
      object[
        this.selectedWranglingAction.functionParameters[0]
      ] = this.columnsSelected;
    }
    return object;
  }
  createSingleParamWithOutColumns(items): Object {
    const object = {};
    if (items.controls[0]) {
      const value = items.controls[0].get('inputValue').value;
      if (value !== null) {
        object[this.selectedWranglingAction.functionParameters[0]] =
          value['value'] === undefined ? value : value['value'];
      }
    }
    return object;
  }

  createDoubleParams(items): Object {
    const object = {};
    if (this.selectedWranglingAction.functionName === 'rows_to_cols') {
      object[
        this.selectedWranglingAction.functionParameters[0]
      ] = this.columnsSelected[0];
    } else {
      object[
        this.selectedWranglingAction.functionParameters[0]
      ] = this.columnsSelected;
    }
    if (items.controls[0]) {
      let value = items.controls[0].get('inputValue').value;
      if (value !== null) {
        const tempArray = [];
        if (this.selectedWranglingAction.function === 'Rename Column') {
          tempArray.push(value);
          value = tempArray;
        }
        object[this.selectedWranglingAction.functionParameters[1]] =
          value && value['value'] ? value['value'] : value;
      }
    }
    return object;
  }

  createDubleParamsWithOutColumns(items): Object {
    const object = {};
    const firstValue = items.controls[0]
      ? items.controls[0].get('inputValue').value
      : null;
    const secondValue = items.controls[1]
      ? items.controls[1].get('inputValue').value
      : null;
    if (firstValue !== null) {
      object[this.selectedWranglingAction.functionParameters[0]] =
        firstValue['value'] === undefined ? firstValue : firstValue['value'];
    }
    if (secondValue !== null) {
      object[this.selectedWranglingAction.functionParameters[1]] =
        secondValue['value'] === undefined ? secondValue : secondValue['value'];
    }
    return object;
  }

  createTripleParams(items): Object {
    const object = {};
    object[
      this.selectedWranglingAction.functionParameters[0]
    ] = this.columnsSelected;
    if (items.controls[0]) {
      const value = items.controls[0].get('inputValue').value;
      if (value !== null) {
        object[this.selectedWranglingAction.functionParameters[1]] =
          value['value'] === undefined ? value : value['value'];
      }
      object[this.selectedWranglingAction.functionParameters[2]] =
        items.controls[1] && items.controls[1].get('inputValue').value
          ? items.controls[1].get('inputValue').value
          : '';
    }
    return object;
  }

  createFourLevelParams(items): Object {
    const object = {};
    const firstValue = items.controls[0]
      ? items.controls[0].get('inputValue').value
      : null;
    const secondValue = items.controls[1]
      ? items.controls[1].get('inputValue').value
      : null;
    const thirdValue = items.controls[2]
      ? items.controls[2].get('inputValue').value
      : null;
    object[
      this.selectedWranglingAction.functionParameters[0]
    ] = this.columnsSelected;
    if (firstValue !== null) {
      object[this.selectedWranglingAction.functionParameters[1]] =
        firstValue['value'] === undefined ? firstValue : firstValue['value'];
    }
    if (secondValue !== null) {
      object[this.selectedWranglingAction.functionParameters[2]] =
        secondValue['value'] === undefined ? secondValue : secondValue['value'];
    }
    const list = ['log_transform', 'power_transform'];
    if (secondValue && list.includes(secondValue['value'])) {
      object[this.selectedWranglingAction.functionParameters[3]] = '0';
    } else {
      if (thirdValue !== null) {
        object[this.selectedWranglingAction.functionParameters[3]] =
          thirdValue['value'] === undefined ? thirdValue : thirdValue['value'];
      }
    }
    return object;
  }

  setTransformArgs(argArray): void {
    this.transformationFunctionAndArgs = {
      function: this.selectedWranglingAction.functionName,
      argument: argArray,
    };
  }
  setDropDownValues(): void {
    if (this.selectedWranglingAction.functionName === 'rows_to_cols') {
      this.dropDownOptions = this.getRowsToColumnsDropdownValues();
    } else if (this.selectedWranglingAction.functionName === 'impute_timeseries' && this.selectedWranglingAction.controlValues.length === 0) {
      this.dropDownOptions = this.getRowsToColumnsDropdownValues();
    } else {
      this.dropDownOptions = this.selectedWranglingAction.controlValues;
    }
    this.dropDownOptions=this.dropDownOptions.map(options=>({
        viewValue:options.label,
        value:options
    }))
    console.log('dropdownOptions',this.dropDownOptions);
    
    
  }
  getRowsToColumnsDropdownValues(): any[] {
    const controlValues = [];
    // this.columnListValue.forEach((column) => {
    //   controlValues.push({ value: column, label: column });
    // });
    this.tableColumns.forEach((column) => {
      controlValues.push({ value: column, label: column });
    });
    return controlValues;
  }
  resetForm() {
    const items = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    items.clear();
    this.dynamicInputDataGroup.reset();
  }
  getDropdownValue(value, currentform,$event): void {
    console.log(this.selectedWranglingAction);   
    this.secondDropdownValue = null;
    if (currentform.value.secondLevelParamDetails) {
      const singleArray = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      const dynmaicctrl = singleArray.controls;
      console.log(dynmaicctrl);      
      dynmaicctrl.forEach((eachCtrl) => {
        if (
          eachCtrl.value.paramName ===
          currentform.value.secondLevelParamDetails.paramName
        ) {
          console.log($event)
          console.log('line 374');         
          eachCtrl.patchValue({ inputValue: null });
        }
      });
    }
    const items = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    this.selectedDropDownValue = value['value'];
    if (
      this.selectedWranglingAction.functionName === 'feature_encoding' &&
      this.selectedDropDownValue !== 'feature_hash'
    ) {
      console.log('wrangling function s feature_encoding');
      
      this.wranglingForm.emit(true);
    }
    if (
      typeof this.selectedDropDownValue === 'string' &&
      this.selectedDropDownValue.includes('binning')
    ) {
      console.log('binning');

      
      this.manageSecondLevelParam(currentform);
    }
    if (
      // typeof this.selectedDropDownValue === 'datetime64' &&
      this.selectedWranglingAction.functionName === 'impute_timeseries' ||
      this.selectedWranglingAction.functionName === 'resampling' ||
      this.selectedWranglingAction.functionName === 'lags_leads_generation'
    ) {
      console.log('resampling');
      
      this.manageTimeseriesSecondLevelParam(currentform);
    }
    if ( this.selectedWranglingAction.functionName === 'feature_embedding'
     ) {this.manageSecondLevelParam(currentform);}
  }
  manageSecondLevelParam(paramObj) {
    if (
      paramObj.value.secondLevelParamDetails &&
      paramObj.value.secondLevelParamDetails.paramName
    ) {
      const singleArray = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      const dynmaicctrl = singleArray.controls;
      dynmaicctrl.forEach((eachCtrl) => {
        if (
          eachCtrl.value.paramName ===
          paramObj.value.secondLevelParamDetails.paramName
        ) {
          paramObj.value.secondLevelParamDetails.conditionValues.forEach(
            (val) => {
              if (val.value === paramObj.value.inputValue.value) {
                eachCtrl.patchValue({
                  options: val.listToShow,
              
                });
                
              }
            }
          );
        }
      });
    }
    console.log(this.getFormArray)
  }
  manageTimeseriesSecondLevelParam(paramObj) {
    if (
      paramObj.value.secondLevelParamDetails &&
      paramObj.value.secondLevelParamDetails.paramName
    ) {
      const singleArray = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      const dynmaicctrl = singleArray.controls;
      dynmaicctrl.forEach((eachCtrl) => {
        if (
          eachCtrl.value.paramName ===
          paramObj.value.secondLevelParamDetails.paramName
        ) {
          paramObj.value.secondLevelParamDetails.conditionValues.forEach(
            (val) => {
              eachCtrl.patchValue({
                options: val.listToShow,
              });
            }
          );
        }
      });
    }
  }
  displayThirdDropdown(currentForm, index) {
    let displayFlag: boolean;    
    if (
      (currentForm.value.type === 'Dropdown' &&
      this.selectedWranglingAction.function === 'Resampling') &&
      (currentForm.value.label === 'Interpolation Method' ||
      currentForm.value.label === 'Method')
    ) {
      
      const singleArray = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      const dynmaicctrl = singleArray.controls;
      dynmaicctrl.forEach((eachCtrl) => {

        if (
          eachCtrl.value.paramName ===
          currentForm.value.displayCondition.paramToCheck
        ) {
          if (
            eachCtrl.value.inputValue &&
            dynmaicctrl[index - 1] &&
            dynmaicctrl[index - 1].value.inputValue
          ) {
            displayFlag = currentForm.value.displayCondition.values.includes(
              eachCtrl.value.inputValue.value
            );
            // this.thirdDropdownOptions=eachCtrl.value.thirdLevelDropdownOptions;
            // currentForm.value.thirdLevelDropdownOptions.forEach(
            //   (val) => {
            // eachCtrl.patchValue({
            //   thirdLevelDropdownOptions: val.listToShow,
            // });
            //   }
            // );
            this.thirdDropdownOptions = eachCtrl.value.thirdLevelDropdownOptions;
            // return displayFlag;
          } else if (
            eachCtrl.value.inputValue &&
            dynmaicctrl[index - 1] &&
            dynmaicctrl[index - 1].value.inputValue === 'technique'
            // && eachCtrl.value.inputValue.type==="technique"
            // eachCtrl.value.paramName ===
            // currentForm.value.secondLevelParamDetails.paramName
          ) {
            currentForm.value.secondLevelParamDetails.conditionValues.forEach(
              (val) => {
                if (val.value === dynmaicctrl[index - 1].value.inputValue.value) {
                  eachCtrl.patchValue({
                    options: val.listToShow,
                  });
                }
              },
              this.thirdDropdownOptions = eachCtrl.value.options
            );
          } else {
            displayFlag = false;
            currentForm.patchValue({
              inputValue: currentForm.value.defaultValue,
            });
          }
        }
      });
      // } else if (currentForm.value.type === 'Spinner') {
      //   displayFlag = true;
    } else {
      displayFlag = false;
    }
    console.log(displayFlag);  
    return displayFlag;
  }
  getErrorMessage(index: number, type: string): string {
    let msg = null;
    if (this.getErrors(index) === true) {
      msg =
        this.selectedWranglingAction.controls[index].controltype === type
          ? this.selectedWranglingAction.controls[index].errorMessage
          : null;
    }
    return msg;
  }

  getErrors(index: number): boolean {
    const items = this.dynamicInputDataGroup.get('dynamicValues') as FormArray;
    return (
      items.controls[index] &&
      items.controls[index].get('inputValue').errors &&
      items.controls[index].get('inputValue').dirty
    );
  }
  displaySpinner(currentForm, index): boolean {
    let displayFlag: boolean;
    if (
      currentForm.value.type === 'Spinner' &&
      currentForm.value.displayCondition
    ) {
      const singleArray = this.dynamicInputDataGroup.get(
        'dynamicValues'
      ) as FormArray;
      const dynmaicctrl = singleArray.controls;

      dynmaicctrl.forEach((eachCtrl) => {
        if (
          eachCtrl.value.paramName ===
          currentForm.value.displayCondition.paramToCheck
        ) {
          if (
            eachCtrl.value.inputValue &&
            dynmaicctrl[index - 1] &&
            dynmaicctrl[index - 1].value.inputValue
          ) {
            displayFlag = currentForm.value.displayCondition.values.includes(
              eachCtrl.value.inputValue.value
            );
          } else {
            displayFlag = false;
            currentForm.patchValue({
              inputValue: currentForm.value.defaultValue,
            });
          }
        }
      });
    } else if (currentForm.value.type === 'Spinner') {
      displayFlag = true;
    }
    return displayFlag;
  }
  keyPress(event): boolean {
    return /\d/.test(String.fromCharCode(event.keyCode || event.which));
  }

}
