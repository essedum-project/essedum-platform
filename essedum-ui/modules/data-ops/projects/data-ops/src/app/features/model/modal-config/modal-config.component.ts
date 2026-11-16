import { Component, ElementRef,  OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatasetServices } from '../../dataset/dataset-service';
import { Services } from '@essedum/shared-lib';
import { ActivatedRoute, Router } from '@angular/router';
import {  MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { OptionsDTO } from '@essedum/shared-lib';
@Component({
    selector: 'app-modal-config',
    templateUrl: './modal-config.component.html',
    styleUrls: ['./modal-config.component.scss'],
    standalone: false
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

  datasourcesOpt: any[] = [];
  edit: boolean = false;
  data_type: OptionsDTO;
  data_datasource: OptionsDTO;
  data_schema: OptionsDTO;
  data_views: any;
  selectedTags: string[] = [];
  datasourceAllOpt: any[] = [];
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
  schemaBol: any;
  contentVal: boolean = false;
  isCacheable: any = false;
  approvalSubmitting: boolean = false;

  ngOnInit() {
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
          this.service.message('Error while fetching model details', 'error');
        });
    }
    catch (Exception) {
      this.service.message('Error occurred', 'error');
    }
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (value: any) => {
        let permissions: any = null;
        if (typeof value === 'string') {
          try {
            permissions = JSON.parse(value);
          } catch (e) {
            permissions = null;
          }
        } else {
          permissions = value;
        }
        if (Array.isArray(permissions)) {
          this.isAuth = !permissions.some((item: any) => item && item.permission === "model-edit");
        } else {
          this.isAuth = !String(value).includes("model-edit");
        }
      }, () => { }
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
            this.service.message('Error while saving model', 'error');
          else
            this.service.message('Error while updating model', 'error');
          this.service.message(error, 'error');
        });
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "Error")
    }
  }

  findalldatasources() {
    const org = sessionStorage.getItem('organization');
    // Use the same (uncached) source as the Connections list so this dropdown
    // always reflects the current connections for the org. `getDatasources()`
    // memoises + shareReplays with resetOnComplete:false, so a result cached
    // before connections existed would replay an empty list forever.
    this.service.getDatasourceCards(org).subscribe(
      (res) => {
        if (!this.applyDatasources(res)) {
          this.loadDatasourcesFallback();
        }
      },
      () => this.loadDatasourcesFallback()
    );
  }

  private loadDatasourcesFallback() {
    this.service.getDatasources().subscribe(
      (res) => { this.applyDatasources(res); },
      () => { }
    );
  }

  private applyDatasources(res: any): boolean {
    let parsed: any = res;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        parsed = null;
      }
    }
    let list: any = Array.isArray(parsed) ? parsed : null;
    if (!list && parsed && typeof parsed === 'object') {
      const keys = ['content', 'data', 'datasources', 'items', 'results'];
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          list = parsed[key];
          break;
        }
      }
    }
    list = Array.isArray(list) ? list : [];

    this.datasources = [];
    this.datasourcesOpt = [];
    this.datasourceAllOpt = [];
    if (!list.length) {
      return false;
    }

    const modelCapable = list.filter(d => d && d.formodel === true);
    const chosen = modelCapable.length ? modelCapable : list;
    this.originalDataSources = chosen;
    this.originalDataSources.sort((a, b) => {
      const aVal = (a.alias || a.name || '').toLowerCase();
      const bVal = (b.alias || b.name || '').toLowerCase();
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
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

    return true;
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

  getCache($event) {
    this.isCacheable = $event;
  }

  getApprovalStatus(): string {
    return this.data?.approvalStatus || this.data?.approval_status || 'DRAFT';
  }

  hasApprovalStatus(): boolean {
    return this.isInEdit && !!this.getApprovalStatus();
  }

  getApprovalStatusLabel(): string {
    const statusMap: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING_PROJECT_APPROVAL: 'Pending Project Approval',
      PROJECT_APPROVED: 'Project Approved',
      PROJECT_REJECTED: 'Project Rejected',
      PENDING_ORG_APPROVAL: 'Pending Org Approval',
      ORG_APPROVED: 'Org Approved',
      ORG_REJECTED: 'Org Rejected',
      PENDING_PLATFORM_APPROVAL: 'Pending Platform Approval',
      PLATFORM_REJECTED: 'Platform Rejected',
      PUBLISHED: 'Published',
    };
    return statusMap[this.getApprovalStatus()] || this.getApprovalStatus();
  }

  getApprovalStatusClass(): string {
    const classMap: Record<string, string> = {
      DRAFT: 'draft',
      PENDING_PROJECT_APPROVAL: 'pending',
      PROJECT_APPROVED: 'project-approved',
      PROJECT_REJECTED: 'rejected',
      PENDING_ORG_APPROVAL: 'pending',
      ORG_APPROVED: 'org-approved',
      ORG_REJECTED: 'rejected',
      PENDING_PLATFORM_APPROVAL: 'pending',
      PLATFORM_REJECTED: 'rejected',
      PUBLISHED: 'published',
    };
    return classMap[this.getApprovalStatus()] || 'draft';
  }

  showSubmitButton(): boolean {
    const status = this.getApprovalStatus();
    return this.isInEdit && (status === 'DRAFT' || status === 'PROJECT_REJECTED');
  }

  submitForApproval(): void {
    const projectId = JSON.parse(sessionStorage.getItem('project') || '{}')?.id;
    if (!projectId) {
      this.service.message('Project not set. Cannot submit for approval.', 'error');
      return;
    }
    this.approvalSubmitting = true;
    this.service.submitModelForApproval(this.data.id, projectId).subscribe({
      next: () => {
        this.approvalSubmitting = false;
        this.service.message('Model submitted for project approval');
        this.fetchModelDetails(this.data.id);
      },
      error: (err: any) => {
        this.approvalSubmitting = false;
        this.service.message(err?.error?.error || 'Failed to submit for approval', 'error');
      },
    });
  }

}