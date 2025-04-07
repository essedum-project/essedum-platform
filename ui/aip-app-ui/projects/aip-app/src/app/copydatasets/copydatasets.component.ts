import { Component,OnInit, OnDestroy } from '@angular/core';
import { Services } from '../services/service';
// import { DatasetsService } from '../../entities/datasets/datasets.service';
// import { GroupsService } from '../../entities/groups/groups.service';
// import { SchemaRegistryService } from '../schema-registry/schema-registry.service';
// import { DatasourceService } from '../../entities/datasource/datasource.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject, ReplaySubject, Subscription } from 'rxjs';
import { SchemaRegistryService } from '../services/schema-registry.service';
import { DatasetServices } from '../dataset/dataset-service';
// import { MessageService } from '../../sharedModule/service/message.service';

@Component({
  selector: 'app-copydatasets',
  templateUrl: './copydatasets.component.html',
  styleUrls: ['./copydatasets.component.scss']
})
export class CopydatasetsComponent implements OnInit, OnDestroy {
  constructor(private datasetsService: DatasetServices,
    private service: Services,
    private datasourceService: Services,
    public schemaRegistryService: SchemaRegistryService) { }

  datasetObjects: any = [];
  datasets: any = [];
  projects: any = [];
  checked = false;
  project: any = sessionStorage.getItem('organization')
  filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredDataSources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  fromfilteredDataSources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  datasetFilterCtrl = new FormControl();
  datasourceCtrl = new FormControl();
  fromdatasourceCtrl = new FormControl();
  selectedDatasets = new FormControl();
  datasources: any = []
  fromdatasources: any = []
  dataSourceFilterCtrl = new FormControl();
  fromdataSourceFilterCtrl = new FormControl();
  check: boolean = false;
  protected onDestroy = new Subject<void>();
  finalDatasets: any = []
  pointerevent: string = "auto";
  busy: Subscription;
  projectId;
  projectName;
  create = false;
  coreDatasource;
  fromfilteredDataSources1: any = []
  filteredDataSources1: any = []
  filteredDatasets1: any = []
  todatasource: any

  ngOnInit() {
    this.projectName = sessionStorage.getItem('organization')
    this.busy = this.datasourceService.getDatasourcesNames1("Core").subscribe(res=>{
      this.coreDatasource = res
    })
    this.busy = this.datasourceService.getDatasourcesNames().subscribe(res=>{
      this.fromdatasources = res
      this.fromdatasources = this.fromdatasources.filter(ele=> this.coreDatasource.findIndex(x => x.name === ele.name)<0)
      // this.fromfilteredDataSources.next(this.fromdatasources.slice());
      res.forEach((ele: any) => {
        this.fromfilteredDataSources1.push({ viewValue: ele.alias, value: ele })
      })
    })
    this.fetchProject();
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

      this.fromdataSourceFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.fromfilterDatasources();
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  fetchProject() {
    this.busy =  this.datasetsService.getProjectNames().subscribe(res => {
      res.forEach((ele: any) => {
        this.projects.push({ viewValue: ele, value: ele })
      })
      // this.projects.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
      // let index = this.projects.indexOf(sessionStorage.getItem("organization"));
      // this.projects.splice(index, 1)
    })
  }

  OnProjectChange(project) {
    this.project = project;
    this.busy = this.datasetsService.getProjectByName(project).subscribe(res => {
      this.projectId = res.id
    })
    this.findalldatasources(project);
  }

  getDatasetsforDatasource(datasource) {
    this.busy =  this.datasetsService.getDatasetNamesByDatasource(datasource).subscribe(res => {
      this.datasets = res;
      // this.filteredDatasets.next(this.datasets.slice());
      res.forEach((ele: any) => {
        this.filteredDatasets1.push({ viewValue: ele.alias, value: ele })
      })
    })
  }

  OnDatasourceChange(datasource) {
    this.getDatasetsforDatasource(datasource.name)
    this.todatasource = datasource.name
  }

  filterDatasets() {
    if (!this.filteredDatasets1) {
      return;
    }
    let search = this.datasetFilterCtrl.value;
    if (!search) {
      this.filteredDatasets1.next(this.datasets.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDatasets1.next(
      this.datasets.filter(dataset => dataset.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  editDatasets() {
    this.check = !this.check
    if (this.check) {
      this.datasets.forEach(element => {
        this.finalDatasets.push(element.name)
      });
      this.selectedDatasets.setValue([]);
    }
    else {
      this.finalDatasets = [];
    }
  }

  onSave() {
    let datasetss = []
    if (this.finalDatasets.length == 0) {
      if (this.selectedDatasets.value != null) {
        this.selectedDatasets.value.forEach(element => {
          datasetss.push(element.name);
        });
      }
      else {
        this.service.message('Error!', "Please select Datasets.");
        return;
      }
    }
    else {
      datasetss = this.finalDatasets;
    }

    this.copyDatasets(datasetss);
  }

  copyDatasets(datasets) {
    this.pointerevent = "none";
    this.busy = this.datasetsService.copyDatasets(sessionStorage.getItem('organization'), this.project, datasets, this.projectId, this.todatasource).subscribe(
      (res) => {
        this.service.message("Copy datasets has started. Please check the Job Status", "IAMP");
        this.pointerevent = "auto";
      },
      (error) => {
        if (error instanceof TypeError)
          this.service.message("Copy datasets has already been done for this project", "IAMP");
        else if (error == "Scheduler Paused") {
          this.service.message("Scheduler paused. Please resume and retrigger", "error");
        }
        else this.service.message("Copy datasets failed", "IAMP");
          this.pointerevent = "auto";
      },
      () => {
        this.create = false
      }
    );
  }

  findalldatasources(project) {
    this.busy = this.datasourceService.getDatasourcesNames1(project)
      .subscribe(res => {
        this.datasources = res;
        this.datasources = this.datasources.filter(ele=> this.coreDatasource.findIndex(x => x.name === ele.name)<0)
        // this.filteredDataSources.next(this.datasources.slice());
        res.forEach((ele: any) => {
          this.filteredDataSources1.push({ viewValue: ele.alias, value: ele })
        })
      });
  }

  filterDatasources() {
    if (!this.datasources) {
      return;
    }
    let search = this.dataSourceFilterCtrl.value;
    if (!search) {
      this.filteredDataSources1.next(this.datasources.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDataSources1.next(
      this.datasources.filter(datasource => datasource.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  fromfilterDatasources() {
    if (!this.fromdatasources) {
      return;
    }
    let search = this.fromdataSourceFilterCtrl.value;
    if (!search) {
      this.fromfilteredDataSources.next(this.fromdatasources.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.fromfilteredDataSources.next(
      this.fromdatasources.filter(datasource => datasource.alias.toLowerCase().indexOf(search) > -1)
    );
  }
}
