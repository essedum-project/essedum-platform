import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PromptServices } from '../../prompts/prompt.service';
import { AIWorkerDTO, userInputParamsGrid } from '../promptAgent';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { ChooseRuntimeComponent } from '../../apps/choose-runtime/choose-runtime.component';
import { pipe } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'app-prompt-agent-execute',
  templateUrl: './prompt-agent-execute.component.html',
  styleUrl: './prompt-agent-execute.component.scss'
})
export class PromptAgentExecuteComponent implements OnInit {

  workerName: string;
  progressVal: number = 0;
  mode: string = 'determinate';
  executionStages: string[] = ['Inputs', 'WorkFlow', 'Execution Logs'];
  selectedStage: string;
  worker: any;
  userTasks: any;
  userInputParamsArray: any = [];
  userInputsArr: any = [];
  selectedPipeline: any;
  workerConfig: AIWorkerDTO;
  userInputs: any;

  taskGroup: any = [];
  taskIndex: number;
  selectedTask: any;
  selectedUserInputs: any;
  workflow: any = {};
  langgraphData: any = {};
  editorOptions = new JsonEditorOptions();
  executeWorker: boolean = false;
  streamItem: any;
  selectedRuntime: any;
  newCanvas: any;
  workerlogId: any;
  selectedTaskName: any;
  mlaiworkerList: any = [];
  versions: any[];
  selectedVersion: any;
  lang_view: boolean = false;
  langScript: string[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private dialog: MatDialog,
    private promptService: PromptServices,
    private eventsService: EventsService,
  ) { }

  async ngOnInit() {
    this.authentications();
    this.selectedStage = this.executionStages[0];
    this.taskIndex = history.state.taskIndex || 0;
    this.selectedTaskName = history.state.selectedTask || '';
    if(history.state.executionType) {
      this.lang_view = history.state.executionType == 'langgraph' ? true : false;
    }
    this.processUpdate();
    this.route.params.subscribe((params) => {
      this.workerName = params['name'];
    });
    await this.promptService.getAiWorkerByNameAndOrgAndTask(this.workerName, sessionStorage.getItem('organization'), this.selectedTaskName).subscribe((response) => {
      this.mlaiworkerList = response.body;
      if (this.mlaiworkerList.length > 0) {
        this.versions = [];
        this.mlaiworkerList.forEach((element, index) => {
          this.versions.push(element.versionname);
        });
        let selectedWorker;
        const defaultWorkers = this.mlaiworkerList.filter(worker => worker.isdefault === true);
        if (defaultWorkers.length > 0) {
          selectedWorker = defaultWorkers.reduce((earliest, current) => {
            return new Date(current.createdon) < new Date(earliest.createdon) ? current : earliest;
          });
        } else {
          selectedWorker = this.mlaiworkerList.reduce((earliest, current) => {
            return new Date(current.createdon) < new Date(earliest.createdon) ? current : earliest;
          });
        }
        const selectedVersion = selectedWorker.versionname;
        this.onVersionSelect(selectedVersion);
        // this.nextStage();
      }
      else {
        this.service.message('Please prepare the task first', 'error');
      }
    });
    await this.promptService.getAgentByName(this.workerName, sessionStorage.getItem('organization')).subscribe((res) => {
      this.workerConfig = res;
      this.formatTaskGroup(this.workerConfig.taskGroup);
      if(history.state.executionType == 'pipeline') 
        this.selectedPipeline = JSON.parse(this.workerConfig.executor).pipeline;
    });
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("execute-worker"))
          this.executeWorker = true;
      }
    );
  }

  formatTaskGroup(tasks) {
    this.taskGroup = JSON.parse(tasks);
    this.taskGroup.forEach((task, index) => {
      this.userInputParamsArray[index] = [];
      Object.keys(task.inputs).forEach(element => {
        this.userInputParamsArray[index].push({ name: element, value: task.inputs[element] });
      });
    })
    this.selectedTask = this.taskGroup[this.taskIndex];
    // this.selectedUserInputs = this.userInputParamsArray[this.taskIndex];
  }

  onVersionSelect(vers, index?) {
    this.selectedVersion = vers;
    this.mlaiworkerList.forEach((element, i) => {
      if (element.versionname == vers) {
        this.workflow = JSON.parse(element.workflowSteps);
        if(element.langgraphJson) {
          this.langgraphData = JSON.parse(element.langgraphJson);
          this.selectedPipeline = this.langgraphData.pipelineName;
          this.readLanggraph(element.langgraphJson);
        }
        this.userInputsArr = [];
        let inp = JSON.parse(element.inputsjson);
        Object.keys(inp).forEach(ele => {
          this.userInputsArr.push({ name: ele, value: inp[ele] });
        });
        this.selectedUserInputs = this.userInputsArr;
      }
    });
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.mode = "text";
  }

  readLanggraph(langgraph) {
    let org = sessionStorage.getItem('organization');
    langgraph = JSON.parse(langgraph);
    let fName = langgraph.pipelineName + "_" + org + ".py";
    this.service.readNativeFile(langgraph.pipelineName, org, fName).subscribe(
      (resp) => {
        const textDecoder = new TextDecoder('utf-8');
        this.langScript = textDecoder.decode(resp).split('\n');
      },
      (error) => { }
    );
  }

  backToAgent() {
    this.router.navigate(['../../tasks/' + this.workerName], { relativeTo: this.route });
  }

  onChange($event) {
    this.lang_view = $event.checked;
  }

  selectStage(stage: string) {
    this.selectedStage = stage;
    this.nextStage();
  }

  nextStage() {
    let indexStage = this.executionStages.indexOf(this.selectedStage) + 1;
    if (indexStage === this.executionStages.length) {
      this.selectedStage = this.executionStages[0];
      indexStage = 0;
    }
    this.selectedStage = this.executionStages[indexStage];
    this.processUpdate();
  }

  processUpdate(stage?) {
    if (stage == 'Select Tasks') {
      this.selectedStage = this.executionStages[0];
    }
    else {
      this.selectedStage = stage || this.selectedStage;
    }
    let indexStage = this.executionStages.indexOf(this.selectedStage) + 1;
    this.progressVal = indexStage / (this.executionStages.length) * 100;
    this.progressVal = parseFloat(this.progressVal.toFixed(2));
  }

  onUserInputChange($event) {
    this.selectedUserInputs = $event;
    // this.selectedTask.inputs
  }

  executeLanggraph() {
    this.mode = 'indeterminate';
    let pipeline = this.langgraphData.pipelineName;
    this.service.getStreamingServicesByName(pipeline, sessionStorage.getItem("organization")).subscribe(
      (response) => {
        this.streamItem = response;
        let json = JSON.parse(this.streamItem.json_content);
        const dialogRef = this.dialog.open(ChooseRuntimeComponent, {
          height: "max-content",
          width: "max-content",
          maxHeight: "70vh",
          disableClose: false,
          data: json
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.selectedRuntime = result;
            let org = sessionStorage.getItem('organization');
            let inputFormatted = {};
            this.selectedUserInputs.forEach((element) => {
              inputFormatted[element.name] = element.value;
            });
            let log = {
              'task': this.selectedTask.taskName,
              'worker': this.workerName,
              'runtime': this.selectedRuntime.type + '-' + this.selectedRuntime.dsAlias,
              'runtimeDsrc': this.selectedRuntime.dsName,
              'context': JSON.stringify(inputFormatted),
              'organization': org
            }
            this.promptService.updateAiWorkerLog(log, org).subscribe(
              (response) => {
                this.workerlogId = response['uid'];
                let arg = [
                  {"name":"org","value":org,"type":"Text","alias":org,"index":"1"},
                  {"name":"instanceUrl","value":window.location.origin,"type":"Text","alias":window.location.origin,"index":"2"},
                  {"name":"workerlogId","value":this.workerlogId,"type":"Text","alias":this.workerlogId,"index":"3"},
                  {"name":"dsrc","value":result.dsName,"type":"Text","alias":result.dsName,"index":"4"},
                  {"name":"access-token","value":"aec127c2-c984-33f6-9a3a-355xd1dof097","type":"Text","alias":"aec127c2-c984-33f6-9a3a-355xd1dof097","index":"5"}
                ]
                let st = JSON.parse(this.streamItem.json_content);
                st.elements[0].attributes.arguments = arg;
                this.streamItem.json_content = JSON.stringify(st);
                const agentTaskName = this.selectedTask.taskName;
                this.streamItem['pipeline_metadata'] = {'agentTaskName': agentTaskName};
                this.streamItem['pipeline_metadata'] = JSON.stringify(this.streamItem['pipeline_metadata']);
                this.service.update(this.streamItem).subscribe(res => {
                  this.runNativeScript(this.streamItem);   
                });
              });
          }
        });
      });
  }

  executePipeline() {
    this.startPipeline();
    this.mode = 'indeterminate';
  }

  startPipeline() {
    this.service.getStreamingServicesByName(this.selectedPipeline, sessionStorage.getItem("organization")).subscribe(
      (response) => {
        this.streamItem = response
        let json = JSON.parse(this.streamItem.json_content);
        const dialogRef = this.dialog.open(ChooseRuntimeComponent, {
          height: "max-content",
          width: "max-content",
          maxHeight: "70vh",
          disableClose: false,
          data: json
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.selectedRuntime = result
            let evCount = this.selectedTask?.bots.length;
            if (evCount > 0) {
              this.eventUpdate(evCount, 0);
            }
            let org = sessionStorage.getItem('organization');
            let inputFormatted = {};
            this.selectedUserInputs.forEach((element) => {
              inputFormatted[element.name] = element.value;
            });
            let log = {
              'task': this.selectedTask.taskName,
              'worker': this.workerName,
              'runtime': this.selectedRuntime.type + '-' + this.selectedRuntime.dsAlias,
              'runtimeDsrc': this.selectedRuntime.dsName,
              'context': JSON.stringify(inputFormatted),
              'organization': org
            }
            this.promptService.updateAiWorkerLog(log, org).subscribe(
              (response) => {
                this.workerlogId = response['uid'];
                this.service.message('Log updated!', 'success');
                if (this.streamItem.type == 'NativeScript') {
                  this.runNativeScript(this.streamItem)
                }
                else {
                  this.updateEnvironment();
                  const agentTaskName = this.selectedTask.taskName;
                  this.streamItem['pipeline_metadata'] = {'agentTaskName': agentTaskName};
                  this.streamItem['pipeline_metadata'] = JSON.stringify(this.streamItem['pipeline_metadata']);
                  this.service.update(this.streamItem).subscribe(response => {
                    this.service.savePipelineJSON(this.streamItem.name, this.streamItem.json_content).subscribe(
                      res => {
                        this.service.message('Saving Pipeline Json!', 'success');
                        this.triggerEvent(res.path)
                      },
                      error => {
                        this.service.message('Could not save the file', 'error');
                      }
                    );
                  }, error => {
                    this.service.message('Could not save the file', 'error');
                  });
                }
              },
              (error) => {
                this.service.message('Could not update the log', 'error');
              }
            );
          }
          else dialogRef.close();
        });
      }
    );
  }

  eventUpdate(botCount, index) {
    if (botCount > 0 && index < botCount) {
      let evName = this.selectedTask.bots[index].name + "Event";
      this.eventsService.getEventByName(evName).subscribe(evtres => {
        let jobdetails = JSON.parse(evtres.jobdetails);
        jobdetails[0].runtime = this.selectedRuntime;
        evtres.jobdetails = JSON.stringify(jobdetails);
        this.eventsService.createEvent(evtres).subscribe(res => {
          if (res) {
            this.eventUpdate(botCount, index + 1);
          }
        }
        )
      });
    }
  }

  updateEnvironment() {
    let env = [
      { name: "bots", value: JSON.stringify(this.taskGroup[this.taskIndex].bots) },
      { name: "workflow", value: JSON.stringify(this.workflow) },
      { name: "inputs", value: JSON.stringify(this.selectedUserInputs) },
      { name: "workerlogId", value: this.workerlogId }
    ]
    let pipelineEnv = JSON.parse(this.streamItem.json_content).environment;
    env.forEach((item) => {
      pipelineEnv = this.removeByName(pipelineEnv, item.name);
    });
    pipelineEnv = pipelineEnv.concat(env);
    let json = JSON.parse(this.streamItem.json_content);
    json.environment = pipelineEnv;
    this.streamItem.json_content = JSON.stringify(json);
  }

  removeByName(arr, name) {
    return arr.filter(function (ele) {
      return ele.name != name;
    });
  }

  runNativeScript(pipeline) {
    this.service.runPipeline(pipeline.alias ? pipeline.alias : pipeline.name, pipeline.name, 'NativeScript', this.selectedRuntime['type'], this.selectedRuntime['dsName'],"",this.workerlogId).subscribe(
      res => {
        this.service.message('Pipeline has been Started!', 'success');
        let job_id = JSON.parse(res).jobId
        job_id = job_id.replaceAll("-", "")
        this.service.getStreamingServicesByName(this.streamItem.name, this.streamItem.organization).subscribe(
          (response) => {
            this.newCanvas = JSON.parse(response.json_content);
            this.newCanvas["latest_jobid"] = job_id
            response.json_content = JSON.stringify(this.newCanvas)
            this.mode = 'determinate';
            this.nextStage();
          });
      },
      error => {
        this.service.message('Could not get the results', 'error');
      }
    );
  }

  triggerEvent(path) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] }
    this.service.triggerPostEvent("generateScript_" + this.streamItem.type, body, "").subscribe(
      resp => {
        this.service.message('Generating Script!', 'success');
        this.service.getEventStatus(resp).subscribe(
          status => {
            if (status == 'COMPLETED')
              this.runScript()
            else {
              this.service.message("Script is not generated.", "error")
            }
          });
      },
      error => {
        this.service.message('Error! Could not generate script.', 'error');
      });
  }

  runScript() {
    let passType = '';
    if (this.streamItem.type != 'Binary' && this.streamItem.type != 'NativeScript') passType = 'DragAndDrop'
    else passType = this.streamItem.type
    this.service.runPipeline(this.streamItem.alias ? this.streamItem.alias : this.streamItem.name, this.streamItem.name, passType, this.selectedRuntime.type, this.selectedRuntime.dsName, "generated", this.workerlogId).subscribe(
      res => {
        this.service.message('Pipeline has been Started!', 'success');
        let job_id = JSON.parse(res).jobId
        job_id = job_id.replaceAll("-", "")
        this.service.getStreamingServicesByName(this.streamItem.name, this.streamItem.organization).subscribe(
          (response) => {
            this.newCanvas = JSON.parse(response.json_content);
            this.newCanvas["latest_jobid"] = job_id
            response.json_content = JSON.stringify(this.newCanvas);
            this.mode = 'determinate';
            this.nextStage();
          });
      },
      error => {
        this.service.message('Some error occured.', 'error');
      }
    )
  }

}
