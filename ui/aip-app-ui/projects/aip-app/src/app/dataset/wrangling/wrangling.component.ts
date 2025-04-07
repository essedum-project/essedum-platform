import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { COLUMNDATATYPES, StatisticsRequestObject, TransformObject } from '../datasets';
import { ColumnMetaData } from './wrangling-static-files/wrangling-col-metadata';
import { DynamicTab } from './wrangling-static-files/wrangling-tab-item';
import { TRANSFORMATION_FUNCTIONS } from './wrangling-static-files/wrangling-transform-labels';
import { WranglingUtilsService } from './wranglingService/wrangling-utils.service';
import { WranglingService } from './wranglingService/wrangling.service';
import { RecipeObject } from './wrangling.ts/recipe-object';
import { WranglingDataService } from './wranglingService/wrangling-data.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TRANSNONCOLUMNACTIONS, WRANACTIONCOLSSTATS, WRANACTIONSTATS } from '../staticfile/constant';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { Services } from '../../services/service';

@Component({
  selector: 'app-wrangling',
  templateUrl: './wrangling.component.html',
  styleUrls: ['./wrangling.component.scss']
})
export class WranglingComponent {

  alias: any;
  selectedTableAction: any;
  selectedColAction: any;
  basicReqTab: any = 'aliasTab';
  action: any;
  recipeAction: any;
  recipeName: any;
  dimensionText: string = null;
  // selectedRecipe: RecipeObject={
  //   datatypes_required: "YES",
  //   user_id: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.c0ae8mPqGvq3AARD0Awb95eOSOxd5fvqh3CI98DcGq8",
  //   collection_name: [],
  //   connection_id: 1,
  //   dataset_type: 'machine_learning',
  //   first_load: 'YES',
  //   object_id: 6,
  //   object_name: 'Lung_Cancer_Cleaned',
  //   recipe_id: 0,
  //   recipe_name: 'Test',
  //   object_dimensions: ['515', '31'],
  //   recipe_type: '',
  //   function_name: [],
  //   args: [],
  //   transformed_file_name: '',
  //   created_timestamp: '',
  //   updated_timestamp: '',
  //   is_active: '',
  //   transformations_applied: [],
  //   mode: '',
  //   screen: ''
  // };
  selectedRecipe: RecipeObject= new RecipeObject();
  advisorySuggestions: any;
  columnDataTypes;
  tableData = [];
  selectedColHeader: any;
  colsMetaData: ColumnMetaData[] = [];
  selectedFunctions = [];
  selectedArgs = [];
  wranglingArray: DynamicTab[] = [];
  actionsPerformed = [];
  resetExpressionBuilder: boolean;
  saveBtnLabel = 'SAVE';
  objDetails: any[];
  actionsAvailable: any;
  errorStats: boolean;
  selectedColumns: string[] = [];
  selectedColumnsTableAction: string[] = [];
  updatedRecipeActions = [];
  @Input() fileData;
  columnStatistics: any;
  colHeaders: any[];
  columnData: any;
  columnName: any;
  datasetsCount: String;
  selectedCol: any[] = [];
  showAdvisoryDialog = false;
  displaySpinner:boolean=true;
  recipeSubscription: Subscription;
  enableRangeSelect = false;
  selectedColumnActions;
  selectedColumnDataType: string;
  actionsTabIndex = 0;
  tableActionsAvailable;
  tableActions=[];
  selectedTableActions;
  pyjoburl: any;
  statsReqObject: StatisticsRequestObject = {
    "function_name": [],
    "args": [],
    "recipe_name": "None",
    "recipe_id": 0,
    "actions_changed": "NO",
    "dataset_type": "machine_learning",
    "screen": "wrangling",
    "dataset_name": localStorage.getItem('nameid'),
    "org": localStorage.getItem('organization'),
    "aip_login": 'True'
  };
  showSpinner:boolean=true;
  // tableAction: any[] = [
  //   { viewValue: 'Remove Duplicate Columns', value: 'Remove Duplicate Columns' },
  //   { viewValue: 'Remove Missing Value', value: 'Remove Missing Value' },
  //   { viewValue: 'Remove Missing Value by Threshold', value: 'Remove Missing Value by Threshold' },
  // ];
  colAction: any[] = [
    { viewValue: 'Row Level', value: 'Row Level' },
    { viewValue: 'Column Level', value: 'Column Level' },
  ];
  showColAction: boolean = false;
  selectedIndex: number;
  newTabType: string;
  resetTableForm: boolean;
  isTableFormValid = false;
  dynamicData: any;
  entityType;
  showConfirm = false;
  confirmMessage: string;
  // dropMissingValueResponse;
  dropMissingValueResponse: { column_level: string, row_level: string } = {
    column_level: "None",
    row_level: "None"
  };
  resetColumnForm: boolean;
  isWranglingFormValid :boolean = false;
  datasetId: any;
  showMissingDatesConfirm : boolean = false;

  constructor(
    private route: ActivatedRoute,
    private ledsLibService: LedsLibService,
    private modalService: LedsModalService,
    private utilsService: WranglingUtilsService,
    private wranglingService: WranglingService,
    private dataService: WranglingDataService,
    private cd: ChangeDetectorRef,
    private services: Services,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
  ) { }
  ngOnInit() {
    this.getPyJobUrl().then(() => {
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.alias = params.get('wname');
        this.action = params.get('action');
        this.recipeName = params.get('rname');
        this.datasetId = params.get('cname');
      })
      this.getCatalogItemSubscription();
      this.getColumnStatistics(this.statsReqObject, null);
      this.getTableActions();
      // this.fillMissingDates(this.getStatisticsRequestObject('NO'));
    });
    // this.datasetsCount = localStorage.getItem('datasetsCount');
    // console.log('count', this.datasetsCount);
    
    // setTimeout(()=>{
     
     
    // },1000)
   
    //this.fileData = history.state['fileData'];
    
    //console.log('filedatainside wrangling', this.fileData);
    // this.colHeaders=Object.keys(this.fileData[0]);
    //console.log('colHeaders',this.colHeaders);
    // this.columnMetaData.forEach((res)=>{

    // })
    //console.log('columMetadata',this.columnMetaData);


    // if (this.action == 'create') {
    //   this.recipeAction = 'Save';
    // }
    // else this.recipeAction = 'Update';
    // this.getTableData();
    //this.convertHTMLToJosn();
    //this.getObjectDetails();
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
  // getTableData(){
  //   this.wranglingService.getColumnStatistics(this.statsReqObject).subscribe((res)=>{
  //     console.log('resTableData',res);
  //     console.log('statiscticsRes',res.body.response.statistics_response.statistics);

  //   })
  // }
  closeModal() {
    this.modalService.dismissAll();
  }
  ngOnDestroy(){
    this.objDetails = [];
    this.selectedRecipe = null;
    this.selectedArgs = [];
    this.selectedFunctions = [];
    this.actionsPerformed = [];
    this.colsMetaData = [];
    //this.columnListValue = [];
    this.selectedColumns = [];
    this.selectedColumnActions = null;
    this.selectedTableActions = null;
    this.dataService.changeMessage(null);
    this.dataService.changeTransformationActionMessage(null);
    this.dataService.setAdvisoryActions(null);
    // if (this.messageService) {
    //   this.messageService.clear();
    // }

    if (this.recipeSubscription) {
      this.recipeSubscription.unsubscribe();
    }
    // if (this.recipeSubs) {
    //   this.recipeSubs.unsubscribe();
    // }
    if (this.cd) {
      this.cd.detach();
    }
  }
  showAdvisory(content: any) {
    this.showAdvisoryDialog=true;
    //this.selectedOperatorsList=[];
    this.modalService.openModal(content, 'standard');
  }
  // showDetails(content: any) {
  //   this.modalService.openModal(content, 'mini');
  // }
  openModal(content: any) {
    this.modalService.openModal(content, 'mini');
  }
  getTableActions() {
    this.wranglingService.getTableActions().subscribe((functions) => {
      // this.tableActionsAvailable = functions.dynamic;
      this.tableActionsAvailable = functions.dynamic.filter(
        (action) =>
          action.datasetTypes.includes(this.selectedRecipe?.dataset_type)
      );
    });
    this.tableActionsAvailable=this.tableActionsAvailable.map(actions=>({
      viewValue:actions.function,
      value:actions,
    }))   
    console.log('tableActions',this.tableActionsAvailable);   
  }
  resetColumnActions() {
    this.selectedColumnActions = null;
    this.selectedColumns = null;
  }
  resetTableActions() {
    this.selectedTableActions = null;
    if (
      this.columnStatistics &&
      this.selectedColumnActions.function === 'Category Reduction' &&
      this.selectedColumns.length === 1 &&
      this.columnStatistics[this.selectedColumns[0]].categories
    ) {
      this.selectedColumnActions.controlValues = Object.assign([]);

      const catValues = Object.keys(
        this.columnStatistics[this.selectedColumns[0]].categories
      );

      catValues.forEach((val) => {
        this.selectedColumnActions.controlValues = [
          ...this.selectedColumnActions.controlValues,
          {
            category: val,
            count:
              this.columnStatistics[this.selectedColumns[0]].categories[val],
          },
        ];
      });
    }
  }
  getUpdatedTableActionForm(formChanged: boolean) {
    this.isTableFormValid = formChanged;
  }
  getDynamicData(dyData) {
    this.dynamicData = dyData;
  }
  viewMetaData(col: string, $event) {
    this.columnName = col;
    const metaData = this.colsMetaData.find(obj => obj.field == col);
    if (metaData) {
      const colData = {
        'Count': metaData.count,
        'Null Count': metaData.nullCount,
        'Mean': metaData.mean,
        'Median': metaData.median,
        'Std Deviation': metaData.std,
        'Min Value': metaData.min,
        'Max Value': metaData.max
      }
      this.columnData = Object.keys(colData).map(t => ({ key: t, value: colData[t] }));
      console.log('metadata', this.columnData);
    }
    console.log('inside ViewmetaData', metaData);
    console.log('event', $event);
  }

  selectChange($event) {
    console.log('event', $event);
    this.selectedTableAction = $event;
    let action = $event
    if (action == 'Remove Missing Value') {
      this.showColAction = true;
    }
    else {
      this.showColAction = false;
    }

  }
  selectColAction($event) {
    console.log('selectedColAction', $event);
    this.selectColAction = $event;
    this.changeDetector.detectChanges();
  }
  // onClear() {
  //   console.log('onclear');
  //   this.showColAction = false;
  //   //this.selectChange(null);
  //   this.selectedTableAction = null;
  //   this.selectedColAction = null;

  // }
  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'aliasTab';
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'flowsTab';
        break;
    }
  }
  getCatalogItemSubscription(): void {
    this.recipeSubscription = this.dataService.currentMessage.pipe(take(1))
      .subscribe((recipeObject) => {
        console.log('recipeObject',recipeObject);
        
        if (recipeObject) {
          // this.displaySpinner = true;
          //this.displayStatsSpinner = true;
          this.selectedRecipe = recipeObject;
           console.log('selectedRecipeSubscription',this.selectedRecipe);
          this.viewSelectedRecipeDetails();
          console.log('wranglingArray inside the catalogItemSubscription',this.wranglingArray);
          
          //this.getDimensions(this.wranglingArray[0].colsMetaData);
          //this.displayUserInfo();
        } else {
          //this.displayNotification = true;
        }
      });
  }
  private viewSelectedRecipeDetails(): void{
    this.clearAllTableConfig();
    if (
      this.selectedRecipe &&
      this.newTabType !== 'PIVOT' &&
      this.selectedRecipe.screen !== 'flows'
    ) {
      // this.displaySpinner = true;
      const tabName =
        this.selectedRecipe.object_name.length > 10
          ? this.selectedRecipe.object_name.substring(0, 9) + '...'
          : this.selectedRecipe.object_name;

      if (
        this.wranglingArray.find(
          (obj) =>
            obj.tooltip === this.selectedRecipe.object_name &&
            obj.recipe.recipe_id === this.selectedRecipe.recipe_id
        )
      ) {

        this.wranglingArray.forEach((tabObject, index) => {
          if (
            tabObject.tooltip === this.selectedRecipe.object_name &&
            tabObject.recipe.recipe_id === this.selectedRecipe.recipe_id
          ) {
            // &&
            // this.selectedRecipe.recipe_id !== 0
            this.selectedIndex = index;
            this.selectedArgs = tabObject.selectedArgs;
            this.actionsPerformed = tabObject.actionsPerformed;

            this.selectedColumnsTableAction =
              tabObject.selectedColumnsTableAction;
            this.columnDataTypes = tabObject.columnDataTypes;
          }
        });
      } else {

        this.wranglingArray.push({
          label: tabName,
          icon: 'fa fa-fw fa-table',
          close: true,
          recipe: this.selectedRecipe,
          colsMetaData: null,
          objDetails: null,
          tooltip: this.selectedRecipe.object_name,
          actionsPerformed: [],
          saveBtnLabel: null,
          selectedFunctions: [],
          selectedArgs: [],
          actionsAvailable: [],
          selectedColumnActions: [],
          selectedColumnsTableAction: [],
          columnDataTypes: null,
          updatedRecipeActions: [],
          rows: [],
          columns: [],
          values: [],
          filter: [],
          attributeList: [],
        });
        this.selectedIndex = this.wranglingArray.length - 1;
        this.getSelectedTabItemDetails();
      }
    }
   // this.getDimensions(this.wranglingArray[0].colsMetaData);
  }
  getSelectedTabItemDetails() {
    console.log(this.selectedRecipe);
    if (this.selectedRecipe.recipe_id > 0) {
      this.setExistingActions();
      if (this.selectedRecipe.screen !== 'flows') {
        this.getTransformedObjectData();
      }
      // this.getTransformedObjectData();
      this.saveBtnLabel = 'UPDATE';
    } else {
      this.selectedFunctions = [];
      this.getObjectDetails();
      this.saveBtnLabel = 'SAVE';
    }
    this.updateRecipeTabObject('saveBtnLabel');
    //this.getColumnStatistics(this.getStatisticsRequestObject('NO'), null);
    //this.dropMissingValue(this.getStatisticsRequestObject('NO'));
    // setTimeout(()=>{
    //   console.log('wranglingArray in setout',this.wranglingArray);
    //   this.getDimensions(this.wranglingArray[0].colsMetaData);
    // },1000);
    this.cd.detectChanges();
  }
  getTransformedObjectData(): void {
    const requestObject = {
      file_name: this.selectedRecipe.transformed_file_name,
      screen: this.selectedRecipe.screen ? this.selectedRecipe.screen : 'NA',
      //user_id: Number(localStorage.getItem('user_id')),
    };
    this.displaySpinner = true;
    this.wranglingService.getTransformedObjectData(requestObject, this.pyjoburl, this.datasetId).subscribe(
      (response) => {
        if (response) {
          if (response.body.status_message === 'SUCCESS') {
            this.showSpinner = false;
            this.columnDataTypes = response.body.response.column_types;
            this.updateRecipeTabObject(
              // this.selectedRecipe.object_id,
              'columnDataTypes'
            );
            if (this.selectedRecipe.recipe_type === 'pivot') {
              this.displaySpinner = false;
            } else {
              this.convertHTMLToJSON(response.body.response.dataframe);
            }
          } else {
            this.displaySpinner = false;
            // this.displayNotification = true;
            // this.notifyMessage = this.wrangErrorMsg + this.notifyMessage;
            // this.showError(response.response);
          }
        } else {
          this.displaySpinner = false;
          // this.displayNotification = true;
          // this.notifyMessage = this.wrangErrorMsg + this.notifyMessage;
          // this.showError('Unable to fetch sample data');
        }
      },
      (error) => {
        if (error) {
          // this.displayNotification = true;
          // this.notifyMessage = this.wrangErrorMsg + this.notifyMessage;
          // this.showError(error);
        }
      }
    );
  }
  setExistingActions(): void {
    this.selectedFunctions = [];
    this.selectedArgs = [];
    this.updateRecipeTabObject( 'selectedArgs');
    const tempArray = [];
    this.actionsPerformed = [];
    this.selectedRecipe.transformations_applied.forEach((obj) => {
      Object.keys(obj).forEach((singleKey, index) => {
        this.selectedFunctions.push(singleKey);
        this.selectedArgs.push(obj[singleKey]);
        const tempLabel = TRANSFORMATION_FUNCTIONS.find(
          (entity) => entity.name === singleKey
        );
        const functionLabel = tempLabel ? tempLabel.label : null;
        if (TRANSNONCOLUMNACTIONS.indexOf(singleKey) > -1) {
          tempArray.push({
            actionID: index,
            actionLabel: functionLabel,
            actionName: singleKey,
            columns: 'NA',
            subFunc: this.utilsService.getSubFunction(
              singleKey,
              obj[singleKey]
            ),
          });
        } else {
          tempArray.push({
            actionID: index,
            actionLabel: functionLabel,
            actionName: singleKey,
            columns: obj[singleKey][Object.keys(obj[singleKey])[0]],
            subFunc: this.utilsService.getSubFunction(
              singleKey,
              obj[singleKey]
            ),
          });
        }
      });
    });
    this.updateRecipeTabObject( 'selectedArgs');
    this.updatedRecipeActions = Object.assign([], this.selectedFunctions);
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'updatedRecipeActions'
    );

    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'selectedFunctions'
    );
    this.actionsPerformed = [...tempArray];
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'actionsPerformed'
    );
  }

  getColumnStatistics(statsReqObject: StatisticsRequestObject, notepadObj): void {
    // this.statsReqObject.dataset_Id=this.datasetId.toString();
    this.wranglingService.getColumnStatistics(this.pyjoburl, statsReqObject,this.datasetId).subscribe(

      (res) => {
        console.log('columnSta', res);

        if (res.body.status_message === "SUCCESS") {
          if (
            res.body.response.statistics_response.statistics_flag === "COMPLETE"
          ) {
            this.columnStatistics =
              res.body.response.statistics_response.statistics;
            this.colHeaders = Object.keys(this.columnStatistics);
            console.log('colHeadersinside columnstatmethod', this.colHeaders);
            //this.convertHTMLToJosn();

            this.setColumnStatistics();
            console.log('colStatistics', this.columnStatistics);

            this.errorStats = false;
            if (notepadObj) {
              //this.showStatisticsPanel(notepadObj);
            }
          } else if (
            res.response.statistics_response.statistics_flag === 'PEND'
          ) {
            //  this.showInfo('Statistics execution in progress...');
          } else if (
            res.response.statistics_response.statistics_flag === 'NA'
          ) {
            // this.showError(
            //   'Could not fetch Column Statistics. ' +
            //   response.response.statistics_response.statistics
            // );
          }
        } else if (res.status_message === 'WARNING') {
          //  this.displayStatsSpinner = false;
          this.errorStats = false;
          //this.showWarning(response.response);
        } else {
          //  this.displayStatsSpinner = false;
          this.errorStats = true;
          // this.showError(
          //   'Could not fetch Column Statistics. ' + response.response
          // );
        }
        //  this.updateRecipeTabObject(this.selectedRecipe.object_id, 'errorStats');
      },
      (error) => {
        if (error) {
          // console.log('error inside col',error);

          // this.displayStatsSpinner = false;
          // this.errorStats = true;
          // this.updateRecipeTabObject(
          //   this.selectedRecipe.object_id,
          //   'errorStats'
          // );
          // this.showError(
          //   'Http Error. Could not fetch Column Statistics. ' + error
          // );
        }
      }
    );
  }
  setColumnStatistics(): void {
    for (const colName of Object.keys(this.columnStatistics)) {
      for (const colMetadata of this.colsMetaData) {
        if (colMetadata.header === colName) {
          colMetadata.count = this.columnStatistics[colName].count;
          colMetadata.nullCount = this.columnStatistics[colName]['null count'];
          colMetadata.min = this.columnStatistics[colName].min;
          colMetadata.max = this.columnStatistics[colName].max;
          colMetadata.std = this.columnStatistics[colName].std;
          colMetadata.mean = this.columnStatistics[colName].mean;
          colMetadata.median = this.columnStatistics[colName]['50%'];
          colMetadata.unique = this.columnStatistics[colName].unique;
          colMetadata.top = this.columnStatistics[colName].top;
          colMetadata.freq = this.columnStatistics[colName].freq;
          colMetadata.startdate = this.columnStatistics[colName]['first'];
          colMetadata.enddate = this.columnStatistics[colName]['last'];
          // colMetadata.type = this.columnStatistics[colName]['data type'];
          break;
        }
      }
    }
    console.log('colMetaData inside SetColummethod', this.colsMetaData);

     this.updateRecipeTabObject('colsMetaData');
    //this.displayStatsSpinner = false;
  }
  getStatisticsRequestObject(actionsChanged): StatisticsRequestObject {
    const statsReqestObj: StatisticsRequestObject = new StatisticsRequestObject();
    const repID = this.selectedRecipe.recipe_id;
    const repName =
      this.selectedRecipe.recipe_id > 0
        ? this.selectedRecipe.recipe_name
        : 'None';

    // statsReqestObj.object_id = this.selectedRecipe.object_id;
    statsReqestObj.function_name = this.selectedFunctions;
    statsReqestObj.args = this.selectedArgs;
    statsReqestObj.recipe_name = repName;
    statsReqestObj.recipe_id = repID;
    // statsReqestObj.mode = 'None';
    //  statsReqestObj.user_id = Number(localStorage.getItem('user_id'));
    statsReqestObj.actions_changed = actionsChanged;
    statsReqestObj.screen = 'wrangling';
    statsReqestObj.dataset_type = this.selectedRecipe.dataset_type;
    return statsReqestObj;
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
          console.log(this.tableData)
        } else if (action === 'drop_rows') {
          console.log('action is drop rows');
          if (colDesc != null) {
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
    console.log(this.tableData);

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
      outlierArray[0].splice(0, 1)
      return {
        column: colName + ' : ' + colDesc["message"],
        action: action,
        function: functionName,
        outlierData: outlierArray[1],
        outlierColumns: outlierArray[0],
        colName: colName,
      };
    } else {
      return {
        column: colName + ' : ' + colDesc[colName],
        action: action,
        function: functionName,
        outliers: [],
        colName: colName,
      };
    }
  }
  getQueryExpression(expQueryObject) {
    console.log(expQueryObject);

    if (expQueryObject.actionType === 'Column') {
      this.selectedColHeader = this.colsMetaData.find(
        (metadata) =>
          metadata.header === expQueryObject.argument[0].target_column_name
      );
    }
    this.executeSingleAction(expQueryObject, expQueryObject.actionType);
  }
  executeSingleAction(next, entityType) {
    console.log(this.selectedRecipe);
    this.resetExpressionBuilder = false;
    const tempTransformObj: TransformObject =
      this.utilsService.createTransformObject(this.selectedRecipe);
    tempTransformObj.function_name.push(next.function);
    tempTransformObj.args = next.argument;
    tempTransformObj.mode = 'individual_save';
    tempTransformObj.dataframe = 'NA';
    this.wranglingService.applyActions(this.pyjoburl, tempTransformObj, this.datasetId).subscribe(
      (response) => {
        if (response.body.status_message === 'SUCCESS') {
          this.selectedFunctions.push(next.function);
          this.updateRecipeTabObject(
            'selectedFunctions'
          );

          this.selectedArgs.push(next.argument[0]);
          console.log('updated selectedFunctions and started selected args');

          this.updateRecipeTabObject(
            // this.selectedRecipe.object_id,
            'selectedArgs'
          );
          console.log('updated selectedArgs');

          this.getSelectedAction(tempTransformObj, entityType);
          console.log('getSelectionAction completed');
          console.log('next.function is', next.function);

          this.selectedRecipe.first_load = response.body.response.first_load;

          if (next.function === 'rename_column') {
            this.replaceOldColWithNewCol(next.argument[0]);
          }
          if (next.function === 'column_data_type_conversion') {
            this.replaceOldDatatypeWithNew(next.argument[0]);
          }
          if (next.function === 'cols_to_rows') {
            this.aAddColumnsToMetadata();
          }
          this.convertHTMLToJSON(response.body.response.dataframe);
         // this.showSuccess(entityType + ' Configuration applied successfully');
          this.selectedColumns = [];
          this.getListOfSelectedColumns();
          this.resetExpressionBuilder = true;
          this.services.message("Action applied");
        } else if (response.body.status_message === 'WARNING') {
          this.showWarning(response.body.response);
        } else if (response.body.status_message === 'INFO') {
         // this.showInfo(response.response);
        } else {
          //this.showError(response.response);
        }
        this.dataService.changeTransformationActionMessage(null);
        this.dynamicData = null;
        console.log(this.wranglingArray);

      },
      (error) => {
        if (error) {
        //  this.showError(error);
        }
        this.dataService.changeTransformationActionMessage(null);
      }
    );
  }
  replaceOldColWithNewCol(argument): void {
    const stringCols = JSON.stringify(this.columnDataTypes);
    const newStringCols = stringCols.replace(
      argument['old_column_name'][0],
      argument['new_column_name'][0]
    );
    this.columnDataTypes = JSON.parse(newStringCols);
    this.updateRecipeTabObject(
     //this.selectedRecipe.object_id,
      'columnDataTypes'
    );
    // Replacing Old column name with new in Statistics
    if (this.columnStatistics) {
      const stringStats = JSON.stringify(this.columnStatistics);
      const newStringStats = stringStats.replace(
        argument['old_column_name'][0],
        argument['new_column_name'][0]
      );
      this.columnStatistics = JSON.parse(newStringStats);
    }
  }
  replaceOldDatatypeWithNew(argument): void {
    this.columnDataTypes[argument['column_name'][0]] = argument['column_dtype'];
    this.updateRecipeTabObject(
    //  this.selectedRecipe.object_id,
      'columnDataTypes'
    );
  }

  updateRecipeTabObject(propertyName: string) {
    console.log('wranglingArray inside updateRecipeObject', this.wranglingArray);
    console.log('actionPerformed', this.actionsPerformed);
    // console.log('ObjectId',objectID);
    console.log('propertName', propertyName);
    console.log('colsMetaData updatetabobject', this.colsMetaData);
    if (this.colsMetaData.length > 0 && this.colsMetaData[0].count) {
      this.getDimensions(this.colsMetaData);
    }

    this.wranglingArray.forEach((tabDetails) => {
      // if (tabDetails.objDetails !== null) {
      //   this.objDetails = [];
      //   // tabDetails.objDetails.forEach(details=>{
      //   //   this.objDetails.push(details);
      //   //  // console.log('diagnosis',details.diagnosis);

      //   // })
      //   // this.objDetails.push(tabDetails.objDetails);
      //   this.objDetails = tabDetails.objDetails;
      //   this.showSpinner = false;
      //   console.log('objDetails', this.objDetails);
      // }

      if (
        tabDetails.recipe &&
        // tabDetails.recipe.object_id === objectID &&
        tabDetails.recipe.recipe_id === this.selectedRecipe.recipe_id &&
        tabDetails.recipe.recipe_name === this.selectedRecipe.recipe_name
      ) {
        switch (propertyName) {
          case 'actionsPerformed': {
            tabDetails[propertyName] = this.actionsPerformed;
            tabDetails['selectedFunctions'] = this.selectedFunctions;
            break;
          }
          case 'saveBtnLabel': {
            tabDetails[propertyName] = this.saveBtnLabel;
            break;
          }
          case 'colsMetaData': {
            tabDetails[propertyName] = this.colsMetaData;
            tabDetails['objDetails'] = this.objDetails;
            break;
          }
          case 'columnDataTypes': {
            tabDetails[propertyName] = this.columnDataTypes;
            break;
          }
          case 'actionsAvailable': {
            tabDetails[propertyName] = this.actionsAvailable;
            break;
          }
          case 'selectedArgs': {
            tabDetails[propertyName] = this.selectedArgs;
            break;
          }
          case 'errorStats': {
            tabDetails[propertyName] = this.errorStats;
            break;
          }
          case 'selectedColumns': {
            tabDetails[propertyName] = this.selectedColumns;
            break;
          }
          case 'selectedColumnsTableAction': {
            tabDetails[propertyName] = this.selectedColumnsTableAction;
            break;
          }
          case 'updatedRecipeActions': {
            tabDetails[propertyName] = this.updatedRecipeActions;
            break;
          }
        }
      }
    });
  }
  displayColumnMetaData(selectedColumnHeader: ColumnMetaData,
    event,
    recipeItem): void { }
  // onClickSubmit() { }
  advisoryDialogClosed(event) {
    this.showAdvisoryDialog = !event;
    this.addAdvisoryActions();
  }
  getObjectDetails(): void {
    // const recipeObject:RecipeObject ={
    //   datatypes_required: "YES",
    //   user_id: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.c0ae8mPqGvq3AARD0Awb95eOSOxd5fvqh3CI98DcGq8",
    //   collection_name: [],
    //   connection_id: 1,
    //   dataset_type: 'machine_learning',
    //   first_load: 'YES',
    //   object_id: 6,
    //   object_name: 'Lung_Cancer_Cleaned',
    //   recipe_id: 0,
    //   recipe_name: 'Test',
    //   object_dimensions: ['515', '31'],
    //   recipe_type: '',
    // }
  
    //this.selectedRecipe.user_id = Number(localStorage.getItem('user_id'));
    
    // this.selectedRecipe.user_id="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.c0ae8mPqGvq3AARD0Awb95eOSOxd5fvqh3CI98DcGq8";
    this.selectedRecipe.datatypes_required= "YES",
    // this.selectedRecipe.collection_name= [],
    // this.selectedRecipe.connection_id= 1,
    //this.selectedRecipe.dataset_type= 'machine_learning',
    //this.selectedRecipe.first_load= 'YES',
    //this.selectedRecipe.object_id= 6,
    //this.selectedRecipe.object_name= 'Lung_Cancer_Cleaned',
    //this.selectedRecipe.recipe_id= 0,
    //this.selectedRecipe.recipe_name= 'Test',
    //this.selectedRecipe.object_dimensions= ['515', '31'],    
    console.log('selectedRecipe',this.selectedRecipe);    
    this.wranglingService.getObjectDetails(this.pyjoburl,this.selectedRecipe, this.datasetId).subscribe(
      (response) => {
        console.log('responseObjectDetails',response);
        
        if (response.body.status_message === 'SUCCESS') {
          this.showSpinner = false;
          this.columnDataTypes = response.body.response.column_types;
          this.updateRecipeTabObject(
            // this.selectedRecipe.object_id,
            'columnDataTypes'
          );
          if (this.selectedRecipe.recipe_type === 'pivot') {
            this.displaySpinner = false;
          } else {
            this.convertHTMLToJSON(response.body.response.dataframe);
          }
        } else {
          this.displaySpinner = false;
          // this.displayNotification = true;
          // this.notifyMessage = this.wrangErrorMsg + this.notifyMessage;
          // this.showError(response.status_message + ' ' + response.response);
        }
      },
      (error) => {
        if (error) {
         // this.displayNotification = true;
          this.displaySpinner = false;
          // this.notifyMessage = this.wrangErrorMsg + this.notifyMessage;
          // this.showError(error);
        }
      }
    );
  }
  public handleClose(event): void {
    this.wranglingArray.splice(event.index, 1);
    this.cd.detectChanges();
    // need to use form array for multi tab data handling
    this.actionsPerformed = [];
    this.selectedIndex = 0;
    // if (this.selectedIndex === 0) {
    //   this.getFlowList();
    // }
    event.close();
  }
  public handleChange(change): void {
    // this.clearAllTableConfig();
    // this.clearAllColumnConfig();
    this.selectedColumns = [];
    // this.selectedColumnActions = null;
    // this.selectedColumnDataType = null;
    this.selectedIndex = change.index;
    this.actionsAvailable = [];
    // this.selectedFunctions = [];
    // this.columnDataTypes = [];
    if (this.wranglingArray[change.index]['recipe']) {
      this.selectedRecipe = this.wranglingArray[change.index]['recipe'];
      this.selectedArgs = this.wranglingArray[change.index].selectedArgs;
      this.actionsPerformed =
        this.wranglingArray[change.index].actionsPerformed;
      this.selectedColumnsTableAction = [];
      this.columnDataTypes = this.wranglingArray[change.index].columnDataTypes;
      this.wranglingArray[change.index].actionsAvailable = [];
      this.selectedFunctions =
        this.wranglingArray[change.index].selectedFunctions;
      this.updatedRecipeActions =
        this.wranglingArray[change.index].updatedRecipeActions;
      //this.actionsTabIndex = 0;
    }
    // if (change.index === 0) {
    //   this.getFlowList();
    // }
    // if (this.newTabType !== 'PIVOT') {
    //   this.wranglingArray[change.index].attributeList = [];
    // }
     //this.getDimensions();
    this.cd.detectChanges();
  }
  getDimensions(record:any) {
    console.log('getDimensionRecord',record);
    
    // if (this.selectedRecipe.object_dimensions) {
    //   this.dimensionText = `${this.selectedRecipe.object_dimensions[0]} rows * ${this.selectedRecipe.object_dimensions[1]} columns`;
    // } else {
    //   this.dimensionText = null;
    // }
    let totalColumn =record.length;
    if(record.length>0){
      this.dimensionText=`${record[0].count} rows * ${totalColumn} columns`;
    }
    else{
      this.dimensionText=null
    }
  }
  addAdvisoryActions(): void {
    this.dataService.currentadvisoryActions
      .pipe(take(1))
      .subscribe((actions) => {
        if (actions) {
          const addActionsArray =
            this.utilsService.getAdvisoryFunctions(actions);
          const message = this.validateAdvisoryAction(
            actions,
            this.selectedFunctions,
            this.actionsPerformed
          );
          if (!message) {
            const transformObj: TransformObject =
              this.utilsService.createTransformObject(this.selectedRecipe);
            transformObj.function_name = addActionsArray[0];
            transformObj.args = addActionsArray[1];
            transformObj.mode = 'individual_save';
            this.addAdvisoryActionsToUI(actions);           //remove this line after the api implementation
            this.updateFunctionsAndArgs(addActionsArray);     //remove this line after the api implementation
            this.wranglingService.applyActions(this.pyjoburl, transformObj, this.datasetId).subscribe(
              (response) => {
                if (response.body.status_message === 'SUCCESS') {
                  this.selectedRecipe.first_load = response.body.response.first_load;
                  this.addAdvisoryActionsToUI(actions);
                  this.updateFunctionsAndArgs(addActionsArray);
                  this.convertHTMLToJSON(response.body.response.dataframe);
                  // this.showSuccess('Configurations applied successfully');
                  this.selectedColumns = [];
                } else if (response.body.status_message === 'WARNING') {
                 // this.showWarning(response.response);
                } else if (response.body.status_message === 'INFO') {
                  //this.showInfo(response.response);
                } else {
                 // this.showError(response.response);
                }
              },
              (error) => {
                if (error) {
                 // this.showError(error);
                }
              }
            );
          } else {
           // this.showWarning(message);
          }
        }
      });
  }

  validateAdvisoryAction(dynamicData, selectedFunctions, actionsPerformed): string {
    let message;
    dynamicData.forEach(eachAction => {
      if (eachAction.function === 'drop_duplicate_columns' && selectedFunctions.includes(eachAction.function)) {
        message = 'Remove Duplicate Columns already applied.';
        return message;
      } else if (eachAction.function === 'drop_duplicate_rows' && selectedFunctions.includes(eachAction.function)) {
        message = 'Remove Duplicate Rows already applied.';
        return message;
      } else if (eachAction.function === 'drop_missing_values' && selectedFunctions.includes(eachAction.function)) {
        const type = eachAction.argument['axis_value'] === 0 ? 'Row Level' : 'Column Level';
        actionsPerformed.forEach(element => {
          if (element.subFunc === type && element.actionName === eachAction.function) {
            message = element.actionLabel + ' already applied. Please remove existing one to add';
            return message;
          }
        });
      } else if (eachAction.function === 'drop_missing_data_by_threshold_value' && selectedFunctions.includes(eachAction.function)) {
        const type = eachAction.argument['axis_value'] === 0 ? 'Row Level' : 'Column Level';
        actionsPerformed.forEach(element => {
          if (element.subFunc.match(type) && element.actionName === eachAction.function) {
            message = element.actionLabel + ' already applied. Please remove existing one to add';
            return message;
          }
        });
      } else if (selectedFunctions.includes(eachAction.function)) {
        actionsPerformed.forEach(element => {
          if (element.columns[0] === Object.values(eachAction.argument)[0][0]) {
            message = element.actionLabel + ' on column ' + element.columns[0] + ' already applied. Please remove existing one to add';
            return message;
          }
        });
      }
      return message;
    });
    return message;
  }
  addAdvisoryActionsToUI(actions) {
    actions.forEach((element) => {
      const transformObj: TransformObject =
        this.utilsService.createTransformObject(this.selectedRecipe);
      transformObj.function_name.push(element.function);
      transformObj.args.push(element.argument);
      transformObj.mode = 'individual_save';
      this.selectedColumns = element.columns;
      this.getSelectedAction(transformObj, 'Column');
    });
    console.log()
  }
  getSelectedAction(
    tempTransformObj: TransformObject,
    entityType: string
  ): void {
    this.actionsPerformed = [
      ...this.utilsService.getActions(
        this.actionsPerformed,
        tempTransformObj,
        entityType,
        this.columnDataTypes,
        this.selectedColumns,
        this.selectedColHeader
      ),
    ];
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'actionsPerformed'
    );
  }
  updateFunctionsAndArgs(actionsArray) {
    actionsArray[0].forEach((element) => {
      this.selectedFunctions.push(element);
    });
    actionsArray[1].forEach((element) => {
      this.selectedArgs.push(element);
    });
    console.log(actionsArray)
    this.updateRecipeTabObject( 'selectedArgs');
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'selectedFunctions'
    );
  }

  convertHTMLToJSON(response): void {
    const table = document.createElement('table');
    table.innerHTML = response + '';
    const data = [];
    const headers = [];
    for (let i = 0; i < table.rows[0].cells.length; i++) {
      headers[i] = table.rows[0].cells[i].innerHTML;
    }
    //to display column names
    this.colsMetaData = [];
    //this.columnListValue = [];
    this.selectedColumnsTableAction = [];
    console.log(this.columnDataTypes);
    for (let i = 0; i < headers.length; i++) {
      console.log(headers[i]);
      const colDataTypeCode = this.columnDataTypes[headers[i]];
      console.log(colDataTypeCode);
      const typeObj = COLUMNDATATYPES.find(
        (entity) => entity.code === colDataTypeCode
      );
      console.log(typeObj);
      const colDataType = typeObj ? typeObj.name : '';
      console.log(colDataType);
      this.colsMetaData.push({
        field: headers[i],
        header: headers[i],
        type: colDataType,
        min: '',
        max: '',
        mean: '',
        median: '',
        count: '',
        std: '',
        unique: '',
        top: '',
        freq: '',
        nullCount: '',
        startdate: '',
        enddate: '',
      });
      // this.columnListValue.push({
      //   label: headers[i],
      //   value: { id: i, name: headers[i], code: headers[i] },
      // });
      this.selectedColumnsTableAction.push(headers[i]);
      this.updateRecipeTabObject(
        // this.selectedRecipe.object_id,
        'selectedColumnsTableAction'
      );
    }
    if (this.columnStatistics) {
      this.setColumnStatistics();
    }
    // go through cells
    for (let i = 1; i < table.rows.length; i++) {
      const tableRow = table.rows[i];
      const rowData = {};
      for (let j = 0; j < tableRow.cells.length; j++) {
        rowData[headers[j]] = tableRow.cells[j].innerHTML;
      }
      data.push(rowData);
    }
    this.objDetails = [];
    this.objDetails = data;
    this.updateRecipeTabObject( 'colsMetaData');
    //this.displaySpinner = false;
   // this.getDimensions(this.wranglingArray[0].colsMetaData);
    console.log(this.objDetails);
    console.log(this.colsMetaData);
    this.cd.detectChanges();
  }
  getListOfSelectedColumns(): void {
    console.log('getListOfSelectedColumns function called');
    if (this.enableRangeSelect && this.selectedColumns.length === 2) {
      this.selectedColumns = this.utilsService.getRangeColumns(
        this.selectedColumns,
        this.colsMetaData
      );
    }
    this.selectedColumnActions = null;
    this.actionsAvailable = [];
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'actionsAvailable'
    );
    // column level Action
    this.wranglingService.getActionsAvailable().subscribe((functions) => {
      if (this.selectedColumns.length > 1) {
        this.actionsAvailable = functions.dynamic.filter(
          (action) =>
            action.availability.includes('multi') &&
            this.getMultiColDataTypeFunctions(action) &&
            action.datasetTypes.includes(this.selectedRecipe.dataset_type)
        );
      } else if (this.selectedColumns.length === 1) {
        this.actionsAvailable = functions.dynamic.filter(
          (action) =>
            action.availability.includes('single') &&
            action.dataTypes.includes(
              this.columnDataTypes[this.selectedColumns[0]]
            ) &&
            action.datasetTypes.includes(this.selectedRecipe.dataset_type)
        );
      }
    });

    if (
      this.selectedColumns.length === 0 &&
      this.selectedColumnActions !== null
    ) {
      this.selectedColumnActions = null;
      // this.resetColumnForm = true;
      // this.isWranglingFormValid = false;
      this.actionsAvailable = [];
      //this.dynamicData = null;
    }
    if (this.selectedColumns.length === 1) {
      this.selectedColumnDataType =
        this.columnDataTypes[this.selectedColumns[0]];
    }
    this.actionsTabIndex = this.selectedColumns.length >= 1 ? 1 : 0;
    // if (this.selectedRecipe && this.selectedRecipe.object_id) {
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'actionsAvailable'
    );
    // }
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'selectedColumns'
    );

  }

  getMultiColDataTypeFunctions(action): boolean {
    let condition = true;
    for (const col of this.selectedColumns) {
      if (!action.dataTypes.includes(this.columnDataTypes[col])) {
        condition = false;
        break;
      }
    }
    return condition;
  }
  aAddColumnsToMetadata(): void {
    this.colsMetaData.push(WRANACTIONSTATS);
    this.colsMetaData.push(WRANACTIONCOLSSTATS);
    this.updateRecipeTabObject( 'colsMetaData');
  }

  removeActions(action,index){
    console.log('actoin from remove',action);
    console.log('index from remove',index);
    this.callActionHistoryUndoService(action, index);    
  }

  callActionHistoryUndoService(selectedAction, actionIndex): void {
    const tempTransformObj: TransformObject =
      this.utilsService.createTransformObject(this.selectedRecipe);
    const actionUndoArray = this.getFunctionAndArgsForActionHistoryUndo(
      selectedAction,
      actionIndex
    );
    tempTransformObj.function_name = actionUndoArray[0];
    tempTransformObj.args = actionUndoArray[1];
    tempTransformObj.mode = 'final_save';
    this.wranglingService.applyActions(this.pyjoburl, tempTransformObj, this.datasetId).subscribe(
      (response) => {
        if (response.body.status_message === 'SUCCESS') {
          if (selectedAction.actionName === 'rename_column') {
            this.replaceNewColWithOldCol(selectedAction, actionIndex);
          }
          if (selectedAction.actionName === 'column_data_type_conversion') {
            this.replaceNewDatatypeWithOld(selectedAction, actionIndex);
          }
          this.selectedRecipe.first_load = response.body.response.first_load;
          this.convertHTMLToJSON(response.body.response.dataframe);
          this.removeFromActionsArray(selectedAction, actionIndex);
          this.removeFromSelectedFunctionsAndArgs(selectedAction, actionIndex);
          //this.showSuccess('Configuration removed successfully');
        } else if (response.body.status_message === 'INFO') {
          //this.showInfo(response.response);
        } else {
          //his.showError(response.response);
        }
      },
      (error) => {
        if (error) {
          //this.showError(error);
        }
      }
    );
  }
  getFunctionAndArgsForActionHistoryUndo(selectedAction, actionIndex): any[] {
    const actionUndoArray = [];
    const addedFunctions = [...this.selectedFunctions];
    const addedArgs = [...this.selectedArgs];
    addedFunctions.splice(actionIndex, 1);
    addedArgs.splice(actionIndex, 1);
    actionUndoArray.push(addedFunctions);
    actionUndoArray.push(addedArgs);
    return actionUndoArray;
  }

  replaceNewColWithOldCol(selectedAction, actionIndex): void {
    const removedAction = this.getRemovedActionFunctionAndArgs(
      selectedAction,
      actionIndex
    );
    const stringCols = JSON.stringify(this.columnDataTypes);
    const newStringCols = stringCols.replace(
      removedAction[1][0]['new_column_name'][0],
      removedAction[1][0]['old_column_name'][0]
    );
    this.columnDataTypes = JSON.parse(newStringCols);
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'columnDataTypes'
    );
    // Replacing new Column name with Old in Statistics
    if (this.columnStatistics) {
      const stringStats = JSON.stringify(this.columnStatistics);
      const newStringStats = stringStats.replace(
        removedAction[1][0]['new_column_name'][0],
        removedAction[1][0]['old_column_name'][0]
      );
      this.columnStatistics = JSON.parse(newStringStats);
    }
  }
  getRemovedActionFunctionAndArgs(selectedAction, actionIndex): any {
    const removedActionArray = [];
    const addedFunctions = [this.selectedFunctions[actionIndex]];
    const arg = this.selectedArgs[actionIndex];
    const addedArgs = [arg];
    removedActionArray.push(addedFunctions);
    removedActionArray.push(addedArgs);
    return removedActionArray;
  }
  replaceNewDatatypeWithOld(selectedAction, actionIndex): void {
    const removedAction = this.getRemovedActionFunctionAndArgs(
      selectedAction,
      actionIndex
    );
    this.columnDataTypes[removedAction[1][0]['column_name'][0]] =
      selectedAction.oldDataType;
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'columnDataTypes'
    );
  }
  removeFromActionsArray(selectedAction, actionIndex): void {
    const addedActions = this.actionsPerformed;
    addedActions.splice(actionIndex, 1);
    this.actionsPerformed = [...addedActions];
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'actionsPerformed'
    );
  }
  removeFromSelectedFunctionsAndArgs(selectedAction, actionIndex): void {
    this.selectedFunctions.splice(actionIndex, 1);
    this.updateRecipeTabObject(
      // this.selectedRecipe.object_id,
      'selectedFunctions'
    );
    this.selectedArgs.splice(actionIndex, 1);
    this.updateRecipeTabObject( 'selectedArgs');
  }
  clearAllTableConfig(): void {
    this.resetTableForm = true;
    this.selectedTableActions = null;
    this.isTableFormValid = null;
  }
  tableSaveButtonState(): boolean {
    return !this.isTableFormValid;
  }
  addActions(entityType: string): void {
    this.entityType = entityType;
    console.log(this.dynamicData);
    console.log(this.selectedFunctions);
    console.log(this.actionsPerformed);
    if (this.dynamicData) {
      const message = this.validateApplyAction(
        this.dynamicData,
        this.selectedFunctions,
        this.actionsPerformed
      );
      if (!message) {
        let func_list = ['drop_duplicate_columns', 'drop_duplicate_rows',
                     'drop_missing_data_by_threshold_value',
                     'drop_columns','drop_outliers']
        if (func_list.includes(this.dynamicData.function)) {
          if (this.entityType === 'Table'){
            var func = this.tableActionsAvailable.find(val => {
              return val.value.functionName == this.dynamicData.function
            })
          } else {
            var func = this.actionsAvailable.find(val => {
              return val.functionName == this.dynamicData.function
            })
          }
          this.showConfirm = true;
          this.confirmMessage =
            'Are you sure that you want to add "' + func.value["function"] + '" action ?';
            this.openDialog(this.confirmMessage);
        } else if(this.dynamicData.function == 'drop_missing_values') {
          var func = this.tableActionsAvailable.find(val => {
            return val.value.functionName == this.dynamicData.function
          });
          let message = 'Are you sure that you want to add "' + func.value["function"] + '" action ?'
          const type = this.dynamicData.argument[0]['axis_value'] === 0 ? 'Row Level' : 'Column Level';
          if (type == 'Row Level') {
            this.confirmMessage = this.dropMissingValueResponse["row_level"] == "None"
              ? message
              : this.dropMissingValueResponse["row_level"]
          } else {
            this.confirmMessage = this.dropMissingValueResponse["column_level"] == "None"
              ? message
              : this.dropMissingValueResponse["column_level"]
          }
          this.showConfirm = true;
          this.openDialog(this.confirmMessage);
        } else {
          this.settingsSaveMessage(this.entityType);
        }
      } else {
        this.showWarning(message);
        this.dynamicData = null;
        this.selectedColumns = [];
      }
    }
  }
  validateApplyAction(dynamicData, selectedFunctions, actionsPerformed): string {
    let message;
    if (dynamicData.function === 'drop_duplicate_columns' && selectedFunctions.includes(dynamicData.function)) {
      message = 'Remove Duplicate Columns already applied.';
      return message;
    } else if (dynamicData.function === 'drop_duplicate_rows' && selectedFunctions.includes(dynamicData.function)) {
      message = 'Remove Duplicate Rows already applied.';
      return message;
    } else if (dynamicData.function === 'drop_missing_values' && selectedFunctions.includes(dynamicData.function)) {
      const type = dynamicData.argument[0]['axis_value'] === 0 ? 'Row Level' : 'Column Level';
      actionsPerformed.forEach(element => {
        if (element.subFunc === type && element.actionName === dynamicData.function) {
          message = element.actionLabel + ' already applied. Please remove existing one to add';
          return message;
        }
      });
    } else if (dynamicData.function === 'drop_missing_data_by_threshold_value' && selectedFunctions.includes(dynamicData.function)) {
      const type = dynamicData.argument[0]['axis_value'] === 0 ? 'Row Level' : 'Column Level';
      actionsPerformed.forEach(element => {
        if (element.subFunc.match(type) && element.actionName === dynamicData.function) {
          message = element.actionLabel + ' already applied. Please remove existing one to add';
          return message;
        }
      });
    } else if (selectedFunctions.includes(dynamicData.function)) {
      actionsPerformed.forEach(element => {
        if (element.columns[0] === Object.values(dynamicData.argument[0])[0][0]) {
          message = element.actionLabel + ' on column ' + element.columns[0] + ' already applied. Please remove existing one to add';
          return message;
        }
      });
    }
    return message;
  }
  settingsSaveMessage(entityType: string): void {
    if (this.dynamicData) {
      const message = this.validateApplyAction(
        this.dynamicData,
        this.selectedFunctions,
        this.actionsPerformed
      );
      if (!message) {
        this.executeSingleAction(this.dynamicData, entityType);
      } else {
        this.showWarning(message);
        this.dynamicData = null;
        this.selectedColumns = [];
      }
    }
    // if (this.dynamicData) {
    //   this.executeSingleAction(this.dynamicData, entityType);
    // }
    entityType === 'Table'
      ? this.clearAllTableConfig()
      : this.clearAllColumnConfig();
  }
  showWarning(message): void {
    // this.messageService.add({
    //   key: 'bc',
    //   severity: 'warn',
    //   summary: 'Warning Message',
    //   detail: message,
    // });
  }
  clearAllColumnConfig(): void {
    this.selectedColumnActions = null;
    this.resetColumnForm = true;
    this.isWranglingFormValid = null;
    this.getListOfSelectedColumns();
  }
  saveButtonState(): boolean {
    return !this.isWranglingFormValid;
  }
  clearDynamicColumnForm(): void {
    this.dynamicData = null;
    this.selectedColumns = [];
    this.selectedColumnActions = null;
    this.resetColumnForm = true;
    this.isWranglingFormValid = false;
    this.getListOfSelectedColumns();
  }
  
  getUpdatedActionForm(formChanged: boolean): void {
    this.isWranglingFormValid = formChanged;
  }
  getLoader(showSpinner: boolean): any {
    if (showSpinner) {
      return {
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        height: '480px' 
      };
    } else {
      return {
        'background-color': 'white',
        overflow: 'auto',
        height: '480px'
      };
    }
  }
  openDialog(message:any): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '360px',
      data: { message: message },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // User clicked "OK"
        // Emit acceptConfirmation event
        // this.acceptConfirmation.emit(true);
        this.settingsSaveMessage(this.entityType);
      } else {
        // User clicked "Cancel"
        // Emit rejectConfirmation event
        // this.rejectConfirmation.emit(true);
        this.entityType === 'Table'
        ? this.clearAllTableConfig()
        : this.clearAllColumnConfig();
      }
    });
  }

  fillMissingDates(statsReqObject: StatisticsRequestObject) {
    // console.log('calling dropmissingvalue');
    this.wranglingService.getFillMissingDates(this.pyjoburl, statsReqObject).subscribe(
      (response) => {
        console.log(response.response["missing_dates"].length);
        if (response.status_message === 'SUCCESS') {
          if (response.response["missing_dates"].length == 1) {
            this.showMissingDatesConfirm = true;
            this.confirmMessage = "Fill Missing Dates";
            this.setParamsForMissingDates(response.response);
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
   setParamsForMissingDates(response) {
    this.dynamicData = {
      "function": "impute_missing_date",
      "argument": [
          {
              "column_name": response.columns,
              // "impute_method": "ffill"
          }
      ]
    };
    this.selectedColumns = response.columns;
  }
  saveRecipe(): void {
    this.selectedRecipe.recipe_type = 'transformation';
    this.selectedRecipe.object_name = this.selectedRecipe.object_name;
    this.selectedRecipe.function_name = this.selectedFunctions;
    this.selectedRecipe.args = this.selectedArgs;
    this.selectedRecipe.screen = 'wrangling';
   // this.selectedRecipe.user_id = Number(localStorage.getItem('user_id'));
    this.wranglingService.saveRecipe(this.pyjoburl, this.selectedRecipe, this.datasetId).subscribe(
      (response) => {
        if (response.status_message === 'SUCCESS') {
          this.saveBtnLabel = 'UPDATE';
          this.updateRecipeTabObject(
            //this.selectedRecipe.object_id,
            'saveBtnLabel'
          );
          //this.showSuccess(response.response.response);
          this.selectedRecipe.recipe_id = response.response.recipe_id;
          this.wranglingService.entityHasUpdated(true);

          this.updatedRecipeActions = Object.assign([], this.selectedFunctions);
          this.updateRecipeTabObject(
           // this.selectedRecipe.object_id,
            'updatedRecipeActions'
          );
          this.getColumnStatistics(
            this.getStatisticsRequestObject('YES'),
            null
          );
          this.services.message("Recipe is saved");
        } else {
         // this.showError(response.response);
        }
      },
      (error) => {
        if (error) {
         // this.showError(error);
        }
      }
    );
  }

  updateRecipe(): void {
    this.selectedRecipe.function_name = this.selectedFunctions;
    this.selectedRecipe.object_name = this.selectedRecipe.object_name;
    this.selectedRecipe.args = this.selectedArgs;
    this.selectedRecipe.screen = 'wrangling';
   // this.selectedRecipe.user_id = Number(localStorage.getItem('user_id'));
    this.wranglingService.updateRecipe(this.pyjoburl, this.selectedRecipe, this.datasetId).subscribe(
      (response) => {
        if (response.status_message === 'SUCCESS') {
          this.updatedRecipeActions = Object.assign([], this.selectedFunctions);
          this.updateRecipeTabObject(
           // this.selectedRecipe.object_id,
            'updatedRecipeActions'
          );

          //this.showSuccess(response.response);
          this.getColumnStatistics(
            this.getStatisticsRequestObject('YES'),
            null
          );
          this.wranglingService.entityHasUpdated(true);
        } else {
          //this.showError(response.response);
        }
      },
      (error) => {
        if (error) {
         // this.showError(error);
        }
      }
    );
  }
  executeRecipe(): void {
    this.displaySpinner = true;
    const transformObj: TransformObject =
      this.utilsService.createTransformObject(this.selectedRecipe);
    transformObj.function_name = this.selectedFunctions;
    transformObj.args = this.selectedArgs;
    transformObj.mode = 'execute';
    this.wranglingService.executeTransformJob(transformObj).subscribe(
      (response) => {
        if (response.status_message === 'SUCCESS') {
          this.displaySpinner = false;
         // this.showSuccess(response.response);
        } else {
          this.displaySpinner = false;
        //  this.showError(response.response);
        }
      },
      (error) => {
        if (error) {
          this.displaySpinner = false;
         // this.showError(error);
        }
      }
    );
  }
  getSaveDisabled(item): boolean {
    return (
      item.selectedFunctions.length === 0 &&
      item.updatedRecipeActions.length === 0
    );
  }

  getUpdateDisabled(item): boolean {
    return (
      item.selectedFunctions.length === 0 &&
      item.updatedRecipeActions.length === 0
    );
  }

  getExecuteDisabled(item): boolean {
    return (
      item.saveBtnLabel === 'SAVE' ||
      (item.selectedFunctions.length === 0 &&
        item.updatedRecipeActions.length === 0)
    );
  }

}
