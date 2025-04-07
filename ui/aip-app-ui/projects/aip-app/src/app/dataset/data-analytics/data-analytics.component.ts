import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CATAGORICALDATATYPES, COLUMNDATATYPES, QUANTDATATYPES } from '../staticfile/constant';
import { ChartRequestParameter } from '../staticfile/models/chart-parameter';
import { Subscription } from 'rxjs';
import { Services } from '../../services/service';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-data-analytics',
  templateUrl: './data-analytics.component.html',
  styleUrls: ['./data-analytics.component.scss']
})
export class DataAnalyticsComponent implements OnInit {
  test: boolean = false;

  @ViewChild('content4') content: TemplateRef<any>;
  type: string = "secondary";
  displaySpinner: boolean = true;
  dataSubscription: Subscription = new Subscription();
  headerBg: string = "transparent";
  title = 'tags';
  gg: boolean = false;
  searchInput: string = '';
  searchtext: any = '';
  selectedObjectID: number = 6;
  selectedAttributes: string[] = [];
  selectedChart;
  displayChartDialog = false;
  newAttribute: any;
  allAttribute: string[] = [];
  data: any;
  coloumn: any = ["Data Type", "Count", "Null Count", "Unique Count", "Frequent Value", "Frequency", "Min Value", "Max Value", "Mean", "Median", "Std Deviation", "Chart"]
  constructor(private services: Services, private modalService: LedsModalService, private route: ActivatedRoute,
    private ledsLibService: LedsLibService,
  ) {
  }
  cardTitle: string = '';
  alias: any;
  nameid: any;
  baseUrl: any;
  quickdatanew: any;
  basicReqTab:any='quickStats'
  ngOnInit(): void {
    this.quickdatanew = history.state.quickdata;
    this.nameid = localStorage.getItem('nameid');
    // this.alias=history.state.dataalias;
    console.log("nameid", this.nameid);
    console.log("type", typeof this.nameid);
    if (localStorage.getItem('dataalias')) {
      this.alias = localStorage.getItem('dataalias');
    } else {
      // If not in local storage, get it from history.state
      this.alias = history.state.dataalias;
      // And then store it in local storage for future use
      localStorage.setItem('dataalias', this.alias);
    }
    console.log("sdac", history.state.dataalias);
    // this.QuickStatsData(); 
    this.getBaseUrl();

   }
  getBaseUrl() {
    this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
      console.log("PyjobUrl", resp);
      this.baseUrl = resp;
      if(resp){
        this.getParams();
      }
    });
  }
  card: any;
  bucketname: any;
  endpoint: any;
  access_key: any;
  secret_key: any;
  object_key: any;
  storage: any;
  region: any;
  getParams() {
    this.displaySpinner = true;
    let org = localStorage.getItem('organization')
    const datasetNameParam = {
      dataset_name : this.nameid
    }
    this.services.quickStat2(this.quickdatanew, this.baseUrl, datasetNameParam, org).subscribe((resp) => {
      console.log(resp.body.response);
      this.data = resp.body.response;
      this.displaySpinner = false;
      console.log("value of data2 is", this.data);
      for (const [key, value] of Object.entries(this.data)) {
        this.allAttribute.push(key);
      }
      this.newAttribute = this.coloumn.map((str: string) => ({ value: str, selected: false }));
      this.newAttribute.unshift({ value: 'all', selected: false });
      this.updateTable(['all']);
    })

  }
  updateTable(selectedValues: any[]) {
    if (selectedValues.length == 0) {
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
        if (attr.value != 'all') {
          attr.selected = false;
        }
      });
      this.selectedAttributes = [];
      this.isAllSelected = false;
    }
    else if (this.isAllSelected == true && !selectedValues.includes('all')) {
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
        if (attr.value != 'all') {
          attr.selected = false;
        }
      });
      this.selectedAttributes = [];//radio button is empty
      this.isAllSelected = false;
    }
    else if (selectedValues.includes('all') && selectedValues.length === 1) {
      this.isAllSelected = true;
      this.selectedAttributes = this.newAttribute.map((attr: { value: string }) => attr.value);
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
        if (attr.value != 'all') {
          attr.selected = true;//COUMS M ALL NA AAYE 
        }
      });
    }
    else if (selectedValues.includes('all') && selectedValues.length == this.newAttribute.length - 1 && this.isAllSelected) {

      selectedValues = selectedValues.filter(item => item !== "all");
      this.selectedAttributes = selectedValues;//radio button check hoga
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {//jo select kiya usko true  KAR RAHI

        attr.selected = selectedValues.includes(attr.value);
      });
      this.isAllSelected = false;
    }
    else if (selectedValues.includes('all') && selectedValues.length >= 1) {
      this.selectedAttributes = this.newAttribute.map((attr: { value: string }) => attr.value);
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
        if (attr.value != 'all') {
          attr.selected = true;//COUMS M ALL NA AAYE 
        }
      });
      this.isAllSelected = true;
    }
    else if (!selectedValues.includes('all') && selectedValues.length >= 1) {
      if (selectedValues.length == this.newAttribute.length - 1) {
        this.isAllSelected = true;
      } else {
        this.isAllSelected = false;
      }

      this.selectedAttributes = selectedValues;//radio button check hoga
      this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {//jo select kiya usko true  KAR RAHI

        attr.selected = selectedValues.includes(attr.value);

      });
      if (this.isAllSelected) {
        this.selectedAttributes = [];
        this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
          this.selectedAttributes.push(attr.value);

        })

        this.newAttribute.forEach((attr: { value: string, selected: boolean }) => {
          if (attr.value == 'all') {
            attr.selected = false;
          }
        });
      }
    }
  }
  isAllSelected: boolean = false;
  param: any = { "object_id": 6, "function_name": [], "args": [], "recipe_name": "None", "recipe_id": 0, "user_id": 1, "actions_changed": "NO", "screen": "both" };


  QuickStatsData() {
    this.services.getQuickStatsData(this.param).subscribe((res) => {
      this.data = res.response.statistics_response.statistics;
      console.log("value of data2 is", this.data);
      for (const [key, value] of Object.entries(this.data)) {
        this.allAttribute.push(key);


      }

      this.newAttribute = this.coloumn.map((str: string) => ({ value: str, selected: false }));
      this.newAttribute.unshift({ value: 'all', selected: false });
      this.updateTable(['all']);

    });

  }
  viewChartFromTable(selectedRow, attribute): void {
    let newSelectedRow = {
      count: selectedRow.count ? selectedRow.count : 'NA',
      field: attribute,
      header: attribute,
      max: selectedRow.max ? selectedRow.max : 'NA',
      mean: selectedRow.mean ? selectedRow.mean : 'NA',
      median: selectedRow['50%'] ? selectedRow['50%'] : 'NA',
      min: selectedRow.min ? selectedRow.min : 'NA',
      nullCount: selectedRow['null count'] ? selectedRow['null count'] : 'NA',
      std: selectedRow.std ? selectedRow.std : 'NA',
      freq: selectedRow.freq ? selectedRow.freq : 'NA',
      top: selectedRow['frequent value'] ? selectedRow['frequent value'] : 'NA',
      type: selectedRow['data type'] ? selectedRow['data type'] : 'NA',
    }
    this.cardTitle = attribute;
    // const rawType = COLUMNDATATYPES.find((obj) => obj.name === selectedRow.type);
    const rawType = newSelectedRow.type
    // this.displayChartDialog = true;


    const colType = this.getColumnType(rawType);
    const chartReqObj = this.createChartRequestObj(newSelectedRow.header, colType);

    this.getChartDataForTable(newSelectedRow.header, chartReqObj, colType);
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard', { backdrop: 'static' });
  }

  getColumnType(dataType: string): string {

    if (QUANTDATATYPES.includes(dataType)) {
      return 'quant';
    } else if (CATAGORICALDATATYPES.includes(dataType)) {
      return 'category';
    } else {
      return 'temporal';
    }
  }
  createChartRequestObj(colName, colType): any {
    const chartParams: ChartRequestParameter = {

      columns: {
        x: colName,
        y: 'None',
      },
      columns_type: {
        x: colType,
        y: 'None',
      },
      value: 'None',
      chart_type: 'None',
      aggregate: {
        x: 'None',
        y: 'None',
      },
      legends: {
        color: 'None',
        size: 'None',
        shape: 'None',
      },
      chart_layout: 'None',
      period: null,
      word_frequecy: null,
      valueaggregate: 'None',
      filter: 'None',
      screen: 'univariate_screenshot',

    };
    // const chartParams = {"object_id":6,"columns":{"x":"diagnosis","y":"None"},"columns_type":{"x":"quant","y":"None"},"value":"None","chart_type":"None","aggregate":{"x":"None","y":"None"},"legends":{"color":"None","size":"None","shape":"None"},"valueaggregate":"None","filter":"None","screen":"univariate_screenshot","user_id":1}

    return chartParams;
  }

  getChartDataForTable(
    element: any,
    chartReqObj: ChartRequestParameter,
    colType: string
  ): void {
    let chartDetails;
    this.test = false;
    const updatedChartReqObj ={
      ...chartReqObj,
      dataset_name : this.nameid,
      aip_login : 'True'
    }
    this.dataSubscription.add(this.services.getAttributeCharts(updatedChartReqObj, this.quickdatanew, this.baseUrl, this.nameid).subscribe(
      (response) => {
        if (response.status_message === 'SUCCESS') {
          this.test = true;
          const chartData = response.response;
          let chartURL = '';
          // let chartImage = 'data:image/png;base64,';
          let type = '';
          if (colType === 'quant') {
            chartURL = chartData['histogram_url'];
            // chartImage += this.getImageDataFromResponse(
            //   chartData,
            //   'histogram_image_data'
            // );
            type = 'Histogram';
          } else if (colType === 'category') {
            chartURL = chartData['verticalchart_url'];
            // chartImage += this.getImageDataFromResponse(
            //   chartData,
            //   'verticalchart_image_data'
            // );
            type = 'Vertical Chart';
          }
          chartDetails = {
            attribute: element,
            chartType: type,
            chartImage: '',
            url: chartURL,
            params: chartReqObj,
            body: this.nameid
          };


          this.openChartDialog(chartDetails);


        } else if (response.status_message === 'WARNING') {
          this.services.message('Could not fetch chart details. ' + response.response);
        } else {
          this.services.message('Could not fetch chart details. ' + response.response);
        }
      },
      (error) => {
        if (error) {
          this.services.message('Could not fetch chart details. ' + error);
        }
      }
    ));
  }

  openChartDialog(chartDetails): void {
    this.selectedChart = chartDetails;
    this.displayChartDialog = true;
    // this.openModal(this.content);

  }
  close(event) {
    console.log(event);
    this.displayChartDialog = false;

  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'quickStats';
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'openExploration';        
        break;
      case 2:
        this.basicReqTab = 'pivots';
        break;
      case 3:
        this.basicReqTab = 'multivariate';
        //this.processJson();
        break;
      case 4:
        this.basicReqTab = 'bivariate';
        break;
    }
  }
  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
}


