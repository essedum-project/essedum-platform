import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'com-lib-util';
import { SwaggerAPISpec } from '../../DTO/swaggerapispec';
import { PipelineModelService } from '../../pipeline-summary/pipeline-model/pipeline-model.service';
import { EventsService } from '../../services/event.service';
import { PipelineModel } from '../../sharedModule/pipeline-model/canvas';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { WorkflowService } from '../entities/workflow.service';
import { Services } from '../../services/service';

@Component({
  selector: 'app-wk-publish',
  templateUrl: './wk-publish.component.html',
  styleUrls: ['./wk-publish.component.scss']
})
export class WkPublishComponent implements OnInit {
  pipelineName: any;
  modelOption: any;
  modelVersion: any = '1';
  publicmodel = true;
  isOverwrite = true;
  pushtocodestore = true;
  model: PipelineModel;
  predictionPipeline: StreamingServices;


  constructor(
      private eventService: EventsService,
      private workflowService: WorkflowService,
      private StreamingServicesService: Services,
      private messageService: MessageService,
      private modelService: PipelineModelService,
  ) { }
  swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();
  showView: boolean = false;


  @Input("wkJson") json;
  @Input() wkData;
  @Input() hide;
  @Output() next = new EventEmitter<any>()
  wkJson;
  loaderDataset
  extractorDataset
  modelname
  metadata = {}

  // paramslist: ParamsElement[]   
  requestbodytype: any = "application/json";
  serverurl: any = "_url_";
  endpoint: any = "_urlpath_";

  ngOnInit() {
      this.json.forEach(json1 => {
          if (json1.QuestionComponent == 'PublishComponent')
              this.wkJson = json1
      })
  }
  Publish() {
      this.getPipeline()

  }
  getEvent(eventName, modelname) {
    let org = sessionStorage.getItem("organization");
      this.eventService.getEventBySearch(eventName,org, 0, 1).subscribe(res => {
          this.pipelineName = JSON.parse(res[0]?.jobdetails)[0].name
      }, err => { },
          () => {
              let inpjsonContent; let newjsonContent
              this.StreamingServicesService.getStreamingServicesByName(this.pipelineName).subscribe(resp => {
                  inpjsonContent = resp.json_content
              })
              this.StreamingServicesService.getStreamingServicesByName(this.wkJson.input.pipelinename).subscribe(resp => {
                  newjsonContent = resp.json_content
              })

              let inpextractor = inpjsonContent.elements.filter(cont => cont.name == 'Dataset Extractor')[0]

              let inploader = inpjsonContent.element.filter(cont => cont.name == 'Dataset Loader')[0]

          })

  }
  getPipeline() {
      this.json.forEach(json1 => {
          if (json1.QuestionComponent == 'PublishComponent')
              this.wkJson = json1
      })
      let datasetextractor = this.wkData.jsondata[this.wkJson.input.inp1].output
      let newjsonContent
      let id
      this.predictionPipeline = new StreamingServices()
      let modelname = this.wkData.jsondata[this.wkJson.input.inp2].output
      this.StreamingServicesService.getStreamingServicesByName(this.wkJson.input.pipelinename).subscribe(resp => {
          newjsonContent = JSON.parse(resp.json_content)
          this.predictionPipeline = resp
          newjsonContent.elements.forEach(element => {
              if (element.classname == 'DatasetExtractorConfig') {
                  element.attributes.dataset = datasetextractor
              }
              if (element.classname == 'ModelSourceConfig') {
                  element.attributes.modelName = modelname

              }
          })
          newjsonContent.elements.forEach(ele => {
              ele.context.forEach(el => {
                  el.dataset = datasetextractor
                  el.modelName = modelname
              })
          })
          this.predictionPipeline.alias = datasetextractor.name + '_batch'
          this.predictionPipeline.name = null
          this.predictionPipeline.cid = null
          this.predictionPipeline.json_content = JSON.stringify(newjsonContent)
          this.StreamingServicesService.create(this.predictionPipeline).subscribe(res => {
              this.predictionPipeline =res
              this.getEndPoints()
          })
      })


  }
  getEndPoints(){
      this.model  = new PipelineModel()
      this.model.apispec = JSON.stringify(this.swaggerapispec.readonlyapispec)
      this.model.modelname = this.predictionPipeline.alias
      this.model.explanation = this.predictionPipeline.alias
      this.modifyAPISpec()
      this.model.metadata = JSON.stringify({"type":"","modeltype":"pipelinemodel","createdtime":new Date().toUTCString(),"version":"1","framework":"","pushtocodestore":true,"public":true,"overwrite":true,"summary":"","taginfo":"","frameworkVersion":"","modelClassName":"","inferenceClassName":"","filePath":"","inputType":""}) 
      this.model.org = sessionStorage.getItem("organization");
      this.model.modelpath = this.predictionPipeline.name
      this.model.pipelinemodel = true
      this.modelService.addModel(this.model).subscribe(resp =>{
          this.messageService.info("Saved successfully", "ICIP")
          this.next.emit(resp.id)
      })

  }
  modifyAPISpec() {
      this.swaggerapispec.changeType(this.requestbodytype)
      this.swaggerapispec.addTitle(this.model.modelname)
      this.swaggerapispec.addDescription(this.model.explanation)
      this.swaggerapispec.addVersion(this.modelVersion)
      this.swaggerapispec.addUrl(this.serverurl)
      this.swaggerapispec.addUrlPath(this.endpoint)
      this.model.apispec = this.swaggerapispec.getAPISpec(true)//(this.requestbodytype == 'application/json')
    }
}
