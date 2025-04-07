import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'com-lib-util';
import { Subscription, Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatasourceService } from '../../datasource/datasource.service';
import { SchemaRegistryService } from '../../services/schema-registry.service';
import { Dataset } from '../datasets';
import { DatasetServices } from '../dataset-service';

@Component({
  selector: 'app-dataset-macrobase',
  templateUrl: './dataset-macrobase.component.html',
  styleUrls: ['./dataset-macrobase.component.scss']
})
  export class DatasetMacrobaseComponent implements OnInit {

    @Input('dataset') inpdata: any;
    @Input() data;
    dataset: Dataset;
    dataSource: any;
    schemaValue
    metrics;
    schemaValueData
    metricsData;
    create: boolean = false
    attributesFilterCtrl = new FormControl()
    attributesCtrl = []
    highCtrl = new FormControl()
    lowCtrl = new FormControl()
    highFilterCtrl = []
    lowFilterCtrl = []
    finalDatasets: any = []
    pointerevent: string = "auto";
    busy: Subscription;
    protected onDestroy = new Subject<void>();
    analysisReport
    jobName = "Macrobase"
    totalJobs = 0;
    page = 0;
    lastPage = 0;
    query
    jobsList
    rows = 4;
    currentJob
    jobData
    datas
    analysis: boolean = false
    highmetric
    lowmetric
    metricDataType = ["decimal", "float", "int", "double", "long"]
    name
    description
    current
    nameErr: boolean = false
    showAdd = true
    datasources: any;
    filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredDataSources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    dataSourceFilterCtrl = new FormControl();
    datasetFilterCtrl= new FormControl();
    datasourceCtrl = new FormControl();
    datasetCtrl = new FormControl();
    datasets: any;
  
    constructor(private datasetService: DatasetServices,
      public messageService: MessageService,
      private datasourceService: DatasourceService,
      private schemaRegistryService: SchemaRegistryService,
      private route: ActivatedRoute,
      public dialog: MatDialog,) { }
  
    ngOnInit() {
      try{
        if(this.data){
          this.showAdd = false
          this.inpdata = this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
        }
        if(this.route.snapshot.params["datasetname"])
          this.inpdata = this.route.snapshot.params["datasetname"]
  //console.log(this.inpdata)
        if(this.inpdata){
          this.busy = this.datasetService.getDataset(this.inpdata.name?this.inpdata.name:this.inpdata).subscribe(res => {
            this.dataset = res;
            this.inpdata = this.dataset
            this.getJobsData();
          }, err => { }, () => {
            this.query = JSON.parse(this.dataset.attributes).Query
            if (this.dataset.schema) {
              this.getSchemaCols()
            }
            else
              this.extractSchema();
          })
      }
      else{
        this.findalldatasources();
        this.datasetFilterCtrl.valueChanges
        .pipe(takeUntil(this.onDestroy))
        .subscribe(() => {
          this.filterDatasets();
        });
      this.dataSourceFilterCtrl.valueChanges
        .pipe(takeUntil(this.onDestroy))
        .subscribe(() => {
          this.filterDatasources();
        });
      }
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    }
  
    filterDatasources() {
      if (!this.datasources) {
        return;
      }
      let search = this.dataSourceFilterCtrl.value;
      if (!search) {
        this.filteredDataSources.next(this.datasources.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      this.filteredDataSources.next(
        this.datasources.filter(datasource => datasource.alias.toLowerCase().indexOf(search) > -1)
      );
    }
  
    findalldatasources() {
      this.busy = this.datasourceService.getDatasourcesNames1(sessionStorage.getItem("organization"))
        .subscribe(res => {
          this.datasources = res;
          this.filteredDataSources.next(this.datasources.slice());
        });
    }
  
    getDatasetsforDatasource(datasource) {
      this.busy =  this.datasetService.getDatasetNamesByDatasource(datasource).subscribe(res => {
        this.datasets = res;
        this.filteredDatasets.next(this.datasets.slice());
      })
    }
  
    OnDatasourceChange(datasource) {
      this.getDatasetsforDatasource(datasource.name)
    }
  
    OnDatasetChange(dataset){
      this.inpdata = dataset
      this.ngOnInit()
    }
  
    filterDatasets() {
      if (!this.filteredDatasets) {
        return;
      }
      let search = this.datasetFilterCtrl.value;
      if (!search) {
        this.filteredDatasets.next(this.datasets.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      this.filteredDatasets.next(
        this.datasets.filter(dataset => dataset.alias.toLowerCase().indexOf(search) > -1)
      );
    }
  
    getSchemaCols() {
      try{
        this.schemaRegistryService.getSchemaByName(this.dataset.schema).subscribe(res => {
          this.schemaValue = JSON.parse(res.schemavalue)
          this.schemaValueData = [];
          if (this.schemaValue.length >= 1) {
            this.schemaValue.forEach(element => {
              if (element.recordcolumnname) {
                this.schemaValueData.push(element.recordcolumnname)
              }
            });
          }
        });
  
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    }
  
  
    extractSchema() {
      try{
        const dataCopy = JSON.parse(JSON.stringify(this.dataset));
      dataCopy.schema = null;
      dataCopy.backingDataset = dataCopy.backingDataset !== '' ? dataCopy.backingDataset : null;
      dataCopy.attributes = JSON.parse(dataCopy.attributes)
      this.datasourceService.getDatasource(dataCopy.datasource).subscribe(resp => {
        dataCopy.datasource = resp
      }, err => { },
        () => {
         this.busy = this.datasetService.extractSchema(dataCopy).subscribe(res => {
            this.schemaValue = res
            this.schemaValueData = [];
            this.schemaValue.sort((a, b) => a.recordcolumnname > b.recordcolumnname ? 1 : -1)
            this.schemaValue.forEach(ele => {
              this.schemaValueData.push(ele.recordcolumnname)
            });
          },
            err => {
              this.messageService.error("Failed to get schema", err)
            })
        })
  
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
      
    }
  
    save() {
     
      if (this.name == " " || this.name == null || this.name.trim == "") {
        this.messageService.error("Enter name", "")
        return;
      }
      let ar: AnalysisRequest = new AnalysisRequest
      ar.name = this.name
      ar.description = this.description
      ar.attributes = this.attributesCtrl
      ar.baseQuery = this.query
      ar.highMetrics = this.highFilterCtrl != null ? this.highFilterCtrl : []
      ar.lowMetrics = this.lowFilterCtrl != null ? this.lowFilterCtrl : []
      this.busy = this.datasetService.analysis(ar, this.inpdata.name?this.inpdata.name:this.inpdata).subscribe(res => {
        this.messageService.info("successfully saved", "CIP")
        this.create = false
        this.analysis = false
        setTimeout(()=>this.getJobsData(), 1500)
        
      }, err => {
        this.messageService.error("Error occured", "CIP")
      })
  
    }
  
    refresh() {
      this.getJobsData();
    }
  
    add() {
      this.create = true
      this.analysis = false
    }
  
  
    getJobsData() {
      try{
        if (this.jobName && this.showAdd) {
          this.busy = this.datasetService.fetchInternalJobLenByNameAndJob(this.jobName, this.dataset.name).
            subscribe(
              response => {
                var n: Number = new Number(response);
                this.totalJobs = n.valueOf();
                var remainder = this.totalJobs % this.rows;
                var cof = ((this.totalJobs - remainder) / this.rows);
                if (remainder != 0) {
                  this.lastPage = cof;
                }
                else {
                  this.lastPage = cof - 1;
                }
                if (this.totalJobs <= 0) {
                  this.add()
                }
                this.messageService.info('Fetched successfully', 'ICIP !');
                if (this.totalJobs !== 0) {
                  this.getJobs('First');
                } else this.jobsList = [];
              },
              error => this.messageService.error('Could not fetch jobs!', error)
            );
        }
        else{
          this.jobsList = []
          this.busy = this.datasetService.findInternalJobsByCoreid(this.datasetService.getCorelId()).subscribe(res => {
            res.forEach(job => {
              job["mb_attributes"] = JSON.parse(JSON.parse(job.jobmetadata).mbattributes)
              job["fileid"] = JSON.parse(job.jobmetadata).fileid
              this.jobsList.push(job)         
            });
            if(this.jobsList[this.jobsList.length-1].jobStatus=='COMPLETED'){
              this.explore(this.jobsList[this.jobsList.length-1])
            }
          });
        }
  
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    }
  
    getJobs(choice: String) {
      try{
        switch (choice) {
          case 'Next':
            this.page += 1;
            if (this.page == this.lastPage) {
              choice = 'Last';
              this.getJobs('Last');
              break;
            }
            break;
          case 'Prev':
            this.page -= 1;
            if (this.page == 0) {
              choice = 'First';
              this.getJobs('First');
              break;
            }
            break
          case 'First':
            this.page = 0;
            break;
          case 'Last':
            this.page = this.lastPage;
            break;
        }
        if (this.jobName) {
          this.jobsList = []
          this.busy = this.datasetService.fetchInternalJobByNameAndJob(this.jobName, this.dataset.name, this.page, this.rows).subscribe(res => {
            res.forEach(job => {
              job["mb_attributes"] = JSON.parse(JSON.parse(job.jobmetadata).mbattributes)
              job["fileid"] = JSON.parse(job.jobmetadata).fileid
              this.jobsList.push(job)
            });
           
          });
        }
  
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    
    }
  
    explore(job) {
      try{
        this.highmetric = job.mb_attributes.highMetrics
        this.lowmetric = job.mb_attributes.lowMetrics
        this.current = job.mb_attributes
        this.busy = this.datasetService.findById(job.fileid).subscribe(res => {
          this.busy = this.datasetService.getMbResult(res.id, res.filename).subscribe(res => {
            this.analysisReport = JSON.parse(JSON.stringify(res)).results[0]
            this.analysis = true
          },
            err => {
              this.messageService.error("Unable to fetch result", "CIP")
            })
        },
          err => {
            this.messageService.error("Result not found", "CIP")
          })
  
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
   
    }
  
    ngOnChanges() {
      this.datas = [];
      if (this.jobData && Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
        for (var i in this.jobData) {
          let a = { 'name': i, 'value': this.jobData[i] };
          this.datas.push(a);
        }
      }
    }
  
    selectorButton(m, l) {
      if (l.indexOf(m) > -1) {
        return "btn btn-default active-schema"
      } else {
        return "btn btn-default"
      }
    }
  
    applyClassAttributeGlyph(attri) {
      if (this.attributesCtrl.includes(attri)) {
        return "fa fa-check"
      } else {
        return "fa fa-plus"
      }
    }
  
    selectedAttribute(attri) {
      if (!this.attributesCtrl.includes(attri)) {
        this.attributesCtrl.push(attri)
      } else {
        this.attributesCtrl.splice(this.attributesCtrl.indexOf(attri), 1)
      }
     
     
    }
  
    applyClassAttributeButton =  (attributeName) => {
      return this.selectorButton(attributeName, this.attributesCtrl)
    }
  
    selectedMetric(attri, ishigh) {
      if (ishigh) {
        if (!this.highFilterCtrl.includes(attri)) {
          this.highFilterCtrl.push(attri)
        } else {
          this.highFilterCtrl.splice(this.attributesCtrl.indexOf(attri), 1)
        }
      } else {
        if (!this.lowFilterCtrl.includes(attri)) {
          this.lowFilterCtrl.push(attri)
        } else {
          this.lowFilterCtrl.splice(this.lowFilterCtrl.indexOf(attri), 1)
        }
      }
    }
  
    applyClassMetricButton(metricName, isHigh) {
      if (isHigh)
        return this.selectorButton(metricName, this.highFilterCtrl)
      else
        return this.selectorButton(metricName, this.lowFilterCtrl)
    }
  
    resetSchema() {
      this.highFilterCtrl = []
      this.lowFilterCtrl = []
      this.attributesCtrl = []
    }
  }
  
  export class AnalysisRequest {
    name: String
    description: String
    baseQuery: String;
    attributes: String[];
    highMetrics: String[];
    lowMetrics: String[];
    transformType: String = 'ZScore';
  }
