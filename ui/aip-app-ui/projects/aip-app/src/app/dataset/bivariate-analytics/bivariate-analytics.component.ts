import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    Input,
  } from '@angular/core';
  import { Router, NavigationStart } from '@angular/router';
  import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
  import {
    UntypedFormArray,
    UntypedFormGroup,
    UntypedFormBuilder,
    Validators,
    AbstractControl,
    FormGroup,
  } from '@angular/forms';
  import { SafeResourceUrl } from '@angular/platform-browser';
  import { ListboxModule } from 'primeng/listbox';
  import { MenuItem } from 'primeng/api';
  import { Subscription } from 'rxjs';
  import { MessageService } from 'primeng/api';
  
  // import { AnalyticsService, AnalyticsDataService } from '../../services';
  import { BivariateObject, StoryBoardParameter } from '../staticfile/models';
  import html2canvas from 'html2canvas';
  import { Services } from '../../services/service';

  import { 
    BIVARIATE_DETAILS_CHART,
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
    LINKAGE_LIST, } from '../staticfile/constant';
  
  @Component({
    selector: 'app-bivariate-analytics',
    templateUrl: './bivariate-analytics.component.html',
    styleUrls: ['./bivariate-analytics.component.scss'],
  })
  export class BivariateAnalyticsComponent implements OnInit, OnDestroy {
    // @ViewChildren('accordion') accordion: QueryList<AccordionTab>;
    private routerSubscription: Subscription;
    private dataSubscription: Subscription = new Subscription();
    editorOptions = new JsonEditorOptions();
    @Input() attribute: any;
    @Input() quickstatdata: any;
    objectID: number;
    disable_wkfl_save: boolean = false;
    alias: any;
    nameid: any;
    paramdata: any;
    isPlotsActive = true;  
    bivariateTableData = []; 
    displayTabularView = false;
    data: any;
    isExpanded = true;
    allAttributes;
    allSelectionCharts = {};
    allSelectionTable;
    currentSelection = {};
    urlSafe: SafeResourceUrl = 'about:blank';
    sanitizedHtml: SafeResourceUrl = 'about:blank';
    corrUrlSafe: SafeResourceUrl = 'about:blank';
    urlCopy: SafeResourceUrl = 'about:blank';
    displaySpinner = false;
    displayTableSpinner = false;
    menuItems: MenuItem[];
    plotMenuItems: MenuItem[];
    plotsMenuItems: MenuItem[];
    currentAttributeCount: number;
    selectedChartAttributeCount: number;
    diagonalType = 'None';
    correlationUrl = false;
    correlationType = 'None';
    threshold: any = '0.5';
    invalidThreshold = false;
    thresholdInvalidErrMsg = '* Value should between 0 and 1';
    listboxMain: ListboxModule;
    currentAccordionName: string;
    draggedItem;
    draggedType: string;
    frameWidth = '100%';
    frameheight = '98%';
    nodeTextBox = false;
    storyContentChartObj = {
      data: '',
      attributes: '',
      screenType: '',
      imagePath: [],
    };
    currentElement;
    storyContentTableObj: StoryBoardParameter;
    detailTabMenuItem: MenuItem[];
    corrChartType: string;
    totalAttributes: number;
    tabIndex = 0;
    biVarLbls = {
      addAttribute: 'Add Attribute',
      removeAttribute: 'Remove Attribute',
      noAttribute: 'No Attributes available',
      threshold: 'Threshold',
      normalize: 'Normalize',
      attributeCombination: 'Attribute Combination',
      correlationValue: 'Correlation Value',
      correlationStatus: 'Correlation Status',
    };
    allColumnsSelected = [];
    basicReqTab: any = "plotsTab";
    selectedTabIndex: number = 0; 
    draggedAttribute: any;
  
    constructor(
      // private analyticsService: AnalyticsService,
      // private analyticsDataService: AnalyticsDataService,
      private messageService: Services,
      private cd: ChangeDetectorRef,
      private formBuilder: UntypedFormBuilder,
      private router: Router,
      private services: Services
    ) { }
  
    ngOnInit() {
      this.nameid=localStorage.getItem('nameid');
      this.getparamdta();
      this.getAttributeList();
      this.setMenuItems();
      this.getAllAttributesSubscription();
      this.getCurrentObject();
      this.allSelectionCharts = {};
      this.allSelectionTable = {};
      //this.bivariantEventSubscription();
      // this.getScreenShotActionSubscription();
      // this.services.updateSaveToStory(true);
      // this.threshold = 'None'
      if (localStorage.getItem('dataalias')) {
        this.alias = localStorage.getItem('dataalias');
      }
      // this.routerSubscription = this.router.events.subscribe(event => {
      //   if (event instanceof NavigationStart) {
      //     this.refresh();
      //   }
      // });
    }
  
    ngOnDestroy() {
      this.dataSubscription.unsubscribe();
      this.services.changeMessageBivariate(this.generateParameter());
      this.services.updateSaveToStory(false);
      this.cd.detach();
      this.refresh();
      if (this.dataSubscription) {
        this.dataSubscription.unsubscribe();
      }
    }
    onTabChange(event: any): void {
      this.selectedTabIndex = event.index;
      if (this.selectedTabIndex === 0) {
        
      } else if (this.selectedTabIndex === 1) {
        
      }
    }
    onClickPlots(){
      this.isPlotsActive = true;
    }
    onClickDetails(){
      this.isPlotsActive = false;
    }
    basicReqTabChange(index) {
      switch (index) {
        case 0:
          this.basicReqTab = 'plotsTab';
          break;
        case 1:
          this.basicReqTab = 'detailsTab';
          console.log(this.bivariateTableData);
          this.displayTabularView = true;
          break;
      }
    }
    /**
     * subscribes all attributes
     * @returns void
     */
    getAllAttributesSubscription(): void {
      this.dataSubscription.add(
        this.services.currentAllAttributes.subscribe((obj) => {
          this.allAttributes = obj;
        })
      );
    }
    refresh(){
      this.bivariateTableData = [];
      this.allColumnsSelected = [];
      this.allSelectionCharts = {};
      this.allSelectionTable = {};
      this.urlSafe = 'about:blank';
      this.sanitizedHtml = 'about:blank';
      this.displaySpinner=false;
      this.totalAttributes = 0;
      this.nodeTextBox = false;
      
    }
    clearPivot() {
      this.services.updatePivotReset(true);
    }
    getparamdta(){
      this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
       this.paramdata=resp;
     });
    }
    getAttributeList(): void {
      const quantitative = [];
      const categorical = [];
      const temporal = [];
      this.allAttributes = [];
      this.dataSubscription.add(
        this.services.getDatasetByNameAndOrg(this.nameid).subscribe((res) => {
        const queryParamdata = {
          dataset_name : this.nameid,
          aip_login : 'True'
        }
        this.services.getAllAttributeTypes2(this.paramdata,queryParamdata).subscribe((attr)=>{
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
        } else {
          this.showError(attr.response);
        }
        });
        })
      )
    }
    /**
     * subscribes current object ID
     * @returns void
     */
    getCurrentObject(): void {
      this.dataSubscription.add(
        this.services.currentMessage.subscribe((selectedObject) => {
          if (selectedObject && selectedObject.object_id) {
            this.objectID = selectedObject.object_id;
          }
        })
      );
    }
  
    /**
     * subscribes bivariate object
     * @returns void
     */
    bivariantEventSubscription(): void {
      this.dataSubscription.add(
        this.services.currentMessageBivariate.subscribe((obj) => {
          if (obj) {
            this.listboxMain = obj.listboxMain;
            this.diagonalType = obj.diagonalType;
            this.nodeTextBox = obj.nodeTextBox;
            this.correlationType = obj.correlationType;
            this.selectedChartAttributeCount = obj.selectedAttributeCount;
            this.urlSafe = obj.url;
            this.allSelectionCharts = obj.selectionCharts;
            this.allSelectionTable = obj.selectionTable;
            this.bivariateTableData = obj.tableData;
            this.displaySpinner = true;
            this.totalAttributes = Object.keys(this.allSelectionTable).length;
            this.cd.detectChanges();
            if (this.diagonalType !== 'None') {
              this.setDiagonalTypeState();
            }
            if (this.correlationType !== 'None') {
              this.setCorrelationTypeState();
            }
          }
        })
      );
    }
  
    /**
     * @returns any
     */
    generateParameter(): any {
      return {
        url: this.urlSafe,
        selectionCharts: this.allSelectionCharts,
        selectionTable: this.allSelectionTable,
        diagonalType: this.diagonalType,
        correlationType: this.correlationType,
        selectedAttributeCount: this.selectedChartAttributeCount,
        listboxMain: this.listboxMain,
        tableData: this.bivariateTableData,
        nodeTextBox: this.nodeTextBox,
      };
    }
  
    /**
     * @param  {} currentElement
     * @param  {ListboxModule} listbox
     * @param  {} event
     */
    getElement(currentElement, listbox: ListboxModule, event) {
      this.currentElement = currentElement;
      this.currentSelection = {};
      event.value.forEach((element) => {
        this.currentSelection[element.attributeName] = element.attributeDataType;
      });
      this.currentAttributeCount = Object.keys(this.currentSelection).length;
      this.listboxMain = listbox;
    }
  
    /**
     * to control open and close on icon click
     * @param  {} event
     */
    // preventAccordionTabClose(event) {
    //   this.accordion.forEach((tab, index) => {
    //     if (event.target.nodeName === 'I' && index + 1 === this.currentElement) {
    //       tab.selected = true;
    //     }
    //   });
    // }
  
    /**
     * return true when categorical attribute
     * @returns boolean
     */
    isCategoricalSelected(): boolean {
      let isCategory = false;
      for (const singleKey of Object.keys(this.currentSelection)) {
        if (this.currentSelection[singleKey] === 'string') {
          isCategory = true;
          break;
        }
      }
      return isCategory;
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
    /**
     * adds selected attribute to the attributes
     * @param  {string} type
     * @returns void
     */
    callAddAttributeUrlService(type: string): void {
      this.currentAccordionName = type;
      this.addAttributesToSelection();
      // if (!this.isCategoricalSelected()) {
      //   this.callUrlService();
      // }
      for (const obj of this.plotsMenuItems[0]['items']) {
        obj.icon = '';
      }
  
      if (this.correlationUrl === true) {
        this.callCorrUrlService(this.correlationType);
        this.correlationUrl = true;
      } else if (!this.isCategoricalSelected()) {
        this.correlationUrl = false;
        this.callUrlService();
      }
  
      this.bivariateTableData = [];
      this.displayTabularView = true;
  
      if (this.totalAttributes > 1) {
        this.getTableData();
      }
      if (this.totalAttributes >= 6) {
        this.displayInfo();
      }
      this.showPopUpForCategoricalAttribute();
      if (this.tabIndex === 0) {
        this.disableBtn(true);
      }
    }
  
    /**
     * removes attribute from attributes
     * @param  {string} type
     * @returns void
     */
    callRemoveAttributeUrlService(type: string): void {
      this.currentAccordionName = type;
      for (const singleKey of Object.keys(this.currentSelection)) {
        delete this.allSelectionCharts[singleKey];
        delete this.allSelectionTable[singleKey];
      }
      this.totalAttributes = Object.keys(this.allSelectionTable).length;
  
      if (this.correlationUrl === true && this.totalAttributes > 1) {
        this.callCorrUrlService(this.correlationType);
        this.correlationUrl = true;
      } else if (this.totalAttributes > 0) {
        this.correlationUrl = false;
        this.callUrlService();
      }
  
      for (const obj of this.plotsMenuItems[0]['items']) {
        obj.icon = '';
      }
      if (this.totalAttributes > 1) {
        this.getTableData();
      } else {
        this.bivariateTableData = [];
        this.displayTabularView = true;
      }
      if (this.totalAttributes < 6) {
        this.messageService.message('UserInfo');
      }
      if (this.tabIndex === 0) {
        this.disableBtn(true);
      }
    }
  
    /**
     * calls url service
     * @returns void
     */
    callUrlService(): void {
      if (
        this.currentAttributeCount > 0 ||
        Object.keys(this.allSelectionCharts).length > 0
      ) {
        this.displaySpinner = true;
        this.selectedChartAttributeCount = Object.keys(
          this.allSelectionCharts
        ).length;
        this.removeIconFromOptions();
        const bivariateObj = this.formRequestObject(false, false);
        this.sanitizedHtml = this.services.createBiVariateChartURL(bivariateObj.chart_type, bivariateObj, this.paramdata, this.nameid);
        if (this.urlSafe === this.urlCopy) {
          this.displaySpinner = false;
        }
        if (this.listboxMain) {
          this.listboxMain['value'] = null;
        }
      }
    }
  
    /**
     * subscribes table data
     * @returns void
     */
    getTableData(): void {
      this.displayTableSpinner = true;
      // this.displayTabularView = true;
      this.bivariateTableData = Object.assign([]);
      const bivariateObj = this.formRequestObject(false, true);
      this.dataSubscription.add(
        this.services.getBiVariateTableData(bivariateObj, this.paramdata, this.nameid).subscribe(
          (result) => {
            const typedResult = result as { status_message: string; response: any };  // Type assertion
            if (typedResult.status_message === 'SUCCESS') {
              const data = Object.assign({}, typedResult.response);
              for (const attributes of Object.keys(data)) {
                this.bivariateTableData.push({
                  attribute: attributes.replace(':', '   :   '),
                  status: data[attributes]['correlation status'],
                  value: data[attributes]['correlation_value'],
                });
              }
              this.displayTableSpinner = false;
              // this.captureTableDataImageForStory();
            } else {
              this.showError(typedResult.response);
              this.displayTableSpinner = false;
            }
          },
          (error) => {
            if (error) {
              this.showError(error);
              this.displayTableSpinner = false;
            }
          }
        )
      );
    }
  
    /**
     * creates the correlation form bivariate Object
     * @param  {string} type
     * @returns BivariateObject
     */
    corrRequestObject(type: string): BivariateObject {
      const bivariateObj: BivariateObject = new BivariateObject();
      // bivariateObj.object_id = this.objectID;
      bivariateObj.columns = this.allSelectionTable;
      bivariateObj.distribution = 'None';
      bivariateObj.threshold = 'None';
      bivariateObj.chart_type = BIVARIATE_DETAILS_CHART[this.corrChartType];
      bivariateObj.screen = type === 'chart' ? 'None' : 'bivariate_screenshot';
      // bivariateObj.user_id = Number(localStorage.getItem('user_id'));
      return bivariateObj;
    }
  
    /**
     * sets diagonal type value
     * @returns string
     */
    getDistributionType(): string {
      return this.selectedChartAttributeCount >= 3 ? this.diagonalType : 'None';
    }
  
    /**
     * get a popup when a categorical attribute is dropped
     * @returns void
     */
    showPopUpForCategoricalAttribute(): void {
      const attributeCount = Object.keys(this.allSelectionTable).length;
      for (const singleKey of Object.keys(this.currentSelection)) {
        if (
          this.currentSelection[singleKey] === 'string' &&
          attributeCount === 1
        ) {
          this.showInfo(
            'Please select atleast two attributes to get correlation values. ' +
            'Correlation values for categorical data will be shown in "Details tab"'
          );
          break;
        }
        if (this.currentSelection[singleKey] === 'string' && attributeCount > 1) {
          this.showInfo(
            'Correlation values for categorical data will be shown in "Detials tab"'
          );
          break;
        }
      }
    }
  
    /**
     * adds the attribute to selected attributes
     * @returns void
     */
    addAttributesToSelection(): void {
      for (const singleKey of Object.keys(this.currentSelection)) {
        if (this.currentSelection[singleKey] !== 'string') {
          this.allSelectionCharts[singleKey] = this.currentSelection[singleKey];
        }
        this.allSelectionTable[singleKey] = this.currentSelection[singleKey];
      }
      this.totalAttributes = Object.keys(this.allSelectionTable).length;
    }
  
    /**
     * declaring menu items
     * @returns void
     */
    setMenuItems(): void {
      this.plotMenuItems = [
        {
          label: 'Options',
          icon: 'pi pi-fw pi-cog',
          items: [
            {
              label: 'Paired plot',
              icon: '',
              items: [
                {
                  label: 'Diagonal Type',
                  items: [
                    {
                      label: 'Histogram',
                      icon: '',
                      command: (event) => {
                        this.setSelectedDiagonal('Histogram', event, 'histogram');
                      },
                    },
                    {
                      label: 'KDE',
                      icon: '',
                      command: (event) => {
                        this.setSelectedDiagonal('KDE', event, 'kde');
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Correlation Heatmap',
              icon: '',
              command: (event) => {
                this.correlationType = 'Correlation Heatmap';
                this.getCorrelationMap('Correlation Heatmap', event);
              },
            },
            {
              label: 'Correlation Node',
              icon: '',
              command: (event) => {
                this.correlationType = 'Correlation Node';
                this.getCorrelationMap('Correlation Node', event);
              },
            },
          ],
        },
      ];
      this.plotsMenuItems = [
        {
          label: 'Options',
          icon: 'pi pi-fw pi-cog',
          items: [
            {
              label: 'Paired plot',
              icon: '',
              command: (event) => {
                this.setSelectedDiagonal('Histogram', event, 'histogram');
              },
            },
            {
              label: 'Correlation Heatmap',
              icon: '',
              command: (event) => {
                this.correlationType = 'Correlation Heatmap';
                this.getCorrelationMap('Correlation Heatmap', event);
              },
            },
            {
              label: 'Correlation Node',
              icon: '',
              command: (event) => {
                this.correlationType = 'Correlation Node';
                this.getCorrelationMap('Correlation Node', event);
              },
            },
          ],
        },
      ];
    }
  
    /**
     * get the correlation map by calling correlation url
     * @param  {string} corrType
     * @param  {} event
     * @returns void
     */
    getCorrelationMap(corrType: string, event): void {
      // this.displayTabularView = false;
      this.corrChartType = corrType;
      this.diagonalType = 'None';
      this.correlationUrl = true;
      event.item.icon = 'pi pi-fw pi-check';
      if (corrType === 'Correlation Node') {
        this.nodeTextBox = true;
      } else {
        this.nodeTextBox = false;
      }
      if (this.totalAttributes === 2) {
        for (const obj of this.plotsMenuItems[0]['items']) {
          if (obj.label !== corrType) {
            obj.icon = 'hide-icon pi pi-fw pi-check';
          }
        }
      } else {
        for (const obj of this.plotMenuItems[0]['items']) {
          if (obj.label !== corrType) {
            obj.icon = 'hide-icon pi pi-fw pi-check';
          }
        }
      }
      for (const obj of this.plotMenuItems[0].items[0].items[0]['items']) {
        obj.icon = 'hide-icon pi pi-fw pi-check';
      }
      this.callCorrUrlService(corrType);
    }
  
    /**
     * changes the correlation type
     * @returns void
     */
    setCorrelationTypeState(): void {
      // for (const obj of this.menuItems[0].items[0]['items']) {
      for (const obj of this.plotMenuItems[0]['items']) {
        if (this.correlationType.toUpperCase() === obj.label.toUpperCase()) {
          obj.icon = 'pi pi-fw pi-check';
        } else {
          obj.icon = 'hide-icon pi pi-fw pi-check';
        }
      }
      for (const obj of this.plotsMenuItems[0]['items']) {
        if (this.correlationType.toUpperCase() === obj.label.toUpperCase()) {
          obj.icon = 'pi pi-fw pi-check';
        } else {
          obj.icon = 'hide-icon pi pi-fw pi-check';
        }
      }
    }
  
    /**
     * calls the correlation url service
     * @param  {} corrType
     * @returns void
     */
    callCorrUrlService(corrType: string): void {
      this.displaySpinner = true;
      this.selectedChartAttributeCount = Object.keys(
        this.allSelectionCharts
      ).length;
      this.setCorrelationTypeState();
      //changed corrUrlSafe to urlSafe
      const bivariateObj = this.corrRequestObject('chart');
      if (this.nodeTextBox) {
        if (this.threshold === null || this.threshold === undefined) {
          bivariateObj.threshold = 'None';
        } else {
          bivariateObj.threshold = Number(this.threshold);
        }
      }
      this.sanitizedHtml = this.services.createCorrChartURL(
        bivariateObj,
        corrType,
        this.nameid,
        this.paramdata
      );
      if (this.sanitizedHtml === this.urlCopy) {
        this.displaySpinner = false;
      }
      if (this.listboxMain) {
        this.listboxMain['value'] = null;
      }
    }
  
    /**
     * creates the form bivariate Object
     * @param  {} isChartImage
     * @param  {} isTableData
     * @returns BivariateObject
     */
    formRequestObject(isChartImage, isTableData): BivariateObject {
      const bivariateObj: BivariateObject = new BivariateObject();
      // bivariateObj.object_id = this.objectID;
      bivariateObj.columns = isTableData
        ? this.allSelectionTable
        : this.allSelectionCharts;
      bivariateObj.distribution = this.getDistributionType();
      bivariateObj.chart_type = 'bivariate_chart';
      bivariateObj.threshold = 'None';
      bivariateObj.screen = isChartImage ? 'bivariate_screenshot' : 'None';
      // bivariateObj.user_id = Number(localStorage.getItem('user_id'));
      return bivariateObj;
    }
  
    /**
     * changes the diagonal type and calls url and functions to add attribute
     * @param  {string} diagonalType
     * @param  {} eventIcon
     * @param  {string} diagType
     * @returns void
     */
    setSelectedDiagonal(diagonalType: string, eventIcon, diagType: string): void {
      this.diagonalType = diagType;
      this.nodeTextBox = false;
      this.correlationType = 'None';
      this.correlationUrl = false;
      this.setSelectedDiagonalTypeIcon(diagonalType, eventIcon);
      // commented
      // this.addAttributesToSelection();
      this.callUrlService();
    }
  
    /**
     * sets the icon for selected digonal type
     * @param  {string} chartType
     * @param  {} event
     * @returns void
     */
    setSelectedDiagonalTypeIcon(chartType: string, event): void {
      if (this.totalAttributes === 2) {
        for (const obj of this.plotsMenuItems[0]['items']) {
          obj.icon = 'hide-icon pi pi-fw pi-check';
        }
      }
      event.item.icon = 'pi pi-fw pi-check';
      for (const obj of this.plotMenuItems[0].items[0].items[0]['items']) {
        if (obj.label !== chartType) {
          obj.icon = 'hide-icon pi pi-fw pi-check';
        }
      }
      for (const obj of this.plotMenuItems[0]['items']) {
        obj.icon = 'hide-icon pi pi-fw pi-check';
      }
    }
  
    /**
     * sets the icon for selected digonal type on page load
     * @returns void
     */
    setDiagonalTypeState(): void {
      for (const obj of this.plotMenuItems[0].items[0].items[0]['items']) {
        if (this.diagonalType.toUpperCase() === obj.label.toUpperCase()) {
          obj.icon = 'pi pi-fw pi-check';
        } else {
          obj.icon = 'hide-icon pi pi-fw pi-check';
        }
      }
      this.setCorrelationTypeState();
    }
  
    /**
     * removes the icon of paired options when attributes are below 3
     * @returns void
     */
    removeIconFromOptions(): void {
      if (Object.keys(this.allSelectionCharts).length < 3) {
        this.diagonalType = 'None';
        for (const obj of this.plotMenuItems[0].items[0].items[0]['items']) {
          obj.icon = '';
        }
      }
    }
  
    /**
     * validates the entered threshold value
     * @returns void
     */
    thresholdValidation() {
      if (this.threshold !== '') {
        this.invalidThreshold = this.threshold.match(
          /^(0(\.\d+)?|1(\.0+)?)$/
        )
          ? false
          : true;
      } else {
        this.invalidThreshold = false;
      }
    }
  
    /**
     * calls correlation url when threshold value is entered
     * @returns void
     */
    addThreshold(): void {
      if (this.threshold <= 1 && this.threshold >= 0) {
        this.callCorrUrlService('Correlation Node');
      }
    }
  
    /**
     * @param  {} itemDragged
     * @param  {} type
     * @returns void
     */
    attributeDragEnd(itemDragged, type): void {
      this.draggedAttribute = itemDragged;
      this.frameWidth = '0%';
      this.frameheight = '0%';
      this.draggedItem = [itemDragged];
      this.draggedType = type;
    }
  
    /**
     * @returns void
     */
    attributeDrop(event: any): void {
      this.allColumnsSelected.push(this.draggedAttribute);
      this.currentAccordionName = this.draggedType;
      this.currentSelection = {};
      this.draggedItem.forEach((element) => {
        this.currentSelection[element.attributeName] = element.attributeDataType;
      });
      this.frameWidth = '100%';
      this.frameheight = '98%';
      this.currentAttributeCount = Object.keys(this.currentSelection).length;
      this.addAttributesToSelection();
      this.getTableData();
      this.showPopUpForCategoricalAttribute();
      if (this.correlationUrl === true) {
        this.callCorrUrlService(this.correlationType);
        this.correlationUrl = true;
      } else if (!this.isCategoricalSelected()) {
        this.correlationUrl = false;
        this.callUrlService();
      }
      if (this.totalAttributes >= 6) {
        this.displayInfo();
      }
      if (this.tabIndex === 0 && !this.isCategoricalSelected()) {
        this.disableBtn(true);
      }
    }
    // attributeDrop(event: any) {
    //   console.log("Dropped item:", event);
    //   this.cd.detectChanges(); // Trigger change detection if necessary
    //   // Add your drop handling logic here
    // }
  
    /**
     * disables save to story button on true
     * @param  {boolean} flag
     * @returns void
     */
    disableBtn(flag: boolean): void {
      this.services.updateSaveToStory(flag);
    }
  
    /**
     * @returns void
     */
    frameLoaded(): void {
      this.displaySpinner = false;
      if (this.urlSafe !== 'about:blank') {
        this.getChartImageData();
        this.urlCopy = this.urlSafe;
      }
    }
  
    /**
     * @param  {} e
     * @returns void
     */
    handleChange(e): void {
      this.tabIndex = e.index;
      if (this.tabIndex === 1) {
        this.displayTabularView = true;
        this.captureTableDataImageForStory();
        // this.services.updateSaveToStory(false);
      } else if (this.tabIndex === 0) {
        this.displayTabularView = false;
        // this.services.updateStoryBoard(this.storyContentChartObj);
      }
    }
  
    /**
     * subscribes screenshots subscription
     * @returns void
     */
    getScreenShotActionSubscription(): void {
      this.dataSubscription.add(
        this.services.currentgetScreenShots.subscribe((flag) => {
          if (
            flag === true &&
            this.tabIndex === 1 &&
            this.displayTabularView === true
          ) {
            this.captureTableDataImageForStory();
          }
        })
      );
    }
  
    /**
     * gets table image data
     * @returns void
     */
    captureTableDataImageForStory(): void {
      let capturedImageData = '';
      if (document.querySelector('#table-data')) {
        html2canvas(document.querySelector('#table-data')).then((canvas) => {
          capturedImageData = canvas.toDataURL('image/png', 1.0);
          this.storyContentTableObj = {
            data: capturedImageData,
            attributes: this.allSelectionTable,
            screenType: 'bivariate',
            imagePath: 'None',
          };
          this.services.updateStoryBoard(this.storyContentTableObj);
        });
      }
    }
  
    /**
     * subscribes chart image
     * @returns void
     */
    getChartImageData(): void {
      const bivariateObj =
        this.correlationUrl === false
          ? this.formRequestObject(true, false)
          : this.corrRequestObject('screenshot');
  
      this.dataSubscription.add(
        this.services.getChartImage(bivariateObj).subscribe(
          (result) => {
            if (result.status_message === 'SUCCESS') {
              const imagePath = [result.response.image_path];
              this.storyContentChartObj = {
                data: this.getImageDataURI(result.response),
                attributes: 'None',
                screenType: 'None',
                imagePath: imagePath,
              };
              // this.storyContent.emit(this.storyContentChartObj);
              // this.services.updateStoryBoard(
              //   this.storyContentChartObj
              // );
              // this.services.updateSaveToStory(false);
            } else {
              this.showError('Unable to get chart Image. ' + result.response);
            }
          },
          (error) => {
            if (error) {
              this.showError('Unable to get chart Image. ' + error);
            }
          }
        )
      );
    }
  
    /**
     * gets image url data
     * @param  {} response
     * @returns string
     */
    getImageDataURI(response): string {
      const imagePrefix = 'data:image/png;base64,';
      let imageData = response.image_data;
      imageData = imageData ? imageData.replace(/^"|"$/g, '') : imageData;
      imageData = imagePrefix + imageData;
      return imageData;
    }
  
    /**
     * displays error message
     * @param  {} message
     * @returns void
     */
    showError(message): void {
      this.messageService.message({
        key: 'bc',
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
    }
  
    /**
     * displays info message
     * @param  {} message
     * @returns void
     */
    showInfo(message): void {
      this.messageService.message({
        key: 'bc',
        severity: 'info',
        summary: 'Info Message',
        detail: message,
      });
    }
  
    /**
     * display a message to switch to correlation map when more than 5 attributes dropped
     * @returns void
     */
    displayInfo(): void {
      this.messageService.message({
        key: 'UserInfo',
        severity: 'info',
        summary: 'User Information',
        detail: 'Please switch to correlation Heatmap or Node chart',
        life: 100000,
      });
    }
  }
  