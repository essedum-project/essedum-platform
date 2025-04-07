import { filter } from 'rxjs/operators';
// import { filter } from 'rxjs/operators';
// import { filter } from 'rxjs/operators';

import { ChangeDetectorRef, Input } from '@angular/core';
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
  FormControl,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subscription } from 'rxjs';

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
} from '../staticfile/constant';
import {
  AnalyticsCategory,
  ChartRequestParameter,
  TransformObject,
  RecipeObject,
  StoryBoardParameter,
} from '../staticfile/models';
import { Services } from '../../services/service';
import { LedsModalService, MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { services, services } from '../../../../../shared/services';
@Component({
  selector: 'app-open-exploration',
  templateUrl: './open-exploration.component.html',
  styleUrls: ['./open-exploration.component.scss']
})

export class OpenExplorationComponent implements OnInit, OnDestroy, OnChanges {
  /**TO DO : all properties should be type casted */
  allAttributes; //: AnalyticsCategory;
  toggle: boolean = false;
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
  compareValue = ['>', '<', '>=', '<='];
  data: any;
  storyName: any;
  name: any;
  chartDetails: any;
  isNewStory: boolean = false;
  selectedChartType: string;
  isChartSelected: boolean = true;
  org: any;
  sName:String;
  storyDescription:String;
  selectedStoryName:any;
  savedStories = [];
  selectedXAxisValue:any;
  dropped: boolean = true;
  selectedStory:any;
  onRefresh:boolean=true;
  alias: any;
  nameid: any;
  showInputField:boolean=false;
 // showCreateButton:boolean=false;
 // showUpdateButton:boolean=false;
 // enableEditIcon:boolean=true;
  //enableDescription:boolean=false;
  enableSaveButton:boolean=true;
  actionPerfomred:any;
  xAxisValue;
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
  storyType: string = 'chart';
  storySelected:any;
  showStoryName:boolean=false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private services: Services,
    private sanitizer: DomSanitizer,
    private modalService: LedsModalService,
    private cd: ChangeDetectorRef,
    private service: Services,
    private matSnackbar: MatSnackBar,
  ) { }
  ngOnInit() {
    // this.pp();
    this.chartControls = '';
    this.chartTypeSelected = '';
    this.toggle = false;
    console.log("qiuickstat value", this.quickstatdata);
    this.nameid = localStorage.getItem('nameid');
    this.org = localStorage.getItem('organization');
    this.getStoryList();
    this.getparamdta();
    this.getAttributeList();
    if (localStorage.getItem('dataalias')) {
      this.alias = localStorage.getItem('dataalias');
    }
    this.getChartList();
    // this.getAllAttributesSubscription();
    // this.getCurrentObject();
    // this.services.updateStoryBoard(this.storyContentObj);
    this.anomalyEventSubscription();
    // this.getMinimizeMaximizeSubscription();
    // this.services.updateSaveToStory(true);
  }

  ngOnDestroy() {
    this.chartControls='';
    this.selectedChartType='';
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
  anomalyEventSubscription() {
    this.itemsDropped1 = []
    this.dataSubscription.add(
      this.services.currentMessageAnomaly.subscribe((obj) => {
        console.log('obj',obj);
        
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
      this.services.getAllChartTypes().subscribe((allCharts) => {
        this.chartTypes = allCharts.dynamicCharts;
        this.chartTypes.forEach((chart) => {
          this.chartTypes1.push({ value: chart, viewValue: chart.chart });
        })
        this.getAllLegendsCharts();
        this.createDynamicInputForm();
      })
    );
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
   // console.log('getFormArray',dynamicArray.controls);
    
    return dynamicArray.controls;
  
    
  }

  attributeDragEnd(attributeName, type: string) {
    console.log('attributeDrag',attributeName);
    
    this.draggedAttribute = attributeName;
    this.currentAttributeType = type;
    this.attributeFilterVariable = this.draggedAttribute.attributeName;
    console.log('dragedAttribute',this.draggedAttribute);
    
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
  heapmap: boolean = false;
  chartSelection(selectionEvent): void {
    // this.selectedChartType = selectionEvent.chart;
    // this.chartControls = this.selectedChartType
    // console.log('selectedcharttype', this.selectedChartType);
    this.chartTypeSelected = selectionEvent;
    if (this.chartTypeSelected.chartName === 'heatmap') {
      this.heapmap = true;
    }
    else {
      this.heapmap = false;
    }
    console.log("heap", this.heapmap);

    this.toggle = true;
    this.clearAllControls();
  }
  removechip(size) {
    if (size === 'colour') {
      this.colorLengends = [];
      this.getSelectedChartPlot();

    }
    else if (size === 'shape') {
      this.shapeLengends = [];
      this.getSelectedChartPlot();
    }
    else if (size === 'size') {
      this.sizeLengends = [];
      this.getSelectedChartPlot();
    }

  }

  clearAllControls() {
    this.urlSafe = 'about:blank';
    this.sanitizedHtml = 'about:blank';
    this.itemsDropped = [];
    this.itemsDropped1 = [];
    this.innerHtml = undefined;
    this.removeExistingControls();
    this.createChartControlForm(this.chartTypeSelected);

    this.filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
    this.attributeFilterVariable = null;
    this.filtersSelected = [];
    this.filterResponse = [];
    this.resetAllAstheticAttributes();
    this.lowerRangeValue = undefined;
    this.upperRangeValue = undefined;
    this.smartFilterValue = undefined;
    this.smartFilterOpr = undefined;
    this.displaySpinner = false;
    //this.selectedStory='';
    this.selectedChartType='';
    this.chartControls='';
    // this.onRefresh=false;
    // this.onRefresh=true;
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



  /**method called when items dropped for chart axis
   * @param  {number} controlIndex
   */
  attributeDrop(controlIndex: number, axisType: string): void {
    this.dropped = false;
    if (this.draggedAttribute !== undefined) {
      this.itemsDropped[controlIndex] = [];
      this.itemsDropped1[controlIndex] = [];
      if (
        !NOAGGREGATECHARTS.find(
          (name) => name === this.chartTypeSelected.chartName
        )
      ) {
        if (axisType === 'Y Axis') {
          if (this.currentAttributeType === 'Quantitative Attributes') {
            // for scatter chart
            if (this.chartTypeSelected.chartName === 'scatter_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                SCATTER_AGGREGATES_QUAN_YAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'horizontal_bar') {
              // for bar chart
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_CAT_YAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'heatmap') {
              // Quantative attributes cannot be selected for Heatmap chart
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_QUAN_XAXIS
              );
              // return;
            } else if (this.chartTypeSelected.chartName === 'barstack') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_QUAN_XAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'pareto') {
              // for bar chart
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
            } else {
              // quantative for other charts
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
              this.getAttributeWithoutAggregate(controlIndex);
            }
          } else if (this.currentAttributeType === 'Categorical Attributes') {
            if (this.chartTypeSelected.chartName === 'line_chart') {
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_CAT_XAXIS
              );
              this.getAttributeWithoutAggregate(controlIndex);
            } else if (this.chartTypeSelected.chartName === 'heatmap') {
              this.getAttributeWithoutAggregate(controlIndex);
            } else if (
              this.chartTypeSelected.chartName === 'vertical_bar' ||
              this.chartTypeSelected.chartName === 'columnstack'
            ) {
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
              this.getAttributeWithoutAggregate(controlIndex);
            } else {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_CAT_YAXIS
              );
            }
          } else {
            //temporal attributes
            this.getAttributeWithoutAggregate(controlIndex);
            this.getAllAttributesWithAggregate(
              controlIndex,
              AGGREGATES_TEM_YAXIS
            );
          }
        } else if (axisType === 'X Axis') {
          //x axis
          if (this.currentAttributeType === 'Quantitative Attributes') {
            if (this.chartTypeSelected.chartName === 'scatter_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_QUAN_XAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'line_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
            } else if (
              SELECTCATAGORICALDATA.find(
                (name) => name === this.chartTypeSelected.chartName
              )
            ) {
              this.getAllAttributesWithAggregate(controlIndex, PIE_CAT_XAXIS);
            } else if (this.chartTypeSelected.chartName === 'horizontal_bar') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_QUAN_XAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'heatmap') {
              // Quantative attributes cannot be selected for Heatmap chart
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_QUAN_XAXIS
              );
              // return;
            } else if (this.chartTypeSelected.chartName === 'barstack') {
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
              this.getAttributeWithoutAggregate(controlIndex);
            } else if (this.chartTypeSelected.chartName === 'bubble_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
              // return;
            } else {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_QUAN_XAXIS
              );
            }
          } else if (this.currentAttributeType === 'Categorical Attributes') {
            if (
              SELECTCATAGORICALDATA.find(
                (name) => name === this.chartTypeSelected.chartName
              )
            ) {
              this.getAllAttributesWithAggregate(controlIndex, PIE_CAT_XAXIS);
            } else if (this.chartTypeSelected.chartName === 'scatter_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                AGGREGATES_CAT_XAXIS
              );
            } else if (
              this.chartTypeSelected.chartName === 'vertical_bar' ||
              this.chartTypeSelected.chartName === 'columnstack'
            ) {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_QUAN_XAXIS
              );
            } else if (this.chartTypeSelected.chartName === 'bubble_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
              // return;
            } else if (this.chartTypeSelected.chartName === 'heatmap') {
              this.getAttributeWithoutAggregate(controlIndex);
            } else if (this.chartTypeSelected.chartName === 'line_chart') {
              this.getAttributeWithoutAggregate(controlIndex);
            } else {
              this.getAttributeWithoutAggregate(controlIndex);
              this.getAllAttributesWithAggregate(
                controlIndex,
                OTHERCHARTS_AGGREGATES_QUAN_YAXIS
              );
            }
          } else {
            //temporal attributes
            this.getAttributeWithoutAggregate(controlIndex);
          }
        } else if (axisType === 'Value') {
          if (this.currentAttributeType === 'Quantitative Attributes') {
            this.getAllAttributesWithAggregate(
              controlIndex,
              OTHERCHARTS_AGGREGATES_QUAN_YAXIS
            );
          }
        }
        // more than 3 axis needs to be handled
      } else {
        this.getAttributeWithoutAggregate(controlIndex);
      }

      this.setDroppedFormValue(controlIndex);
    }
    this.getSelectedChartPlot();
  }

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
    console.log('setDropvalueDyanmicArray',dynamicArray);
    
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
  showFilter() {
    this.hide = true;
    console.log("on click", this.hide);

  }

  filterSelectedAttribute(): void {
    this.hide = true;
    console.log("on drop", this.hide);
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

  onselecting(item: any) {
    console.log("on select", item);
    const index = this.filtersSelected.indexOf(item);
    if (this.filtersSelected.length == 0) {
      this.filtersSelected.push(item);
    } else {
      this.filtersSelected = [];
      this.filtersSelected.push(item);

    }
  }
  getSelectedAttributeFilterList(): void {
    const params = {

      column: this.draggedAttribute.attributeName,
      dataset_name: this.nameid,
    };
    this.dataSubscription.add(
      this.services.getfilternew(params, this.paramdata).subscribe((filterRes) => {
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
    this.hide = false;
    console.log(this.filtersSelected);

    this.getSelectedChartPlot();
    this.filtersSelected = [];
  }

  /**
   * method to close filter overlay
   * @param  {OverlayPanel} component
   */
  hide = false;
  cancelOverLay(component: OverlayPanel) {
    this.hide = false;
    console.log("on cancel", this.hide);
    // component.hide();
    const filterVal1 = this.filtersSelected;
    this.filtersSelected = [];
    const filterVal2 =
      this.filterResponse &&
        this.filterResponse.length === this.filterResponseBackup.length
        ? []
        : this.filterResponse;
    this.filterResponse = [];
    if (filterVal1.length >= 0 || filterVal2.length > 0) {
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
  getSelectedChartPlot(): void {
    this.displaySpinner = true;
    this.getChartRequestParameters(); 
    this.chartDetails = this.chartParams;
    console.log('chartDetails', this.chartParams);
    this.sanitizedHtml = this.services.createChartURL(this.chartTypeSelected.chartName, this.chartParams, JSON.stringify(this.quickstatdata), this.paramdata, this.nameid);
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

  frameLoaded() {
    this.displaySpinner = false;
    if (this.urlSafe !== 'about:blank') {
      this.getChartImageData();
    }
  }
  radioValue: any;
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
  paramdata: any;
  getparamdta() {
    this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      console.log("pyjobUrl", resp);
      this.paramdata = resp;
      if (resp) {
        this.getAttributeList();
      }
    });
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
    this.dataSubscription.add(
      this.services.getAllAttributeTypes2(this.paramdata, queryParamdata).subscribe((attr) => {
        console.log(attr.body.response);
        this.data = attr.body.response;
        console.log("value of data2 is dasdasdas", this.data);
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
          console.log('allAttributes',this.allAttributes);
          
        }

        else {
          this.showError(attr.response);
        }
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
  openChange(event) {

  }
  selectStory(event) {
    this.showStoryName=true;
    //this.enableEditIcon=false;
   // this.enableDescription=true;
    //this.showCreateButton=false;
    this.actionPerfomred='edit';
    this.enableSaveButton=false;
    console.log('selectChange', event);
    console.log('chartTyoes', this.chartTypes1);
    this.sName = event.chartName;
    this.selectedStory = event.chartName;
   // this.selectedStoryName = this.sName;
   this.storyName=this.sName;
    this.storyDescription = event.description;
    this.showInputField=true;
    const value = JSON.parse(event.chartDetails);
     console.log('selectChnage Value', value);
    this.selectedXAxisValue = value.columns.x;
    //this.attributeDrop(0,'X Axis');
    const chartDetails = this.chartTypes1.find((ele) => ele.value.chartName === value.chart_type);
    console.log('chartDetails', chartDetails);
    this.isChartSelected = false;
    this.chartSelection(chartDetails.value);
    this.chartControls = chartDetails.value;
    this.isChartSelected = true;
    this.toggle = false;
    this.getAxisValues(value);
    this.toggle = true;
    this.chartParams = value
    const chartType = value.chart_type;
    let imgurl = this.services.createChartURL(chartType, this.chartParams, JSON.stringify(this.quickstatdata), this.paramdata, this.nameid);
    // console.log('selectImgUrl', imgurl);
    this.sanitizedHtml = imgurl;
    if (value.legends.color !== 'None') this.colorLengends = [value.legends.color];
    if (value.legends.shape !== 'None') this.shapeLengends = [value.legends.shape];
    if (value.legends.size !== 'None') this.sizeLengends = [value.legends.size];
    this.getFilteredData(value.filter);
    this.cd.detectChanges();
  }
  // createStroy() {
  //   console.log('storyName', this.storyName);
  //   this.modalService.dismissAll();
  //   this.isNewStory = true;
  //   this.name = this.storyName

  // }
  opneDescription(content: any) {
    this.modalService.openModal(content, 'standard');
  }
  // saveStory() {
  //   //this.modalService.openModal(content, 'standard');
  // }
  closeModal() {
    this.modalService.dismissAll();
  }
  openSelection(event) {
    console.log('openChange', event);

  }
  getStoryList() {
    this.savedStories=[];
    this.services.getStoryList(this.nameid, this.org).subscribe((res) => {
      console.log('stroyList', res);
      res.forEach((story) =>{
     // const details = JSON.parse(story.chartDetails);
        this.savedStories.push({ viewValue: story.chartName, value: story })})
    })
  }
  getSavedStory(event){
    console.log('getSavedStory',event);
    if(event){
      this.getStoryList();
      this.modalService.dismissAll();
    }
    
  }
  findAttributeDetails(attributeName: string) {
    let foundAttributeDetails = null;  
    this.allAttributes.forEach(attributeGroup => {
      attributeGroup.attributes.forEach(attribute => {
        if (attribute.attributeName === attributeName) {
          foundAttributeDetails = {
            attributeType: attributeGroup.attributeType,
            attribute: attribute
          };
        }
      });
    });  
    return foundAttributeDetails;
  }
  getAxisValues(value: any) {
    if (value.columns.x !== 'None') {
      // console.log('dropdownValue for y', this.itemsDropped1);
      // const dynamicArray = this.dynamicInputDataGroup.get(
      //   'dynamicValues'
      // ) as UntypedFormArray;
      //  console.log('dynamicArray', dynamicArray);
      this.xAxisValue = value.columns.x;
      const attributeDetails = this.findAttributeDetails(value.columns.x);
      //  console.log('attributeDetails of findArrt', attributeDetails);

      if (attributeDetails) {
        this.attributeDragEnd(attributeDetails.attribute, attributeDetails.attributeType);
      }
      this.attributeDrop(0, 'X Axis');
      const aggValue=value.aggregate.x;
      let arrtName:any;
      if( aggValue !== 'None'){
        arrtName=this.xAxisValue + ' ' + aggValue.toUpperCase();
      }
      else{
        arrtName=this.xAxisValue;
      }
      // const formGroup = dynamicArray.at(0) as FormGroup;
      // if (formGroup) {
      //   const inputValueControl = formGroup.get('inputValue');
      //   if (inputValueControl) {
      //     inputValueControl.patchValue(value.columns.x);
      //   }
      //   const valueControl = formGroup.get('value');
      //   if (valueControl) {
      //     valueControl.patchValue(value.columns.x);
      //   }
      // }
      let selectedValue:any;
      console.log('xAxisOption',this.itemsDropped1[0]);
      this.itemsDropped1[0].forEach((name)=>{
        if(name.viewValue == arrtName){
          selectedValue=name.value;
        }
      })
      console.log('selectedXAxisValue',selectedValue);
      this.getSelectedChart('X Axis',selectedValue);

    }
    if (value.columns.y !== 'None') {
      // const dynamicArray = this.dynamicInputDataGroup.get(
      //   'dynamicValues'
      // ) as UntypedFormArray;
      // // console.log('dynamicArray', dynamicArray);
      // const formGroup = dynamicArray.at(1) as FormGroup;
      // if (formGroup) {
      //   const inputValueControl = formGroup.get('inputValue');
      //   if (inputValueControl) {
      //     inputValueControl.patchValue(value.columns.y);
      //   }
      //   const valueControl = formGroup.get('value');
      //   if (valueControl) {
      //     valueControl.patchValue(value.columns.y);
      //   }
      // }
      const attributeDetails = this.findAttributeDetails(value.columns.y);
      //  console.log('attributeDetails of findArrt', attributeDetails);

      if (attributeDetails) {
        this.attributeDragEnd(attributeDetails.attribute, attributeDetails.attributeType);
      }
      this.attributeDrop(1, 'Y Axis');
      // console.log('dynamicArray x axis', dynamicArray);
      const aggValue=value.aggregate.y;
      let arrtName:any;
      if( aggValue !== 'None'){
        arrtName=value.columns.y + ' ' + aggValue.toUpperCase();
      }
      else{
        arrtName=value.columns.y;
      }
      let selectedValue:any;
      console.log('yAxisOption',this.itemsDropped1[1]);
      this.itemsDropped1[1].forEach((name)=>{
        if(name.viewValue == arrtName){
          selectedValue=name.value;
        }
      })
      console.log('selectedXAxisValue',selectedValue);
      this.getSelectedChart('Y Axis',selectedValue);
    }


  }
  getFilteredData(data: any) {
    if (data !== 'None') {
      const filterKeys = Object.keys(data)
      this.filterBtnLabel = 'Filter - ' + filterKeys[0];
      const attributeDetails = this.findAttributeDetails(filterKeys[0]);
      this.draggedAttribute = attributeDetails.attribute;
      //  console.log('filterAttributeDetails', this.draggedAttribute);
      this.attributeFilterVariable = this.draggedAttribute.attributeName;
      // this.filterAttributeType = attributeDetails.attributeType;
      if (attributeDetails.attributeType === 'Categorical Attributes') {
        this.filterAttributeType = 'Categorical';
      }
      else if (attributeDetails.attributeType === 'Quantitative Attributes') {
        this.filterAttributeType = 'Quantitative';
      }
      this.hide = true;
      const filterValue: any = { value: Object.values(data)[0] }
      // console.log('filterValue', filterValue);

      this.filterResponse = filterValue.value.map((item) => {
        return { label: item };
      })
      this.filterResponse.sort((a, b) => a.label - b.label);
      this.filterResponseBackup = this.filterResponse;
      // console.log('filterResponseBackUp', this.filterResponseBackup);

    }

  }
  createStory(action:any){
    console.log('action',action);
    this.enableSaveButton=false;
    this.actionPerfomred=action;
    this.showInputField=true;
   // this.showCreateButton=true;
    this.showStoryName=false;
    //this.enableDescription=false;
    //this.enableEditIcon=true;
    this.storyName='';
    this.storyDescription='';
    this.storySelected='';
    this.sName='';
    this.clearAllControls();
    

  }
  refresh(){
    this.showInputField=false;
    // this.showCreateButton=false;
    // this.showUpdateButton=false;
    this.enableSaveButton=true;
    this.selectedStory='';
    this.storySelected='';
    this.clearAllControls();
  }
  saveStory() {
    const name = { "story_name": this.storyName }
    console.log('saveStoryName', name);
    const desc = { "description": this.storyDescription };
    console.log('savestoryDesc', desc);
    const details = { "details": this.chartDetails }
    if (name.story_name === '' || desc.description === '') {
      console.log('storyname and desc is empty');
      this.showErrorMessage('Enter All the Details');
    }
    else {
      let reqBody = { ...name, ...desc, ...details };
      console.log('reqBody', reqBody);
      if (this.actionPerfomred === 'create')
        this.service.saveStory(this.org, this.nameid, this.storyType, reqBody).subscribe((res) => {
          console.log('saveStory', res);
          //this.storySaved.emit('true');
          this.getStoryList();
          this.service.messageService(res, 'Done! Story Saved Successfully.');
          // this.refresh();
        })
      else if (this.actionPerfomred === 'edit') {
        this.service.updateStory(this.org, this.nameid, this.storyType, reqBody).subscribe((res) => {
          console.log('updateStory', res);
          // this.storySaved.emit('true');
          this.getStoryList();
          this.service.messageService(res, 'Done! Story Updated Successfully.')

        })
      }

      this.refresh();
    }
  } 
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
  getSelectedChart(label:any,event){
    console.log('selectedchart label',label);
    console.log('selectedchart detail',event);
    const dynamicArray = this.dynamicInputDataGroup.get(
      'dynamicValues'
    ) as UntypedFormArray;
    if(label ==='X Axis'){
      dynamicArray.controls[0].patchValue(
        { inputValue: event },
        { emitEvent: false }
      );
     // this.selectedVal = this.itemsDropped1[controlIndex][0]
      dynamicArray.updateValueAndValidity();
      console.log('setDropvalueDyanmicArray',dynamicArray);

    }
    else if( label === 'Y Axis'){
      dynamicArray.controls[1].patchValue(
        { inputValue: event },
        { emitEvent: false }
      );
     // this.selectedVal = this.itemsDropped1[controlIndex][0]
      dynamicArray.updateValueAndValidity();
      console.log('setDropvalueDyanmicArray',dynamicArray);
    }
    this.getSelectedChartPlot();
    
  }
}

