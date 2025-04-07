import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatasourceService } from '../../datasource/datasource.service';
import { EventsService } from '../../services/event.service';
import { JobsService } from '../../services/jobs.service';
import { WorkflowService } from '../entities/workflow.service';
import { DatasetServices } from '../../dataset/dataset-service';
import { Services } from '../../services/service';
import { StreamingServices } from '../../streaming-services/streaming-service';

@Component({
  selector: 'app-wk-execute',
  templateUrl: './wk-execute.component.html',
  styleUrls: ['./wk-execute.component.scss']
})
export class WkExecuteComponent implements OnInit {
  event: any;
  chainJobsList: any;
  disablerun: boolean = false;
  dsname: any;
  streamItem: StreamingServices;
  eventDetails: any;
  pipelineEvent: any;
  inpeve: any;
  constructor(
    private eventService: EventsService,
    private messageService: Services, private jobService: JobsService,
    private datasetService: DatasetServices,
    private datasourceService: DatasourceService,
    private workflowService: WorkflowService,
    public dialog: MatDialog, private router: Router,
  ) {

  }
  @Input("wkJson") json;
  @Input() wkData;
  @Input() hide;
  @Output() next = new EventEmitter<any>()
  @Output() run = new EventEmitter<any>()
  @Output() skip = new EventEmitter<any>()
  wkJson;
  corelationId: any;
  log
  params: any = {}
  loaderDataset
  loaderDatasetExists
  createdDataset;
  busy: Subscription
  goingnext: boolean = true
  datasetSuffix

  ngOnInit() {
    // this.datasetService.getDataset(this.wkData.jsondata.stage1.output).subscribe(resp => {
    //   this.loaderDataset = resp
    // })
    //console.log("execute")
    this.corelationId = this.datasetService.getCorelId()
    this.json.forEach(json1 => {
      if (json1.QuestionComponent == 'ExecuteComponent')
        this.wkJson = json1
    })
    this.loaderDatasetExists = this.wkJson?.output
    // if(this.json[this.json.length - 1].input?.event && this.json[this.json.length - 1].input?.event!="")
    //   this.getEvent()
    // if(this.event)
    // this.getLog()

  }

  refresh() {
    if (this.corelationId) {
      if (this.log && this.log.jobStatus == 'COMPLETED')
        this.goNext(!this.goingnext)
      else {
        this.goNext(false)
      }
    }
    else
      this.goNext(false)
  }

  skipStage() {
    this.skip.emit()
  }

  execute() {
    this.json.forEach(json1 => {
      if (json1.QuestionComponent == 'ExecuteComponent')
        this.wkJson = json1
    })
    this.loaderDatasetExists = this.wkJson.output
    let input = this.wkJson.input
    this.params = {}
    let loader;
    this.datasetSuffix = this.wkJson.input.outputDatasetName;
    if (this.wkJson.input.outputDataset && this.wkJson.input.outputDataset != "")
      loader = this.wkData.jsondata[this.wkJson.input.outputDataset].output;
    let inputevent = JSON.parse(this.wkJson.input.eventinp)
    for (let json in inputevent) {
      this.params[json] = {}
      if (typeof (inputevent[json]) != 'string') {
        for (let j in JSON.parse(JSON.stringify(inputevent[json]))) {
          if (inputevent[json][j] == 'corelationId') {
            let id = {}
            id["CorrelationId"] = this.corelationId
            this.params[json][j] = JSON.stringify(id)
          }
          else
            this.params[json][j] = this.wkData.jsondata[inputevent[json][j]] ? this.wkData.jsondata[inputevent[json][j]].output : inputevent[json][j]
        }
      }
      else
        this.params[json] = this.wkData.jsondata[inputevent[json]] ? this.wkData.jsondata[inputevent[json]].output : inputevent[json]
    }
    if (this.wkJson.input.type == "internaljob") {
      this.params = { "data": this.params }
      let reqparams = {
        "org": sessionStorage.getItem("organization"),
        "zoneid": "Asia/Calcutta",
        "date": "",
        "time": "",
        "expression": "",
        "event": "true",
        "runnow": "true"
      }
      for (let json in reqparams) {
        this.params[json] = this.wkJson.input.reqparams[json]
      }
    }
    if (loader)
      this.createNewDataset(loader, input)
    else
      this.trigger(input.event)
  }

  createNewDataset(loader, input) {
    this.datasetService.getDataset(loader.name).subscribe(resp => {
      this.loaderDataset = resp
    }, err => { },
      () => {
        this.datasourceService.getCoreDatasource(this.loaderDataset.datasource, localStorage.getItem('organization')).subscribe(resp => {
          this.loaderDataset.datasource = resp
        }, err => { },
          () => {
            this.datasetService.getDataset(this.loaderDataset.name + "_" + this.datasetSuffix).subscribe(resp => {
              this.loaderDatasetExists = resp
              if (!this.loaderDatasetExists) {
                this.loaderDataset.schema = null
                this.loaderDataset.taskdetails = null
                this.loaderDataset.alias = this.loaderDataset.alias + "_" + this.datasetSuffix
                delete this.loaderDataset["id"]
                this.loaderDataset.name = this.loaderDataset.name + "_" + this.datasetSuffix
                let attributes = JSON.parse(this.loaderDataset.attributes)
                attributes.tableName = this.loaderDataset.name
                attributes.Query = "Select * from " + this.loaderDataset.name + " where correlationId = '{corelationid}'"
                attributes.params = "{corelationid : '" + this.corelationId + "'}"
                this.loaderDataset.attributes = attributes
                this.datasetService.createDataset(this.loaderDataset).subscribe(resp => {
                  this.createdDataset = resp.body
                }, er => { },
                  () => {
                    this.createdDataset.datasource = this.loaderDataset.datasource
                    this.params["Dataset  Loader"] = {}
                    this.params["Dataset  Loader"]["dataset"] = this.createdDataset
                    this.trigger(input.event)
                  })
              }
              else {
                this.loaderDatasetExists.datasource = this.loaderDataset.datasource
                let attributes = JSON.parse(this.loaderDatasetExists.attributes)
                attributes.params = "{corelationid : '" + this.corelationId + "'}"
                this.loaderDatasetExists.attributes = attributes
                this.params["Dataset  Loader"] = {}
                this.params["Dataset  Loader"]["dataset"] = this.loaderDatasetExists
                this.trigger(input.event)
              }
            })
          })
      })
  }

  trigger(event) {
    let e = this.json[this.json.length - 1].input?.event
    if (e.indexOf("@!") == -1) {
      event = this.json[this.json.length - 1].input?.event
      this.inpeve = event
    }
    else {
      let index1 = e.indexOf("@!");
      let index2 = e.indexOf("!@");
      if (index2 >= 0 && index1 > index2) {
        let tempName = e.substring(index2 + 2, index1);
        event = this.wkData.jsondata[tempName].output + e.substring(index1 + 2)
        this.inpeve = event
      }
    }

    this.goingnext = true
    // this.params = JSON.stringify(this.params)
    let org = sessionStorage.getItem("organization");
    this.eventService.getEventBySearch(event, org, 0, 1).subscribe(res => {
      //Generate Script
      this.eventDetails = JSON.parse(res[0]?.jobdetails)[0];
      let pipelineName = JSON.parse(res[0]?.jobdetails)[0].name
      this.messageService.getStreamingServicesByName(pipelineName).subscribe(
        (response) => {
          this.streamItem = response

          let pipelineJson = JSON.parse(this.streamItem.json_content);
          console.log(pipelineJson);

          console.log(this.params);
          for (let param in this.params) {
            console.log(param);
            for (let i = 0; i < pipelineJson.elements.length; i++) {
              console.log(pipelineJson.elements[i]);

              if (pipelineJson.elements[i].alias == param) {
                console.log(pipelineJson.elements[i].alias);
                for (let key in this.params[param]) {
                  console.log(key);
                  console.log(pipelineJson.elements[i].attributes[key]);
                  console.log(this.params[param][key]);
                  pipelineJson.elements[i].attributes[key] = this.params[param][key];
                }
              }
            };
          }
          console.log(pipelineJson);
          this.streamItem.json_content = JSON.stringify(pipelineJson);
          this.params = JSON.stringify(this.params);
          this.messageService.savePipelineJSON(this.streamItem.name, this.streamItem.json_content).subscribe(
            res => {
              this.messageService.message('Saving Pipeline Json!', 'success');
              this.triggerEvent(res.path)
            },
            error => {
              this.messageService.message('Could not save the file', 'error');
            }
          );
        }
      );
      setTimeout(() => this.getLog(), 10000)
    })

    this.messageService.message("Job submission in progress", "success")
    this.disablerun = true
  }


  async getChainJob() {
    while (this.goingnext) {
      if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.event) {
        this.goingnext = await new Promise<boolean>((resolve) => {
          this.delay(2000).then(
            res => {
              this.jobService.getChainsJobsByCorelationId(this.corelationId).subscribe(resp => {
                this.chainJobsList = resp
                this.log = this.chainJobsList[this.chainJobsList.length - 1]
                if (this.event == this.log.jobName) {
                  if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.log && this.log.jobStatus == 'COMPLETED') {
                    resolve(false)
                  }
                  else if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.log && this.log.jobStatus == 'ERROR') {
                    this.disablerun = false
                    return
                  }
                  else
                    resolve(true)
                }
                else
                  return
              })
            })
        })
      }
      else
        break
    }
    this.refresh()

  }


  getEvent() {
    // let e = this.json[this.json.length - 1].input?.event
    // if (e.indexOf("@!") == -1) {
    //   this.pipelineEvent = this.json[this.json.length - 1].input?.event
    // }
    // else {
    //   let index1 = e.indexOf("@!");
    //   let index2 = e.indexOf("!@");
    //   if (index2 >= 0 && index1 > index2) {
    //     let tempName = e.substring(index2 + 2, index1);
    //     this.pipelineEvent = this.wkData.jsondata[tempName].output + e.substring(index1 + 2)
    //   }
    // }
    let org = sessionStorage.getItem("organization");
    let event = this.inpeve
    this.eventService.getEventBySearch(event, org, 0, 1).subscribe(res => {
      this.event = JSON.parse(res[0]?.jobdetails)[0].name
      this.getLog()
    })
  }
  async getLog(name?) {
    let job;
    while (this.goingnext) {
      if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.event) {
        this.goingnext = await new Promise<boolean>((resolve) => {
          this.delay(2000).then(
            res => {
              this.jobService.getByCorelationId(this.corelationId).subscribe(resp => {
                job = resp
                this.log = job[job.length - 1]
                if (this.log && (this.event == name ? name : this.log.streamingService)) {
                  if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.log && this.log.jobStatus == 'COMPLETED') {
                    resolve(false)
                  }
                  else if (this.json[this.json.length - 1].QuestionComponent == "ExecuteComponent" && this.log && this.log.jobStatus == 'ERROR') {
                    this.disablerun = false
                    return
                  }
                  else
                    resolve(true)
                }
                else
                  return
              })
            })
        })
      }
      else
        break
    }
    this.refresh()

  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  goNext(gonext) {
    let res = {}
    res['gonext'] = gonext
    res['json'] = this.createdDataset ? this.createdDataset : this.loaderDatasetExists ? this.loaderDatasetExists : ""
    this.next.emit(res)
    if (gonext) this.goingnext = true
  }
  //Generate Script Implementation with Event Trigger
  triggerEvent(path) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] }
    this.messageService.triggerPostEvent("generateScript_" + this.streamItem.type, body, "").subscribe(
      resp => {
        this.messageService.message('Generating Script!', 'success');
        this.messageService.getEventStatus(resp).subscribe(
          status => {
            if (status == 'COMPLETED') {
              this.dsname = this.eventDetails.runtime.dsName
              let e = this.json[this.json.length - 1].input?.event
              if (e.indexOf("@!") == -1) {
                this.pipelineEvent = this.json[this.json.length - 1].input?.event
              }
              else {
                let index1 = e.indexOf("@!");
                let index2 = e.indexOf("!@");
                if (index2 >= 0 && index1 > index2) {
                  let tempName = e.substring(index2 + 2, index1);
                  this.pipelineEvent = this.wkData.jsondata[tempName].output + e.substring(index1 + 2)
                }
              }
              this.busy = this.eventService.triggerPostEvent(this.pipelineEvent, this.params, this.dsname, this.corelationId).subscribe(res => {
                this.messageService.message("Job Submitted", "success")
                this.corelationId = res
                this.goingnext = true
                if(res)this.getEvent()
              },
                err => {
                  if ((err.status != 404) && (!err.status?.includes('404')) && (!err.includes('404'))) {
                    this.disablerun = false
                    this.messageService.message("Job Submission Failed")
                  }
                  else {
                    this.getEvent()
                  }
                });
            }
            else {
              this.messageService.message("Script is not generated.", "error");
              this.dsname = this.eventDetails.runtime.dsName
              this.busy = this.eventService.triggerPostEvent(this.pipelineEvent, this.params, this.dsname, this.corelationId).subscribe(res => {
                this.messageService.message("Job Submitted", "success")
                this.corelationId = res
                this.getEvent()
              },
                err => {
                  if ((err.status != 404) && (!err.status?.includes('404')) && (!err.includes('404'))) {
                    this.disablerun = false
                    this.messageService.message("Job Submission Failed")
                  }
                  else {
                    this.getEvent()
                  }
                });
            }
          });
      },
      error => {
        this.messageService.message('Error! Could not generate script.', 'error');
      });
  }
}
