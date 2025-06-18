import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  Routes,
} from '@angular/router';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { App } from '../app';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ComponentType } from '@angular/cdk/overlay';
import { DynamicRemoteLoad } from './remoteLoad';

@Component({
  selector: 'app-view-app',
  templateUrl: './view-app.component.html',
  styleUrls: ['./view-app.component.scss'],
})
export class ViewAppComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() initiativeData: any;
  url: string = '';
  isBackHovered: boolean = false;
  urlSafe: SafeResourceUrl;
  basicReqTab: any = 'configTab';
  dynamicParamsArray: any[] = [];
  pipeline_attributes: any[];
  paramsDynamic: any = {};
  streamItem: StreamingServices;
  loadScript: boolean = false;
  busy: Subscription;
  redirectChain: string = 'Navigate to chain';
  redirectPipeline: string = 'Navigate to pipeline';
  redirectDataset: string = 'Navigate to dataset';
  tooltipPoition: string = 'above';
  configData: any;
  runTypes: any;
  selectedRunType: any;
  showSpinner = true;
  isrunApp: boolean = false;
  isOverview: boolean = true;
  switchtoVideoView: boolean = false;
  script: any[] = [];
  appname;
  appData: App = new App();
  editAuth: Boolean = false;
  fileData: SafeResourceUrl;
  targetElement: HTMLElement;
  appFile: any;
  mhtmlFileUrl: SafeUrl;
  @ViewChild('pdfIframe') pdfIframe: ElementRef;
  @ViewChild('loadAppContainer', { read: ViewContainerRef })
  loadAppContainer!: ViewContainerRef;
  pdfUrl: string;
  filePresent: boolean = false;
  appRoute;
  dataset: any;
  datasetData: any;
  isVideo: boolean = false;
  addTags: string = 'Add Tags to App';
  appDescription: string;
  createdDate: Date;
  createdBy: string;
  jobName: string;
  appType: string;
  appId: Number;
  apptryoutlink: string;
  type: string;
  isExpand: boolean = true;
  component: any = [];
  autoComponent: any = [];
  linkAuth: boolean;
  relatedloaded = false;
  relatedComponent: any;
  videoUrl: any;
  initiativeView: boolean;
  isMfe: boolean;
  mfeApp: string;
  safeMfeUrl: SafeResourceUrl;
  routes: Routes;
  componentMfe: ComponentType<any>;
  iFrameUrl: SafeResourceUrl;
  fileName: string = '';

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // update/edit-app permission
      if (cipAuthority.includes('edit-app')) this.editAuth = true;
    });
  }

  ngOnInit(): void {
    this.Authentications();
    this.route.params.subscribe((params) => {
      (this.appname = params.name), (this.type = params.type);
    });
    if (this.router.url.includes('initiative')) {
      this.initiativeView = false;
      this.appname = this.initiativeData.name;
      this.type = this.initiativeData.type;
    } else {
      this.initiativeView = true;
    }

    if (this.type == 'overview') {
      this.isOverview = true;
      this.isrunApp = false;
      this.switchtoVideoView = false;
    } else if (this.type == 'runApp') {
      this.isrunApp = true;
      this.isOverview = false;
      this.switchtoVideoView = false;
    } else if (this.type == 'video') {
      this.switchtoVideoView = true;
      this.isOverview = false;
      this.isrunApp = false;
    }
    this.service.getAppByName(this.appname).subscribe((resp) => {
      this.appData.scope = resp['scope'];
      this.appData.jobName = resp['jobName'];
      this.appData.file = resp['file'];
      this.appData.videoFile = resp['videoFile'];
      this.appType = resp['scope'];

      this.apptryoutlink = resp['tryoutlink'];
      this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.apptryoutlink
      );
      if (
        this.appType == 'video' ||
        this.appType == 'pipeline' ||
        this.appType == 'chain'
      ) {
        let paramsJobName: HttpParams = new HttpParams();
        paramsJobName = paramsJobName.set('name', this.appData.jobName);
        paramsJobName = paramsJobName.set('org', resp['organization']);

        this.service.getPipelineByName(paramsJobName).subscribe((respJob) => {
          if (respJob.length > 0) {
            this.jobName = respJob[0]['alias'];
            let relatedJson = {};
            relatedJson['id'] = respJob[0]['cid'];
            relatedJson['type'] = 'PIPELINE';
            relatedJson['alias'] = respJob[0]['alias'];
            relatedJson['description'] = respJob[0]['description'];
            this.relatedComponent = relatedJson;
            this.relatedComponent.data = respJob[0]['target'];
            this.component.push(this.relatedComponent);
            this.autoComponent = this.component;
            this.cdr.detectChanges();
          }
        });
      } else if (this.appType == 'MFE') {
        this.isMfe = true;
        this.safeMfeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          resp['tryoutlink']
        );
        this.isrunApp = false;
        this.isOverview = false;
        this.switchtoVideoView = false;
        this.mfeApp = resp['mfeAppName'];
        this.componentMfe = this.remoteLoad.navigateToRemoteComponent(
          this.mfeApp,
          resp['tryoutlink']
        );
        console.log('view', this.mfeApp);
        console.log('view', this.componentMfe);
      }

      let params: HttpParams = new HttpParams();
      params = params.set('name', this.appname);
      params = params.set('org', resp['organization']);
      this.service
        .getStreamingServicesByName(this.appname, resp['organization'])
        .subscribe((respPipeline) => {
          console.log(respPipeline);
          this.appDescription = respPipeline['description'];
          this.createdBy = respPipeline['created_by'];
          this.createdDate = respPipeline['created_date'];
          this.linkAuth = true;
          this.appId = respPipeline['cid'];
          this.getRelatedComponent();
        });
      this.service.getImage(this.appData.name).subscribe((image) => {
        if (image) this.appData['image'] = image['url'];
      });
      this.service.getAppRoute(this.appname).subscribe((resp) => {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(resp);
      });
      if (this.appData.file != null) {
        this.getFile(this.appData.file);
      }
      if (this.appData.videoFile != null) {
        this.getPresignedUrl(this.appData.videoFile);
      }
      if (this.appData.scope == 'video') {
        this.service.getDataset(this.appData.jobName).subscribe((resp) => {
          this.dataset = resp;
          this.service.getDatasource(this.dataset.datasource).subscribe(
            (resp) => {
              this.dataset.datasource = resp;
              let params = { page: 0, size: 50 };
              this.service
                .getProxyDbDatasetDetails(
                  this.dataset,
                  this.dataset.datasource,
                  params,
                  this.dataset.organization,
                  true
                )
                .subscribe(
                  (resp) => {
                    if (resp.length === 0) {
                      this.service.message(
                        'There is an application error, please contact the application admin',
                        'error'
                      );
                    } else {
                      this.datasetData = resp;
                      let obj = JSON.parse(this.dataset.attributes);
                      this.fileName = obj.path + '/' + obj.object;
                      this.isVideo = true;
                      this.service
                        .getStreamingServicesByName(this.appname)
                        .subscribe((res) => {
                          this.streamItem = res;
                          let json_content = JSON.parse(
                            this.streamItem.json_content
                          );
                          this.configData =
                            json_content['elements'][0]['attributes'][
                              'arguments'
                            ];
                          console.log(this.configData);
                        });
                    }
                  },
                  (err) => {
                    console.log(err);
                    this.service.message(err, 'error');
                  }
                );
            },
            (err) => {
              console.log(err);
            }
          );
        });
      } else {
        this.service
          .getStreamingServicesByName(this.appname)
          .subscribe((res) => {
            this.streamItem = res;
            let json_content = JSON.parse(this.streamItem.json_content);
            this.configData =
              json_content['elements'][0]['attributes']['arguments'];
            console.log(this.configData);
          });
        this.service
          .readScriptFile(this.appname, 'filename')
          .subscribe((resp) => {
            const textDecoder = new TextDecoder('utf-8');

            this.script = textDecoder.decode(resp).split('\n');
          });

        this.service.getAppByName(this.appname).subscribe((resp) => {
          console.log(resp);
          this.appData.id = resp['id'];
          this.appData.name = resp['name'];
          this.appData.tryoutlink = resp['tryoutlink'];
          this.appData.type = resp['type'];
          this.appData.organization = resp['organization'];
          this.appData.scope = resp['scope'];
          this.appData.file = resp['file'];
          this.appData.jobName = resp['jobName'];
          this.appData.videoFile = resp['videoFile'];
          this.service.getImage(this.appData.name).subscribe((image) => {
            this.appData['image'] = image['url'];
          });
          this.service.getAppRoute(this.appname).subscribe((resp) => {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(resp);
          });

          if (this.appData.file != null) {
            this.getFile(this.appData.file);
          }
          if (this.appData.videoFile != null) {
            this.getPresignedUrl(this.appData.videoFile);
          }
        });

        this.service.fetchJobRunTypes2().subscribe((resp) => {
          this.runTypes = resp;
          this.selectedRunType = this.runTypes[0];
        });

        const iframeEle = document.getElementById('iframe');
        const loadingEle = document.getElementById('loading');

        iframeEle.addEventListener('load', function () {
          // Hide the loading indicator
          loadingEle.style.display = 'none';

          // Bring the iframe back
          iframeEle.style.opacity = 'inherit';
        });
      }
    });
  }

  getPresignedUrl(fileName: string) {
    this.service.getPresignedUrl(fileName).subscribe((resp) => {
      this.videoUrl = resp;
    });
  }

  ngAfterViewInit(): void {
    // this.pdfIframe.nativeElement.style.display = 'none';
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private service: Services,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _location: Location,
    private remoteLoad: DynamicRemoteLoad
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'configTab';
        break;
      case 1:
        this.basicReqTab = 'scriptTab';
        break;
      case 2:
        this.basicReqTab = 'jobsTab';
        break;
    }
  }

  getRelatedComponent() {
    this.component = this.autoComponent;
    this.service.getRelatedComponent(this.appId, 'APP').subscribe({
      next: (res) => {
        // this.relatedloaded=true;
        this.relatedComponent = res[0];
        this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
        this.component.push(this.relatedComponent);
        this.cdr.detectChanges();
      },
      complete() {
        console.log('completed');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.getRelatedComponent();
      }, 2000);
    }
  }
  expandCollapse() {
    this.isExpand = !this.isExpand;
  }
  switchToVideoView() {
    this.switchtoVideoView = true;
    this.isOverview = false;
    this.isrunApp = false;
  }
  deleteParamsRow(i) {
    this.dynamicParamsArray.splice(i, 1);
    this.pipeline_attributes = this.dynamicParamsArray;
    return true;
  }

  switchToOverview() {
    this.isrunApp = false;
    this.isOverview = true;
    this.switchtoVideoView = false;
  }
  switchToAppView() {
    this.isrunApp = true;
    this.isOverview = false;
    this.switchtoVideoView = false;
  }
  addParamsRow() {
    if (!this.dynamicParamsArray || this.dynamicParamsArray.length == 0) {
      this.dynamicParamsArray = [];
    }
    this.paramsDynamic = { key: '', value: '' };
    this.dynamicParamsArray.push(this.paramsDynamic);
    this.pipeline_attributes = this.dynamicParamsArray;
    return true;
  }

  onScriptChange($event) {
    this.script = $event;
  }

  runPipeline() {
    this.service
      .runPipeline(
        this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
        this.streamItem.name,
        'NativeScript',
        this.selectedRunType['type'],
        this.selectedRunType['dsName']
      )
      .subscribe((pageResponse) => {
        console.log(pageResponse);
        this.service.message('Job Started', 'success');
      });

    // this.busy = this.service.runpipeline2(this.streamItem.name,this.selectedRunType['type'],this.selectedRunType['dsName']).subscribe(
    //   pageResponse => {
    //     console.log(pageResponse)
    //   }
    // );
  }

  open(content: any): void {
    this.dialog.open(content, {
      width: '400px',
      panelClass: 'mini-dialog',
    });
  }

  openLgModal(content: any): void {
    this.dialog.open(content, {
      width: '80vw',
      panelClass: 'wide-dialog',
    });
    setTimeout(() => {
      this.showSpinner = false;
    }, 500);
  }

  openInNewTab() {
    window.open(this.apptryoutlink, '_blank');
  }
  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }
  openWdModal(content: any): void {
    this.dialog.open(content, {
      width: '80vw',
      panelClass: 'wide-dialog',
    });
  }
  openModal(content: any): void {
    this.dialog.open(content, {
      width: '830px',
      panelClass: 'standard-dialog',
    });
  }

  updateUrl() {
    console.log(this.appData.tryoutlink);
    this.service.saveApp(this.appData).subscribe((resp) => {
      console.log(resp);
    });
    this.service.getAppRoute(this.appname).subscribe((resp) => {
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(resp);
    });
  }

  saveScript() {
    const formData: FormData = new FormData();
    let script = this.script.join('\n');
    let scriptFile = new Blob([script], { type: 'text/plain' });
    formData.set('scriptFile', scriptFile);
    this.service
      .saveNativeScript(this.appname, 'python3', formData)
      .subscribe((resp) => {
        console.log(resp);
      });
    let json_content = JSON.parse(this.streamItem.json_content);
    json_content['elements'][0]['attributes']['arguments'] = this.configData;
    this.streamItem.json_content = JSON.stringify(json_content);

    this.service.update(this.streamItem).subscribe((resp) => {
      this.service.message('Script saved Successfully', 'success');
    });
  }

  toggler() {
    this._location.back();
  }

  redirectToPipeline() {
    this.service
      .getStreamingServicesByName(this.appData.jobName)
      .subscribe((res) => {
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
            ['../../pipelines/view' + '/' + this.appData.jobName],
            navigationExtras
          );
        } else {
          this.router.navigate(
            ['../../pipelines/view/drgndrp' + '/' + this.appData.jobName],
            navigationExtras
          );
        }
      });
  }

  redirectToChain() {
    this.service
      .getStreamingServicesByName(this.appData.jobName)
      .subscribe((res) => {
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
            ['../../chain-list/view' + '/' + this.appData.jobName],
            navigationExtras
          );
        } else {
          this.router.navigate(
            ['../../chain-list/view/drgndrp' + '/' + this.appData.jobName],
            navigationExtras
          );
        }
      });
  }

  redirectToDataset(dataset) {
    if (dataset)
      this.router.navigate(['../../datasets/data'], {
        state: { selectedCard: dataset },
        relativeTo: this.route,
      });
  }

  getFile(fileId) {
    // var mhtml2html = require('mhtml2html');

    this.service.getFile(fileId).subscribe((resp) => {
      this.appFile = new Blob([resp], { type: 'application/pdf' });

      this.pdfUrl = URL.createObjectURL(this.appFile);

      this.pdfIframe.nativeElement.style.display = 'block';

      this.pdfIframe.nativeElement.src = this.pdfUrl;

      this.filePresent = true;
      // this.appFile = new Blob([resp],{type: 'text/html'});
      // this.mhtmlFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.appFile));
    });
  }
}
