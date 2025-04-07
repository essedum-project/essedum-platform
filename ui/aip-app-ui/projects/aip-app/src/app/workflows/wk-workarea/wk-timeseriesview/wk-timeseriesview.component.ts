import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PaginationAttributes } from '../../../dataset/dataset-view/dataset-view.component';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';

@Component({
  selector: 'app-wk-timeseriesview',
  templateUrl: './wk-timeseriesview.component.html',
  styleUrls: ['./wk-timeseriesview.component.scss']
})
export class WkTimeseriesviewComponent implements OnInit,OnChanges,WorkareaItemsComponent{

    @Input() data: any = [];
    colList;
    inpDataset
    outDataset
    datasetDetails;
    xAxis
    yAxis
    selectedDataset;
    @Output() event = new EventEmitter<any>();
    options;
    inpChartData = []
    outChartData = []
    inchrt = false
    outchrt = false


    constructor(private datasetService: DatasetServices) { }
    ngOnInit() {
        
        this.inpDataset = this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
        this.outDataset = this.data.wkData.jsondata[this.data.wkJson.input.inp2].output
        this.xAxis = this.data.wkData.jsondata[this.data.wkJson.input.xaxis].output
        this.yAxis = this.data.wkData.jsondata[this.data.wkJson.input.yaxis].output
        this.inpDataset.taskdetails = null
        this.outDataset.taskdetails = null
        this.getOutDatasetDetails()                               
        this.getInpDatasetDetails()
           
    }

    ngOnChanges() {
        this.ngOnInit();
      }

    getColumnNames() {
        this.colList = []
        for (let obj in this.datasetDetails[0]) {
            this.colList.push(obj)
        }
    }

    getInpDatasetDetails() {
        this.inpChartData = []
        this.inchrt = true
        let pagination: PaginationAttributes = new PaginationAttributes();
        pagination.page = 0;
        pagination.size = 50;
        this.inpDataset.attributes = typeof(this.inpDataset.attributes)=='string'?JSON.parse(this.inpDataset.attributes):this.inpDataset.attributes
        this.datasetService.getDirectDatasetDetails(this.inpDataset, pagination).subscribe(resp => {
            this.datasetDetails = resp
            this.datasetDetails.forEach(det=>{
                if(det[this.xAxis]!=null && det[this.yAxis]!=null){
                    this.inpChartData.push(det)
                    this.inpChartData.sort((a, b) => (a[this.xAxis] > b[this.xAxis]) ? 1 : -1)
                }
            })
        })
    }

    getOutDatasetDetails() {
        this.outChartData = []
        this.outchrt = true
        let pagination: PaginationAttributes = new PaginationAttributes();
        pagination.page = 0;
        pagination.size = 50;
        this.outDataset.attributes = typeof(this.outDataset.attributes)=='string'?JSON.parse(this.outDataset.attributes):this.outDataset.attributes
        this.datasetService.getDirectDatasetDetails(this.outDataset, pagination).subscribe(resp => {
            this.datasetDetails = resp
            this.datasetDetails.forEach(det=>{
                if(det[this.xAxis]!=null && det[this.yAxis]!=null){
                    this.outChartData.push(det)
                    this.outChartData.sort((a, b) => (a[this.xAxis] > b[this.xAxis]) ? 1 : -1)
                }
            })
        })
    }

    changeXAxis(column) {
        this.xAxis = column
    }

    changeYAxis(column) {
        this.yAxis = column
    }
}
