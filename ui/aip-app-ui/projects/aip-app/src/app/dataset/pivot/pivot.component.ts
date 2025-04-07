import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { MenuItem, } from 'primeng/api';

import { Subscription, timer } from 'rxjs';
import { QUANTDATATYPES, AGGREGATES_QUAN_XAXIS, CATAGORICALDATATYPES, CATEGORICALFUNCTIONS, TEMPORALDATATYPES, TEMPORALFUNCTIONS } from '../staticfile/constant';
import { RecipeObject, PivotTableRequest } from '../staticfile/models';
import { WranglingDataService } from '../wrangling/wranglingService/wrangling-data.service';
import { WranglingService } from '../wrangling/wranglingService/wrangling.service';
import { Services } from '../../services/service';

import { ContextMenu } from 'primeng/contextmenu';
import { LedsModalService, MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-pivot',
  templateUrl: './pivot.component.html',
  styleUrls: ['./pivot.component.scss']
})
export class PivotComponent implements OnInit, OnDestroy{
  @Input() pivotFile: RecipeObject;
  @Input() baseUrl:any;
  allAttributes;
  selectedRecipe: RecipeObject;
  datasetHeader: string;
  pivotSubscription: Subscription = new Subscription();
  attributeSelected = null;
  columnDropDownValue = [];
  draggedColumnFields = [];
  draggedRowFields = [];
  draggedValueFields = [];
  draggedFilterFields = [];
  pivotParameterFormGroup: UntypedFormGroup;
  toggleOverlay: boolean;
  statsClickEvent: Event;
  currentFilterValue;
  contextMenuItems: MenuItem[];
  selectedContextObject;
  ctxtFieldType: string;
  ctxtFieldValue;
  ctxtIndex: number;
  displaySpinner: boolean;
  toggleMaxBtn: boolean;
  sampleData;
  selectedObject;
  displayPivotSpinner: boolean;
  pivotUserMessage: boolean;
  message = 'Please wait until the data is processed...';
  filterIndex: number;
  pivotUrl: any;
  filterParameters: {
    attribute: string;
    values: [];
  }[] = [];
  noOfRowsSelected: number;
  pivotTimerSubscription: Subscription;
  valueRequest: any;
  colAttribute = [];
  valueAttribute = [];
  rowAttribute = [];
  filterAttribute = [];
  columnsSelected: any;
  data: any;
  pivotLbls = {
    noAttributes: 'No attributes available',
    dragMsg: ' Drag and Drop filter fields',
    dragValMsg: 'Drag and Drop value fields',
    dragColMsg: 'Drag and Drop column fields',
    dragRowMsg: 'Drag and Drop row fields',
    noData: 'No Data Available',
  };
  opts=[{viewValue: 'English', value: 'eng'}, {viewValue: 'Hindi', value: 'hin'}, {viewValue: 'German', value: 'deu'}, {viewValue: 'Telugu', value: 'tel'},
    {viewValue: 'Kannada', value: 'kan'}, {viewValue: 'Tamil', value: 'tam'}, {viewValue: 'French', value: 'fre'}, {viewValue: 'Spanish', value: 'spa'}]
  sampleDataPresent: boolean = false;
  constructor(
    private modalService: LedsModalService,
    private services: Services,
    private fb: UntypedFormBuilder,
    // private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private matSnackbar: MatSnackBar,
  ) { }
alias:any;
nameid: any;
isExpanded:boolean = true;
  ngOnInit() {
    //this.getBaseUrl();
    // console.log('baseurl Pivot',this.baseUrl);
    
    this.nameid = localStorage.getItem('nameid');
    // this.alias=history.state.dataalias;
    // console.log("nameid", this.nameid);
    // console.log("type", typeof this.nameid);
    if (localStorage.getItem('dataalias')) {
      this.alias = localStorage.getItem('dataalias');
      // console.log('alias',this.alias);
      
    } else {
      // If not in local storage, get it from history.state
      this.alias = history.state.dataalias;
      // And then store it in local storage for future use
      localStorage.setItem('dataalias', this.alias);
    }
    this.getMinimizeMaximizeSubscription();
    this.createDraggedAttributeForm();
    this.getAllAttributesSubscription();
    this.getResetSubscription();
    // this.services.updateSaveToStory(true);

    this.getPivotURL();
    this.contextMenuItems = [
      {
        label: 'Remove',
        icon: 'fa fa-times',
        command: (event) => this.removeContextSelection(),
      },
    ];
  }
  getPivotURL(){
    this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      console.log("pivot url",resp);
      this.pivotUrl=resp;
      if (resp) {
        this.getAttributeList();
      }
   });
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.toggleMaxBtn = !this.toggleMaxBtn;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '', margin: '' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }
  // getBaseUrl() {
  //   this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
  //     console.log("pyjobUrl", resp);
  //     this.baseUrl = resp;
  //     // if (resp) {
  //     //  // this.getAttributeList();
  //     // }
  //   });
  // }

  ngOnDestroy() {
    if (this.pivotTimerSubscription) {
      this.pivotTimerSubscription.unsubscribe();
    }
    if (this.cd) {
      this.cd.detach();
    }
    this.pivotSubscription.unsubscribe();
    this.services.updatePivotMsg(null);
    this.services.updateSaveToStory(false);
    this.services.setPivotDownloadData(null);
  }

  getPivotStateSubscription() {
    this.pivotSubscription.add(
      this.services.currentPivotParameters.subscribe((params) => {
        if (params) {
          this.draggedValueFields = params.values;
          this.draggedRowFields = params.rows;
          this.draggedColumnFields = params.columns;
          this.draggedFilterFields = params.filters;
          this.columnsSelected = params.colDatypes;
          this.filterParameters = params.filterParams;
          this.sampleData = params.sampleData;
          //console.log("142",this.sampleData)
        }
      })
    );
  }

  getAllAttributesSubscription() {
    this.pivotSubscription.add(
      this.services.currentAllAttributes.subscribe((obj) => {
        this.allAttributes = obj;
      })
    );
  }

  getAttributeList(): void {
    const quantitative = [];
    const categorical = [];
    const temporal = [];
    this.allAttributes = [];
    const queryParamdata = {
      dataset_name : this.nameid,
      aip_login : 'True'
    }
    this.services.getAllAttributeTypes2(this.pivotUrl,queryParamdata).subscribe((attr)=>{
      console.log(attr.body.response);
      this.data=attr.body.response;
      if (attr.body.status_message === 'SUCCESS' && attr.body.response.column_types) {
        const entries = Object.entries(attr.body.response.column_types);
        entries.forEach((singleEntry, index) => {
          if (QUANTDATATYPES.find((type) => type === singleEntry[1])) {
            quantitative.push({
              attributeName: entries[index][0],
              attributeID: index,
              attributeDataType: entries[index][1],
            });
          }
          if (CATAGORICALDATATYPES.find((type) => type === singleEntry[1])) {
            categorical.push({
              attributeName: entries[index][0],
              attributeID: index,
              attributeDataType: entries[index][1],
            });
          }
          if (TEMPORALDATATYPES.find((type) => type === singleEntry[1])) {
            temporal.push({
              attributeName: entries[index][0],
              attributeID: index,
              attributeDataType: entries[index][1],
            });
          }
        });

        this.allAttributes = [
          {
            attributeType: 'Quantitative Attributes',
            attributes: quantitative,
          },
          {
            attributeType: 'Categorical Attributes',
            attributes: categorical,
          },
          {
            attributeType: 'Temporal Attributes',
            attributes: temporal,
          },
        ];
        this.services.changeAllAttributes(this.allAttributes);
      }else {
        // this.showError(attr.response);
      }
    });
  }
  getMinimizeMaximizeSubscription() {
    this.services.updatePivotResize(true);
    this.pivotSubscription.add(
      this.services.currentResizePivot.subscribe((toggle) => {
        this.toggleMaxBtn = toggle;
        this.cd.detectChanges();
      })
    );
  }

  getResetSubscription() {
    this.pivotSubscription.add(
      this.services.currentResetPivot.subscribe((reset) => {
        if (reset === true) {
          this.clearPivot();
        }
      })
    );
  }
  createDraggedAttributeForm() {
    this.pivotParameterFormGroup = this.fb.group({
      columnAttArray: this.fb.array([]),
      rowAttArray: this.fb.array([]),
      valueAttArray: this.fb.array([]),
    });
  }

  attributeDragEnd(item, type) {
    this.attributeSelected = item;
  }

  showFilterOverlay(filterItem, event, index,content) {
    this.toggleOverlay = !this.toggleOverlay;
    this.statsClickEvent = event;
    this.currentFilterValue = filterItem;
    this.filterIndex = index;
    this.cd.detectChanges();
  }

  itemDropped(contentType: string) {
    if (contentType === 'column') {
      this.colAttribute.push({
        [this.attributeSelected.attributeName]: this.attributeSelected
          .attributeDataType,
      });
      this.draggedColumnFields.push(this.attributeSelected.attributeName);
      this.getPivotData();
    } else if (contentType === 'filter') {
      this.filterAttribute.push({
        [this.attributeSelected.attributeName]: this.attributeSelected
          .attributeDataType,
      });
      this.draggedFilterFields.push(this.attributeSelected);
      this.filterParameters.push({
        attribute: this.attributeSelected.attributeName,
        values: [],
      });
    } else if (contentType === 'value') {
      this.valueAttribute.push({
        [this.attributeSelected.attributeName]: this.attributeSelected
          .attributeDataType,
      });
      this.draggedValueFields.push({
        label: this.attributeSelected.attributeName,
        value: this.attributeSelected,
      });
      const tempValueArray = [];
      this.appendAggregateFunctions(tempValueArray);
      const colArray = this.pivotParameterFormGroup.get(
        'valueAttArray'
      ) as UntypedFormArray;

      colArray.push(
        this.fb.group(
          {
            options: [tempValueArray],
            attributeValue: '',
          },
          { emitEvent: false }
        )
      );
      this.getPivotData();
    } else if (contentType === 'rows') {
      this.rowAttribute.push({
        [this.attributeSelected.attributeName]: this.attributeSelected
          .attributeDataType,
      });
      this.draggedRowFields.push(this.attributeSelected.attributeName);
      this.getPivotData();
    }
    const tempArray = [
      ...this.colAttribute,
      ...this.rowAttribute,
      ...this.valueAttribute,
      ...this.filterAttribute,
    ];
    this.columnsSelected = Object.assign({}, ...tempArray);
  }

  appendAggregateFunctions(tempColArray) {
    if (
      QUANTDATATYPES.find(
        (types) => types === this.attributeSelected.attributeDataType
      )
    ) {
      AGGREGATES_QUAN_XAXIS.forEach((aggreVal, index) => {
        tempColArray.push({
          viewValue:
            this.attributeSelected.attributeName + ' ' + aggreVal.toUpperCase(),
          value: {
            attributeName:
              this.attributeSelected.attributeName +
              ' ' +
              aggreVal.toUpperCase(),
            id: index + 1,
            attributeAxisValue: this.attributeSelected.attributeName,
            attributeAggregrate: aggreVal,
            attributeDataType: this.attributeSelected.attributeDataType,
          
          },
          // viewValue:
          //   this.attributeSelected.attributeName + ' ' + aggreVal.toUpperCase(),value:this.attributeSelected.attributeName + ' ' + aggreVal.toUpperCase()
        });
      });
     // console.log("testig",tempColArray)
    } else if (
      CATAGORICALDATATYPES.find(
        (types) => types === this.attributeSelected.attributeDataType
      )
    ) {
      CATEGORICALFUNCTIONS.forEach((aggreVal, index) => {
        tempColArray.push({
          label:
            this.attributeSelected.attributeName + ' ' + aggreVal.toUpperCase(),
          value: {
            attributeName:
              this.attributeSelected.attributeName +
              ' ' +
              aggreVal.toUpperCase(),
            id: index + 1,
            attributeAxisValue: this.attributeSelected.attributeName,
            attributeAggregrate: aggreVal,
            attributeDataType: this.attributeSelected.attributeDataType,
          },
        });
      });
    } else if (
      TEMPORALDATATYPES.find(
        (types) => types === this.attributeSelected.attributeDataType
      )
    ) {
      TEMPORALFUNCTIONS.forEach((aggreVal, index) => {
        tempColArray.push({
          label:
            this.attributeSelected.attributeName + ' ' + aggreVal.toUpperCase(),
          value: {
            attributeName:
              this.attributeSelected.attributeName +
              ' ' +
              aggreVal.toUpperCase(),
            id: index + 1,
            attributeAxisValue: this.attributeSelected.attributeName,
            attributeAggregrate: aggreVal,
            attributeDataType: this.attributeSelected.attributeDataType,
          },
        });
      });
    }
  }

  formValueSubscription() {
    this.pivotSubscription.add(
      this.pivotParameterFormGroup
        .get('valueAttArray')
        .valueChanges.subscribe((formValue) => {
          this.getPivotData();
        })
    );
  }

  public exportAsExcelFile(): void {
    const table = document.createElement('table');
    table.innerHTML = this.sampleData + '';
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table, {
      raw: true,
      cellStyles: true,
    });
    const prefix ='Export_Result_pivot';
    const fileName = `${prefix}_${new Date().toISOString()}`;

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pivot');

    /* save to file */
    XLSX.writeFile(wb, fileName + '.xlsx', {
      cellStyles: true,
    });
  }

  onSelectChange(colValue: any, event: any) {
    console.log(event);
    const selectedValue = event;
    colValue.get('attributeValue').setValue(selectedValue);
    this.getPivotData();
  }
  getPivotData() {
    const requestObj = this.getPivotRequest();
    this.noOfRowsSelected = requestObj.rows.length;
    this.displayPivotSpinner = true;
    this.services.setPivotDownloadData(null);
    this.services.updateSaveToStory(true);
    this.services.updateDisablePivotFlag(true);
    this.delayMessage();
    let org = localStorage.getItem('organization')
    this.pivotSubscription.add(
      this.services.getPivotTableData(this.pivotUrl,requestObj,this.nameid,org).subscribe(
        (response) => {
          if (this.pivotTimerSubscription) {
            this.pivotTimerSubscription.unsubscribe();
          }
          this.pivotUserMessage = false;
          this.services.updatePivotMsg(false);
          this.services.updateDisablePivotFlag(false);
          if (response['status_message'] === 'SUCCESS') {
            this.sampleData = response['response'];
            //this.sampleData = { ...response['response'] };
           // if(this.sampleData != null) this.sampleDataPresent = true
            this.services.setPivotDownloadData(this.sampleData);
            this.services.updateSaveToStory(false);
            //console.log("373",this.sampleData)
          } else if (response['status_message'] === 'INFO') {
            this.sampleData = null;
            this.showInfo(response['response']);
           // console.log("378",this.sampleData)
          } else {
            this.sampleData = null;
            this.showErrorMessage(response['response']);
           // console.log("381",this.sampleData)
          }
          this.displayPivotSpinner = false;
        },
        (error) => {
          if (this.pivotTimerSubscription) {
            this.pivotTimerSubscription.unsubscribe();
          }
          this.services.updateDisablePivotFlag(false);
          this.pivotUserMessage = false;
          this.services.updatePivotMsg(false);
          this.sampleData = null;
         // console.log("395",this.sampleData)
          this.displayPivotSpinner = false;
          this.showErrorMessage('There is an issue with web service, please check');
        }
      )
    );
    this.cd.detectChanges();
  }

  delayMessage() {
    const numbers = timer(10000);
    this.pivotTimerSubscription = numbers.subscribe((x) => {
      if (this.displayPivotSpinner === true) {
        this.pivotUserMessage = true;
        this.services.updatePivotMsg(true);
        this.cd.detectChanges();
      }
    });
  }

  getPivotRequest(): PivotTableRequest {
    this.getAllRequestValues();
    return {
      dataframe: 'NA',
      rows: this.draggedRowFields.length === 0 ? 'None' : this.draggedRowFields,
      columns:
        this.draggedColumnFields.length === 0
          ? 'None'
          : this.draggedColumnFields,
      values: this.valueRequest.length === 0 ? 'None' : this.getValueFields(),
      filter:
        this.filterParameters.length === 0
          ? 'None'
          : this.getFilterParameters(),
    };
  }

  getFilterParameters() {
    let filterReqParam = null;
    this.filterParameters.forEach((para) => {
      if (para.values.length > 0) {
        const obj = { [para.attribute]: para.values };
        filterReqParam = { ...filterReqParam, ...obj };
      }
    });
    return filterReqParam === null ? 'None' : filterReqParam;
  }

  getValueFields() {
    let valReqParam = {};
    this.valueRequest.forEach((val) => {
      valReqParam = { ...valReqParam, ...val };
    });
    return valReqParam;
  }

  getFilterSelection(filterParameters) {
    if (
      this.filterParameters[this.filterIndex].attribute ===
      filterParameters.attributeName
    ) {
      this.filterParameters[this.filterIndex].values =
        filterParameters.filterValues;
    }
    this.getPivotData();
  }

  getAllRequestValues() {
    this.valueRequest = [];
    const valueArray = this.pivotParameterFormGroup.get(
      'valueAttArray'
    ) as UntypedFormArray;
    valueArray.value.forEach((val) => {
      let arrayValue = [];
      for (const i in this.valueRequest) {
        if (this.valueRequest[i][val.options[0].value.attributeAxisValue]) {
          arrayValue = this.valueRequest[i][
            val.options[0].value.attributeAxisValue
          ];
        }
      }
      if (val.attributeValue === '') {
        this.valueRequest.push({
          [val.options[0].value.attributeAxisValue]: [
            ...arrayValue,
            val.options[0].value.attributeAggregrate,
          ],
        });
      } else {
        this.valueRequest.push({
          [val.attributeValue.attributeAxisValue]: [
            ...arrayValue,
            val.attributeValue.attributeAggregrate,
          ],
        });
      }
    });
  }

  displayContextMenu(
    menuRef: ContextMenu,
    event,
    deleteValue,
    type: string,
    index: number
  ) {
    menuRef.show(event);
    this.ctxtFieldType = type;
    this.ctxtFieldValue = deleteValue;
    this.ctxtIndex = index;
  }

  clearPivot() {
    this.draggedRowFields = [];
    this.draggedColumnFields = [];
    this.draggedFilterFields = [];
    this.draggedValueFields = [];
    this.filterParameters = [];
    this.sampleData = null;
    //.log("522",this.sampleData)
    this.resetFormArrayControls();
  }

  resetFormArrayControls() {
    const rowArray = this.pivotParameterFormGroup.get(
      'rowAttArray'
    ) as UntypedFormArray;
    rowArray.clear();
    const valArray = this.pivotParameterFormGroup.get(
      'valueAttArray'
    ) as UntypedFormArray;
    valArray.clear();
    const colArray = this.pivotParameterFormGroup.get(
      'columnAttArray'
    ) as UntypedFormArray;
    colArray.clear();
  }

  removeContextSelection() {
    switch (this.ctxtFieldType) {
      case 'row': {
        this.draggedRowFields.splice(this.ctxtIndex, 1);
        this.rowAttribute.splice(this.ctxtIndex, 1);
        this.getPivotData();
        break;
      }
      case 'column': {
        this.draggedColumnFields.splice(this.ctxtIndex, 1);
        this.colAttribute.splice(this.ctxtIndex, 1);
        this.getPivotData();
        break;
      }
      case 'value': {
        const valueArray = this.pivotParameterFormGroup.get(
          'valueAttArray'
        ) as UntypedFormArray;
        valueArray.removeAt(this.ctxtIndex);
        this.draggedValueFields.splice(this.ctxtIndex, 1);
        this.valueAttribute.splice(this.ctxtIndex, 1);
        this.getPivotData();
        break;
      }
      case 'filter': {
        this.draggedFilterFields.splice(this.ctxtIndex, 1);
        this.filterParameters.splice(this.ctxtIndex, 1);
        this.filterAttribute.splice(this.ctxtIndex, 1);
        this.getPivotData();
        break;
      }
    }
  }

  // minMaxTableArea() {
  //   this.toggleMaxBtn = !this.toggleMaxBtn;
  //   this.cd.detectChanges();
  // }

  Message:any;
  showErrorMessage(msg:any){
    let message = {
      message: msg,
      button: false,
      type: 'error',
      successButton: 'Ok',
      errorButton: 'Cancel',
    };
    this.matSnackbar.openFromComponent(MessageBarComponent, {
      data: message,
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: '',
    });
  } 

  showInfo(message): void {
    
    this.Message = {
      button: false,
      type: 'info',
      message: message,
    }
  }

}
