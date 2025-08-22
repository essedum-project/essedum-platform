import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatasetServices } from '../../dataset/dataset-service';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { OptionsDTO } from '../../DTO/OptionsDTO';
@Component({
  selector: 'app-modal-config',
  templateUrl: './modal-config.component.html',
  styleUrls: ['./modal-config.component.scss']
})
export class ModalConfigComponent implements OnInit, OnDestroy {

  @ViewChild('ingest', { static: true }) ingest: ElementRef;
  constructor(private datasetsService: DatasetServices,
    private service: Services,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<ModalConfigComponent>,
    private router: Router,
    private _location: Location,
  ) { }

  datasourcesOpt = [];
  edit: boolean = false;
  data_type: OptionsDTO;
  data_datasource: OptionsDTO;
  data_schema: OptionsDTO;
  data_views: any;
  selectedTags: string[] = [];
  datasourceAllOpt = [];
  data: any = {
    modelName: '',
    description: '',
    datasource: '',
    attributes: {},
    version: '',
    id: ''
  };
  datasources: any = [];
  originalDataSources: any = [];
  isAuth = true
  testSuccessful: boolean = false;
  dataSourceFilterCtrl = new FormControl();
  filteredDataSources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected onDestroy = new Subject<void>();
  busy: Subscription
  isInEdit: boolean = false;

  ngOnInit() {

    // Check for edit-model route with id parameter
    this.route.params.subscribe(params => {
      if (params.id) {
        this.isInEdit = true;
        this.fetchModelDetails(params.id);
      }
    });

    this.findalldatasources();
    this.authentications();
    this.dataSourceFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterDatasources();
      });
  }

  fetchModelDetails(id: any) {
    try {
      this.service.fetchModelDetails(id).subscribe((response) => {
        this.data = response;
        this.data.datasource = response.datasource.name;
      },
        error => {
          console.log('Error while fetching model details:', error);
        });
    }
    catch (Exception) {
      console.log(Exception)
    }
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("model-edit")) this.isAuth = false;
      }
    );
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
      this.datasources.filter(datasource => datasource.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  extractUploadFileName(uploadFilePath: string): string {
    if (!uploadFilePath) return '';
    const pathParts = uploadFilePath.split('/');
    return pathParts[pathParts.length - 1];
  }

  extractDatasourceName(): string {
    return this.data.datasource?.name || '';
  }

  testConnection() {
    try {
      const uploadFileName = this.extractUploadFileName(this.data.attributes?.uploadFile);
      const datasourceName = this.extractDatasourceName();
      const editCanvas = {}
      editCanvas['modelName'] = this.data.modelName;
      editCanvas['datasource'] = datasourceName;
      editCanvas['organisation'] = String(sessionStorage.getItem('organization'));
      editCanvas['attributes'] = JSON.stringify(this.data.attributes);
      editCanvas['description'] = this.data.description;
      this.busy = this.service.testConnectionForModels(editCanvas, uploadFileName).subscribe((response) => {
        this.service.message('Tested! Connected successfully');
        this.testSuccessful = true;
      },
        error => {
          console.log('Test connection error:', error);
          this.service.message(error, 'error');
        });
    }
    catch (Exception) {
      this.service.message("Some error occured", 'error')
    }
  }

  saveOrUpdateModel() {
    try {
      const datasourceName = this.extractDatasourceName();
      const editCanvas = {}
      if (this.isInEdit)
        editCanvas['id'] = this.data.id;
      editCanvas['name'] = this.data.modelName;
      editCanvas['dataSource'] = datasourceName;
      editCanvas['organisation'] = String(sessionStorage.getItem('organization'));
      editCanvas['attributes'] = JSON.stringify(this.data.attributes);
      editCanvas['description'] = this.data.description;
      editCanvas['version'] = this.data?.version;
      this.busy = this.service.registerModel(editCanvas).subscribe((response) => {
        if (!this.isInEdit) {
          this.service.message('Model created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        }
        else {
          this.service.message('Model updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        }
      },
        error => {
          if (!this.isInEdit)
            console.log('Error while saving model:', error);
          else
            this.service.message('Error while updating model:', error);
          this.service.message(error, 'error');
        });
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "Error")
    }
  }

  findalldatasources() {
    this.service.getDatasources()
      .subscribe(res => {
        this.originalDataSources = res.filter(datasource => datasource.category === 'S3');
        this.originalDataSources.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        this.originalDataSources.forEach(element => {
          this.datasources.push(element.alias);
        });
        this.filteredDataSources.next(this.datasources.slice());
        this.originalDataSources.forEach((opt) => {
          let val = { viewValue: opt.alias, value: opt.name };
          this.datasourcesOpt.push(opt.alias)
          this.datasourceAllOpt.push(val)
        })


        setTimeout(() => {

          // Handle edit mode - set datasource value if model was fetched
          if (this.isInEdit && this.data && this.data.datasource) {
            // Find the datasource alias that matches the datasource name
            const matchingDatasource = this.datasourceAllOpt.find(opt =>
              opt.value === this.data.datasource ||
              opt.viewValue === this.data.datasource
            );
            if (matchingDatasource) {
              this.data_datasource = matchingDatasource.viewValue;
              this.onChanginDatasource(matchingDatasource.viewValue);
            }
          }
        }, 500);

      }, err => { },
        () => {

        });
  }

  eventHandler($event) {
    switch ($event) {
      case 'test': this.testConnection();
        break;
      case 'save': this.saveOrUpdateModel();
        break;
    }
  }

  routeBackToList() {
    this._location.back();
  }

  onChanginDatasource(datasourceAlias) {
    let datasourceName;
    this.datasourceAllOpt.forEach((opt) => {
      if (opt.viewValue == datasourceAlias)
        datasourceName = opt.value;
    })
    try {
      const datasource = this.originalDataSources.filter(d => d.name === datasourceName)[0];
      this.data.datasource = JSON.parse(JSON.stringify(datasource));
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }
  }

}