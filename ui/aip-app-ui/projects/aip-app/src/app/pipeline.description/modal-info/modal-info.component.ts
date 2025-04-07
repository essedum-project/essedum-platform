import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
// import { DatasetsService } from '../../entities/datasets/datasets.service';
import { ViewerZipComponent } from '../../viewer-zip/viewer-zip.component';
import { DatasetServices } from '../../dataset/dataset-service';
import { Services } from '../../services/service';

export class PaginationAttributes {
  page: any
  size: any
  sortEvent: any
  sortOrder: any
}

@Component({
  selector: 'app-modal-info',
  templateUrl: './modal-info.component.html',
  styleUrls: ['./modal-info.component.scss']
})
export class ModalInfoComponent implements OnInit {
  selectedDatasetName: any;
  views: any;
  tableviews: string;
  datasetData: any;
  tableviewsupport: boolean;
  selectedDataset: any={};
  pipelineData: boolean;

  constructor(
    public dialogRef: MatDialogRef<ModalInfoComponent>,
    private datasetService: DatasetServices,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private service: Services,
  ) { }

  columnDef: any[] = [];
  dataSource = new MatTableDataSource();
  datas: any = [];
  dataCopy: any;
  tableview;
  flag=false;
  responseList:any=[];
  dataset:any={'views':false};
  dataList: {}[] = [];
  fileList: {filename:any,extension:any}[]=[];
  ngOnInit() {
    this.dataCopy = this.data;
    this.selectedDatasetName=this.data.name;
    this.pipelineData = true;
    this.checkTableSupport()
    let response: any[]

    this.dataCopy.schema = this.dataCopy.schema !== '' ? this.dataCopy.schema : null;
    this.dataCopy.backingDataset = this.dataCopy.backingDataset !== '' ? this.dataCopy.backingDataset : null;
    let pagination: PaginationAttributes = new PaginationAttributes();
    pagination.page = 0;
    pagination.size = 10;
    if (this.dataCopy.attributes) {
      this.datasetService.getDirectDatasetDetails(this.dataCopy, pagination).subscribe(resp => {
        response = resp
        console.log("response",response);
      }, err => { },
        () => {
          if (response && Array.isArray(response))
            {
              this.tableview = 'yes'
              console.log("true");
              for(const item of response){
                const filename = Object.keys(item)[0];
                const data = Object.values(item)[0] as string;
                const extension = filename.substring(filename.lastIndexOf(".") + 1);
                this.dataList.push({filename,data});

                this.responseList.push({...item});
              }
              this.flag = true;
              console.log("dataList",this.dataList);
            }
          else
            this.tableview = 'no'
        })
    }
    else {
      this.datasetService.getDataset(this.dataCopy.name).subscribe(res => {
        this.datasetService.getDirectDatasetDetails(res, pagination).subscribe(resp => {
          response = resp
        }, err => { },
          () => {
            if (response && Array.isArray(response))
              this.tableview = 'yes'
            else
              this.tableview = 'no'
          })
      })
    }
    
    if(this.data.attributes){
      Object.keys(this.data.attributes).forEach(keyValue => {
        this.columnDef.push(keyValue);
      });
      this.datas.push(this.data.attributes);
      this.dataSource.data = this.datas;
    }
  }
  checkTableSupport() {
    this.service.checkVisualizeSupport(this.selectedDatasetName)
    .subscribe(res => {
      if (res && res.filter(ele => ele["Tabular View"]).length > 0) {
        
        this.service.getDataset(this.selectedDatasetName).subscribe(resp=>{
          this.dataset=resp;
          try {
            try {
            this.views = JSON.parse(this.dataset.views)
          }
          catch {
            this.views = this.dataset.views
          }
          if(this.views == ""){
            this.tableviews = 'yes'
          }
          }
          catch {
            this.views = this.dataset.views
          }
          
          if(this.dataset.views){
           this.service.getDatasource(this.dataset.datasource).subscribe(resp=>{
            this.dataset.datasource=resp;
            let params={page:0,size:50}
            this.service.getProxyDbDatasetDetails(
             this.dataset,
             this.dataset.datasource,
             params,
             this.dataset.organization,
             true
            ).subscribe(resp=>{
             this.datasetData=resp
             this.flag=true
            },err=>{
              console.log(err);
             this.datasetData=err.text;
             this.flag=true
            }); 
          },err=>{console.log(err)});
           
          }
          else{
            this.tableviewsupport = false
          }
        },err=>{console.log(err)});
      }
      else{
        
        this.service.getDataset(this.selectedDatasetName).subscribe(resp=>{
          this.dataset=resp;
          try {
            try {
            this.views = JSON.parse(this.dataset.views)
          }
          catch {
            this.views = this.dataset.views
          }
          }
          catch {
            this.views = this.dataset.views
          }

          if(this.views == ""){
            this.tableviews = 'no'
          }
          
          if(this.dataset.views){
           this.service.getDatasource(this.dataset.datasource).subscribe(resp=>{
            this.dataset.datasource=resp;
            let params={page:0,size:50}
            this.service.getProxyDbDatasetDetails(
             this.dataset,
             this.dataset.datasource,
             params,
             this.dataset.organization,
             true
            ).subscribe(resp=>{
             this.datasetData=resp
             this.flag=true
            },err=>{
              console.log(err);
             this.datasetData=err.text;
             this.flag=true
            }); 
          },err=>{console.log(err)});
           
          }
          else{
            this.tableviewsupport = false
          }
        },err=>{console.log(err)});
      }
    },err=>{
      this.tableviews = 'no'
    })
    this.selectedDataset["name"] = this.selectedDatasetName;
}
  close() {
    this.dialogRef.close();
  }
}
