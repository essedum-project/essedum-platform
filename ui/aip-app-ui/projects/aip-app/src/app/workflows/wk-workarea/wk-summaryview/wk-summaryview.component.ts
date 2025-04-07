import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginationAttributes } from '../../../dataset/dataset-view/dataset-view.component';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';

@Component({
  selector: 'app-wk-summaryview',
  templateUrl: './wk-summaryview.component.html',
  styleUrls: ['./wk-summaryview.component.scss']
})
export class WkSummaryviewComponent implements OnInit,WorkareaItemsComponent {

  @Input() data: any; 

  selectedDataset;
  // @Input() isTimeSeries;
  totalCount:any
  datasetDetails
  grouped;
  average;
  @Output() event = new EventEmitter<any>();

  constructor(private datasetService:DatasetServices){}
  ngOnInit(){
    this.selectedDataset = this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
    this.getDatasetDetails();

  }

  getDatasetDetails(){
    let pagination: PaginationAttributes = new PaginationAttributes();
      pagination.page = 0;
      pagination.size = 50;
    this.datasetService.getPaginatedDetails(this.selectedDataset, pagination).subscribe(resp => {
      this.datasetDetails = resp
      this.totalCount = resp.length
    },err=>{},
    ()=>{
      // this.grouped = this.groupBy(this.datasetDetails, data => data[this.wkData.jsondata.stage2?this.wkData.jsondata.stage2.output:'id']);
    })
  }

//   calAverage() {
//     var sum = 0;
//     var keys = Object.keys(this.datasetDetails[0]);
//     keys.forEach(key => {
//       if (key == this.wkData.jsondata.stage2.output) {
//         sum += Number(this.datasetDetails[0][key]);
//       }
//     });
//     this.average = sum / (keys.length - 1);
// }

  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

  

}
