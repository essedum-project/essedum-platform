import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';


//import { AnalyticsService } from 'src/app/advisory/services';

import { CATAGORICALDATATYPES, OPENEXPFILTERDEFAULTLBL, QUANTDATATYPES } from '../../staticfile/constant';
import { RecipeObject } from '../../staticfile/models';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-pivot-filter',
  templateUrl: './pivot-filter.component.html',
  styleUrls: ['./pivot-filter.component.scss'],
})
export class PivotFilterComponent implements OnInit, OnChanges, OnDestroy {
   @ViewChild('filterAttributes') filterAttributes: OverlayPanel;
  @Input() toggleOverlay: boolean;
  @Input() statsClickEvent;
  @Input() recipe: RecipeObject;
  @Input() filterSelection;
  @Input() baseUrl:any;
  @Output() selectedValue = new EventEmitter();
  filterAttributeType: string;
  smartFilterOpr: string;
  smartFilterValue: number;
  upperRangeValue: number;
  lowerRangeValue: number;
  filterResponse = [];
  filterListboxMessage = [{ label: 'Too many values to display' }];
  filterResponseBackup = [];
  filterColumnSelected: string;
  filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
  filtersSelected = [];
  attributeFilterVariable;
  pivotFilterSubscription: Subscription = new Subscription();
  compareValue = ['>', '<', '>=', '<='];
  currentFilterValues: {
    filterValues: number[] | string[];
    attributeName: string;
    type: string;
    lowerRangeValue: number;
    upperRangeValue: number;
    smartFilterValue: number;
  };
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
  sample =[];
  displaySpinner = true;

  constructor(
    //private messageService: MessageService,
    //private analyticsService: AnalyticsService,
    private services: Services,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(change: SimpleChanges) {
    if (change['toggleOverlay']&& this.filterAttributes ) {
      this.filterAttributes.toggle(this.statsClickEvent);
      this.lowerRangeValue = null;
      this.upperRangeValue = null;
      this.smartFilterValue = null;
      this.smartFilterOpr = null;
      this.filterSelectedAttribute();
    }
  }

  ngOnDestroy() {
    this.pivotFilterSubscription.unsubscribe();
    this.cd.detach();
  }

  resetValueFilter(): void {
    this.smartFilterOpr = undefined;
    this.smartFilterValue = undefined;
    this.filterResponse = this.filterResponseBackup;
  }

  resetRangeFilter(): void {
    this.upperRangeValue = undefined;
    this.lowerRangeValue = undefined;
    this.filterResponse = this.filterResponseBackup;
  }

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
    } else if (this.smartFilterOpr === '<') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label < this.smartFilterValue
      );
    } else if (this.smartFilterOpr === '<=') {
      this.filterResponse = this.filterResponseBackup.filter(
        (item) => item.label <= this.smartFilterValue
      );
    }
  }

  /**
   * method to close filter overlay
   * @param  {OverlayPanel} component
   */
  cancelOverLay(component: OverlayPanel) {
    component.hide();
    const filterVal1 = this.filtersSelected;
    this.filtersSelected = [];

    const filterVal2 =
      this.filterResponse.length === this.filterResponseBackup.length
        ? []
        : this.filterResponse;
    this.filterResponse = [];
    if (filterVal1.length > 0 || filterVal2.length > 0) {
      // this.getSelectedChartPlot();
    }
    this.filterBtnLabel = OPENEXPFILTERDEFAULTLBL;
    this.attributeFilterVariable = null;
  }

  getFilterResult(component: OverlayPanel): void {
    component.hide();
    this.currentFilterValues = {
      filterValues:
        this.filterAttributeType === 'Quantitative'
          ? this.filterResponse.map((val) => val.label)
          : this.filtersSelected.map((val) => val.label),
      attributeName: this.attributeFilterVariable,
      type: this.filterAttributeType,
      lowerRangeValue: this.lowerRangeValue,
      upperRangeValue: this.upperRangeValue,
      smartFilterValue: this.smartFilterValue,
    };
    this.selectedValue.emit(this.currentFilterValues);
  }

  getSelectedAttributeFilterList(): void {
    //let datasetName = localStorage.getItem('nameid');
    const params = {

      column: this.filterSelection.attributeName,
      dataset_name: localStorage.getItem('nameid') ,
    };
    this.pivotFilterSubscription.add(
      this.services.getfilternew(params, this.baseUrl).subscribe((filterRes) => {
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
        // this.showError(filterRes.response);
        }
      })
    );
  }

  filterSelectedAttribute(): void {
    // this.clearPreviousFilters();
    this.getSelectedAttributeFilterList();
    this.filtersSelected = [];
    // this.filterAttributeType = QUANTDATATYPES.includes(
    //   this.filterSelection.attributeDataType
    // )
    //   ? 'Quantitative'
    //   : undefined;
    if (QUANTDATATYPES.includes(this.filterSelection.attributeDataType)) {
      this.filterAttributeType = 'Quantitative';
    } else if (CATAGORICALDATATYPES.includes(this.filterSelection.attributeDataType)) {
      this.filterAttributeType = 'Categorical';
    }
    this.filterColumnSelected = this.filterSelection.attributeName;
    this.attributeFilterVariable = this.filterSelection.attributeName;
    // this.filterBtnLabel = 'Filter - ' + this.filterSelection.attributeName;
    console.log('attributeFilter',this.attributeFilterVariable);
    
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

  sampleFilterData(){
    const length = this.filterResponse.length/2
    const first= this.filterResponse.slice(0,100)
    const last= this.filterResponse.slice(-100)
    const mid= this.filterResponse.slice(length-100,length+100)
    const res=[...first,...mid,...last]
    this.sample =res;
  }

  // showError(message): void {
  //   this.messageService.add({
  //     key: 'bc',
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: message,
  //   });
  // }
}

