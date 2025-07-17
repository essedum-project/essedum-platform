import {
  Component,
  DebugElement,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import { Services } from '../../services/service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { ChooseRuntimeComponent } from '../choose-runtime/choose-runtime.component';
import { Location } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { CreateAppComponent } from '../create-app/create-app.component';

@Component({
  selector: 'app-view-apps',
  templateUrl: './app-list.component.html',
  styleUrl: './app-list.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AppListComponent implements OnInit {
  editable: boolean = false;
  isSearchHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isMenuHovered: boolean = false;
  isFilterHovered: boolean = false;
  loading: boolean = true;
  alias: any;
  filter: string = '';
  pageNumber = 1;
  pageSize = 6;
  noOfItems: number;
  noOfPages: number = 0;
  pageChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  pageNumberInput: number = 1;
  itemsPerPage: number[] = [];
  pageArr: number[] = [];
  editAuth: Boolean = false;
  records: boolean = false;
  streamItem: StreamingServices;
  app: any;
  status: string;
  isExpanded = false;
  tooltip: string = 'above';
  newCanvas: any;
  lastest_job: boolean;
  jobslist: any = [];
  jobstatuslist: any = {};
  selectedTag = [];
  selectedTagType = [];
  selectedTagList: any[];
  filterShow: boolean = false;
  servicev1 = 'apps';
  tagrefresh: boolean = false;
  selectedRuntime: any;
  idealTimeout: any;
  organization: any;
  appConstantsKey: string = 'icip.app.includeCore';
  hoverStates: boolean[] = [];
  isRefreshing: boolean = false;
  isPrevHovered = false;
  isNextHovered = false;
  lastRefreshedTime: Date | null = null;
  cardTitle: String = 'Apps';
  hasFilters = false;
  selectedAppTypeList: string[] = [];

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // update/edit-app permission
      if (cipAuthority.includes('edit-app')) this.editAuth = true;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.idealTimeout);
    this.idealTimeout = setTimeout(() => {
      this.updatePageSize();
    }, 2000);
  }

  updatePageSize() {
    this.pageSize = 0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [15, 30, 45, 60, 75, 90];
      this.pageSize = this.pageSize || 16; // xl
      this.getAllApps();
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [12, 24, 36, 48, 60, 72];
      this.pageSize = this.pageSize || 12; // lg
      this.getAllApps();
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [6, 12, 24, 36, 48, 60];
      this.pageSize = this.pageSize || 6; //md
      this.getAllApps();
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getAllApps();
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [3, 6, 9, 12, 15, 18];
      this.pageSize = this.pageSize || 3; //xs
      this.getAllApps();
    }
  }

  ngOnInit(): void {
    this.records = false;
    this.loading = true;
    this.isRefreshing = true;
    this.Authentications();
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'] ? params['search'] : '';
        this.selectedTagType = params['type'] ? params['type'].split(',') : [];
        this.selectedTag = params['tagId'] ? params['tagId'].split(',') : [];
        // this.selectedAdapterInstance = params['adapterInstance']
        //   ? params['adapterInstance'].split(',')
        //   : [];
      } else {
        this.pageNumber = 1;
        this.filter = '';
      }
    });
    // this.selectedTagType=this.selectedTagType;
    // this.updateQueryParam(this.pageNumber,this.filter);
    this.service
      .getConstantByKey(this.appConstantsKey)
      .subscribe((response) => {
        if (response.body == 'true')
          this.organization = 'Core,' + sessionStorage.getItem('organization');
        else this.organization = sessionStorage.getItem('organization');

        this.getAllApps(this.pageNumber, this.pageSize, this.filter);
        if (this.pageNumberChanged) {
          this.pageNumber = 1;
          this.startIndex = 0;
          this.endIndex = 5;
        }
        this.updatePageSize();
      });
    this.lastRefreshTime();
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    type: string = '',
    tagId: string = '',
    // adapterInstance: string = '',
    org: string = this.organization,
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: type,
          tagId: tagId,
          // adapterInstance: adapterInstance,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  constructor(
    private location: Location,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private el: ElementRef
  ) {}

  appData = [];

  getAllApps(page?: any, size?: any, filter?: any) {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', this.organization);
    params = params.set('isCached', true);
    params = params.set('adapter_instance', 'internal');
    params = params.set('interfacetype', 'App');
    if (this.selectedTagType.length >= 1)
      params = params.set('type', this.selectedTagType.toString());
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    this.service.getPipelinesCards(params).subscribe((res) => {
      this.appData = res.filter((res) => res.type == 'App');
      this.loading = false;
      this.appData.forEach((app, index) => {
        this.service.getAppByName(app.name).subscribe((resp) => {
          this.appData[index]['scope'] = resp.scope;
          if (resp.videoFile) {
            this.appData[index]['isvideoPresent'] = true;
          } else {
            this.appData[index]['isvideoPresent'] = false;
          }
        });
        this.service.getImage(app['name']).subscribe((image) => {
          this.appData[index]['image'] = image['url'];
        });
      });
    });
    this.getCountPipelines();
    // this.selectedTagType=this.selectedTagType;
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedTagType.toString(),
      this.selectedTag.toString()
    );
  }

  openApp(app: StreamingServices, type) {
    this.service.getAppByName(app.name).subscribe((resp) => {
      if (resp.scope == 'MFE') {
        console.log('MFE');
      } else if (resp.scope == 'external' && type == 'runApp') {
        window.open(resp.tryoutlink, '_blank');
        return;
      }
      this.router.navigate(['../app/' + app.name + '/' + type], {
        queryParams: {
          page: this.pageNumber,
          search: this.filter,
          type: this.selectedTagType.toString(),
          tagId: this.selectedTag.toString(),
          // adapterInstance: this.selectedAdapterInstance.toString(),
          org: this.organization,
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',

        relativeTo: this.route,
      });
    });
  }

openAddedit(edit: boolean = false, app?: any): void {
  const dialogRef = this.dialog.open(CreateAppComponent, {
    height: '80%',
    width: '60%',
    minWidth: '60vw',
    disableClose: true,
    data: {
      edit: edit,
      appName: app?.name,
      appcid: app?.cid
    },
  });
  dialogRef.afterClosed().subscribe((result) => {
    if (result==="refresh") {
      this.ngOnInit();
    }
  });
}

  tagSelectedEvent(event) {
    this.selectedTag = event.getSelectedTagList();
    this.selectedTagType = event.getSelectedAdapterType();
    this.tagrefresh = false;
    this.getAllApps();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    // this.selectedTag = [];
    // this.selectedTagType = [];
    this.ngOnInit();
  }
  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '80%', margin: '0 0 0 20%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  deleteApp(index) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .deleteStreamingService(this.appData[index]['cid'])
          .subscribe((resp) => {
            this.getAllApps();
          });
        this.service
          .getAppByName(this.appData[index]['name'])
          .subscribe((resp) => {
            this.service.deleteApp(resp.id).subscribe();
          });
        this.service.messageNotificaionService(
          'success',
          'Deleted Successfully'
        );
      }
    });
  }

  searchApp(searchText?: string) {
    if (searchText !== undefined) {
      this.filter = searchText;
    }

    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('page', (this.pageNumber = 1));
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);
    if (this.selectedTagType.length >= 1)
      params = params.set('type', this.selectedTagType.toString());
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    params = params.set('adapter_instance', 'internal');
    params = params.set('interfacetype', 'App');

    this.service.getPipelinesCards(params).subscribe((res) => {
      this.appData = res.filter((res) => res.type == 'App');
      this.loading = false;
      this.appData.forEach((app, index) => {
        this.service.getImage(app['name']).subscribe((image) => {
          this.appData[index]['image'] = image['url'];
        });
      });
      if (this.appData.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
      this.getCountPipelines();
    });
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedTagType.toString(),
      this.selectedTag.toString()
    );
  }
  getCountPipelines() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);

    // params = params.set('type', 'App');
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', this.organization);
    params = params.set('isCached', true);
    params = params.set('cloud_provider', 'internal');
    params = params.set('interfacetype', 'App');
    if (this.selectedTagType.length >= 1)
      params = params.set('type', this.selectedTagType.toString());
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    });
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.getAllApps();
  }

  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getAllApps();
  }
  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#0094ff' };
    else return { color: 'black' };
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  open(content: any): void {
    this.dialog.open(content, {
      width: '400px',
      panelClass: 'mini-dialog',
    });
  }

  startInternalApp(app) {
    this.app = app;
    let json = JSON.parse(this.app.target.json_content);
    const dialogRef = this.dialog.open(ChooseRuntimeComponent, {
      height: 'max-content',
      width: 'max-content',
      maxHeight: '70vh',
      disableClose: false,
      data: json,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedRuntime = result;
        this.runNativeScript(this.app);
      } else dialogRef.close();
    });
  }

  startApp(app) {
    this.app = app;
    this.service.getAppByName(app.name).subscribe((resp) => {
      this.service
        .getStreamingServicesByName(resp.jobName, resp.organization)
        .subscribe((response) => {
          this.streamItem = response;
          let json = JSON.parse(this.streamItem.json_content);
          if (
            this.app.scope == 'Apps' &&
            json.hasOwnProperty('default_runtime')
          ) {
            let default_runtime = JSON.parse(json.default_runtime);
            this.selectedRuntime = default_runtime;
            if (this.streamItem.type == 'NativeScript') {
              this.runNativeScript(this.streamItem);
            } else {
              this.service
                .savePipelineJSON(
                  this.streamItem.name,
                  this.streamItem.json_content
                )
                .subscribe(
                  (res) => {
                    this.service.message('Saving Pipeline Json!', 'success');
                    this.triggerEvent(res.path);
                  },
                  (error) => {
                    this.service.message('Could not save the file', 'error');
                  }
                );
            }
          } else {
            const dialogRef = this.dialog.open(ChooseRuntimeComponent, {
              height: 'max-content',
              width: 'max-content',
              maxHeight: '70vh',
              disableClose: false,
              data: json,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.selectedRuntime = result;
                if (this.streamItem.type == 'NativeScript') {
                  this.runNativeScript(this.streamItem);
                } else {
                  this.service
                    .savePipelineJSON(
                      this.streamItem.name,
                      this.streamItem.json_content
                    )
                    .subscribe(
                      (res) => {
                        this.service.message(
                          'Saving Pipeline Json!',
                          'success'
                        );
                        this.triggerEvent(res.path);
                      },
                      (error) => {
                        this.service.message(
                          'Could not save the file',
                          'error'
                        );
                      }
                    );
                }
              } else dialogRef.close();
            });
          }
        });
    });
  }
  triggerEvent(path) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] };
    this.service
      .triggerPostEvent('generateScript_' + this.streamItem.type, body, '')
      .subscribe(
        (resp) => {
          this.service.message('Generating Script!', 'success');
          this.service.getEventStatus(resp).subscribe((status) => {
            if (status == 'COMPLETED') this.runScript();
            else {
              console.log(status);
              this.service.message('Script is not generated.', 'error');
            }
          });
        },
        (error) => {
          // this.service.message('Could not get the results', 'error');
          this.service.message('Error! Could not generate script.', 'error');
        }
      );
  }
  runScript() {
    // if(this.isScript){
    let passType = '';
    if (
      this.streamItem.type != 'Binary' &&
      this.streamItem.type != 'NativeScript'
    )
      passType = 'DragAndDrop';
    else passType = this.streamItem.type;
    // passType = this.type
    this.service
      .runPipeline(
        this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
        this.streamItem.name,
        passType,
        this.selectedRuntime.type,
        this.selectedRuntime.dsName,
        'generated'
      )
      .subscribe(
        (res) => {
          this.service.message('Pipeline has been Started!', 'success');
          let job_id = JSON.parse(res).jobId;
          job_id = job_id.replaceAll('-', '');
          this.service
            .getStreamingServicesByName(this.app.name, this.app.organization)
            .subscribe((response) => {
              this.newCanvas = JSON.parse(response.json_content);
              this.newCanvas['latest_jobid'] = job_id;
              response.json_content = JSON.stringify(this.newCanvas);
              this.service.update(response).subscribe((response) => {
                this.lastest_job = true;
              });
            });
          // this.getStatus()
        },
        (error) => {
          this.service.message('Some error occured.', 'error');
        }
      );
    // }else{
    //   this.service.message('Please generate script to run pipeline.', 'error');
    // }
  }
  getLatestJobId(app) {
    let json = JSON.parse(app.target.json_content);
    if (json.latest_jobid) return json.latest_jobid;
    else return false;
  }

  stopJob(jobid) {
    this.service.stopPipeline(jobid).subscribe(
      (response) => {
        this.service.message('Stop App Triggered!', 'success');
      },
      (error) => {
        this.service.message('Error!', 'error');
      }
    );
  }

  runNativeScript(pipeline) {
    this.service
      .runPipeline(
        pipeline.alias ? pipeline.alias : pipeline.name,
        pipeline.name,
        'NativeScript',
        this.selectedRuntime['type'],
        this.selectedRuntime['dsName']
      )
      .subscribe(
        (res) => {
          this.service.message('Pipeline has been Started!', 'success');
          let job_id = JSON.parse(res).jobId;
          job_id = job_id.replaceAll('-', '');
          this.service
            .getStreamingServicesByName(this.app.name, this.app.organization)
            .subscribe((response) => {
              this.newCanvas = JSON.parse(response.json_content);
              this.newCanvas['latest_jobid'] = job_id;
              response.json_content = JSON.stringify(this.newCanvas);
              this.service.update(response).subscribe((response) => {
                this.lastest_job = true;
              });
            });
        },
        (error) => {
          this.service.message('Could not get the results', 'error');
        }
      );
  }

  navigate(app: StreamingServices) {
    this.service.getAppByName(app.name).subscribe((resp) => {
      if (resp.scope == 'pipeline') {
        this.redirectToPipeline(resp.jobName);
      } else if (resp.scope == 'chain') {
        this.redirectToChain(resp.jobName);
      }
    });
  }

  redirectToPipeline(jobName) {
    this.service.getStreamingServicesByName(jobName).subscribe((res) => {
      this.streamItem = res;
      const navigationExtras: NavigationExtras = {
        state: {
          cardTitle: 'Pipeline',
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: this.streamItem,
        },
        relativeTo: this.route,
      };
      if (this.streamItem.type === 'NativeScript') {
        this.router.navigate(
          ['../pipelines/view' + '/' + jobName],
          navigationExtras
        );
      } else {
        this.router.navigate(
          ['../pipelines/view/drgndrp' + '/' + jobName],
          navigationExtras
        );
      }
    });
  }

  redirectToChain(jobName) {
    this.service.getStreamingServicesByName(jobName).subscribe((res) => {
      this.streamItem = res;
      const navigationExtras: NavigationExtras = {
        state: {
          cardTitle: 'Pipeline',
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: res,
        },
        relativeTo: this.route,
      };
      if (this.streamItem.type === 'NativeScript') {
        this.router.navigate(
          ['../chain-list/view' + '/' + jobName],
          navigationExtras
        );
      } else {
        this.router.navigate(
          ['../chain-list/view/drgndrp' + '/' + jobName],
          navigationExtras
        );
      }
    });
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
      console.log('Data refreshed!');
    }, 1000);
  }

  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }

  get shouldShowEmptyState(): boolean {
    return !this.loading && (!this.appData || this.appData.length === 0);
  }

  get shouldShowPagination(): boolean {
    return this.appData && this.appData.length > 0;
  }
}
