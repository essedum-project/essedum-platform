import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { RecipeObject } from '../wrangling.ts/recipe-object';
import { WranglingService } from '../wranglingService/wrangling.service';
import { DISABLED_ADVISORIES, StatisticsRequestObject } from '../../datasets';
import { Subscription } from 'rxjs';
import { TRANSFORMATION_FUNCTIONS } from '../wrangling-static-files/wrangling-transform-labels';
import { WranglingDataService } from '../wranglingService/wrangling-data.service';
import COLUMNACTIONS from '../wrangling-static-files/actions-column.json'
import { Services } from '../../../services/service';

@Component({
  selector: 'app-wrangling-advisory',
  templateUrl: './wrangling-advisory.component.html',
  styleUrls: ['./wrangling-advisory.component.scss']
})
export class WranglingAdvisoryComponent {
  @Input() displayDialog: boolean;
  @Input() recipeObject: RecipeObject; 
  @Output() dialogClosed = new EventEmitter();
  @Input()datasetName:any;
  selectedCol: any[] = [];
  displaySpinner:boolean=true;
  selectedRecipe;
  advisorySuggestions;
  dataSubscription: Subscription = new Subscription();
  tableData = [];
  selectedOutliers=[];
  checkedData:boolean=false;
  checked:boolean=false;
  disabledButton:boolean=true;
  noAdvisory = 'No Advisory available';
  displayFailure = false;
  displayPending = false;
  failureText = 'Unable to fetch Advisory details ';
  pendingText =
    'Advisory processing still in progress. Please check after some time...';
    outlierTableData = [];
  outlierTableColumns = [];

//   columnDefs=[
//     {
//       "field": "make", "sortable": true,
//       "filter": true, "checkboxSelection": true
//     }
// ]
  statsReqObject: StatisticsRequestObject = {
    //"object_id": 6,
    "function_name": [],
    "args": [],
    "recipe_name": "None",
    "recipe_id": 0,
    //"user_id": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.c0ae8mPqGvq3AARD0Awb95eOSOxd5fvqh3CI98DcGq8",
    "actions_changed": "NO",
    "dataset_type": "machine_learning",
    "screen": "wrangling",
    dataset_name: '',
    aip_login: '',
    org: ''
  };
  actionsToAdd: any[];
  pyjoburl: any;

  constructor( 
    private services: Services,
    private ledsLibService: LedsLibService,
    private modalService: LedsModalService,
    private wranglingService: WranglingService,
    private dataService: WranglingDataService,
   // private dataService: WranglingDataService
    
  ){}

  ngOnChanges(change: SimpleChanges) {
    if (change['displayDialog'] && change['displayDialog'].currentValue) {
      this.selectedRecipe = this.recipeObject;
      console.log('selectedRecipe in advisory',this.recipeObject);    
      this.fetchAdvisoryDetails();
    }
  }
  ngOnInit():void{
    this.getPyJobUrl();
    //this.fetchAdvisoryDetails();
  }
  getPyJobUrl(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.services.pyjob(localStorage.getItem('organization')).subscribe(
            resp => {
                this.pyjoburl = resp;
                resolve();
            },
            error => {
                reject(error);
            }
        );
    });
}
  // getStatisticsRequestObject(): StatisticsRequestObject {
  //   const statsReqestObj: StatisticsRequestObject = new StatisticsRequestObject();
  //   const repID = this.selectedRecipe.recipe_id;
  //   const repName =
  //     this.selectedRecipe.recipe_id > 0
  //       ? this.selectedRecipe.recipe_name
  //       : 'None';

  //   statsReqestObj.object_id = this.selectedRecipe.object_id;
  //   statsReqestObj.function_name = [];
  //   statsReqestObj.args = [];
  //   // statsReqestObj.args = this.selectedArgs;
  //   // if (this.selectedRecipe.recipe_type === 'pivot') {
  //   //   statsReqestObj.args = [];
  //   //   statsReqestObj.function_name = [];
  //   // } else {
  //   //   statsReqestObj.function_name = this.selectedFunctions;
  //   //   statsReqestObj.args = this.selectedArgs;
  //   // }
    
  //   statsReqestObj.recipe_name = repName;
  //   statsReqestObj.recipe_id = repID;
  //   // statsReqestObj.mode = 'None';
  //   statsReqestObj.user_id = Number(localStorage.getItem('user_id'));
  //   statsReqestObj.actions_changed = 'NO';
  //   statsReqestObj.screen = 'wrangling';
  //   statsReqestObj.dataset_type = this.selectedRecipe.dataset_type;
  //   return statsReqestObj;
  // }
  fetchAdvisoryDetails() {
    this.advisorySuggestions = null;
    this.dataSubscription.add(
      this.wranglingService
        .getColumnStatistics(this.pyjoburl, this.statsReqObject, this.datasetName)       //currently we hardcoded data here , we have to pass this.getStatisticsRequestObject()
        .subscribe(
          (res) => {
           // this.displaySpinner = false;
            if (res.body.status_message === "SUCCESS") {
              if (
                res.body.response.wrangling_response.wrangling_flag ===
                "COMPLETE"
              ) {
                this.advisorySuggestions =
                  res.body.response.wrangling_response.wrangling;
                console.log(this.advisorySuggestions);                
                this.createTableData();
                console.log('creating table data is successful');
                //console.log(this.tableData);
                this.displaySpinner = false;
                
              } else if (
                res.body.response.wrangling_response.wrangling_flag === 'PEND'
              ) {
                //this.showInfo('Advisory processing still in progress.');
                if (res.response.wrangling_response.wrangling.length > 0) {
                  this.advisorySuggestions =
                    res.response.wrangling_response.wrangling;
                  this.createTableData();
                  this.displaySpinner = false;
                } else {
                  this.displaySpinner = false;
                  this.displayPending = true;
                }
              } else if (
                res.body.response.wrangling_response.wrangling_flag === "NA"
              ) {
                this.failureText +=
                  res.response.wrangling_response.wrangling;
                this.displayFailure = true;
                this.displaySpinner = false;
              }
            } else if (res.status_message === "WARNING") {
               this.displaySpinner = false;
              // this.showWarning(response.response);
            } else {
              this.failureText += res.response;
              this.displayFailure = true;
              this.displaySpinner = false;
            }
          },
          (error) => {
            if (error) {
              this.displaySpinner = false;
            }
          }
        )
    );
  }
  createTableData() {
    this.tableData = [];
    this.advisorySuggestions.forEach((element) => {     
      for (const action of Object.keys(element)) {
        console.log(action);        
        const colDesc = element[action];
        console.log(colDesc);        
        if (Array.isArray(colDesc)) {
          console.log('desc is array');          
          for (const colName of colDesc) {
            this.tableData.push(
              this.getTableRowForArray(colName, colDesc, action)
            );
          }
          console.log('Table data',this.tableData)
        } else if (action === 'drop_rows') {
          console.log('action is drop rows');
          if (colDesc!=null) {
            const colName = colDesc.column;
            this.tableData.push(this.getTableRow(colName, colDesc, action));
          }
        } else if (action === 'anomaly_detection') {
          console.log('action is anomoly detection');
          for (const colName of Object.keys(colDesc)) {
            console.log(colName);            
            this.tableData.push(this.getTableRow(colName, colDesc[colName], action));
          }
        } else {
          console.log('action is else');
          for (const colName of Object.keys(colDesc)) {
            console.log(colName);            
            this.tableData.push(this.getTableRow(colName, colDesc, action));
          }
        }
      }
    });
    console.log('tableData last',this.tableData);
    
  }
  getTableRowForArray(actionObj, actionArray, action) {
    const actionName = TRANSFORMATION_FUNCTIONS.find(
      (element) => element.name === action
    ).label;
    const columName = Object.keys(actionObj)[0];
    return {
      column: columName + ' : ' + actionObj[columName],
      action: action,
      function: actionName,
      outliers: [],
      colName: columName,
      actionObj: actionObj,
    };
  }
  getTableRow(colName, colDesc, action): any {
    console.log(colName, colDesc, action);       
    const functionName = TRANSFORMATION_FUNCTIONS.find(
      (element) => element.name === action
    ).label;
    if (action === 'drop_outliers') {
      const outlierArray = colDesc[colName];
      return {
        column: colName + ' : Outlier Count - ' + outlierArray.length,
        action: action,
        function: functionName,
        outliers: outlierArray,
        colName: colName,
      };
    } else if (action === 'drop_rows') {
      return {
        column: colName,
        // action: action,
        action: 'drop_missing_data_by_threshold_value',
        function: functionName,
        outliers: [],
        colName: colDesc,
        actionObj: colDesc,
      };
    } else if (action === 'anomaly_detection') {     
      const outlierArray = this.convertHTMLToJSON(colDesc["outliers"]);
      outlierArray[0].splice(0,1)
      return {
        column: colName + ' : ' + colDesc["message"],
        action: action,
        function: functionName,
        outlierData: outlierArray[1],
        outlierColumns: outlierArray[0],
        colName: colName,
      };
    }else {
      return {
        column: colName + ' : ' + colDesc[colName],
        action: action,
        function: functionName,
        outliers: [],
        colName: colName,
      };
    }
  }
  convertHTMLToJSON(tableData): any {
    const tableDataArray = [];
    const htmlData = tableData;
    const table = document.createElement('table');
    table.innerHTML = htmlData + '';

    const data = [];
    const headers = [];
    for (let i = 0; i < table.rows[0].cells.length; i++) {
      const headerName = table.rows[0].cells[i].innerHTML;
      headers.push({
        field: headerName,
        header:
          headerName === ''
            ? 'Row_Index'
            : headerName.length > 10
              ? headerName.substring(0, 9) + '...'
              : headerName,
      });
    }
    // go through cells
    for (let i = 1; i < table.rows.length; i++) {
      const tableRow = table.rows[i];
      const rowData = {};
      for (let j = 0; j < tableRow.cells.length; j++) {
        rowData[headers[j].field] = tableRow.cells[j].innerHTML;
      }
      data.push(rowData);
    }
    tableDataArray.push(headers);
    tableDataArray.push(data);
    return tableDataArray;
  }



  addAdvisoryActions() { 
    this.actionsToAdd = [];    
    this.selectedCol.forEach((element) => {
      console.log(element)
      if (!DISABLED_ADVISORIES.find((action) => action === element.action)) {
      
        const actionObject = {
          function: element.action,
          argument: this.getArgument(element),
          columns: [element.colName],
        };
        this.actionsToAdd.push(actionObject);
      }
    });
    console.log(this.actionsToAdd);    
    this.dataService.setAdvisoryActions(this.actionsToAdd);
    this.dialogClosed.emit(true);
    this.modalService.dismissAll();
  }
  
  getArgument(element): Object {
    console.log(element);   
    const functionObject = COLUMNACTIONS.dynamic.find(
      (action) => action.functionName === element.action
    );    
    const argument = {};
    if (functionObject) {
      functionObject.functionParameters.forEach((paramName, index) => {
        if (index === 0) {
          argument[functionObject.functionParameters[index]] = [
            element.colName,
          ];
          if (functionObject.function === 'Remove missing values by Threshold') {
            argument[functionObject.functionParameters[index]] = element.actionObj[paramName];
          }
        } else {
          if (functionObject.function === 'Trim') {
            argument[functionObject.functionParameters[1]] = 'strip';
          } else {
            if (functionObject.functionParameters[index] === paramName) {
              argument[functionObject.functionParameters[index]] =
                element.actionObj[paramName];
            }
          }
        }
      });
    }
    return argument;
  }
  displayOutliers(content: any,rowData:any) {
    this.modalService.openModal(content, 'mini');
    this.selectedOutliers = rowData.outliers.map((item) => {
      return { label: item };
    });
    console.log('selectedOuteliers',this.selectedOutliers);
  }
  displayOutliersForAnomaly(outlierPanelForAnomaly: any,rowData:any) {
    this.modalService.openModal(outlierPanelForAnomaly, 'mini');
    this.outlierTableColumns = rowData.outlierColumns;
    this.outlierTableData = rowData.outlierData;
    //outlierPanelForAnomaly.toggle(event);
  }
  onSelectColumn(colDetails: any) {
    console.log('colDetails', colDetails);
    if (this.selectedCol.length >= 0) {
      let isPresent = this.selectedCol.some(item => item.colName == colDetails.colName);
      if (isPresent) {
        let index = this.selectedCol.findIndex(item => item.colName == colDetails.colName);
        this.selectedCol.splice(index, 1);
       // this.checkedData=false;
      }
      else{
        this.selectedCol.push(colDetails);
       // this.checkedData=true;
      }
      if(this.selectedCol.length>0){
        this.disabledButton=false;
      }
      else this.disabledButton=true;
    }
    console.log('selectedCol', this.selectedCol);
  }
  checkRowAction(rowData): boolean {
    return DISABLED_ADVISORIES.find((action) => action == rowData.action)
      ? false
      : true;
  }
  selectAll(check:boolean){
    if(!check){
      this.selectedCol=[];
    this.checkedData=true;
    this.tableData.forEach(data=>{
      this.selectedCol.push(data)
    })
    //this.selectedCol=this.tableData;
    console.log('selectAll',this.selectedCol);
    this.checked=true;
    this.disabledButton=false;
    }
    else{
      this.checkedData=false;
      this.selectedCol=[];
      this.checked=false;
      this.disabledButton=true;
    }
    
  }

}
