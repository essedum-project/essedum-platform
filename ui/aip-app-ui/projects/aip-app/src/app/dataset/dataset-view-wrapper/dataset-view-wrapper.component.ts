import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';

export class PaginationAttributes {
  page: any
  size: any
  sortEvent: any
  sortOrder: any
}
@Component({
  selector: 'app-dataset-view-wrapper',
  templateUrl: './dataset-view-wrapper.component.html',
  styleUrls: ['./dataset-view-wrapper.component.scss']
})
export class DatasetViewWrapperComponent {
  busy: Subscription;
  @Input() dataset: any
  tableview: string = ' ';
  datasetData
  views: any;
  flag:boolean=false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datasetsService: DatasetServices,
    private datasourceService: Services
  ) { }

  ngOnInit() {
    this.getDataset();

  }

  checkTableViewSupport() {
    this.datasetsService.checkVisualizeSupport(this.dataset.name)
      .subscribe(res => {
        this.getDatasetData()
        if (res && res.filter(ele => ele["Visualization"]).length > 0) {
          this.tableview = 'yes'
        }
        else {
          this.tableview = 'no'
        }
      },
        () => { this.tableview = 'no' })
  }
  getDatasetData() {
   this.busy = this.datasourceService.getDatasource(this.dataset.datasource).subscribe(resp => {
      let params = { page: 0, size: 1 };
      this.datasetsService
        .getProxyDbDatasetDetails(
          this.dataset,
          resp,
          params,
          sessionStorage.getItem("organization"),
          true
        )
        .subscribe((resp) => {
          this.datasetData = resp
          this.flag=true
        }, (err) => {
          //console.log(err);
          this.datasetData = err.text;
          this.flag=true
        })
    })

  }
  getDataset() {
    this.datasetsService.getDataset(this.dataset.name).subscribe(resp => {
      this.dataset = resp
      if (this.dataset.views == "\"\""){
        this.dataset.views = ""
        this.checkTableViewSupport()
      }
        
      if(this.dataset != undefined){
        try {
                this.views = JSON.parse(this.dataset.views)
              }
              catch {
                this.views = this.dataset.views
              }
              if(this.dataset.views){
                this.getDatasetData();
              }
            }
        
        else{
          this.checkTableViewSupport()
        }
    })
  }
}
