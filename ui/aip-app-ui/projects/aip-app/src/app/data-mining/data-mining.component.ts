import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { LogConsoleComponent } from '../dataset/log-console/log-console.component';
import { DatasetLoadComponent } from '../dataset/dataset-load/dataset-load.component';
import { MatTableDataSource } from '@angular/material/table';
import { DatasetServices } from '../dataset/dataset-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasourceService } from '../datasource/datasource.service';
import { takeUntil } from 'rxjs/operators';
import { Services } from '../services/service';
import { MatTabChangeEvent } from '@angular/material/tabs';

export class PaginationAttributes {
  page: any;
  size: any;
  sortEvent: any;
  sortOrder: any;
}
@Component({
  selector: 'app-data-mining',
  templateUrl: './data-mining.component.html',
  styleUrls: ['./data-mining.component.scss']
})
export class DataMiningComponent implements OnInit {
  // DataSource Varibles
  selectedDataSource;
  dataSources = [];
  dataSourcesCopy = [];
  public filteredDataSource: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild("dataSourceSelect", { static: true }) dataSourceSelect: MatSelect;
  public dataSourceFilterCtrl: FormControl = new FormControl();

  // DataSet Variables
  selectedDataSet;
  selectedDataSetDetails;
  dataSets = [];
  dataSetsCopy = [];
  dataSetDetails = [];
  public filteredDataSet: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild("dataSetSelect", { static: true }) dataSetSelect: MatSelect;
  public dataSetFilterCtrl: FormControl = new FormControl();

  // Event Variables
  selectedEvent;
  eventList = [];
  eventListCopy = [];
  public filteredEvent: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild("eventSelect", { static: true }) eventSelect: MatSelect;
  public eventFilterCtrl: FormControl = new FormControl();

  //All Other Variables
  protected _onDestroy = new Subject<void>();
  view: Boolean = false;
  refreshFile: Boolean = true;
  viewPipeLineLogs: Boolean = false;
  viewloaderLogs: Boolean = false;
  rows = 10;
  page = 0;
  sortOrder = -1;
  sortEvent;
  lastPage = false;
  busy: Subscription;
  processType;
  edgeTableName;
  graphTableName;
  dashboardName;
  schemaValue: any = "";
  displayedColumns: string[] = ["map", "column"];
  @ViewChild('console', { static: false }) consoleTab: LogConsoleComponent;
  @ViewChild('datasetload', { static: false }) datasetload: DatasetLoadComponent;
  @ViewChild('tableschema', { static: false }) tableschema: DatasetLoadComponent;
  @ViewChild('loader', { static: false }) loaderTab: LogConsoleComponent;

  paramId = "";
  paramNode = "";
  dataitem;
  loaderitem;
  paramActionTimeStamp = "";
  paramAdditionalMapping = [];
  mappingData: any[] = [
    { name: "Id*", model: '' },
    { name: "Node*", model: '' },
    { name: "Action Time Stamp*", model: '' },
    { name: "Additional Columns", model: '' }
  ]
  schemasList: MatTableDataSource<any> = new MatTableDataSource();
  originalSchemas = []

  constructor(
    private service: Services,
    private dataSetService: DatasetServices,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private datasourceService: DatasourceService
  ) { }

  ngOnInit() {
    this.fetchAllDataSources();
    this.fetchAllEvents();

    this.dataSourceFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterDataSource();
    });

    this.dataSetFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterDataSet();
    });

    this.eventFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterEvent();
    });

    if (!this.selectedDataSet) {
      this.view = false;
    }
  }

  // *********************** fetch all the datasources for the datasource dropdown ***********************
  fetchAllDataSources() {
    this.busy = this.datasourceService.getDatasources().subscribe(
      (res) => {
        this.dataSources = res;
        this.dataSourcesCopy = this.dataSources;
        this.selectedDataSource = res[0].name;
        this.filteredDataSource.next(this.dataSources.slice());
        this.fetchAllDataSets(this.selectedDataSource)
      },
      (error) => {
        this.service.message(error, "Process Mining");
      }
    );
  }

  // *********************** filter datasource based on input given ***********************
  protected filterDataSource() {
    if (!this.dataSources) {
      return;
    }
    let search = this.dataSourceFilterCtrl.value;
    if (!search) {
      this.filteredDataSource.next(this.dataSources.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDataSource.next(
      this.dataSources.filter((datasource) => datasource.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  // *********************** get all events to populate the dropdown ***********************
  fetchAllEvents() {
    this.eventList = [];
    this.busy = this.dataSetService.getAllEventDetails().subscribe((res) => {
      this.eventList = res;
      this.selectedEvent = res[0].eventname;
      this.eventListCopy = this.eventList;
      this.filteredEvent.next(this.eventList.slice());
      this.fetchPipelineLogs();
    },
      (error) => {
        this.service.message(error, "Process Mining");
      });
  }


  protected filterEvent() {
    if (!this.eventList) {
      return;
    }
    let search = this.eventFilterCtrl.value;
    if (!search) {
      this.filteredEvent.next(this.eventList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredEvent.next(
      this.eventList.filter((event) => event.eventname.toLowerCase().indexOf(search) > -1)
    );

  }

  // *********************** fetch all the datasets for the selected datasource  ***********************
  fetchAllDataSets(dataSource) {
    this.selectedDataSource = dataSource;
    this.dataSources.forEach((element) => {
      if (element.name == dataSource) {
        dataSource = element;
      }
    });
    this.busy = this.dataSetService.getDatasetForDatasource(this.selectedDataSource).subscribe(
      (res) => {
        this.dataSets = [];
        this.dataSets = res.filter(el => el.type == "rw");
        this.dataSets = this.dataSets.sort((a, b) =>
          a.alias.trim().toLowerCase() > b.alias.trim().toLowerCase() ? 1 : -1
        );
        this.selectedDataSet = this.dataSets[0].name;
        this.view = true;
        this.dataSetsCopy = this.dataSets
        this.filteredDataSet.next(this.dataSets.slice());
        this.fetchDataSetData(this.selectedDataSet)
      },
      (error) => {
        this.service.message(error, "Process Mining");
      }
    );
  }

  // *********************** filter dataset based on input given ***********************
  protected filterDataSet() {
    if (!this.dataSets) {
      return;
    }
    let search = this.dataSetFilterCtrl.value;
    if (!search) {
      this.filteredDataSet.next(this.dataSets.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDataSet.next(
      this.dataSets.filter((dataset) => dataset.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  // *********************** filter dataset based on input given ***********************
  fetchDataSetData(selectedDataSet) {
    this.busy = this.dataSetService.getDataset(selectedDataSet).subscribe((res) => {
      this.selectedDataSetDetails = res;
      this.datasourceService.getDatasource(res.datasource).subscribe(response => {
        this.selectedDataSetDetails.datasource = response
      }, error => { }, () => {
        if (this.datasetload)
          this.datasetload.ngOnInit();
        if (this.loaderTab)
          this.loaderTab.ngOnInit();
        if (this.tableschema)
          this.tableschema.ngOnInit();
        this.getDatasetDetails(res);
        //this.extractSchema();
      });
    });
  }

  // *********************** filter dataset based on input given ***********************
  getDatasetDetails(dataset) {
    let pagination: PaginationAttributes = new PaginationAttributes();
    pagination.page = this.page;
    pagination.size = this.rows;
    pagination.sortEvent = this.sortEvent;
    pagination.sortOrder = this.sortOrder;
    this.busy = this.dataSetService.getPaginatedDetails(dataset, pagination).subscribe(
      (resp) => {
        let response: any[] = resp;
        if (response && response.length < 10) this.lastPage = true;
        this.dataSetDetails = resp;
      },
      (error) => { }
    );
  }

  // *********************** trigger the data mining pipeline for the selected dataset ***********************
  triggerPipeline() {
    if (!this.dashboardName)
      return this.service.message("Please input dashboard name", "Process Mining");
    else if (!this.graphTableName)
      return this.service.message("Please input graph table name", "Process Mining");
    else if (!this.edgeTableName)
      return this.service.message("Please input edge table name", "Process Mining");
    else if (!this.selectedEvent) {
      return this.service.message("Please input event name", "Process Mining");
    } else if (!this.processType) {
      return this.service.message("Please input data type", "Process Mining");
    } else if (this.paramId == "" || this.paramNode == "" || this.paramActionTimeStamp == "") {
      return this.service.message("Please map all mandatory fields", "Process Mining");
    } else {
      let dataSourceObj = this.dataSources.find((dataSource) => dataSource.name == this.selectedDataSource);
      let dataSetObj = this.dataSets.filter((dataSet) => dataSet.name == this.selectedDataSet);

      let eventName = this.selectedEvent;
      try {
        let params = JSON.stringify({
          projectId: JSON.stringify(JSON.parse(sessionStorage.getItem("project")).id),
          rawTableName: JSON.parse(dataSetObj[0].attributes).tableName,
          type: this.processType,
          additionalMapping: this.paramAdditionalMapping,
          mandatoryParams: JSON.stringify({
            id: this.paramId,
            node: this.paramNode,
            actiontimestamp: this.paramActionTimeStamp,
          }),
          edgetablename: this.edgeTableName,
          graphtablename: this.graphTableName,
          rawdatasource: this.selectedDataSource
        });
        this.busy = this.dataSetService.triggerProcessMiningPipeline(eventName, params).subscribe(
          (res) => {
            this.service.info("Pipeline triggered successfully", "Dashboard");
          },
          (error) => {
            this.service.message("Error!", "Pipeline not triggered due to error: " + error);
          }
        );
      }
      catch (e) {
        console.error("JSON error - ", e['message']);
      }
    }
  }

  // *********************** create mapping for columns to trigger pipeline ***********************
  mapColumn(column, modify) {
    //console.log(column, modify);
    if (column == "Id*") {
      this.paramId = modify;
    } else if (column == "Node*") {
      this.paramNode = modify;
    } else if (column == "Action Time Stamp*") {
      this.paramActionTimeStamp = modify;
    } else {
      this.paramAdditionalMapping = modify;
    }
  }
  trackByMethod(index, item) { }

  // *********************** extract schema for mapping to trigger pipeline ***********************
  extractSchema() {
    try {
      const dataCopy = JSON.parse(JSON.stringify(this.selectedDataSetDetails));
      dataCopy.schema = null
      dataCopy.backingDataset = dataCopy.backingDataset !== "" ? dataCopy.backingDataset : null;
      dataCopy.attributes = JSON.parse(dataCopy.attributes);
      this.busy = this.dataSetService.extractSchema(dataCopy).subscribe((res) => {
        this.schemaValue = res;
        this.mappingData.forEach((item, index) => {
          if (this.schemaValue[index]) {
            item.model = this.schemaValue[index].recordcolumnname;
            if (item.name == "Id*" || item.name == "Node*" || item.name == "Action Time Stamp*")
              this.mapColumn(item.name, item.model)
          }
        })
        this.mappingData[3].model = [];
        this.view = true;
      });
    }
    catch (e) {
      console.error("JSON.parse error - ", e['message']);
    }
  }



  fetchPipelineLogs() {
    let selectedEventObj = this.eventList.filter((event) => event.eventname == this.selectedEvent);
    let jobname = JSON.parse(selectedEventObj[0].jobdetails);
    this.busy = this.dataSetService.getStreamingServicesByName(jobname[0].name).subscribe(res => {
      this.dataitem = res;
      this.viewPipeLineLogs = true;
      if (this.consoleTab)
        this.consoleTab.ngOnInit();

    },
      (error) => {
        this.service.message(error, "Process Mining");
      })
  }


  compareObjects1(o1: any, o2: any): boolean {
    return o1 && o2 && o1 == o2;
  }

  refresh(event) {
    //console.log("in refresh");
    this.refreshFile = false;
    this.changeDetector.detectChanges();
    this.refreshFile = true;
    this.changeDetector.detectChanges();

  }
  gotoDashboard() {
    if (!this.dashboardName)
      return this.service.message("Please input dashboard name", "Process Mining");
    else if (!this.graphTableName)
      return this.service.message("Please input graph table name", "Process Mining");
    else if (!this.edgeTableName)
      return this.service.message("Please input edge table name", "Process Mining");
    else if (!this.selectedEvent) {
      return this.service.message("Please input event name", "Process Mining");
    } else if (!this.processType) {
      return this.service.message("Please input data type", "Process Mining");
    } else if (this.paramId == "" || this.paramNode == "" || this.paramActionTimeStamp == "") {
      return this.service.message("Please map all mandatory fields", "Process Mining");
    } else {
      try {
        let body = {
          "projectName": JSON.parse(sessionStorage.getItem("project")).name,
          "id": JSON.parse(sessionStorage.getItem("project")).id,
          "edgetablename": this.edgeTableName,
          "graphtablename": this.graphTableName,
          "dashboardName": this.dashboardName
        }
        this.busy = this.dataSetService.createDashboardProcess(body).subscribe(res => {
          this.router.navigate(['../../dynamicDashboard/grid/OCC/' + res], { relativeTo: this.route });
        })
      }
      catch (e) {
        console.error("JSON.parse error - ", e['message']);
      }
    }
  }
  tabChange(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.tab.textLabel == "Trigger Pipeline")
      this.extractSchema();
  }
}
