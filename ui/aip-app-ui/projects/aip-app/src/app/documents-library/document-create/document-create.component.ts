import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { DatasetServices } from '../../dataset/dataset-service';
import { Dataset } from '../../dataset/datasets';
import { HttpParams } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import mammoth from 'mammoth';
import docx2html from 'docx2html';
import { MatRadioChange } from '@angular/material/radio';
import { EventsService } from '../../services/event.service';
import { LedsModalService } from 'leds-lib';
import { SemanticService } from '../../services/semantic.services';
import { MlTopic } from '../../DTO/mlTopic';
import { AdapterServices } from '../../adapter/adapter-service';
import { JobsService } from '../../services/jobs.service';
import { saveAs } from 'file-saver';
import * as quillToWord from "quill-to-word";
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.scss']
})
export class DocumentCreateComponent implements OnInit {

  editorContent: string = '';
  docName: any;
  data = new Dataset();
  datasource: any;
  datasetName: any;
  selectedTemplate: any;
  selectedFile: File;
  fileUploader: boolean = false;
  documentConstant = 'icip.document.default';
  templateName = [];

  upload: boolean = false;
  showUploadStatus: boolean = true;
  selectedCreationType = "Manual";
  videoOptions: any;
  kbConstant = 'icip.document.kb.default';
  corelid: any;
  event_status: string;
  dstId: any;
  indexName: any;
  adapterInstanceName: any;
  description: string = "";
  mlTopic: MlTopic;
  instanceName: any;
  adapterName: any;
  isInstanceExist: boolean;
  adapter: any;
  spp: any;
  formattedapispec: any[];
  spec: any;
  cURL: null;
  specPath: any;
  isInstance: boolean = true;
  serverUrl = "";
  isEndpoint: boolean = false;
  filteredTopics: any;
  cardData: any[];
  searchCards: any[];
  card: any;
  lanValue: string = 'eng';
  errCount: number = 0;
  count: number = 0;
  stat: string;
  isExpanded: boolean = false;
  tooltip = 'above';
  mlTopics: any;
  knowledgeBaseOptions: any = [];
  selectedKb: any;

  creationTypes = [{ viewValue: 'Manual', value: 'Manual' }, { viewValue: 'Video', value: 'Video' }, { viewValue: 'Knowledge', value: 'Knowledge' }];
  selectedVideo: any;
  reqEventBody = { "environment": [] };
  videoPaths: any = [];
  selectedPaths: any;
  dataAttribute: any;
  docDefault: any = {};
  private quillToWordConfig: quillToWord.Config = {
    exportAs: "blob"
  };
  quillContent: any;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private telemetry: OpenTelemetryService,
    private service: Services,
    private sanitizer: DomSanitizer,
    private eventsService: EventsService,
    private datasetsService: DatasetServices,
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: LedsModalService,
    private semanticService: SemanticService,
    private adapterServices: AdapterServices,
    private jobService: JobsService,
    private changeDetectionRef: ChangeDetectorRef,
  ) { }

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','DocumentCreateComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit(): void {
    this.telemetryCall();
    // to get document
    this.getTemplateNames();
    this.getVideoDataset();
    this.getKnowledgeBase();

    let params: HttpParams = new HttpParams();
    params = params.append('name', 'AIPNTNXH56520');
    params = params.append('org', sessionStorage.getItem('organization'));
    this.service.getDatasourceByName(params).subscribe(res => {
      this.datasource = res[0];
    });

    // this.datasetsService.getDatasetJson().subscribe((res) => {
    //   res.forEach((dsetType: any) => {
    //     if (dsetType.type == 'S3') {
    //       this.dataAttribute = dsetType.attributes;
    //       this.data["attributes"] = dsetType.attributes;
    //     }
    //   });
    // });

    this.service.getConstantByKey(this.documentConstant).subscribe((res) => {
      if (res && res.body) {
        this.docDefault = JSON.parse(res.body);
        this.data.type = this.docDefault['type'];
        this.data.views = this.docDefault['views'];
        let obj = {
          'bucket': this.docDefault['bucket'],
          'path': this.docDefault['path'],
        }
        this.data.attributes = JSON.stringify(obj);
      }
    });
    this.service.getConstantByKey(this.kbConstant).subscribe((res) => {
      this.indexName = res.body;
      this.semanticService.getTopicByTopicNameAndOrg(this.indexName).subscribe((res: any) => {
        this.adapterInstanceName = res.adapterinstance;
      });
    });

  }

  getTemplateNames() {
    this.templateName = [];
    this.datasetsService.getFileTemplateNames().subscribe((resp) => {
      this.templateName.push({ 'viewValue': 'Blank', 'value': '0' });
      this.selectedTemplate = '0';
      this.changeDetectionRef.detectChanges();
      resp.forEach((uploadedFile) => {
        if (uploadedFile.filename.endsWith(".docx") || uploadedFile.filename.endsWith(".doc"))
          this.templateName.push({ 'viewValue': uploadedFile.filename, 'value': uploadedFile.datasetname });
      });
    },
      (error) => { },
    );
  }

  getVideoDataset() {
    this.videoOptions = [];
    this.videoPaths = {};
    this.datasetsService.getDatasetByViewType('Video View').subscribe((res) => {
      res.forEach(element => {
        this.videoOptions.push(new OptionsDTO(element.alias, element.name));
        let attributes = JSON.parse(element.attributes)
        this.videoPaths[element.name] = attributes.bucket + '/' + attributes.path + '/' + attributes.object;
      });
    });
  }

  getKnowledgeBase() {
    this.semanticService.getAllTopicsbyOrg().subscribe(res => {
      this.mlTopics = res;
      this.mlTopics.forEach(topic => {
        this.knowledgeBaseOptions.push(new OptionsDTO(topic.topicname, topic.topicname));
      });
    });
  }

  back() {
    this.router.navigate(["../"], { relativeTo: this.route });
  }

  onContentChanged(event) {
    this.editorContent = event.html;
    this.quillContent = event.content;
  }

  createDocument() {
    // content to word
    this.exportWord(this.quillContent);

    // content to pdf
    // this.toPdfConverter();
  }

  toPdfConverter() {
    let div = document.createElement('div');
    let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(this.editorContent);
    div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
    div.style.padding = '15px';
    document.body.appendChild(div);
    this.docToPdfconvert(div);
  }

  async exportWord(delta) {
    const blob = await quillToWord.generateWord(delta, this.quillToWordConfig);
    // saveAs(blob, "word-export.docx");
    this.uploadWord(blob);
  }

  uploadWord(file) {
    this.fileUploader = true;
    this.selectedFile = new File([file], this.docName + '.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.datasetsService.uploadFileToServer(formData).subscribe(res => {
      if (res.body) {
        this.data.attributes = JSON.parse(this.data.attributes);
        this.data.attributes['object'] = this.docName + '.docx';
        this.data.attributes['uploadFile'] = res.body.uploadFilePath;
        this.fileUploader = false;
        this.datasetCreate();
      }
    });
  }

  async docToPdfconvert(htmldiv) {
    await html2canvas(htmldiv).then((canvas) => {
      var contentDataURL = canvas.toDataURL('image/png');
      document.body.removeChild(htmldiv);

      let pdf = new jsPDF('p', 'mm', 'a4');
      var imgWidth = 211;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var remainingHeight = imgHeight;
      var position = 0;
      do {
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        position -= 295;
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
      while (remainingHeight > 0)
      this.uploadPdf(pdf.output('blob'));
      this.service.message('Document creation in progress');
      // pdf.save(this.docName+'.pdf');
    }).catch(function (error) {
      console.log('error', error);
      this.service.message('Error in creating document');
    });
  }

  uploadPdf(file) {
    this.fileUploader = true;
    this.selectedFile = new File([file], this.docName + '.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.datasetsService.uploadFileToServer(formData).subscribe(res => {
      if (res.body) {
        this.data.attributes['object'] = this.docName + '.pdf';
        this.data.attributes['uploadFile'] = res.body.uploadFilePath;
        this.fileUploader = false;
        this.datasetCreate();
      }
    });
  }

  datasetCreate() {
    this.data.alias = this.docName;
    this.data.attributes['Headers'] = "";
    this.data.attributes['QueryParams'] = "";
    this.data.attributes['Cacheable'] = false;
    this.data.datasource = this.datasource;
    this.data.organization = sessionStorage.getItem('organization');
    this.datasetsService.testConnection(this.data).subscribe((response) => {
      this.datasetsService.createDataset(this.data).subscribe((res) => {
        this.datasetName = res.name;
        this.dstId = res.id;
        this.service.message('Document created successfully');
        this.telemetry.addTelemetryEvent(res.alias + ' document created');

        //Generate Embeddings
        this.createAndLinkToKB();
        //Data Enrichments
        this.translation();
        if (this.datasetName) {
          this.datasetsService.getDatasetByNameAndOrg(this.datasetName).subscribe((res) => {
            this.card = res
            let viewType = this.card.views
            if (this.card.event_details != null) {
              this.filteredTopics = JSON.parse(this.card.event_details)
              this.getCardStatus();
            }
          });
        }
        this.router.navigate(["../"], { relativeTo: this.route });
      }, (error) => {
        console.log('error', error);
        this.service.message('Error in creating document');
      });
    }, (error) => {
      console.log('error', error);
      this.service.message('Error in creating document');
    });
  }

  getCardStatus() {
    this.cardData = [];
    this.searchCards = [];
    this.filteredTopics.forEach(e => {
      this.jobService.getByCorelationId(e.corelId).subscribe(res => {
        this.cardData.push({ ...e, status: res[0].jobStatus }),
          this.searchCards.push({ ...e, status: res[0].jobStatus })
      })
    });
  }

  createAndLinkToKB() {
    this.mlTopic = new MlTopic(this.datasetName, sessionStorage.getItem('organization'), this.indexName, this.adapterInstanceName, 'IN-PROGRESS', this.description);
    this.semanticService.addOrUpdateTopic(this.mlTopic).subscribe(res => {
      this.initiateKnowledgeBaseIngestion(this.adapterInstanceName);
    });
  }

  initiateKnowledgeBaseIngestion(adapterInstanceName) {
    try {
      this.instanceName = adapterInstanceName;
      this.adapterServices.getInstanceByNameAndOrganization(adapterInstanceName).subscribe((res) => {
        if (res && res.adaptername) {
          this.adapterName = res.adaptername;
          this.adapterServices.getAdapteByNameAndOrganization(this.adapterName).subscribe((resAdp) => {
            if (resAdp) {
              this.isInstanceExist = true;
              this.adapter = resAdp;
              this.spp = JSON.parse(resAdp.apispec);
              this.formatSpec();
            } else {
              this.isInstanceExist = false;
            }
          });
        } else {
          this.isInstanceExist = false;
        }
      });
    }
    catch (error) {
      this.adapterServices.messageNotificaionService('error', "Some error occured!");
    }
  }

  formatSpec() {
    this.formattedapispec = []
    for (let keys in this.spp.paths) {
      if (keys.includes('ingest')) {
        for (let key in this.spp.paths[keys]) {
          let pathObj = {}
          pathObj["path"] = keys
          pathObj["requestType"] = key.toUpperCase()
          for (let value in this.spp.paths[keys][key]) {
            if (value == "responses") {
              let responses = []
              for (let resp in this.spp.paths[keys][key][value]) {
                let respObj = {}
                respObj["status"] = resp
                respObj["description"] = this.spp.paths[keys][key][value][resp]["description"]
                respObj["content"] = this.spp.paths[keys][key][value][resp]["content"]
                responses.push(respObj)

              }
              pathObj[value] = responses
            }
            else if (value == "parameters") {
              for (let i = 0; i < this.spp.paths[keys][key][value].length; i++) {
                this.spp.paths[keys][key][value][i].value = this.spp.paths[keys][key][value][i].value?.replace("{datasource}", this.adapter?.alias).replace("{org}", sessionStorage.getItem("organization"))
              }
              pathObj[value] = this.spp.paths[keys][key][value]
            }
            else {
              pathObj[value] = this.spp.paths[keys][key][value];
              if (pathObj["requestType"] == "POST" && value == "requestBody") {
              }
            }
          }
          pathObj["button"] = "Try it out"
          pathObj["executeFlag"] = false
          this.formattedapispec.push(pathObj)
        }
      }
    }
    this.spec = this.formattedapispec[0];
    this.ingestToKB();
  }

  ingestToKB() {
    if (this.indexName == undefined || this.indexName == null || this.indexName == '') {
      this.service.message('No default KnowledgeBase', 'error');
    }
    else {
      let org = sessionStorage.getItem("organization");
      let spec = JSON.parse(JSON.stringify(this.spec));
      let requestBody = JSON.parse(spec.requestBody.value);
      requestBody["dataset_id"] = this.data;
      requestBody["organization"] = org;
      requestBody["index_name"] = this.indexName;
      if (requestBody.config?.VectorStoreConfig) {
        requestBody.config.VectorStoreConfig["index_name"] = this.indexName;
      }
      spec.requestBody.value = JSON.stringify(requestBody);
      spec.path.substring(0, spec.path.lastIndexOf('/')) + '/' + sessionStorage.getItem('organization')

      this.cURL = null;
      this.specPath = spec.path;
      spec["executeFlag"] = true
      let headers = {}
      if (this.specPath && this.specPath.includes("/adapters/"))
        headers['access-token'] = localStorage.getItem("accessToken");
      let params = {}
      if (spec.parameters) {
        for (let param of spec.parameters) {
          if (param.in == "params" || param.in == "query") {
            if (!this.isInstance)
              params[param.name] = param.value ? param.value.replace("{datasource}", this.adapterName).replace("{org}", sessionStorage.getItem("organization")) : ""
            else {
              params[param.name] = param.value ? param.value.replace("{datasource}", this.instanceName).replace("{org}", sessionStorage.getItem("organization")) : ""
            }
            if (!param.value)
              param.value = ""
          }
          if (param.in == "header") {
            headers[param.name] = param.value ? param.value : ""
          }
          if (param.in == "path") {
            this.specPath = this.specPath.replace("{" + param.name + "}", param.value)
          }
        }
      }
      if (this.isInstance)
        params['isInstance'] = 'true';
      if (this.isEndpoint)
        params['isInstance'] = 'REMOTE';
      if (spec.requestType.toLowerCase() == "post") {
        let url = spec.path;
        this.specPath = this.specPath.replace(this.adapterName, this.instanceName);
        url = this.serverUrl + this.specPath
        if (spec.requestBody.content['multipart/form-data']) {
          delete headers['Content-Type']; delete headers['content-type']; delete headers['content-Type']; delete headers['Content-type'];
        } else {
          this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).subscribe(resp => {
            if (resp.body) {
              this.adapterServices.messageNotificaionService('success', "Knowledge Base Ingestion Initiated");
              this.cancelLinkKB();
              // this.ngOnInit();
            } else {
              this.service.message('Upstream API is currently down! Please try again later', 'warning');
            }
          }, err => {
            this.service.message('Upstream API is currently down! Please try again later', 'warning');
          })
        }
        if (spec.requestBody.value) {
          if (spec.requestBody.value.includes("'")) {
            spec.requestBody.value = spec.requestBody.value.replaceAll("'", "'\\''");
          }
        }
      }
    }
  }

  cancelLinkKB() {
    this.indexName = "";
    this.adapterInstanceName = "";
    this.description = "";
    // this.ngOnInit();
  }

  async translation() {
    let eventName = 'Translation';
    await this.eventTrigger(eventName);
  }

  async summary() {
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if (corlId === 0) {
      this.service.errorMessage('No Translation event found! Trigerring', 'error')
      this.translation()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        if(resp.length > 0) {
          let job = resp
          const jobStat = job[0]?.jobStatus
          console.log("Job status before triggering in else", jobStat)
          if (jobStat === "ERROR") {
            this.errCount = this.errCount + 1
            if (this.errCount === 1) {
              this.service.errorMessage('Retriggering Translation Pipeline', "error")
              this.translation()
              console.log("Job status in translationn", jobStat)
            } else {
              clearInterval(checkInterval);
              this.service.errorMessage('Error in Translation Pipeline', "error")
            }
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "COMPLETED") {
          clearInterval(checkInterval);
          this.eventTrigger('Summary')
        }
        else if (jobStat === "RUNNING") {
          console.log("Job status while running", jobStat)
          this.service.message('Pipeline running')
        }
        else if (jobStat === "CANCELLED") {
          this.count = this.count + 1
          if (this.count === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translation()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Pipeline cancelled!', "error")
          }
        }
        else if (jobStat === "ERROR") {
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline', "error")
          // this.ngOnInit()
        }
      });
    }, 10000);
  }

  getCorelid(event: string) {
    if (this.card.event_details != null) {
      const filterEvent = this.filteredTopics.filter(eve => eve.eventName === event);
      if (filterEvent.length === 0) {
        return 0;
      }
      return filterEvent.map(eve => eve.corelId);
    } else {
      return 0
    }
  }

  async questions() {
    this.count = 0
    this.errCount = 0;
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if (corlId === 0) {
      this.service.errorMessage('No Translation event found! Trigerring', 'error')
      this.translation()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "ERROR") {
          this.errCount = this.errCount + 1
          if (this.errCount === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translation()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Translation Pipeline', "error")
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "COMPLETED") {
          clearInterval(checkInterval);
          this.eventTrigger('Questions')
        }
        else if (jobStat === "RUNNING") {
          this.service.message('Translation Pipeline running')
        }
        else if (jobStat === "CANCELLED") {
          this.count = this.count + 1
          if (this.count === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translation()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Transalation Pipeline cancelled!', "error")
          }
        }
        else if (jobStat === "ERROR") {
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline', "error")
          // this.ngOnInit()
        }
      });
    }, 10000);
  }

  eventTrigger(eventName: string) {
    try {
      let updateEventName = eventName;
      this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
        if (eventRes != null) {
          let jobdetails = JSON.parse(eventRes.jobdetails);
          let selectedRunType = jobdetails[0].runtime;
          this.corelid = jobdetails[0].last_refresh_event
          const requesting = this.reqBody();
          this.eventsService.triggerPostEvent(updateEventName, requesting, selectedRunType['dsName']).subscribe((res) => {
            this.event_status = 'RUNNING'
            jobdetails[0]["last_refresh_event"] = res
            this.service.message(updateEventName + " Job Triggered Successfully", 'success');
            this.service.getEventStatus(res).subscribe(status => {
              this.event_status = status
              jobdetails[0]["last_refresh_status"] = this.event_status
              eventRes.jobdetails = JSON.stringify(jobdetails)
              this.eventsService.createEvent(eventRes).subscribe((response) => {
                this.corelid = jobdetails[0].last_refresh_event
              }, error => {
                this.service.message('Event not updated due to error: ' + error, 'error')
              });
            });
            this.corelid = jobdetails[0].last_refresh_event
            this.setCorelId(this.dstId, this.corelid, updateEventName);
            // this.ngOnInit();
            this.refreshJobStatus(updateEventName)
          }, error => {
            this.service.message('Job not triggered due to error: ' + error, 'error')
          });
        } else {
          this.service.errorMessage('Please check event ' + updateEventName)
        }
      }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
      });
    }
    catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }

  async refreshJobStatus(event: string) {
    if (event) {
      const corelId: string = this.getCorelid(event);
      if (corelId) {
        const id = corelId[0]
        if (id) {
          this.eventsService.getEventByName(event).subscribe((eventRes) => {
            let jobdetails = JSON.parse(eventRes.jobdetails);
            let eventStat = jobdetails[0].last_refresh_status
            // if(this.stat){
            //   console.log("status in refresh if Stat", this.stat)
            if (eventStat == 'RUNNING') {
              this.service.getEventStatus(jobdetails[0].last_refresh_event).subscribe(
                status => {
                  this.stat = status
                  this.event_status = status
                  jobdetails[0]["last_refresh_status"] = this.event_status
                  eventRes.jobdetails = JSON.stringify(jobdetails)
                  this.eventsService.createEvent(eventRes).subscribe((response) => {
                    this.service.message('Status refreshed')
                  }, error => {
                    this.service.message('Event not updated due to error: ' + error, 'error')
                  });
                });
            } else {
              this.event_status = jobdetails[0].last_refresh_status
              this.service.message('Status refreshed')
            }
            //  else {
            //   this.event_status = ''
            // }
          });
          // });
        }
      }
    }
  }

  reqBody() {
    let requestBody = {
      "environment": [
        {
          "name": "datasetId",
          "value": this.datasetName
        },
        {
          "name": "org",
          "value": sessionStorage.getItem("organization")
        }
      ]
    };
    if (this.lanValue) {
      requestBody.environment.push({
        "name": "targetLanguage",
        "value": this.lanValue
      });
    }
    return requestBody;
  }

  setCorelId(dstid, corelid, name) {
    this.datasetsService.savecorelId(dstid, corelid, name).subscribe((res) => {
      let dataset = res
      if (name === 'Translation') {
        if (this.datasetName) {
          this.datasetsService.getDatasetByNameAndOrg(this.datasetName).subscribe((res) => {
            this.card = res
            let viewType = this.card.views
            if (this.card.event_details != null) {
              this.filteredTopics = JSON.parse(this.card.event_details)
              this.getCardStatus();
              this.summary();
              this.questions();
            }
          });
        }
      }
      // this.eventName = JSON.parse(dataset.event_details);
    }, error => {
      this.service.message('Error in corelId! ' + error)
    }
    );
  }

  addfile(file) {
    this.upload = true;
    this.onUploadStarted()
    if (file.target.files[0].name.endsWith(".docx") || file.target.files[0].name.endsWith(".doc")) {
      try {
        this.readLoadFile(file);
        this.selectedFile = undefined;
        const chunkSize = 200000;
        const formData: FormData = new FormData();
        let file1: File = file.target.files[0];
        let metadata = {};
        metadata["FileGuid"] = this.generateHash();
        metadata["FileName"] = file1.name;
        metadata["TotalCount"] = Math.ceil(file1.size / chunkSize);
        metadata["FileSize"] = file1.size;

        let i = 0;
        let count = 0;
        for (let offset = 0; offset < file1.size; offset += chunkSize) {
          const chunk = file1.slice(offset, offset + chunkSize);
          formData.set("file", chunk, file1.name);
          metadata["Index"] = i++;
          formData.set("chunkMetadata", JSON.stringify(metadata));
          this.datasetsService.saveTemplateChunks(file1.name, formData).subscribe(
            (res) => {
              count += 1;
              if (count < Math.ceil(file1.size / chunkSize))
                this.onUploadProgress(chunk.size, count * chunk.size, file1.size);
              else
                this.onUploadProgress(chunk.size, file1.size, file1.size);
              if (res && res.body) {
                this.showUploadStatus = false;
                this.upload = false;
                this.createDataset(res.body);
              }
            },
            (err) => {
              //console.log(err)
              this.service.message('Error! while uploading file: ' + "error")
            }
          );
        }
        // this.uploaded = true;
        // this.previewFile();
      }
      catch (Exception) {
        this.service.message("Some error occured", "error")
      }
    }
    else
      this.service.message("File format not supported", "error")
  }

  createDataset(fileData) {
    let fileName = fileData.filename;
    let filePath = fileData.filepath;
    let dsetData = new Dataset();
    dsetData.datasource = this.datasource
    dsetData.organization = sessionStorage.getItem('organization');
    dsetData.type = this.docDefault['type'];
    dsetData.views = this.docDefault['views'];
    dsetData["attributes"] = this.dataAttribute;
    dsetData.attributes['bucket'] = this.docDefault['bucket'];
    dsetData.attributes['path'] = this.docDefault['path'];
    dsetData.attributes['object'] = fileName;
    dsetData.attributes['uploadFile'] = filePath.toString().replaceAll('\\', "/")
    dsetData.alias = "Document_" + fileName;
    dsetData.name = "Document_" + fileName;
    this.datasetsService.testConnection(dsetData).subscribe((response) => {
      this.datasetsService.createDataset(dsetData).subscribe((res) => {
        // this.selectedTemplate = res.name;
        this.templateName.push({ 'viewValue': fileName, 'value': res.name });
        // this.onTemplateSelect(res.name);
      });
    });
  }

  readLoadFile(file) {
    const fileRead = file.target.files[0];
    let reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = reader.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        try {
          const resultt = await mammoth.convertToHtml({ arrayBuffer });
          this.editorContent = resultt.value;
        } catch (e) {
          console.log(e);
        }

        // docx2html(arrayBuffer).then((html) => {
        //   this.editorContent = html;
        // }).catch((error) => {
        //   console.log('error', error);
        // });
      }
    }
    reader.readAsArrayBuffer(fileRead);
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
        })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
      })
      .join("");
  }

  onUploadStarted() {
    this.getChunkPanel().innerHTML = "";
  }

  onUploadProgress(segmentSize, bytesLoaded, bytesTotal) {
    this.getChunkPanel().appendChild(
      this.addChunkInfo(segmentSize, bytesLoaded, bytesTotal)
    );
  }

  addChunkInfo(segmentSize, loaded, total) {
    var result = document.createElement("DIV");
    result.appendChild(this.createSpan("Chunk size:"));
    result.appendChild(
      this.createSpan(this.getValueInKb(segmentSize), "segment-size")
    );
    result.appendChild(this.createSpan(", Uploaded:"));
    result.appendChild(
      this.createSpan(this.getValueInKb(loaded), "loaded-size")
    );
    result.appendChild(this.createSpan("/"));
    result.appendChild(this.createSpan(this.getValueInKb(total), "total-size"));
    return result;
  }

  createSpan(text, className = null) {
    var result = document.createElement("SPAN");
    if (className)
      result.className = className + " dx-theme-accent-as-text-color";
    result.innerText = text;
    return result;
  }

  getValueInKb(value) {
    return (value / 1024).toFixed(0) + "kb";
  }

  getChunkPanel() {
    return document.querySelector(".chunk-panel");
  }

  // creation via pipeline
  onCreationSelect(event) {
    this.selectedCreationType = event;
    this.reqEventBody = { environment: [] };
    this.selectedTemplate = '0';
    this.selectedVideo = [];
    this.selectedKb = '';
  }

  onTemplateSelect($event) {
    this.selectedTemplate = $event;
    this.changeDetectionRef.detectChanges();
    if ($event != '0') {
      this.datasetsService.getDatasetByNameAndOrg($event).subscribe((resp) => {
        let attri = JSON.parse(resp.attributes);
        let paths = attri.bucket + '/' + attri.path + '/' + attri.object;
        this.reqEventBody["environment"].push({
          name: "templatePath",
          value: paths
        })
      });
    }
  }

  onVideoSelect($event) {
    this.selectedVideo = $event;
    this.selectedPaths = [];
    this.selectedVideo.forEach(ele => {
      this.selectedPaths.push(this.videoPaths[ele]);
    })
    let present = false
    this.reqEventBody.environment.forEach(e => {
      if (e.name == 'videoPath') {
        e.value = this.selectedPaths.toString();
        present = true
      }
    })
    if (!present) {
      this.reqEventBody["environment"].push({
        name: "videoPath",
        value: this.selectedPaths.toString()
      });
    }
  }

  onKBSelect($event) {
    this.selectedKb = $event;
    this.reqEventBody["environment"].push({
      name: "knowledgeBase",
      value: this.selectedKb
    });
  }

  createByPipeline() {
    if (this.docName && this.docName != '') {
      let eventName = 'GenerateDocument';
      this.eventsService.getEventByName(eventName).subscribe((eventRes) => {
        let jobdetails = JSON.parse(eventRes.jobdetails);
        let selectedRunType = jobdetails[0].runtime;
        if(this.selectedTemplate == '0'){
          this.reqEventBody["environment"].push({
            "name": "templatePath",
            "value": ""
          })
        }
        this.reqEventBody["environment"].push({
          "name": "org",
          "value": sessionStorage.getItem("organization")
        })
        this.reqEventBody["environment"].push({
          "name": "DocumentName",
          "value": this.docName
        })
        this.eventsService.triggerPostEvent(eventName, this.reqEventBody, selectedRunType['dsName']).subscribe((res) => {
          this.service.message("Event Triggered Successfully", 'success');
          this.back();
        }, error => this.service.message('Document Creation failed due to error: ' + error, 'error'));
      }, error => this.service.message('Document Creation failed due to error: ' + error, 'error'));
    }
    else {
      this.service.message("please select document name", "error");
    }
  }

  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}