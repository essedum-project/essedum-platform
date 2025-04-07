import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfigDatasetComponent } from '../../../dataset/modal-config-dataset/modal-config-dataset.component';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';

@Component({
  selector: 'app-wk-datasetsview',
  templateUrl: './wk-datasetsview.component.html',
  styleUrls: ['./wk-datasetsview.component.scss']
})
  export class WkDatasetsviewComponent implements OnInit,WorkareaItemsComponent {

    @Input() data: any;
    datasourceRedirect: boolean = false;
    currentDatasourceName = "NA";
    router: any;
  
    constructor(private datasetsService: DatasetServices,private dialog: MatDialog) { }
    allDatasets: any = []
    @Output() event = new EventEmitter<any>();
    datasetCtrl = new FormControl()
    search: any = ''
    totalJobs = 0;
    page = 0;
    lastPage = 0;
    rows = 9;
    size = 9;
    searchText;
    upload : boolean = false;
    showview : boolean = false;
    logs:boolean =false;
    selecteddataset;
  
    ngOnInit() {
      this.searching();
    }
  
    searching() {
  //console.log("search", )
      this.datasetsService.getDatasetsLenBySearch(this.search).subscribe(response => {
        var n: Number = new Number(response);
        this.totalJobs = n.valueOf();
        var remainder = this.totalJobs % this.rows;
        var cof = (this.totalJobs - remainder) / this.rows;
        if (remainder != 0) {
          this.lastPage = cof;
        } else {
          this.lastPage = cof - 1;
        }
        if (this.totalJobs !== 0) {
          this.getDatasets('First')
        } else {
          this.page = 0;
          this.lastPage = 0;
        }
      })
  
    }
  
    getDatasets(choice: String) {
      switch (choice) {
        case "Next":
          this.page += 1;
          if (this.page == this.lastPage) {
            choice = "Last";
            this.getDatasets("Last");
            break;
          }
          break;
        case "Prev":
          this.page -= 1;
          if (this.page == 0) {
            choice = "First";
            this.getDatasets("First");
            break;
          }
          break;
        case "First":
          this.page = 0;
          break;
        case "Last":
          this.page = this.lastPage;
          break;
      }
      if (this.search == "") {
        this.datasetsService.getDatasetsByOrg(this.page, this.size).subscribe((res) => {
          if(this.data.wkJson.input.dataset == null){
          this.allDatasets = res 
          }
          else{
            this.allDatasets = res.filter(dataset => dataset.name == this.data.wkJson.input.dataset)
          }
        });
      }
      else {
        this.datasetsService.getDatasetsByName(this.search, this.page, this.size).subscribe((res) => {
          this.allDatasets = res
        });
      }
    }
  
    changeStage(value) {
      // let selDataset = this.allDatasets.filter(data => data.name == value)[0]
      this.event.emit(value)
    }
  
    addDataset() {
      const dialogRef = this.dialog.open(ModalConfigDatasetComponent, {
        height: "90%",
        panelClass: "dsConfig",
        minWidth: "60vw",
        disableClose: true,
        data: {
          redirect: this.datasourceRedirect,
          datasource: this.currentDatasourceName,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
    }
  
   
  
    onSearch() {
    }
  
}
