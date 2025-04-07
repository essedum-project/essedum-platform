import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { PromptServices } from '../../prompts/prompt.service';
import { AIWorkerDTO, userInputParamsGrid } from '../promptAgent';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { SemanticService } from '../../services/semantic.services';
import { HttpParams } from '@angular/common/http';
import { LedsModalService } from 'leds-lib';
import { Options } from '@angular-slider/ngx-slider';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { StreamingServices } from '../../streaming-services/streaming-service';

@Component({
  selector: 'app-prepare-agent',
  templateUrl: './prepare-agent.component.html',
  styleUrl: './prepare-agent.component.scss'
})
export class PrepareAgentComponent implements OnInit {
  @ViewChild('formJsonEditor', { static: false }) formJsonEditor: JsonEditorComponent;

  editorOptions = new JsonEditorOptions();
  schemaForm: any;
  editMode: boolean = false;
  userInputs_name: string;
  userInputs_value: string;
  task: string;
  mlaiworkerName: any;
  mlaiworker: any;
  editedEntries: { key: string; value: unknown; }[];
  plan: any;
  bpm: any;
  validation_results: any;
  workflow: any = {};
  navigate_url: string = "";
  workerName: any;
  instance_name: any;
  planner_inputs: {};
  bots: any;
  providers: any = [];
  alias: String;
  description: String;
  startLoader: boolean = false;
  sop_status_flag: boolean = false;
  plan_status_flag: boolean = false;
  valid_status_flag: boolean = false;
  wkfl_status_flag: boolean = false;
  lang_status_flag: boolean = false;
  sop_status_msg: string;
  create_sop: boolean = false;
  aiWorker: AIWorkerDTO;
  plan_status_msg: string;
  valid_status_msg: string;
  wkfl_status_msg: string;
  lang_status_msg: string;
  plan_max_tokens = 5000;
  plan_temperature = 1;
  plan_top_p = 1;
  plan_frequency_penalty = 1;
  plan_presence_penalty = 1;
  valid_max_tokens = 5000;
  valid_temperature = 0.5;
  valid_top_p = 0.5;
  valid_presence_penalty = 0.5;
  valid_frequency_penalty = 0.5;
  wkfl_max_tokens = 5000;
  wkfl_temperature = 0.5;
  wkfl_top_p = 0.5;
  wkfl_presence_penalty = 0.5;
  wkfl_frequency_penalty = 0.5;
  loptions: Options = { floor: 0, ceil: 10000, showTicks: true, showTicksValues: true, tickStep: 5000, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1' };
  toptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  tpoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  ppoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  fpoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  config: any = {};
  taskGroup: any;
  taskIndex: any;
  isAuth: boolean = false;
  newTask: boolean = false;
  mlaiworkerList: any = [];
  versions: Array<versionArray> = [];
  default_index: any;
  showPanel: boolean = false;
  regexPattern = `^(?!REX)[a-zA-Z0-9\_\-]+$`;
  regexPatterForEmptyNames = `^(?!www$)[a-zA-Z0-9\_\-]+$`;
  regexPatternString: any;
  regexPatternObj: any
  nameValidator: any;
  regString: string = '';
  regexPatternForExistingNames = `^(?!REX).+$`;
  regexPatternForValidAlphabets = `^[a-zA-Z0-9\_\-]+$`;
  regexPatternForExistingNamesObj: any;
  regexPatternForValidAlphabetsObj: any;
  errMsg: string;
  nameFlag: boolean = false;
  errMsgFlag: boolean = false;
  filteredVersions = [];
  searchQuery: string = '';
  version_oldName: any;
  disable_sop_next: boolean = false;
  disable_plan_next: boolean = false;
  disable_valid_next: boolean = false;
  disable_wkfl_save: boolean = false;
  langGraph_json: any;
  langgraph_view: boolean;
  langScript: string[] = [];
  langgraph_loading: boolean = false;


  constructor(
    private location: Location,
    private promptService: PromptServices,
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private semanticService: SemanticService,
    private modalService: LedsModalService,
    private dialog: MatDialog,
  ) { }
  userInputs: any = {};
  userInputParamsArray: Array<userInputParamsGrid> = [];
  SOP_response: string;
  json_view: boolean = true;
  bpm_view: boolean = false;
  wk_viewer_value: string = "json";
  steps = { "action_group": true, "SOP": false, "plan": false, "validation_results": false, "workflow": false };
  versionSelected = {};
  configValues: Config = {
    plan: {
      max_tokens: 5000,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1
    },
    validation: {
      max_tokens: 5000,
      temperature: 0.5,
      top_p: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    },
    workflow: {
      max_tokens: 5000,
      temperature: 0.5,
      top_p: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    }
  };
  version_name: string;
  version_isDefault: boolean = false;
  current_index: number;
  taskdescription: any;

  ngOnInit() {
    this.authentications();
    this.taskIndex = history.state.taskIndex || 0;
    //Prepare Plan
    this.route.params.subscribe((params) => {
      this.workerName = params['name'];
      let org = sessionStorage.getItem('organization');
      this.promptService.getAgentByName(this.workerName, org).subscribe((res) => {
        if (res) {
          this.aiWorker = res;
          this.semanticService.getTopicByTopicNameAndOrg(this.aiWorker.knowledgeBase).subscribe((response) => {
            this.instance_name = response["adapterinstance"];
          });
          this.formatTaskGroup(this.aiWorker.taskGroup);
          this.alias = this.aiWorker.alias;
          this.description = this.aiWorker.description;

          this.route.params.subscribe((params) => {
            this.mlaiworkerName = params['name'];
          });
          this.getAiworkers();
          // this.promptService.getAiWorkerByNameAndOrgAndTask(this.mlaiworkerName, sessionStorage.getItem('organization'), this.task).subscribe((response) => {
          //   //view plan
          //   // this.mlaiworker = response.body; //commented for now

          //   this.mlaiworkerList = response.body;
          //   if (this.mlaiworkerList.length > 0) {
          //     this.versions = [];
          //     this.filteredVersions = [];
          //     this.mlaiworkerList.forEach((element, index) => {
          //       this.versions.push({ versionname: element.versionname, isdefault: element.isdefault, isEditing: false, old_name: element.versionname });
          //       if (element.isdefault) {
          //         this.default_index = index;
          //       }

          //     });
          //     this.filteredVersions = [...this.versions];

          //     if (this.default_index >= 0) {
          //       this.current_index = this.default_index;
          //       this.mlaiworker = this.mlaiworkerList[this.default_index];
          //     } else {
          //       this.current_index = this.versions.length - 1;
          //       this.mlaiworker = this.mlaiworkerList[this.current_index];
          //     }
          //   }

          //   if (this.mlaiworker) {
          //     //commented for now
          //     // this.task = this.mlaiworker.task;
          //     this.userInputParamsArray = [];
          //     this.userInputs = JSON.parse(this.mlaiworker.inputsjson);
          //     Object.keys(this.userInputs).forEach(element => {
          //       this.userInputParamsArray.push({ name: element, value: this.userInputs[element] });
          //     });
          //     this.SOP_response = this.mlaiworker.sop;
          //     this.plan = this.mlaiworker.plan;
          //     this.validation_results = this.mlaiworker.validationResult;
          //     this.workflow = JSON.parse(this.mlaiworker.workflowSteps);
          //     this.bpm = this.mlaiworker.bpm ? this.mlaiworker.bpm : "No Workflow Available";
          //     if (this.mlaiworker.configuration)
          //       this.configValues = JSON.parse(this.mlaiworker.configuration);
          //     this.navigate_url = this.mlaiworker.navigateUrl;
          //   } else {
          //     this.newTask = true;
          //   }
          //   this.generateValidator(this.versions);

          // }, (error) => {
          //   this.newTask = true;
          //   this.generateValidator(this.versions);
          // });
        }
      });
    });

    let org = sessionStorage.getItem('organization');
    this.promptService.getPromptProviders(org).subscribe(
      res => {
        this.providers = res.body;
      },
      error => {
        this.service.message('Error in fetching prompt providers.', 'error');
      }
    )

    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.mode = "text";

    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.onChange = () => {
      this.schemaForm = this.formJsonEditor.get();
    }
  }

  getAiworkers(indexx?) {
    this.promptService.getAiWorkerByNameAndOrgAndTask(this.mlaiworkerName, sessionStorage.getItem('organization'), this.task).subscribe((response) => {
      //view plan
      // this.mlaiworker = response.body; //commented for now

      this.mlaiworkerList = response.body;
      this.versions = [];
      this.filteredVersions = [];
      if (this.mlaiworkerList.length > 0) {
        this.mlaiworkerList.forEach((element, index) => {
          this.versions.push({ versionname: element.versionname, isdefault: element.isdefault, isEditing: false, old_name: element.versionname });
          if (element.isdefault) {
            this.default_index = index;
          }

        });
        this.filteredVersions = [...this.versions];

        if (this.default_index >= 0) {
          this.current_index = this.default_index;
          this.mlaiworker = this.mlaiworkerList[this.default_index];
        } else {
          this.current_index = this.versions.length - 1;
          this.mlaiworker = this.mlaiworkerList[this.current_index];
        }
        if (indexx != undefined) {
          this.current_index = indexx;
          this.mlaiworker = this.mlaiworkerList[indexx];
        }
        if (this.mlaiworker) {
          this.langGraph_json = this.mlaiworker.langgraphJson;
          //commented for now
          // this.task = this.mlaiworker.task;
          this.userInputParamsArray = [];
          this.userInputs = JSON.parse(this.mlaiworker.inputsjson);
          Object.keys(this.userInputs).forEach(element => {
            this.userInputParamsArray.push({ name: element, value: this.userInputs[element] });
          });
          this.SOP_response = this.mlaiworker.sop;
          this.plan = this.mlaiworker.plan;
          this.validation_results = this.mlaiworker.validationResult;
          this.workflow = JSON.parse(this.mlaiworker.workflowSteps);
          this.bpm = this.mlaiworker.bpm ? this.mlaiworker.bpm : "No Workflow Available";
          if (this.mlaiworker.configuration)
            this.configValues = JSON.parse(this.mlaiworker.configuration);
          this.navigate_url = this.mlaiworker.navigateUrl;
        } else {
          this.newTask = true;
          this.langGraph_json = null;
        }
        if (this.langGraph_json == null) {
          this.createNewLangGraph();
        }
        else
          this.readLanggraph(this.langGraph_json);
        this.generateValidator(this.versions);
      }

      // if (this.mlaiworker) {
      //   //commented for now
      //   // this.task = this.mlaiworker.task;
      //   this.userInputParamsArray = [];
      //   this.userInputs = JSON.parse(this.mlaiworker.inputsjson);
      //   Object.keys(this.userInputs).forEach(element => {
      //     this.userInputParamsArray.push({ name: element, value: this.userInputs[element] });
      //   });
      //   this.SOP_response = this.mlaiworker.sop;
      //   this.plan = this.mlaiworker.plan;
      //   this.validation_results = this.mlaiworker.validationResult;
      //   this.workflow = JSON.parse(this.mlaiworker.workflowSteps);
      //   this.bpm = this.mlaiworker.bpm ? this.mlaiworker.bpm : "No Workflow Available";
      //   if (this.mlaiworker.configuration)
      //     this.configValues = JSON.parse(this.mlaiworker.configuration);
      //   this.navigate_url = this.mlaiworker.navigateUrl;
      // } else {
      //   this.newTask = true;
      // }
      // this.generateValidator(this.versions);

    }, (error) => {
      this.newTask = true;
      this.generateValidator(this.versions);
    });
  }

  createNewLangGraph(status?) {
    let verName = status ? this.version_name : this.mlaiworker.versionname;
    const newCanvas = new StreamingServices();
    newCanvas.alias = this.task + " " + verName;
    newCanvas.type = 'NativeScript';
    newCanvas.interfacetype = 'pipeline';
    newCanvas.is_template = false,
      newCanvas.organization = sessionStorage.getItem('organization');
    this.service.create(newCanvas).subscribe((data) => {
      if (data) {
        const formData: FormData = new FormData();
        let script = "";
        let scriptFile = new Blob([script], { type: 'text/plain' });
        formData.set('scriptFile', scriptFile);
        this.service.createNativeFile(data.name, data.organization, undefined, 'Python3', formData).subscribe((fileres) => {
          this.service.message('Langgraph created successfully.', 'success');
          data.json_content = JSON.stringify({ "elements": [{ "attributes": { "filetype": "Python3", "files": [fileres], "arguments": [
            {"name":"org","value":sessionStorage.getItem("organization"),"type":"Text","alias":sessionStorage.getItem("organization"),"index":"1"},
            {"name":"instanceUrl","value":window.location.origin,"type":"Text","alias":window.location.origin,"index":"2"},
            {"name":"workerlogId","value":"","type":"Text","alias":"","index":"3"},
            {"name":"dsrc","value":"LEALCLCL12132","type":"Text","alias":"LEALCLCL12132","index":"4"}
          ], "dataset": [] } }] });
          this.service.update(data).subscribe(res => { });
        });
        this.langGraph_json = { "pipelineName": data.name, "pipelineCid": data.cid };
        if (status && status == "newVersion"){
          this.saveNewWorkerVersion(this.langGraph_json)
          this.bpm_view = false;
          this.json_view = false;
          this.selectWkflowViewer('langgraph_view')
          this.generate_langgraph();
        }
        else
          this.updateAiWorkerLanggraph(this.langGraph_json);
      }
    });
  }

  updateAiWorkerLanggraph(langgraph) {
    let payyload = this.mlaiworkerList[this.current_index];
    payyload.langgraphJson = langgraph;
    payyload.configuration = JSON.parse(this.mlaiworkerList[this.current_index].configuration) || this.configValues
    payyload.inputsjson = JSON.parse(this.mlaiworkerList[this.current_index].inputsjson)
    payyload.workflowsteps = JSON.parse(this.mlaiworkerList[this.current_index].workflowSteps)
    payyload.validationresults = this.mlaiworkerList[this.current_index].validationResult
    payyload["Navigate_Url"] = this.mlaiworkerList[this.current_index].navigateUrl
    delete payyload["navigateUrl"];
    delete payyload["validationResult"];
    delete payyload["workflowSteps"];
    payyload["langgraphJson"] = this.langGraph_json;
    let org = sessionStorage.getItem('organization');
    this.promptService.updateAiWorker(payyload, this.workerName, org).subscribe(res => {
      this.getAiworkers(this.current_index);
    });
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

  formatTaskGroup(tasks) {
    this.taskGroup = JSON.parse(tasks);
    this.task = this.taskGroup[this.taskIndex].taskName;
    this.taskdescription = this.taskGroup[this.taskIndex].description ? this.taskGroup[this.taskIndex].description : '';
    this.bots = this.taskGroup[this.taskIndex].bots;
    // this.userInputs = JSON.parse(this.taskGroup[this.taskIndex].inputs);
    this.userInputs = this.taskGroup[this.taskIndex].inputs;

    Object.keys(this.userInputs).forEach(element => {
      this.userInputParamsArray.push({ name: element, value: this.userInputs[element] });
    });
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("ai-worker-prepare")) {
          this.isAuth = true;
        }
        if (!this.isAuth) {
          this.loptions.disabled = !this.isAuth;
          this.toptions.disabled = !this.isAuth;
          this.tpoptions.disabled = !this.isAuth;
          this.ppoptions.disabled = !this.isAuth;
          this.fpoptions.disabled = !this.isAuth;
        }
      }
    );
  }

  generate_SOP() {
    this.selectChangeHandler('SOP');
    this.SOP_response = "";
    this.plan = "";
    this.validation_results = "";
    this.workflow = {};
    this.bpm = "";
    this.create_sop = false;
    this.sop_status_flag = true;
    this.disable_sop_next = true;
    // Initialize the output message
    this.sop_status_msg = 'Fetching Instructions';
    let dotCount = 0;
    const maxDots = 3;

    // Create blinking effect
    const intervalId = setInterval(() => {
      dotCount = (dotCount + 1) % (maxDots + 1);
      this.sop_status_msg = 'Fetching Instructions' + ' .'.repeat(dotCount);
    }, 500);
    let query = '';
    if (this.taskdescription == undefined || this.taskdescription == '') {
      query = "What is the SOP for " + this.task + "? Give the answer in Steps";
    }
    else {
      query = this.taskdescription;
    }
    let payload = {

      "index_name": this.aiWorker.knowledgeBase,

      "query": query

    }

    let org = sessionStorage.getItem('organization');
    this.promptService.generateSOP(this.instance_name, org, payload).subscribe((response) => {
      // this.sop_status_flag = false;
      clearInterval(intervalId);
      this.sop_status_msg = 'Instructions fetched';
      this.SOP_response = response[0]['Answer'];
      this.disable_sop_next = false;
    }, (error) => {
      // this.sop_status_flag = false;
      clearInterval(intervalId);
      this.sop_status_msg = 'Fetching Instructions failed';
      this.create_sop = true;
      if (this.SOP_response == undefined)
        this.SOP_response = "//Write instructions here";
      this.disable_sop_next = false;
    });
  }

  generate_plan() {
    this.selectChangeHandler('plan');
    this.plan = "";
    this.validation_results = "";
    this.workflow = {};
    this.bpm = "";
    if (this.aiWorker.llm && this.aiWorker.planner) {
      this.plan_status_flag = true;
      this.disable_plan_next = true;
      // Initialize the output message
      this.plan_status_msg = 'Generating Plan';
      let dotCount = 0;
      const maxDots = 3;

      // Create blinking effect
      const intervalId = setInterval(() => {
        dotCount = (dotCount + 1) % (maxDots + 1);
        this.plan_status_msg = 'Generating Plan' + ' .'.repeat(dotCount);
      }, 500);

      this.userInputParamsArray.forEach(element => {
        this.userInputs[element.name] = element.value;
      });
      this.planner_inputs = {};
      this.planner_inputs['user_task'] = this.SOP_response;
      this.planner_inputs['user_input_params'] = this.userInputs;
      this.planner_inputs['bots'] = this.bots
      let index = this.providers.findIndex(option => option.name === this.aiWorker.llm);
      let payload = {
        "inputs": this.planner_inputs,
        "type": this.providers[index].type.toLowerCase(),
        "prompt_name": this.aiWorker.planner,
        "provider": this.aiWorker.llm,
        "configuration": {
          "max_tokens": this.configValues.plan.max_tokens,
          "temperature": this.configValues.plan.temperature,
          "top_p": this.configValues.plan.top_p,
          "frequency_penalty": this.configValues.plan.frequency_penalty,
          "presence_penalty": this.configValues.plan.presence_penalty
        },
        "organization": sessionStorage.getItem('organization')
      }

      this.promptService.startGeneration(payload).subscribe({
        next: (data) => {
          // this.plan_status_flag = false;
          clearInterval(intervalId);
          this.plan_status_msg = 'Plan generated';
          this.plan = data.body;
          this.disable_plan_next = false;
        },
        error: (error) => {
          // this.plan_status_flag = false;
          clearInterval(intervalId);
          this.plan_status_msg = 'Plan generation failed';
          this.disable_plan_next = false;
          if (this.plan == undefined)
            this.plan = 'Error! ' + error + '\nRefresh to generate Plan.';
        }
      })
    }

  }

  generate_validation() {
    this.selectChangeHandler('validation_results');
    this.validation_results = "";
    this.workflow = {};
    this.bpm = "";
    if (this.aiWorker.llm && this.aiWorker.validator) {
      // Initialize the output message
      this.valid_status_msg = 'Validating Plan';
      let dotCount = 0;
      const maxDots = 3;

      // Create blinking effect
      const intervalId = setInterval(() => {
        dotCount = (dotCount + 1) % (maxDots + 1);
        this.valid_status_msg = 'Validating Plan' + ' .'.repeat(dotCount);
      }, 500);
      this.valid_status_flag = true;
      this.disable_valid_next = true;


      this.userInputParamsArray.forEach(element => {
        this.userInputs[element.name] = element.value;
      });
      this.planner_inputs = {};
      this.planner_inputs['user_task'] = this.SOP_response;
      this.planner_inputs['user_input_params'] = this.userInputs;
      this.planner_inputs['bots'] = this.bots
      this.planner_inputs['input_plan'] = this.plan;
      let index = this.providers.findIndex(option => option.name === this.aiWorker.llm);
      let payload = {
        "inputs": this.planner_inputs,
        "type": this.providers[index].type.toLowerCase(),
        "prompt_name": this.aiWorker.validator,
        "provider": this.aiWorker.llm,
        "configuration": {
          "max_tokens": this.configValues.validation.max_tokens,
          "temperature": this.configValues.validation.temperature,
          "top_p": this.configValues.validation.top_p,
          "frequency_penalty": this.configValues.validation.frequency_penalty,
          "presence_penalty": this.configValues.validation.presence_penalty
        },
        "organization": sessionStorage.getItem('organization')
      }

      this.promptService.startGeneration(payload).subscribe({
        next: (data) => {
          clearInterval(intervalId);
          this.valid_status_msg = 'Plan Validated';
          this.disable_valid_next = false;
          const responseValidString = data.body;
          let formatValid = this.extractJsonFromString(responseValidString)
          if (formatValid)
            this.validation_results = "Accuracy: " + formatValid["Accuracy"] + "\n" + "Explanation: " + formatValid["Explanation"];
          else
            this.validation_results = responseValidString;
        },
        error: (error) => {
          // this.valid_status_flag = false;
          clearInterval(intervalId);
          this.valid_status_msg = 'Plan Validation failed';
          this.disable_valid_next = false;
          if (this.validation_results == undefined)
            this.validation_results = 'Error! ' + error + '\nRefresh to validate plan.';
        }
      })
    }

  }

  generate_workflow() {
    this.selectChangeHandler('workflow');
    this.workflow = {};
    this.bpm = "";
    if (this.aiWorker.llm && this.aiWorker.generator) {
      this.wkfl_status_flag = true;
      this.disable_wkfl_save = true;

      // Initialize the output message
      this.wkfl_status_msg = 'Generating Workflow';
      let dotCount = 0;
      const maxDots = 3;

      // Create blinking effect
      const intervalId = setInterval(() => {
        dotCount = (dotCount + 1) % (maxDots + 1);
        this.wkfl_status_msg = 'Generating Workflow' + ' .'.repeat(dotCount);
      }, 500);

      this.userInputParamsArray.forEach(element => {
        this.userInputs[element.name] = element.value;
      });
      this.planner_inputs = {};
      this.planner_inputs['user_input'] = this.plan;
      let index = this.providers.findIndex(option => option.name === this.aiWorker.llm);
      let payload = {
        "inputs": this.planner_inputs,
        "type": this.providers[index].type.toLowerCase(),
        "prompt_name": this.aiWorker.generator,
        "provider": this.aiWorker.llm,
        "configuration": {
          "max_tokens": this.configValues.workflow.max_tokens,
          "temperature": this.configValues.workflow.temperature,
          "top_p": this.configValues.workflow.top_p,
          "frequency_penalty": this.configValues.workflow.frequency_penalty,
          "presence_penalty": this.configValues.workflow.presence_penalty
        },
        "organization": sessionStorage.getItem('organization')
      }

      this.promptService.startGeneration(payload).subscribe({
        next: (data) => {
          // this.wkfl_status_flag = false;
          clearInterval(intervalId);
          this.wkfl_status_msg = 'Workflow Generated';
          this.disable_wkfl_save = false;
          const responseString = data.body;
          this.workflow = this.extractJsonFromString(responseString);
        },
        error: (error) => {
          // this.wkfl_status_flag = false;
          clearInterval(intervalId);
          this.wkfl_status_msg = 'Workflow Generation failed';
          this.disable_wkfl_save = false;
          if (this.workflow == undefined)
            this.workflow = 'Error! ' + error + '\nRefresh to generate workflow.';
        }
      })
    }

  }

  generate_langgraph() {
    this.langgraph_loading = true;
    if (this.workflow) {
      this.lang_status_flag = true;

      // Initialize the output message
      this.lang_status_msg = 'Generating LangGraph';
      let dotCount = 0;
      const maxDots = 3;

      // Create blinking effect
      const intervalId = setInterval(() => {
        dotCount = (dotCount + 1) % (maxDots + 1);
        this.lang_status_msg = 'Generating LangGraph' + ' .'.repeat(dotCount);
      }, 500);

      let lanng = JSON.parse(this.langGraph_json)
      let pipelineJson = {
        workflow: this.workflow,
        inputs: this.userInputs
      }
      this.service.savePipelineJSON(lanng.pipelineName, pipelineJson).subscribe(
        res => {
          let body = { pipelineName: lanng.pipelineName, scriptPath: res.path[0] }
          this.service.triggerPostEvent("generateScript_langgraph", body, "").subscribe(
            resp => {
              this.service.getEventStatus(resp).subscribe(
                status => {
                  if (status == 'COMPLETED') {
                    this.readGeneratedScript(lanng.pipelineName, intervalId);
                  }
                  else if (status == 'ERROR') {
                    clearInterval(intervalId);
                    this.lang_status_msg = 'LangGraph Generation failed';
                  }
                }, error => {
                  clearInterval(intervalId);
                  this.lang_status_msg = 'LangGraph Generation failed';
                });
            }, error => {
              clearInterval(intervalId);
              this.lang_status_msg = 'LangGraph Generation failed';
            }
          );
        },
        error => {
          clearInterval(intervalId);
          this.lang_status_msg = 'LangGraph Generation failed';
        }
      );
    }
  }

  onScriptChange($event) {
    this.langScript = $event;
  }

  readGeneratedScript(pipelineName, intervalId) {
    this.service.readGeneratedScript(pipelineName).subscribe(
      async (res) => {
        let fileObj = await res.body
        this.langgraph_loading = false;
        this.langScript = fileObj.script[0];
        const formData: FormData = new FormData();
        let scriptFile = new Blob([this.langScript.join('\n')], { type: 'text/plain' });
        formData.set('scriptFile', scriptFile);
        let org = sessionStorage.getItem('organization');
        let fName = pipelineName + "_" + org + ".py";
        this.service.createNativeFile(pipelineName, org, fName, 'Python3', formData).subscribe((fileres) => {
          clearInterval(intervalId);
          this.lang_status_msg = "LangGraph Generated";
        });
      },
      error => {
        clearInterval(intervalId);
        this.lang_status_msg = 'LangGraph Generation failed';
      }
    );
  }

  extractJsonFromString(str: string): any {
    const jsonStart = str.indexOf('{');
    if (jsonStart === -1) return null;

    let openBraces = 0;
    let jsonEnd = jsonStart;

    for (let i = jsonStart; i < str.length; i++) {
      if (str[i] === '{') openBraces++;
      if (str[i] === '}') openBraces--;
      if (openBraces === 0) {
        jsonEnd = i + 1;
        break;
      }
    }

    const jsonString = str.substring(jsonStart, jsonEnd);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  }

  saveAiWorker(index?: number) {
    this.userInputParamsArray.forEach(element => {
      this.userInputs[element.name] = element.value;
    });

    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    let org = sessionStorage.getItem('organization');
    if (!this.newTask && index >= 0) {
      let userInputs = JSON.parse(this.mlaiworkerList[index].inputsjson);

      let payload = {
        "alias": this.alias,
        "description": this.description,
        "task": this.task,
        "inputsjson": userInputs,
        "sop": this.mlaiworkerList[index].sop,
        "langgraphJson": JSON.parse(this.mlaiworker.langgraphJson),
        "validationresults": this.mlaiworkerList[index].validationResult,
        "workflowsteps": JSON.parse(this.mlaiworkerList[index].workflowSteps),
        "bpm": this.mlaiworkerList[index].bpm,
        "Navigate_Url": this.mlaiworkerList[index]?.navigate_url ? this.mlaiworkerList[index].navigate_url : '',
        "plan": this.mlaiworkerList[index].plan,
        "configuration": this.mlaiworkerList[index].configuration ? JSON.parse(this.mlaiworkerList[index].configuration) : this.configValues,
        "versionname": this.version_name || this.mlaiworkerList[index].versionname,
        "isdefault": this.mlaiworkerList[index].isdefault,
        "old_name": this.version_oldName,
      }
      this.promptService.updateAiWorker(payload, this.workerName, org).subscribe(
        (response: any) => {
          if (response.status == 200) {
            this.service.message('Updated successfully.', 'success');
            if (this.version_name != this.version_oldName) {
              this.updateLangGraph(this.version_name, payload.langgraphJson.pipelineCid);
            }
            this.getAiworkers();
            // this.promptService.getAiWorkerByNameAndOrgAndTask(this.mlaiworkerName, sessionStorage.getItem('organization'), this.task).subscribe((response) => {
            //   this.mlaiworkerList = response.body;
            // });
            // let index = this.versions.findIndex(element => element.versionname === this.version_name);
            // this.versions[index].versionname = this.version_name;
            // this.versions[index].old_name = this.version_name;
          }
        },
        error => {
          this.service.message('Error in updating agent.', 'error');
        }
      );
    } else {
      this.createNewLangGraph("newVersion");
    }

  }

  saveNewWorkerVersion(langgraph) {
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    let payload = {
      "name": this.workerName,
      "alias": this.alias,
      "description": this.description,
      "task": this.task,
      "inputsjson": this.userInputs,
      "sop": this.SOP_response,
      "langgraphJson": langgraph,
      "validationresults": this.validation_results,
      "workflowsteps": this.workflow,
      "bpm": this.bpm,
      "Navigate_Url": this.navigate_url,
      "plan": this.plan,
      "configuration": this.configValues,
      "versionname": this.version_name,
      "isdefault": this.version_isDefault,
    }
    this.promptService.saveAiWorker(payload, params).subscribe(
      (response: any) => {
        if (response.status == 200) {
          let worker = response.body;
          if (worker.isdefault) {
            this.promptService.setTaskDefaultVersion(worker.name, worker.organization, worker.task, worker.versionname).subscribe((response) => { });
          }
          this.version_name = '';
          this.service.message('Saved successfully.', 'success');
          this.newTask = false;
          this.getAiworkers();
        }
      },
      error => {
        this.service.message('Error in creating agent.', 'error');
      }
    );
  }

  updateLangGraph(version_name, pipelineCid) {
    this.service.getStreamingServices(pipelineCid).subscribe((data) => {
      data.alias = this.task + " " + version_name;
      this.service.update(data).subscribe((res) => {
      });
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  backToAgent() {
    this.location.back();
  }

  selectChangeHandler(event: any) {
    for (let key in this.steps) {
      this.steps[key] = false;
    }
    this.steps[event] = true;
  }

  selectedStep(event) {
    if (this.steps[event]) return { color: 'white', background: '#7b39b1' };
    else return { color: 'black' };
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
  }

  editUserInputs() {
    this.editMode = true;
  }

  changeUserInputs() {
    this.editMode = false;
    console.log(this.userInputs);
  }

  changesOccurName($event) {
    this.userInputs_name = $event;
    this.userInputs.name = $event;
  }

  changesOccurValue($event) {
    this.userInputs_value = $event;
    this.userInputs.value = $event;
  }

  open(content: any): void {
    this.modalService.openModal(content, 'mini');
  }

  selectWkflowViewer(viewer: string) {
    if (viewer === 'json_view') {
      this.json_view = true;
      this.wk_viewer_value = "json";
    }
    if (viewer === 'bpm_view') {
      this.bpm_view = true;
      this.wk_viewer_value = "bpmn";
    }
    if (viewer === 'langgraph_view') {
      this.langgraph_view = true;
      this.wk_viewer_value = "langgraph";
    }
  }

  publish() {
    // this.router.navigate(["../../../../" + this.navigate_url], { relativeTo: this.route });
    this.router.navigateByUrl(this.navigate_url);
  }

  changesOccurTokens($event, type) {
    switch (type) {
      case 'plan':
        this.configValues.plan.max_tokens = $event;
        break;
      case 'validation':
        this.configValues.validation.max_tokens = $event;
        break;
      case 'workflow':
        this.configValues.workflow.max_tokens = $event;
        break;
    }
  }

  changesOccurTemperature($event, type) {
    switch (type) {
      case 'plan':
        this.configValues.plan.temperature = $event;
        break;
      case 'validation':
        this.configValues.validation.temperature = $event;
        break;
      case 'workflow':
        this.configValues.workflow.temperature = $event;
        break;
    }
  }

  changesOccurTopP($event, type) {
    switch (type) {
      case 'plan':
        this.configValues.plan.top_p = $event;
        break;
      case 'validation':
        this.configValues.validation.top_p = $event;
        break;
      case 'workflow':
        this.configValues.workflow.top_p = $event;
        break;
    }
  }

  changesOccurPresencePenalty($event, type) {
    switch (type) {
      case 'plan':
        this.configValues.plan.presence_penalty = $event;
        break;
      case 'validation':
        this.configValues.validation.presence_penalty = $event;
        break;
      case 'workflow':
        this.configValues.workflow.presence_penalty = $event;
        break;
    }
  }

  changesOccurFrequencyPenalty($event, type) {
    switch (type) {
      case 'plan':
        this.configValues.plan.frequency_penalty = $event;
        break;
      case 'validation':
        this.configValues.validation.frequency_penalty = $event;
        break;
      case 'workflow':
        this.configValues.workflow.frequency_penalty = $event;
        break;
    }
  }

  setDefault(version_name) {
    let index = this.versions.findIndex(element => element.versionname === version_name);
    this.versions.forEach((element) => {
      element.isdefault = false;
    });
    this.versions[index].isdefault = true;
    this.default_index = index;
    this.promptService.setTaskDefaultVersion(this.mlaiworkerList[this.default_index].name, this.mlaiworkerList[this.default_index].organization, this.mlaiworkerList[this.default_index].task, this.mlaiworkerList[this.default_index].versionname).subscribe((response) => {

    });
  }

  saveNewVersion() {
    this.newTask = true;
    this.saveAiWorker();
  }

  viewVersion(version_name) {
    let index = this.versions.findIndex(element => element.versionname === version_name);
    this.mlaiworker = this.mlaiworkerList[index];
    this.current_index = index;
    this.version_name = this.mlaiworker.versionname;
    this.version_isDefault = this.mlaiworker.isdefault;
    this.newTask = false;
    this.alias = this.mlaiworker.alias;
    this.userInputs = JSON.parse(this.mlaiworker.inputsjson);
    this.userInputParamsArray = [];
    this.userInputs = JSON.parse(this.mlaiworker.inputsjson);
    Object.keys(this.userInputs).forEach(element => {
      this.userInputParamsArray.push({ name: element, value: this.userInputs[element] });
    });
    this.SOP_response = this.mlaiworker.sop;
    this.plan = this.mlaiworker.plan;
    this.validation_results = this.mlaiworker.validationResult;
    try {
      this.workflow = JSON.parse(this.mlaiworker.workflowSteps);
    } catch (e) {
      if (this.mlaiworker.workflowSteps === "")
        this.workflow = {}
    }
    this.bpm = this.mlaiworker.bpm ? this.mlaiworker.bpm : "No Workflow Available";
    if (this.mlaiworker.configuration)
      this.configValues = JSON.parse(this.mlaiworker.configuration);
    this.navigate_url = this.mlaiworker.navigateUrl;
    if (this.mlaiworker.langgraphJson) {
      this.langGraph_json = this.mlaiworker.langgraphJson;
    } else {
      this.createNewLangGraph();
    }
  }

  generateValidator(versionsList) {
    this.regexPatternString = this.regexPatterForEmptyNames;
    this.regString = "";
    if (versionsList.length > 0) {
      let listOfNames = [];
      versionsList.forEach(element => {
        listOfNames.push(element.versionname);
      });
      for (let i = 0; i < listOfNames.length; i++) {
        if (i != listOfNames.length - 1)
          this.regString = this.regString.concat(listOfNames[i].concat('$|'));
        else
          this.regString = this.regString.concat(listOfNames[i].concat('$'));
      }
      this.regexPatternString = this.regexPattern.replace('REX', this.regString)
      this.regexPatternForExistingNames = this.regexPatternForExistingNames.replace('REX', this.regString)
    } else {
      this.regexPatternString = this.regexPatterForEmptyNames;
    }
    this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
    this.regexPatternForExistingNamesObj = new RegExp(this.regexPatternForExistingNames, 'i');
    this.regexPatternForValidAlphabetsObj = new RegExp(this.regexPatternForValidAlphabets, 'i');

    this.nameValidator = [Validators.required, Validators.pattern(this.regexPatternObj)];

  }

  changesOccurVersionName($event) {
    // this.alias = $event;
    let versionName = $event;
    this.errMsg = "Name is required field.";
    if (this.regexPatternObj.test(versionName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (versionName.length == 0) {
        this.errMsg = "* Name is required filed.";
      } else if (versionName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = "* Name already exists.";
      } else if (versionName.match(this.regexPatternForValidAlphabetsObj) == null) {
        this.errMsg = "* Name should not contain special characters, accepted special characters are _ and -.";
      }
    }
  }

  selectedVersion(version_name) {
    let index = this.versions.findIndex(element => element.versionname === version_name);
    if (this.current_index == index) return { background: '#f8efff' };
    else return { background: 'white' };
  }

  onJsonEditorChange(event: any): void {
    this.workflow = this.formJsonEditor.get();
  }

  filterVersions(): void {
    this.filteredVersions = this.versions.filter(version =>
      version.versionname.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  editVersionName($event, index) {
    this.versions[index].versionname = $event;
  }

  deleteVersion(index) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.promptService.deleteVersion(this.mlaiworkerList[index].id).subscribe((response) => {
          if (response.status == 200) {
            this.service.message('Deleted successfully.', 'success');
            this.getAiworkers();
          }
        });
      }
    });
  }

  closeDropDown(dropdown: NgbDropdown): void {
    dropdown.close(); // Close the dropdown menu
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}
export class DynamicParamsGrid {
  name: string;
  value: string;
}

export class Config {
  plan: {
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
  validation: {
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
  workflow: {
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
}

export class versionArray {
  versionname: string;
  isdefault: boolean;
  isEditing: boolean;
  old_name: string;
}