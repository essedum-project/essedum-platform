import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { FileUploader } from 'ng2-file-upload';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { App } from '../../apps/app';
import { AppListComponent } from '../../apps/app-list/app-list.component';
import { PipelineService } from '../../services/pipeline.service';
import { HttpParams } from '@angular/common/http';
import { DatasetServices } from '../../dataset/dataset-service';
import { Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
})
export class CreateAppComponent implements OnInit {
  @Output() responseLink = new EventEmitter<any>();
  public uploader: FileUploader;
  public docUploader: FileUploader;
  urlSafe: SafeResourceUrl;
  url: string = 'https://victlpast02:7875/';

  name = '';
  alias = '';
  description = '';
  finalImage;
  type = 'App';
  inputColumns = new FormControl('', Validators.required);
  isAuth: any = false;
  @Input() edit: boolean;
  @Input('dataset') matData: any;
  @Input() appcid?: any;
  @Input() appName?: any;
  appEdit: any;
  editAlias: any;
  editCanvas: any = [];
  videoFile: string;
  isTemplate: boolean = false;
  isCloseHovered: boolean = false;
  public data: any;
  logoUploaded: boolean = false;
  chunkMetadata = {};
  exceededSize: boolean = false;
  chunkSize = 200000;
  @ViewChild('myImage', { static: false }) myImage;
  app: App = new App();
  tagsSelected;
  tagsOptions = [];
  tags: any = '';
  editImgId: any;
  appTypeList = [
    { viewValue: 'External link', value: 'external' },
    { viewValue: 'Embedded link', value: 'embed' },
  ];
  typeApp: string = 'Apps';
  isChain: boolean = false;
  isMFEApp: boolean = false;
  isUrl: boolean = false;
  isPipeline: boolean = false;
  isVideo: boolean = false;
  chainList = [];
  pipelineList = [];
  videoDatasetList = [];
  fileExtension: string;
  apptype;
  jobName;
  file: string;
  docName: any;
  appObj: App;
  disableSave: boolean = false;
  appFile: any;
  link: string;
  supportedDoc: boolean = true;
  isLoaded: boolean = false;
  uploadPercentage: number;
  stompClient: any;
  uploading: boolean;
  storageAttributes: any = {};
  appMfe: any;
  mfeList: any;
  isDefaultLink: boolean = false;
  pipelineListApps: any = [];
  isApp: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public inputDetails: any,
    private Services: Services,
    private dialogRef: MatDialogRef<CreateAppComponent>,
    private route: ActivatedRoute,
    public router: Router,
    public sanitizer: DomSanitizer,
    @Optional() @SkipSelf() private appListComponent: AppListComponent,
    private pipelineService: PipelineService,
    private datasetsService: DatasetServices
  ) {}

  ngOnInit() {
    this.edit = this.inputDetails.edit;
    this.appcid = this.inputDetails.appcid;
    this.appName = this.inputDetails.appName;
    this.editApp();
    this.logoUploaded = false;
    this.uploader = new FileUploader({
      url: this.url,
      allowedFileType: ['image'],
    });
    this.docUploader = new FileUploader({
      url: this.url,
      allowedFileType: ['pdf'],
    });
    this.authentications();
    if (this.data) {
      if (this.data.type) {
        this.type = this.data.type;
      }
      let databckp = _.cloneDeep(this.data);
      if (this.data?.action) {
        this.data.canvasData = databckp;
        delete this.data.canvasData.created_date;
      }
    }
    this.fetchTags();
    this.getChains();
    this.getPipelines();
    this.getPipelinesApps();
    this.getVideoDatasets();
    this.getMfeApps();
  }

  getMfeApps() {
    this.mfeList = [];
    this.Services.getMfeAppConfig().subscribe(async (response) => {
      Object.keys(response).forEach((element: any) => {
        this.mfeList.push({ viewValue: element, value: element });
      });
    });
  }

  getVideoDatasets() {
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('views', 'Video View');
    this.Services.getVideoDatasets(params).subscribe((res) => {
      res.forEach((element: any) => {
        this.videoDatasetList.push({
          viewValue: element.alias,
          value: element.name,
        });
      });
    });
  }

  authentications() {
    this.Services.getPermission('cip').subscribe((cipAuthority) => {
      // edit/update permission
      if (cipAuthority.includes('edit-app')) this.isAuth = false;
    });
  }

  checkAll(event) {
    this.isTemplate = event;
  }

  fetchTags() {
    this.Services.getMlTags().subscribe((res) => {
      this.tagsSelected = res;
      this.tagsSelected.forEach((opt) => {
        let val = { viewValue: opt.label, value: opt.label };
        this.tagsOptions.push(val);
      });
    });
  }
  saveDetails() {
    if (
      this.apptype == undefined ||
      this.alias == undefined ||
      this.alias == '' ||
      (this.jobName == undefined &&
        (this.apptype == 'video' ||
          this.apptype == 'pipeline' ||
          this.apptype == 'chain'))
    ) {
      this.Services.message('Please fill all the mandatory details', 'error');
    } else {
      try {
        const newCanvas = new StreamingServices();
        newCanvas.alias = this.alias;
        newCanvas.description = this.description;
        newCanvas.type = 'App';
        newCanvas.interfacetype = 'App';
        newCanvas.is_template = this.isTemplate;
        const temp = [];
        if (this.inputColumns.value != null) {
          if (Array.isArray(this.inputColumns.value)) {
            newCanvas.groups = this.inputColumns.value;
          }
        }
        this.Services.create(newCanvas).subscribe(
          (data: StreamingServices) => {
            data.json_content = JSON.stringify({
              elements: [
                {
                  attributes: {
                    filetype: 'Python3',
                    files: [
                      data.name +
                        '_' +
                        sessionStorage.getItem('organization') +
                        '.py',
                    ],
                    arguments: [{ name: 'App', value: data.alias }],
                    dataset: [],
                  },
                },
              ],
            });
            this.Services.update(data).subscribe();

            this.Services.saveImage(
              this.alias,
              data.name,
              this.chunkMetadata['FileName'],
              'image/png/jpg',
              this.finalImage
            ).subscribe((resp) => {});
            this.app.name = data.name;
            this.app.organization = sessionStorage.getItem('organization');
            this.app.status = null;
            this.app.tryoutlink = this.link;
            this.app.type = 'App';
            this.app.scope = this.apptype;
            this.app.file = this.file;
            this.app.jobName = this.jobName;
            this.app.videoFile = this.videoFile;
            this.app.mfeAppName = this.appMfe;
            this.Services.saveApp(this.app).subscribe((app) => {
              this.responseLink.emit(app);
            });
            this.Services.message('Created Sucessfully.', 'success');
            this.Services.addGroupModelEntity(data.name, temp).subscribe();
            this.dialogRef.close('refresh');
            if (this.appListComponent) this.appListComponent.ngOnInit();
          },
          (error) => this.Services.message(error, 'error')
        );
      } catch (Exception) {
        this.Services.message('Some error occured '+ Exception, 'error');
      }
    }
  }

  closeModal() {
    this.dialogRef.close();
    if (this.router.url.includes('/initiative')) {
    }
  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    } catch (Exception) {
      this.Services.message('Some error occured '+ Exception, 'error');
    }
  }

  dropChange(val) {
    if (this.data && this.data.canvasData) {
      this.data.canvasData.groups = this.inputColumns.value;
    }
  }

  onImageChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Clear the queue
    this.uploader.clearQueue();

    // Add the file using the uploader's API
    this.uploader.addToQueue([file]);
    if (this.uploader.queue[0].file.size <= 250000) {
      this.logoUploaded = true;
      let possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]=-)(*&^%$#@!~`";
      const lengthOfCode = 40;
      this.chunkMetadata['FileGuid'] = this.makeRandom(lengthOfCode, possible);
      this.chunkMetadata['FileName'] = this.uploader.queue[0]._file.name;
      this.chunkMetadata['TotalCount'] = Math.ceil(
        this.uploader.queue[0]._file.size / this.chunkSize
      );
      this.chunkMetadata['FileSize'] = this.uploader.queue[0]._file.size;
      this.chunkMetadata['FileType'] = this.uploader.queue[0]._file.type;
      this.exceededSize = false;
      this.editCanvas.url = '';
      var reader = new FileReader();
      if (!this.edit && this.myImage?.nativeElement) {
        var image = this.myImage.nativeElement;
        reader.onload = (e: any) => {
          var src = e.target.result;
          image.src = src;
          this.finalImage = image.src;
        };
      } else {
        reader.onload = (e: any) => {
          var src = e.target.result;
          this.finalImage = src;
        };
      }
      reader.readAsDataURL(event.target.files[0]);
    } else {
      this.exceededSize = true;
      this.uploader.queue = [];
    }
  }

  makeRandom(lengthOfCode: number, possible: string) {
    let text = '';
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(
        Math.floor(
          (window.crypto.getRandomValues(new Uint32Array(1))[0] /
            (0xffffffff + 1)) *
            possible.length
        )
      );
    }
    return text;
  }

  editApp() {
    if (this.edit) {
      this.Services.getStreamingServices(this.appcid).subscribe((res) => {
        this.appEdit = res;
        this.editCanvas['alias'] = res.alias;
        this.editCanvas['description'] = res.description;
        this.Services.getAppByName(this.appName).subscribe((resp) => {
          this.appObj = resp;
          this.editCanvas['tryoutlink'] = resp.tryoutlink;
          this.editCanvas['scope'] = resp['scope'];
          this.editCanvas['file'] = resp['file'];
          this.editCanvas['videoFile'] = resp['videoFile'];
          this.editCanvas['url'] = resp['url'];
          this.editCanvas['mfeAppName'] = resp['mfeAppName'];
          this.appMfe = this.editCanvas['mfeAppName'];
          if (this.editCanvas.scope === 'MFE') this.isMFEApp = true;
          if (this.editCanvas.scope === 'url') this.isUrl = true;
          if (this.editCanvas.scope === 'chain') {
            this.isChain = true;
          }
          if (this.editCanvas.scope === 'pipeline') {
            this.isPipeline = true;
          }
          if (this.editCanvas.scope === 'Apps') {
            this.isApp = true;
          }
          if (this.editCanvas.scope === 'video') {
            this.isVideo = true;
          }
          this.editCanvas['jobName'] = resp['jobName'];
          this.jobName = this.editCanvas['jobName'];
          this.videoFile = this.editCanvas['videoFile'];
          this.docName = this.editCanvas['file'];
        });
        this.Services.getImage(this.appName).subscribe((resp) => {
          this.editCanvas['url'] = resp.url;
          this.finalImage = resp.url;
          this.editImgId = resp.id;
        });
        this.Services.getTemplate(this.appName).subscribe((response) => {
          if (response._template) {
            this.editCanvas['is_template'] = response._template;
          }
        });
      });
    }
  }

  editDetails() {
    let valid = true;
    if (this.isChain || this.isPipeline || this.isVideo) {
      if (this.jobName == undefined) {
        valid = false;
      }
    }
    if (valid == false) {
      this.Services.message('Select jobName ', 'error');
    } else {
      this.Services.getStreamingServicesByName(this.appName).subscribe(
        (resp) => {
          let newCanvas = { ...resp };
          newCanvas.alias = this.editCanvas['alias'];
          newCanvas.description = this.editCanvas['description'];

          const temp = [];
          this.Services.update(newCanvas).subscribe(
            (response) => {
              //this.Services.messageService(response, 'Updated Successfully');
              this.Services.updateImage(
                this.editImgId,
                this.editCanvas['alias'],
                this.appName,
                this.chunkMetadata['FileName'],
                'image/png/jpg',
                this.finalImage
              ).subscribe((resp) => {});
              //this.Services.addGroupModelEntity(this.data.canvasData.name, temp).subscribe();
              let newApp = { ...this.appObj };
              newApp.scope = this.editCanvas.scope;
              newApp.tryoutlink = this.editCanvas.tryoutlink;
              newApp.jobName = this.editCanvas.jobName;
              newApp.file = this.editCanvas.file;
              newApp.videoFile = this.editCanvas.videoFile;
              newApp.mfeAppName = this.editCanvas.mfeAppName;
              this.Services.saveApp(newApp).subscribe((resp) => {
                this.responseLink.emit(resp);
                this.dialogRef.close('refresh');
                this.Services.message('Updated Sucessfully.', 'success');
                if (this.appListComponent) this.appListComponent.ngOnInit();
              });
            },
            (error) => this.Services.message('Some error occured '+error, 'error')
          );
        }
      );
    }
  }

  setMfeApp(mfeapp: any) {
    this.appMfe = mfeapp.value;
  }

  setAppType(apptype: any) {
    this.apptype = apptype.value;
    if (apptype.value === 'MFE') this.isMFEApp = true;
    if (apptype.value === 'Apps') {
      this.isApp = true;
    } else {
      this.isApp = false;
    }
    if (apptype.value === 'chain') {
      this.isChain = true;
    } else {
      this.isChain = false;
    }
    if (apptype.value === 'pipeline') {
      this.isPipeline = true;
    } else {
      this.isPipeline = false;
    }
    if (apptype.value === 'video') {
      this.isVideo = true;
    } else {
      this.isVideo = false;
    }
    this.jobName = null;
  }

  getPipelines() {
    let org: any = sessionStorage.getItem('organization');
    this.Services.getPipelinesByInterfacetype(org, 'pipeline').subscribe(
      (res) => {
        res.forEach((element: any) => {
          if (element.type != 'Apps') {
            this.pipelineList.push({
              viewValue: element.alias,
              value: element.name,
            });
          }
        });
      }
    );
  }

  getPipelinesApps() {
    let org: any = sessionStorage.getItem('organization');
    this.Services.getPipelinesByInterfacetype(org, 'pipeline').subscribe(
      (res) => {
        res.forEach((element: any) => {
          if (element.type == 'Apps') {
            this.pipelineListApps.push({
              viewValue: element.alias,
              value: element.name,
            });
          }
        });
      }
    );
  }
  getChains() {
    // let filter = ""
    // let org: any = sessionStorage.getItem('organization');
    // this.Services.getPipelinesByTypeAndInterface(org,'Langchain','chain').subscribe((res) => {
    //     res.forEach((element: any) => {
    //       this.chainList.push({ viewValue: element.alias, value: element.name });
    //     });
    //   })
    let org: any = sessionStorage.getItem('organization');
    this.Services.getPipelinesByInterfacetype(org, 'chain').subscribe((res) => {
      res.forEach((element: any) => {
        this.chainList.push({ viewValue: element.alias, value: element.name });
      });
    });
  }

  setJobType(job: any) {
    this.jobName = job.value;
  }

  async uploadVideo(file) {
    this.isLoaded = false;
    this.uploadPercentage = 0;
    const chunkSize = 20000000;
    const formData: FormData = new FormData();
    let file1: File = file.target.files[0];
    this.fileExtension = file1.name.split('.').pop();
    if (file1.name.split('.').pop() != 'mp4') {
      return;
    }
    this.disableSave = true;
    let metadata = {};
    metadata['FileGuid'] = this.generateHash();
    metadata['FileName'] = file1.name;
    metadata['TotalCount'] = Math.ceil(file1.size / chunkSize);
    metadata['FileSize'] = file1.size;
    let metaDataIndex = 0;
    let count = 0;
    this.uploading = true;
    this.videoFile = '';
    for (let offset = 0; offset < file1.size; offset += chunkSize) {
      const chunk = file1.slice(offset, offset + chunkSize);
      formData.set('file', chunk, file1.name);
      metadata['Index'] = metaDataIndex++;
      formData.set('chunkMetadata', JSON.stringify(metadata));
      let res = this.datasetsService.uploadChunks(file, formData).toPromise();
      await res
        .then((res) => {
          count += 1;
          if (count < Math.ceil(file1.size / chunkSize))
            this.onUploadProgress(chunkSize, count * chunk.size, file1.size);
          if (count == Math.ceil(file1.size / chunkSize)) {
            this.uploadPercentage = 100;
            this.storageAttributes.objectKey = res.body.object;
            this.storageAttributes.uploadFile = res.body.uploadFilePath;
            this.uploading = false;
            this.isLoaded = true;
          }
        })
        .catch((err) => {
          this.disableSave = false;
          console.log('An error occured');
          this.Services.message('Error! while uploading file '+ err, 'error');
          this.uploading = false;
        });
    }
  }

  uploadFile() {
    try {
      this.Services.uploadToStorageServer(this.storageAttributes).subscribe(
        (response) => {
          this.Services.message('File Upload Initiated!');
          this.isLoaded = false;
          if (this.edit) {
            this.editCanvas['videoFile'] = response;
          }
          this.videoFile = response;
          this.websocketConnection();
          this.disableSave = false;
        },
        (err) => {
          this.disableSave = false;
          this.Services.message('some error occured ' + err, 'error');
        }
      );
    } catch (Exception) {
      this.disableSave = false;
      this.Services.message('Some error occured '+ Exception, 'error');
    }
  }

  websocketConnection() {
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame) => {
      console.log('connected to webSocket server');

      this.stompClient.subscribe('/topic/fileUploadStatus', (message) => {
        console.log(message.body);
        this.Services.message(message.body);

        this.stompClient.disconnect(() => {
          console.log('Disconnected from WebSocket server');
        });
      });
    });
  }

  onUploadProgress(chunkSize, bytesLoaded, bytesTotal) {
    let dlper: number =
      Math.round((bytesLoaded / bytesTotal) * 100 * 100) / 100;
    this.uploadPercentage = dlper > 99.99 ? 99.99 : dlper;
  }

  generateHash() {
    return Array.apply(0, Array(5))
      .map(function () {
        return (function (charset) {
          let min = 0;
          let max = charset.length - 1;
          let rand =
            window.crypto.getRandomValues(new Uint32Array(1))[0] /
            (0xffffffff + 1);
          return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
        })('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
      })
      .join('');
  }

  uploadDocument(event) {
    this.uploadFileToServer(this.docUploader.queue.pop()._file);
  }

  uploadFileToServer(file) {
    if (file.type == 'application/pdf') {
      this.supportedDoc = true;
      let chunkMetadata = {};
      let possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]=-)(*&^%$#@!~`";
      const lengthOfCode = 40;
      chunkMetadata['FileGuid'] = this.makeRandom(lengthOfCode, possible);
      chunkMetadata['FileName'] = file.name;
      this.docName = file.name;
      chunkMetadata['TotalCount'] = 1;
      chunkMetadata['FileSize'] = file.size;
      chunkMetadata['FileType'] = file.type;
      this.Services.uploadFile2(file, chunkMetadata).subscribe((resp) => {
        this.file = resp['file'][0];

        if (this.edit) {
          this.editCanvas['file'] = this.file;
        }
      });
    } else {
      this.supportedDoc = false;
    }
  }

  isDefaultUserLink(istrue: any) {
    this.isDefaultLink = istrue.checked;
  }
}
