import { ChangeDetectorRef, Input} from '@angular/core';


// export class OpenExplorationComponent implements OnInit{
//   // @Input() attribute;
//   // toggleMaxBtn = false;
//   ngOnInit(): void {

//   }

// }
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import {
  UntypedFormArray,
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ListboxModule } from 'primeng/listbox';
import { Observable, Subscription, timer } from 'rxjs';

import {
  DROPLENGENDSLABEL,
  CATEGORICALFUNCTIONS,
  OPENEXPFILTERDEFAULTLBL,
  QUANTITATIVEFUNCTIONS,
  NOAGGREGATECHARTS,
  SELECTCATAGORICALDATA,
  SCATTER_AGGREGATES_QUAN_YAXIS,
  OTHERCHARTS_AGGREGATES_QUAN_YAXIS,
  AGGREGATES_CAT_YAXIS,
  AGGREGATES_TEM_YAXIS,
  AGGREGATES_QUAN_XAXIS,
  AGGREGATES_CAT_XAXIS,
  PIE_CAT_XAXIS,
  OTHERCHARTS_QUAN_XAXIS,
  QUANTDATATYPES,
  CATAGORICALDATATYPES,
  TEMPORALDATATYPES,
  BOOL_LIST,
  LINKAGE_LIST,
} from '../staticfile/constant';
import {
  AnalyticsCategory,
  ChartRequestParameter,
  TransformObject,
  RecipeObject,
  StoryBoardParameter,
  MultiVariateParams,
} from '../staticfile/models';
import { Services } from '../../services/service';
import { multiCharts } from '../staticfile/multivariate-charts';
// import { services, services } from '../../../../../shared/services';
@Component({
  selector: 'app-multivariate-analytics',
  templateUrl: './multivariate-analytics.component.html',
  styleUrls: ['./multivariate-analytics.component.scss']
})

export class MultivariateAnalyticsComponent implements OnInit, OnDestroy, OnChanges {
  /**TO DO : all properties should be type casted */
  allAttributes; //: AnalyticsCategory;
 toggle:boolean=false;
  @Input() quickstatdata;
  showSaveStoryDialog: boolean;
  attributes;
  objectID: number;
  listInlineStyle = { width: '100%' };
  currentListBoxID: Array<string> = [];
  allSelection: AnalyticsCategory = {
    quantitave: [],
    categorical: [],
    temporal: [],
  };
  chartTypes;
  chartTypes1 = [];
  itemsDropped = [];
  itemsDropped1 = [];
  draggedAttribute: any;
  chartTypeSelected;
  firstOptionXAxis: string;
  firstOptionYAxis: string;
  toggleMaxBtn = false;
  catAxisOptions = CATEGORICALFUNCTIONS;
  quanAxisOptions = QUANTITATIVEFUNCTIONS;
  legendLabels = DROPLENGENDSLABEL;
  lblColorVariation = DROPLENGENDSLABEL.color;
  lblShapeVariation = DROPLENGENDSLABEL.shape;
  lblSizeVariation = DROPLENGENDSLABEL.size;
  currentAttributeType: string;
  colorLengends: string[];
  shapeLengends: string[];
  sizeLengends: string[];
  attributeFilterVariable;
  filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
  filtersSelected = [];
  attrClassification$: Observable<{ list: [{ name: string; id: number }] }>;
  dynamicInputDataGroup: FormGroup;
  chartsWithLegends: string[];
  private dataSubscription: Subscription = new Subscription();
  frameTimerSubscription: Subscription;
  chartParams: ChartRequestParameter;
  innerHtml: string;
  chartControls;
  urlSafe: SafeResourceUrl = 'about:blank';
  filterResponse = [];
  filterListboxMessage = [{ label: 'Too many values to display' }];
  filterResponseBackup;
  filterColumnSelected: string;
  displaySpinner: boolean;
  filterAttributeType: string;
  smartFilterOpr: string;
  smartFilterValue: number;
  upperRangeValue: number;
  lowerRangeValue: number;
  period: number = null;
  word_frequecy: number = null;
  threshold: number;
  storyContentObj: StoryBoardParameter;
  compareValue=['>','<','>=','<='];
  normalizeValue: { name: string; code: string };
  linkageValue: { name: string, code: string };
  thresholdValue = null;
  inCorrectThreshold = false;
  allColumnsSelected = [];
  normalizeOptions = BOOL_LIST;
  LinkageOptions = LINKAGE_LIST;
  openExpLbls = {
    chartLbl: 'Chart type',
    noAttributes: 'No attributes available',
    noAxisReq: 'No axis required',
    legends: 'Legends',
    filters: 'Filters',
    reset: 'Reset',
    filter: 'Filter',
    low: 'Lower Range',
    up: 'Upper Range',
    enterVal: 'Enter value',
    cancel: 'Cancel',
    apply: 'Apply',
    threshold: 'Threshold',
    normalize: 'Normalize',
    linkage: 'Linkage'
    
  };
  timeSeriesOptions = [
    "decomposition_grid",
    "decomposition_vertical",
    "decomposition_horizontal"
  ];
  timeSeriesOptions1 = [
    { value: "decomposition_grid", viewValue: "decomposition_grid" },
    { value: "decomposition_vertical", viewValue: "decomposition_vertical" },
    { value: "decomposition_horizontal", viewValue: "decomposition_horizontal" },
  ];
  chartLayout = "decomposition_grid";
  isExpanded = true;
  sanitizedHtml: SafeResourceUrl = 'about:blank';
  columnsWithType;
  listboxMain: ListboxModule;
  normal: { name: string; code: string; }[];
  normalizeOptions1: any = [];
  LinkageOptions1: any= [];
  chartPlaceholder =
    'Please select chart type and select/drag & drop attributes';
    frameWidth = '0%';
    frameHeight = '0%';
  multivariateUrl: any;
  constructor(


    private formBuilder: UntypedFormBuilder, private services: Services,private sanitizer: DomSanitizer, private cdRef: ChangeDetectorRef
  ) { }
  alias: any;
  nameid:any;
  ngOnInit() {
    // this.pp();
    this.chartControls='';
    this.chartTypeSelected='';
    this.toggle=false;
    console.log("qiuickstat value",this.quickstatdata);
    this.nameid=localStorage.getItem('nameid');
    this.getparamdta();
    this.getAttributeList();
    this.getMultivariateURL();
   
    if (localStorage.getItem('dataalias')) {
      this.alias = localStorage.getItem('dataalias');

    }
    this.getChartList();
    this.getNormalisedValue();
    this.getLinkageValue();
    // this.getAllAttributesSubscription();
    // this.getCurrentObject();
    // this.services.updateStoryBoard(this.storyContentObj);
    this.anomalyEventSubscription();
    // this.getMinimizeMaximizeSubscription();
    // this.services.updateSaveToStory(true);
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
    this.services.changeMessageAnomaly(
      this.generateAnomalyObject()
    );
    this.services.updateSaveToStory(false);
  }

  ngOnChanges() {
    this.allAttributes = this.attributes;
  }

  getAllAttributesSubscription() {
    this.dataSubscription.add(
      this.services.currentAllAttributes.subscribe((obj) => {
        this.allAttributes = obj;
      })
    );
  }

  getCurrentObject(): void {
    // this.dataSubscription.add(
    //   this.services.currentMessage.subscribe((selectedObject) => {
    //     if (selectedObject && selectedObject.object_id) {
    //       this.objectID = selectedObject.object_id;
    //     }
    //   })
    // );
    // var selectedObject = JSON.parse(localStorage.getItem('selectedObject_for_analytics'))
    var selectedObject = { "object_id": 6, "function_name": [], "args": [], "recipe_name": "None", "recipe_id": 0, "user_id": 1, "actions_changed": "NO", "screen": "both" };


    if (selectedObject && selectedObject.object_id) {
      this.objectID = selectedObject.object_id;
    }
  }

  anomalyEventSubscription() {
    this.itemsDropped1 = []
    this.dataSubscription.add(
      this.services.currentMessageAnomaly.subscribe((obj) => {
        if (obj && obj.chartType) {
          this.chartTypeSelected = obj.chartType;
          this.chartControls = obj.chartControls;
          this.createChartControlForm(this.chartTypeSelected);
          this.itemsDropped = obj.itemsDropped;
          for (let i = 0; i < this.itemsDropped.length; i++) {
            this.itemsDropped1.push({ value: this.itemsDropped[i], viewValue: this.itemsDropped[i].label })
            this.setDroppedFormValue(i);
          }
          this.innerHtml = obj.innerHtml;
          this.filterBtnLabel = obj.filterBtnLabel;
          this.attributeFilterVariable = obj.attributeFilterVariable;
          this.filtersSelected = obj.filtersSelected;
          this.filterColumnSelected = obj.filterColumnSelected;
          this.filterAttributeType = obj.filterAttributeType;
          this.lblShapeVariation = obj.lblShapeVariation;
          this.lblSizeVariation = obj.lblSizeVariation;
          this.lblColorVariation = obj.lblColorVariation;
          this.shapeLengends = obj.shapeLengends;
          this.sizeLengends = obj.sizeLengends;
          this.colorLengends = obj.colorLengends;
          this.urlSafe = obj.urlSafe;
          this.chartParams = obj.chartParams;
          this.filterResponse = obj.filterResponse;
          this.filterResponseBackup = obj.filterResponseBackup;
          this.allAttributes = obj.allAttributes;
          this.allSelection = obj.allSelection;
          this.chartTypes = obj.chartTypes;
          this.lowerRangeValue = obj.lowerRangeValue;
          this.upperRangeValue = obj.upperRangeValue;
          this.smartFilterValue = obj.smartFilterValue;
          this.smartFilterOpr = obj.smartFilterOpr;
          this.storyContentObj = obj.storyData;
          this.services.updateStoryBoard(this.storyContentObj);
        }
      })
    );
  }

  generateAnomalyObject(): any {
    return {
      chartType: this.chartTypeSelected,
      chartControls: this.chartControls,
      itemsDropped: this.itemsDropped,
      innerHtml: this.innerHtml,
      filterBtnLabel: this.filterBtnLabel,
      attributeFilterVariable: this.attributeFilterVariable,
      filtersSelected: this.filtersSelected,
      filterColumnSelected: this.filterColumnSelected,
      filterAttributeType: this.filterAttributeType,
      urlSafe: this.urlSafe,
      lblShapeVariation: this.lblShapeVariation,
      lblSizeVariation: this.lblSizeVariation,
      lblColorVariation: this.lblColorVariation,
      shapeLengends: this.shapeLengends,
      sizeLengends: this.sizeLengends,
      colorLengends: this.colorLengends,
      chartParams: this.chartParams,
      filterResponse: this.filterResponse,
      filterResponseBackup: this.filterResponseBackup,
      allAttributes: this.allAttributes,
      allSelection: this.allSelection,
      chartTypes: this.chartTypes,
      lowerRangeValue: this.lowerRangeValue,
      upperRangeValue: this.upperRangeValue,
      smartFilterValue: this.smartFilterValue,
      smartFilterOpr: this.smartFilterOpr,
      storyData: this.storyContentObj,
    };
  }

  /**
   * method to get charts list from service
   */
  getChartList(): void {
    this.dataSubscription.add(
      this.services.getAllMultivariateChartTypes().subscribe((allCharts) => {
        this.chartTypes = allCharts.multiCharts;
        this.chartTypes.forEach((chart) => {
          this.chartTypes1.push({ value: chart, viewValue: chart.chart });
        })
        this.cdRef.detectChanges();
      })
    );
  }
  
  getNormalisedValue(): void { 
     this.normalizeOptions.forEach((name) => {
      this.normalizeOptions1.push({ value: name, viewValue: name.name });
     });
    
  }

  getLinkageValue(): void { 
    this.LinkageOptions.forEach((name) => {
     this.LinkageOptions1.push({ value: name, viewValue: name.name });
    });
   
 }
  

  getAllLegendsCharts() {
    this.chartsWithLegends = this.chartTypes
      .filter((chartObj) => {
        return chartObj.legendsRequired === true;
      })
      .map((filteredList) => filteredList.chart);
  }

  createDynamicInputForm(): void {
    this.dynamicInputDataGroup = this.formBuilder.group({
      dynamicValues: this.formBuilder.array([]),
    });
  }

  createChartControlForm(chartControls): void {
    const items = this.dynamicInputDataGroup.get('dynamicValues') as UntypedFormArray;
    chartControls.controls.forEach((singleControl) => {
      items.push(this.getCurrentFormControl(singleControl, chartControls));
    });
  }

  getCurrentFormControl(control, chartControls): UntypedFormGroup {
    return this.formBuilder.group({
      chartType: chartControls.chart,
      inputControl: control.controltype,
      inputValue: [null, Validators.required],
      type: control.controltype,
      label: control.label,
      id: control.id,
      axisNumber: chartControls.axisNumber,
      value: control.value,
    });
  }

  getFormArray(): AbstractControl[] {
    const dynamicArray = this.dynamicInputDataGroup.get(
      'dynamicValues'
    ) as UntypedFormArray;
    return dynamicArray.controls;
  }

  attributeDragEnd(attributeName, type: string) {
    this.draggedAttribute = attributeName;
    this.currentAttributeType = type;
    this.attributeFilterVariable = this.draggedAttribute.attributeName;
  }


  attributeDrop() {
    this.allColumnsSelected.push(this.draggedAttribute);
    this.services.updateSaveToStory(true);
    const newObj = {
      [this.draggedAttribute.attributeName]: this.draggedAttribute.attributeDataType,
    };
    this.columnsWithType = Object.assign(newObj, this.columnsWithType);
    this.frameWidth = '100%';
    this.frameHeight = 'calc(100% - 45px)';
    if (this.chartControls) {
      this.createChartUrl();
    }
    this.cdRef.detectChanges();
  }

  // for pie and doughnut to disable quantitative attributes
  disableAttibutes(type: string): boolean {
    let disableList = false;
    if (this.chartTypeSelected) {
      if (
        SELECTCATAGORICALDATA.some(
          (chart) => chart === this.chartTypeSelected.chartName
        ) &&
        type !== 'Categorical Attributes'
      ) {
        disableList = true;
        return disableList;
      } else {
        disableList = false;
        return disableList;
      }
    }
  }
heapmap:boolean=false;
  chartSelection(selectionEvent): void {
    this.normalizeValue = { name: 'TRUE', code: 'True' };
    this.linkageValue = { name: 'Ward', code: 'ward' };
    this.thresholdValue = 0.5;
    this.inCorrectThreshold = false;
    if (this.allColumnsSelected.length > 0) {
      this.chartControls = selectionEvent;
      this.createChartUrl();
    }
    
  }

  createChartUrl() {
    //if multiple validations are required, implement form validation
    if (this.inCorrectThreshold === false && this.chartControls) {
      const multiChartParams: MultiVariateParams = {
        //object_id:1,
        columns: this.columnsWithType,
        filter: this.getFilterParameters(),
        threshold: this.thresholdValue ? Number(this.thresholdValue) : 'None',
        normalize: this.normalizeValue ? this.normalizeValue.code : 'None',
        linkage: this.linkageValue ? this.linkageValue.code : 'ward',
        chart_type: this.chartControls.chartName,
        // chart_type: this.chartControls ? this.chartControls.chartName : 'None',
        screen: 'None',
        validation_response: 'No',
        //user_id: 1
      };
      this.displaySpinner = true;
      this.services.updateSaveToStory(true);
      this.sanitizedHtml=this.services.createMultivariateChartURL(multiChartParams.chart_type,multiChartParams,JSON.stringify(this.quickstatdata),this.multivariateUrl,this.nameid);

      //this.analyticsDataService.updateSaveToStory(true);
      // this.chartUrl = this.analyticsService.createMultiVariateChartURL(
      //   multiChartParams,
      //   this.chartControls.chartName
      // );
    } else if (this.inCorrectThreshold === true) {
      console.log('Please provide valid inputs');
    }
    if (this.listboxMain) {
      this.listboxMain['value'] = null;
    }
  }

  getFilterParameters(): { [key: string]: Object } | string {
    let filters = null;
    if (this.filtersSelected.length > 0) {
      filters = {
        [this.filterColumnSelected]: this.filtersSelected.map((item) => {
          return item.label;
        }),
      };
    } else {
      if (this.filterResponse.length > 0) {
        if (this.filterResponse.length === this.filterResponseBackup.length) {
          filters = 'None';
        } else {
          filters = {
            [this.filterColumnSelected]: this.filterResponse.map((item) => {
              return item.label;
            }),
          };
        }
      } else filters = 'None';
    }

    return filters;
  }





  removechip(size){
    if(size==='colour'){
    this.colorLengends=[];
    this.getSelectedChartPlot();

    }
    else if(size==='shape'){
      this.shapeLengends=[];
      this.getSelectedChartPlot();
    }
    else if(size==='size'){
      this.sizeLengends=[];
      this.getSelectedChartPlot();
    }

  }
 
  clearAllControls() {
    this.urlSafe = 'about:blank';
    this.sanitizedHtml = 'about:blank';
    this.itemsDropped = [];
    this.itemsDropped1=[];
    this.innerHtml = undefined;
    this.allColumnsSelected = [];
    this.columnsWithType = null;
    // this.removeExistingControls();
    // this.createChartControlForm(this.chartTypeSelected);

    this.filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
    this.attributeFilterVariable = null;
    this.filtersSelected = [];
    this.filterResponse = [];
    this.resetAllAstheticAttributes();
    this.lowerRangeValue = undefined;
    this.upperRangeValue = undefined;
    this.smartFilterValue = undefined;
    this.smartFilterOpr = undefined;
    this.normalizeValue = null;
    this.linkageValue = null;
    this.thresholdValue = null;
    this.inCorrectThreshold = false;
    this.displaySpinner=false;
    // this.period = null;
    // this.word_frequecy = null;
  }

  /**
   * method to remove existing form array value
   * otherwise will retain those controls and displays accumulated
   * controls in view
   */
  removeExistingControls(): void {
    const dynamicArray = this.dynamicInputDataGroup.get(
      'dynamicValues'
    ) as UntypedFormArray;
    while (dynamicArray.length !== 0) {
      dynamicArray.removeAt(0);
    }
  }

  dropped: boolean = true;

  /**method called when items dropped for chart axis
   * @param  {number} controlIndex
   */
  // attributeDrop(controlIndex: number, axisType: string): void {
  //   this.dropped = false;
  //   if (this.draggedAttribute !== undefined) {
  //     this.itemsDropped[controlIndex] = [];
  //     this.itemsDropped1[controlIndex] = [];
  //     if (
  //       !NOAGGREGATECHARTS.find(
  //         (name) => name === this.chartTypeSelected.chartName
  //       )
  //     ) {
  //       if (axisType === 'Y Axis') {
  //         if (this.currentAttributeType === 'Quantitative Attributes') {
  //           // for scatter chart
  //           if (this.chartTypeSelected.chartName === 'scatter_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               SCATTER_AGGREGATES_QUAN_YAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'horizontal_bar') {
  //             // for bar chart
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_CAT_YAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'heatmap') {
  //             // Quantative attributes cannot be selected for Heatmap chart
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_QUAN_XAXIS
  //             );
  //             // return;
  //           } else if (this.chartTypeSelected.chartName === 'barstack') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_QUAN_XAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'pareto') {
  //             // for bar chart
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //           } else {
  //             // quantative for other charts
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           }
  //         } else if (this.currentAttributeType === 'Categorical Attributes') {
  //           if (this.chartTypeSelected.chartName === 'line_chart') {
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_CAT_XAXIS
  //             );
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else if (this.chartTypeSelected.chartName === 'heatmap') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else if (
  //             this.chartTypeSelected.chartName === 'vertical_bar' ||
  //             this.chartTypeSelected.chartName === 'columnstack'
  //           ) {
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_CAT_YAXIS
  //             );
  //           }
  //         } else {
  //           //temporal attributes
  //           this.getAttributeWithoutAggregate(controlIndex);
  //           this.getAllAttributesWithAggregate(
  //             controlIndex,
  //             AGGREGATES_TEM_YAXIS
  //           );
  //         }
  //       } else if (axisType === 'X Axis') {
  //         //x axis
  //         if (this.currentAttributeType === 'Quantitative Attributes') {
  //           if (this.chartTypeSelected.chartName === 'scatter_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_QUAN_XAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'line_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else if (
  //             SELECTCATAGORICALDATA.find(
  //               (name) => name === this.chartTypeSelected.chartName
  //             )
  //           ) {
  //             this.getAllAttributesWithAggregate(controlIndex, PIE_CAT_XAXIS);
  //           } else if (this.chartTypeSelected.chartName === 'horizontal_bar') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_QUAN_XAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'heatmap') {
  //             // Quantative attributes cannot be selected for Heatmap chart
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_QUAN_XAXIS
  //             );
  //             // return;
  //           } else if (this.chartTypeSelected.chartName === 'barstack') {
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else if (this.chartTypeSelected.chartName === 'bubble_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //             // return;
  //           } else {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_QUAN_XAXIS
  //             );
  //           }
  //         } else if (this.currentAttributeType === 'Categorical Attributes') {
  //           if (
  //             SELECTCATAGORICALDATA.find(
  //               (name) => name === this.chartTypeSelected.chartName
  //             )
  //           ) {
  //             this.getAllAttributesWithAggregate(controlIndex, PIE_CAT_XAXIS);
  //           } else if (this.chartTypeSelected.chartName === 'scatter_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               AGGREGATES_CAT_XAXIS
  //             );
  //           } else if (
  //             this.chartTypeSelected.chartName === 'vertical_bar' ||
  //             this.chartTypeSelected.chartName === 'columnstack'
  //           ) {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_QUAN_XAXIS
  //             );
  //           } else if (this.chartTypeSelected.chartName === 'bubble_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //             // return;
  //           } else if (this.chartTypeSelected.chartName === 'heatmap') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else if (this.chartTypeSelected.chartName === 'line_chart') {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //           } else {
  //             this.getAttributeWithoutAggregate(controlIndex);
  //             this.getAllAttributesWithAggregate(
  //               controlIndex,
  //               OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //             );
  //           }
  //         } else {
  //           //temporal attributes
  //           this.getAttributeWithoutAggregate(controlIndex);
  //         }
  //       } else if (axisType === 'Value') {
  //         if (this.currentAttributeType === 'Quantitative Attributes') {
  //           this.getAllAttributesWithAggregate(
  //             controlIndex,
  //             OTHERCHARTS_AGGREGATES_QUAN_YAXIS
  //           );
  //         }
  //       }
  //       // more than 3 axis needs to be handled
  //     } else {
  //       this.getAttributeWithoutAggregate(controlIndex);
  //     }

  //     this.setDroppedFormValue(controlIndex);
  //   }
  //   this.getSelectedChartPlot();
  // }

  getAttributeWithoutAggregate(controlIndex: number) {
    this.itemsDropped[controlIndex].push({
      label: this.draggedAttribute.attributeName,
      value: {
        attributeName: this.draggedAttribute.attributeName,
        id: 1,
        attributeAxisValue: this.draggedAttribute.attributeName,
        attributeAggregrate: 'None',
        attributeDataType: this.draggedAttribute.attributeDataType,
      },
    });
    this.itemsDropped1[controlIndex].push({
      viewValue: this.draggedAttribute.attributeName,
      value: {
        attributeName: this.draggedAttribute.attributeName,
        id: 1,
        attributeAxisValue: this.draggedAttribute.attributeName,
        attributeAggregrate: 'None',
        attributeDataType: this.draggedAttribute.attributeDataType,
      },
    });
  }

  getAllAttributesWithAggregate(controlIndex: number, constantArrayValue) {
    constantArrayValue.forEach((option, index) => {
      const convertToUppercase = option.toUpperCase();
      const mainOption = this.draggedAttribute.attributeName;
      this.itemsDropped[controlIndex].push({
        label: mainOption + ' ' + convertToUppercase,
        value: {
          attributeName: mainOption + ' ' + convertToUppercase,
          id: index + 1,
          attributeAxisValue: mainOption,
          attributeAggregrate: option,
          attributeDataType: this.draggedAttribute.attributeDataType,
        },
      });

      this.itemsDropped1[controlIndex].push({
        viewValue: mainOption + ' ' + convertToUppercase,
        value: {
          attributeName: mainOption + ' ' + convertToUppercase,
          id: index + 1,
          attributeAxisValue: mainOption,
          attributeAggregrate: option,
          attributeDataType: this.draggedAttribute.attributeDataType,
        },
      });
    });


  }

  selectedVal: any = null;

  /**
   * set formarray value on attribute drag and drop
   * @param  {number} controlIndex
   */
  setDroppedFormValue(controlIndex: number): void {
    const dynamicArray = this.dynamicInputDataGroup.get(
      'dynamicValues'
    ) as UntypedFormArray;

    dynamicArray.controls[controlIndex].patchValue(
      { inputValue: this.itemsDropped1[controlIndex][0].value },
      { emitEvent: false }
    );
    this.selectedVal = this.itemsDropped1[controlIndex][0]
    dynamicArray.updateValueAndValidity();
  }

  colorAttrdrop(): void {
    this.lblColorVariation = DROPLENGENDSLABEL.color;
    this.colorLengends = [this.draggedAttribute.attributeName];
    this.getSelectedChartPlot();
  }

  shapeAttrdrop(): void {
    this.lblShapeVariation = DROPLENGENDSLABEL.shape;
    this.shapeLengends = [this.draggedAttribute.attributeName];
    this.getSelectedChartPlot();
  }

  sizeAttrdrop(): void {
    this.lblSizeVariation = DROPLENGENDSLABEL.size;
    this.sizeLengends = [this.draggedAttribute.attributeName];
    this.getSelectedChartPlot();
  }

  resetAllAstheticAttributes(): void {
    this.lblShapeVariation = DROPLENGENDSLABEL.shape;
    this.lblSizeVariation = DROPLENGENDSLABEL.size;
    this.lblColorVariation = DROPLENGENDSLABEL.color;
    this.shapeLengends = [];
    this.sizeLengends = [];
    this.colorLengends = [];
  }
ll(){
 
  this.hide=true;
  console.log("on click",this.hide);
  
}

  filterSelectedAttribute(): void {
    this.hide=true;
    console.log("on drop",this.hide);
    this.clearPreviousFilters();
    this.getSelectedAttributeFilterList();
    this.filtersSelected = [];
    // this.filterAttributeType = QUANTDATATYPES.includes(
    //   this.draggedAttribute.attributeDataType
    // )
    //   ? 'Quantitative'
    //   : undefined;
    if (QUANTDATATYPES.includes(this.draggedAttribute.attributeDataType)) {
      this.filterAttributeType = 'Quantitative';
    } else if (CATAGORICALDATATYPES.includes(this.draggedAttribute.attributeDataType)) {
      this.filterAttributeType = 'Categorical';
    }
    this.filterColumnSelected = this.draggedAttribute.attributeName;
    this.attributeFilterVariable = this.draggedAttribute.attributeName;
    this.filterBtnLabel = 'Filter - ' + this.draggedAttribute.attributeName;
  }

  clearPreviousFilters() {
    this.upperRangeValue = undefined;
    this.lowerRangeValue = undefined;
    this.smartFilterOpr = undefined;
    this.smartFilterValue = undefined;
  }
  searchTerm: string = '';
  filterResults(): void {
    if (this.searchTerm) {
      this.filterResponse = this.filterResponseBackup.filter(item => item.label.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } else {
      this.filterResponse = [...this.filterResponseBackup];
    }
  }

  onselecting(item:any){
    console.log("on select",item);
    const index = this.filtersSelected.indexOf(item);
  if(this.filtersSelected.length==0){
    this.filtersSelected.push(item);
  }else{
    this.filtersSelected=[];
    this.filtersSelected.push(item);
  
  }
  }
  getSelectedAttributeFilterList(): void {
    const params = {
     
      column: this.draggedAttribute.attributeName,
      dataset_name: this.nameid,
    };
    this.dataSubscription.add(
      this.services.getfilternew(params,this.paramdata).subscribe((filterRes) => {
        if (filterRes.status_message === 'SUCCESS') {
          this.filterResponse = filterRes.response.map((item) => {
            return { label: item };
          });
          this.filterResponse.sort((a, b) => a.label - b.label);
          this.filterResponseBackup = filterRes.response.map((item) => {
            return { label: item };
          });
          this.filterResponseBackup.sort((a, b) => a.label - b.label);
        } else {
          this.filterResponse = [];
          this.filterResponseBackup = [];
          this.showError(filterRes.response);
        }
      })
    );
  }

  getFilterResult(component: OverlayPanel): void {
    // component.hide();
    this.hide=false;
    console.log(this.filtersSelected);
    // this.getSelectedChartPlot();
    this.createChartUrl();
    this.filtersSelected=[];
  }

  /**
   * method to close filter overlay
   * @param  {OverlayPanel} component
   */
  hide=false;
  cancelOverLay(component: OverlayPanel) {
   this.hide=false;
   console.log("on cancel",this.hide);
    // component.hide();
    const filterVal1 = this.filtersSelected;
    this.filtersSelected = [];
    const filterVal2 =
      this.filterResponse &&
        this.filterResponse.length === this.filterResponseBackup.length
        ? []
        : this.filterResponse;
    this.filterResponse = [];
    if (filterVal1.length > 0 || filterVal2.length > 0) {
      this.getSelectedChartPlot();
    }
    this.filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
    this.attributeFilterVariable = null;
  }

  

  /**method to check whether selected chart type needs to display legends
   * TO DO: get false to display Legends from json response
   * @returns boolean
   */
  displayLegends(): boolean {
    return this.chartsWithLegends.find(
      (chartType) => chartType === this.chartTypeSelected.chart
    ) !== undefined
      ? true
      : false;
  }
  availableAttrLegend(legend: string): boolean {
    return this.chartTypeSelected.legendName.find(
      (eachlegend) => eachlegend === legend
    );
  }
  kkk:any;
  getSelectedChartPlot(): void {
    this.displaySpinner = true;
    this.getChartRequestParameters();

    this.sanitizedHtml=this.services.createChartURL(this.chartTypeSelected.chartName,this.chartParams,JSON.stringify(this.quickstatdata),this.paramdata,this.nameid);
   

  }

  getChartImageData(): void {
    const imageParams = this.chartParams;
    imageParams.screen = 'openexploration_screenshot';
    this.services.updateSaveToStory(true);
    this.dataSubscription.add(
      this.services.getChartImage(this.chartParams).subscribe(
        (result) => {
          if (result.status_message === 'SUCCESS') {
            const imagePath = [result.response.image_path];
            this.storyContentObj = {
              data: this.getImageDataURI(result.response),
              attributes: 'None',
              screenType: 'None',
              imagePath: imagePath,
            };
            this.services.updateStoryBoard(this.storyContentObj);
            this.services.updateSaveToStory(false);
          } else {
            // this.showError('Unable to get chart Image. ' + result.response);
          }
        },
        (error) => {
          if (error) {
            // this.showError('Unable to get chart Image. ' + error);
          }
        }
      )
    );
  }

  getImageDataURI(response): string {
    const imagePrefix = 'data:image/png;base64,';
    let imageData = response.image_data;
    imageData = imageData ? imageData.replace(/^"|"$/g, '') : imageData;
    imageData = imagePrefix + imageData;
    return imageData;
  }

  getChartRequestParameters(): void {
    let filters;
    let xAxis = 'None';
    let yAxis = 'None';
    let xType = 'None';
    let yType = 'None';
    let xAgg = 'None';
    let yAgg = 'None';
    let value = 'None';
    let valueAgg = 'None';
    const dynamicArray = this.dynamicInputDataGroup.get(
      'dynamicValues'
    ) as UntypedFormArray;
    dynamicArray.controls.forEach((fmGroup) => {
      if (fmGroup.value.inputValue) {
        if (fmGroup.value.label === 'X Axis') {
          if (fmGroup.value.inputValue.value) {
            xAxis = fmGroup.value.inputValue.value.attributeAxisValue || 'None';
          } else {
            xAxis = fmGroup.value.inputValue.attributeAxisValue || 'None';
          }
          if (fmGroup.value.inputValue.value) {
            xType = fmGroup.value.inputValue.value.attributeDataType || 'None';
          } else {
            xType = fmGroup.value.inputValue.attributeDataType || 'None';
          }
          if (fmGroup.value.inputValue.value) {
            xAgg = fmGroup.value.inputValue.value.attributeAggregrate || 'None';
          } else {
            xAgg = fmGroup.value.inputValue.attributeAggregrate || 'None';
          }
        }
        if (fmGroup.value.label === 'Y Axis') {
          if (fmGroup.value.inputValue.value) {
            yAxis = fmGroup.value.inputValue.value.attributeAxisValue || 'None';
          } else {
            yAxis = fmGroup.value.inputValue.attributeAxisValue || 'None';
          }
          if (fmGroup.value.inputValue.value) {
            yType = fmGroup.value.inputValue.value.attributeDataType || 'None';
          } else {
            yType = fmGroup.value.inputValue.attributeDataType || 'None';
          }
          if (fmGroup.value.inputValue.value) {
            yAgg = fmGroup.value.inputValue.value.attributeAggregrate || 'None';
          } else {
            yAgg = fmGroup.value.inputValue.attributeAggregrate || 'None';
          }
        }
        if (fmGroup.value.label === 'Value') {
          if (fmGroup.value.inputValue.value) {
            value = fmGroup.value.inputValue.value.attributeAxisValue || 'None';
            valueAgg =
              fmGroup.value.inputValue.value.attributeAggregrate || 'None';
          } else {
            value = fmGroup.value.inputValue.attributeAxisValue || 'None';
            valueAgg = fmGroup.value.inputValue.attributeAggregrate || 'None';
          }
        }
      }
    });

    if (this.filtersSelected.length > 0) {
      filters = {
        [this.filterColumnSelected]: this.filtersSelected.map((item) => {
          return item.label;
        }),
      };
    } else {
      if (this.filterResponse.length > 0) {
        if (this.filterResponse.length === this.filterResponseBackup.length) {
          filters = 'None';
        } else {
          filters = {
            [this.filterColumnSelected]: this.filterResponse.map((item) => {
              return item.label;
            }),
          };
        }
      } else filters = 'None';
    }

    this.chartParams = {
  
      columns: {
        x: xAxis,
        y: yAxis,
      },
      columns_type: {
        x: xType,
        y: yType,
      },
      value: value,
      chart_type: this.chartTypeSelected.chartName,
      aggregate: {
        x: xAgg,
        y: yAgg,
      },
      legends: {
        color: this.colorLengends.length > 0 ? this.colorLengends[0] : 'None',
        size: this.sizeLengends.length > 0 ? this.sizeLengends[0] : 'None',
        shape: this.shapeLengends.length > 0 ? this.shapeLengends[0] : 'None',
      },
      chart_layout: this.chartLayout ? this.chartLayout : 'None',
      period: this.period ? this.period : null,
      word_frequecy: this.word_frequecy ? this.word_frequecy : null,
      valueaggregate: valueAgg,
      filter: filters,
      screen: 'None',
 
    };
  }

  showError(message): void {
    this.services.message(message, 'error');

  }

  periodValueCheck(event, data) {
    if (data.label === "Period") {
      this.period = event.value;
    } else if (data.label === "Word Frequency") {
      this.word_frequecy = event.value;
    }
    this.getSelectedChartPlot();
  }

  // frameLoaded() {
  //   this.displaySpinner = false;
  //   if (this.urlSafe !== 'about:blank') {
  //     this.getChartImageData();
  //   }
  // }
  
  frameLoaded(): void {
    const numbers = timer(3000);
    this.frameTimerSubscription = numbers.subscribe((x) => {
      if (this.urlSafe !== 'about:blank') {
        this.saveStoryBoard();
      }
      this.frameTimerSubscription.unsubscribe();
      this.displaySpinner = false;
      this.cdRef.detectChanges();
    });
  }


  saveStoryBoard() {
    const multiChartParams: MultiVariateParams = {
      //object_id: 1,
      columns: this.columnsWithType,
      filter: this.getFilterParameters(),
      threshold: this.thresholdValue ? Number(this.thresholdValue) : 'None',
      normalize: this.normalizeValue ? this.normalizeValue.code : 'None',
      linkage: this.linkageValue ? this.linkageValue.code : 'ward',
      chart_type: this.chartControls.chartName,
      screen: 'multivariate_screenshot',
      validation_response: 'Yes',
      //user_id: 1
      
    };
    this.dataSubscription.add(
      this.services.getChartImage(multiChartParams).subscribe(
        (chartImageRes) => {
          if (chartImageRes.status_message === 'SUCCESS') {
            const imagePath = [chartImageRes.response.image_path];
            this.storyContentObj = {
              data: this.getImageDataURI(chartImageRes.response),
              attributes: 'None',
              screenType: 'None',
              imagePath: imagePath,
            };
            this.services.updateStoryBoard(
              this.storyContentObj
            );
            this.services.updateSaveToStory(false);
          } else {
            this.showError(
              'Unable to get chart screenshot. ' + chartImageRes.response
            );
          }
        },
        (error) => {
          this.showError(
            'There is an issue in service to get chart screenshot'
          );
        }
      )
    );
  }




  radioValue:any;
  smartFilter(event): void {
    this.smartFilterOpr = event.value;
    if (this.smartFilterOpr === '>') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label > this.smartFilterValue
      );
    } else if (this.smartFilterOpr === '>=') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label >= this.smartFilterValue
      );
    }
    else if (this.smartFilterOpr === 'none') {
      this.filterResponse = this.filterResponseBackup
    }  
    else if (this.smartFilterOpr === '<') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label < this.smartFilterValue
      );
    } else if (this.smartFilterOpr === '<=') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label <= this.smartFilterValue
      );
    }
  }

  rangeFilter(): void {
    // if (this.filterResponse.length !== this.filterResponseBackup.length) {
    //   this.filterResponse = this.filterResponseBackup;
    // }
    this.filterResponse = this.filterResponseBackup.filter(
      (item) =>
        item['label'] >= this.lowerRangeValue &&
        item['label'] <= this.upperRangeValue
    );
  }

  resetRangeFilter(event): void {
    console.log(event)
    this.smartFilterValue = event;
    this.upperRangeValue = undefined;
    this.lowerRangeValue = undefined;
    this.filterResponse = this.filterResponseBackup;
  }


  resetValueFilter(event): void {
  
    this.lowerRangeValue = event;
    this.smartFilterOpr = undefined;
    this.smartFilterValue = undefined;
    this.filterResponse = this.filterResponseBackup;
    console.log(this.smartFilterOpr);
  }

  changesOccur(event) {
    this.upperRangeValue = event;
  }

  //added
  getMinimizeMaximizeSubscription() {
    this.services.updatePivotResize(true);
    this.services.currentResizePivot.subscribe((toggle) => {
      this.toggleMaxBtn = toggle;
    });
  }

  changeToCategoricalType(attribute): void {
    // if (!CATAGORICALDATATYPES.includes(attribute.attributeDataType)) {
    //   const transformObj: TransformObject = this.createTransformObject(
    //     this.draggedAttribute.attributeName
    //   );
    //   this.dataSubscription.add(
    //     this.services
    //       .executeTransformJobForDatatypeConvert(transformObj)
    //       .subscribe((response) => {
    //         if (response.status_message === 'SUCCESS') {
    //           const recipeObj: RecipeObject = new RecipeObject();
    //           recipeObj.object_id = transformObj.object_id;
    //           this.getAttributeList(recipeObj);
    //         } else {
    //           this.showError(response.response);
    //         }
    //       })
    //   );
    // }
  }

  createTransformObject(attributeName): TransformObject {
    const transformObj: TransformObject = new TransformObject();
    transformObj.object_id = this.objectID;
    transformObj.function_name = ['column_data_type_conversion'];
    transformObj.args = [
      { column_name: [attributeName], column_dtype: 'category' },
    ];
    transformObj.mode = 'individual_save';
    return transformObj;
  }
  paramdata:any;
  getparamdta(){
    this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      console.log("asfasdfdsfasdfadsfasf",resp);
     this.paramdata=resp;
   });
  }
  card:any;
bucketname:any;
endpoint:any;
access_key:any;
secret_key:any;
object_key:any;
storage:any;
region:any;
data:any;

  getAttributeList(): void {
    const quantitative = [];
    const categorical = [];
    const temporal = [];
    this.allAttributes = [];
    this.dataSubscription.add(
      this.services.getDatasetByNameAndOrg(this.nameid).subscribe((res) => {
        console.log(res);
        this.card = res;
        let kk=JSON.parse(res.attributes);
        this.bucketname=kk.bucket;
        this.object_key=kk.path+'/'+kk.object;
        let pp=JSON.parse(res.datasource.connectionDetails);
        this.secret_key=pp.secretKey;
        this.access_key=pp.accessKey;
        this.region=pp.Region;
        this.endpoint=pp.url;
        this.storage=res.datasource.category;
        let body={
          "bucket": this.bucketname,
          "endpoint": this.endpoint,
          "access_key": this.access_key,
          "secret_key": this.secret_key,
          "object_key": this.object_key ,
          "storage" :  "s3",
          "region" :  this.region
      }
      // this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      //      console.log("asfasdfdsfasdfadsfasf",resp);
      //     this.paramdata=resp;
      //   });
    
      const queryParamdata = {
        dataset_name : this.nameid,
        aip_login : 'True'
      }
        this.services.getAllAttributeTypes2(this.paramdata,queryParamdata).subscribe((attr)=>{
          console.log(attr.body.response);
          this.data=attr.body.response;
        console.log("value of data2 is dasdasdas",this.data);
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
        } 
        
        else {
          this.showError(attr.response);
        }
        
      
  
    
    
          
        });
    
    })
    )
  }

  onTextEnter(event: any): void {
    const filterValue = event.target.value;
    if (filterValue.length === 0) {
      this.filterResponse = this.filterResponseBackup;
    } else {
      this.filterResponse = this.filterResponseBackup.filter((obj) => {
        return obj.label.toUpperCase().includes(filterValue.toUpperCase());
      });
    }
  }

  // updateResize(){
  //   this.services.updatePivotResize.subscribe((flag)=>{
  //   })
  // (this.toggleMaxBtn);
  // }

  pp() {
    this.allAttributes =
      [
        {
        attributeType: 'Quantitative Attributes', attributes: [{ attributeName: 'diagnosis', attributeID: 0, attributeDataType: 'int64' },

        { attributeName: 'radius_mean', attributeID: 1, attributeDataType: 'float64' },

        { attributeName: 'texture_mean', attributeID: 2, attributeDataType: 'float64' },

        { attributeName: 'perimeter_mean', attributeID: 3, attributeDataType: 'float64' },

        { attributeName: 'area_mean', attributeID: 4, attributeDataType: 'float64' },
        { attributeName: 'smoothness_mean', attributeID: 5, attributeDataType: 'float64' },
        { attributeName: 'compactness_mean', attributeID: 6, attributeDataType: 'float64' },

        { attributeName: 'concavity_mean', attributeID: 7, attributeDataType: 'float64' },
        { attributeName: 'concave points_mean', attributeID: 8, attributeDataType: 'float64' },

        { attributeName: 'symmetry_mean', attributeID: 9, attributeDataType: 'float64' },
        { attributeName: 'fractal_dimension_mean', attributeID: 10, attributeDataType: 'float64' },
        { attributeName: 'radius_se', attributeID: 11, attributeDataType: 'float64' },
        { attributeName: 'texture_se', attributeID: 12, attributeDataType: 'float64' },

        { attributeName: 'perimeter_se', attributeID: 13, attributeDataType: 'float64' },
        { attributeName: 'area_se', attributeID: 14, attributeDataType: 'float64' },

        { attributeName: 'smoothness_se', attributeID: 15, attributeDataType: 'float64' },

        { attributeName: 'compactness_se', attributeID: 16, attributeDataType: 'float64' },

        { attributeName: 'concavity_se', attributeID: 17, attributeDataType: 'float64' },

        { attributeName: 'concave points_se', attributeID: 18, attributeDataType: 'float64' },
        { attributeName: 'symmetry_se', attributeID: 19, attributeDataType: 'float64' },

        { attributeName: 'fractal_dimension_se', attributeID: 20, attributeDataType: 'float64' },
        { attributeName: 'radius_worst', attributeID: 21, attributeDataType: 'float64' },

        { attributeName: 'texture_worst', attributeID: 22, attributeDataType: 'float64' },

        { attributeName: 'perimeter_worst', attributeID: 23, attributeDataType: 'float64' },

        { attributeName: 'area_worst', attributeID: 24, attributeDataType: 'float64' },

        { attributeName: 'smoothness_worst', attributeID: 25, attributeDataType: 'float64' },

        { attributeName: 'compactness_worst', attributeID: 26, attributeDataType: 'float64' },

        { attributeName: 'concavity_worst', attributeID: 27, attributeDataType: 'float64' },

        { attributeName: 'concave points_worst', attributeID: 28, attributeDataType: 'float64' },

        { attributeName: 'symmetry_worst', attributeID: 29, attributeDataType: 'float64' },{ attributeName: 'fractal_dimension_worst', attributeID: 30, attributeDataType: 'float64' }], attributeID: 1},
      { attributeType: 'Categorical Attributes', attributes: [], attributeID: 2 },
      { attributeType: 'Temporal Attributes', attributes: [], attributeID: 3 }
    ]
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '', margin: '' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  refresh(){
    this.clearAllControls();
    console.log(this.allColumnsSelected.length);
  }
  getMultivariateURL(){
    this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      console.log("multivariateUrl",resp);
     this.multivariateUrl=resp;
   });
  }

  clearPivot(){
    this.services.updatePivotReset(false);
    
  }
}

