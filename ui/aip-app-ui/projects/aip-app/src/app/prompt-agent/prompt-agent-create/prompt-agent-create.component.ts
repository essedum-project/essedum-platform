import { Component, OnInit } from '@angular/core';
import { AIWorkerDTO, userInputParamsGrid } from '../promptAgent';
import { Location } from '@angular/common';
import { PromptServices } from '../../prompts/prompt.service';
import { Services } from '../../services/service';
import { HttpParams } from '@angular/common/http';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { SemanticService } from '../../services/semantic.services';
import { ActivatedRoute, Router } from '@angular/router';
import { J } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-prompt-agent-create',
  templateUrl: './prompt-agent-create.component.html',
  styleUrl: './prompt-agent-create.component.scss'
})
export class PromptAgentCreateComponent implements OnInit {

  aiWorker: AIWorkerDTO = {
    id: null,
    alias: '',
    name: '',
    description: '',
    llm: '',
    knowledgeBase: '',
    planner: '',
    validator: '',
    generator: '',
    executor: '',
    taskGroup: ''
  };
  providerList: Object;
  userInputParamsArray: any = [];
  promptList: any = [];
  llmList: any = [];
  kbList: any = [];
  pipelineList: any = [];
  botCategoryList: any = [];
  toolCategoryList: any = [];
  botList: any = [];
  toolList: any = [];
  promptOptions: OptionsDTO[] = [];
  llmOptions: OptionsDTO[] = [];
  kbOptions: OptionsDTO[] = [];
  pipelineOptions: OptionsDTO[] = [];
  botCategoryOptions: OptionsDTO[] = [];
  toolCategoryOptions: OptionsDTO[] = [];
  botOptions: OptionsDTO[] = [];
  toolOptions: OptionsDTO[] = [];
  isEdit: boolean;
  workerName: string;
  pageAgentTitle: string = 'Create Agent';
  loadingWorkerData: boolean;
  executionTypeList: OptionsDTO[] = [
    {value: 'pipeline', viewValue: 'Pipeline'}, 
    {value: 'langgraph', viewValue: 'Langgraph'}, 
    // {value: 'bpmn', viewValue: 'BPMN'}
  ];
  executionType: string = '';
  selectedPipeline: String;
  taskGroup: any = [];
  selectedBots: any = [[]];
  selectedLlm: String;
  createEditConfig: boolean = false;
  isCreate: boolean = true;
  toEdit: boolean = false;
  allTools: any = [];
  errMsgFlag: boolean = false;

  constructor(
    private location: Location,
    private service: Services,
    private promptService: PromptServices,
    private route: ActivatedRoute,
    private router: Router,
    private semanticService: SemanticService,
  ) { }

  backToAgent() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  Authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("create-workerConfig")) 
          this.createEditConfig = true;
      }
    );
  }

  ngOnInit() {
    this.getAllConnectionForPrompt();
    this.getAllPrompts();
    this.getAllKnowledgeBases();
    this.getAllPipelines();
    // this.getAllBotCategory();
    this.getAllTools();
    this.Authentications();

    if (this.router.url.includes('edit')) {
      this.isEdit = true;
      this.isCreate = false;
      this.pageAgentTitle = 'Edit AI Worker';
      this.loadingWorkerData = true;
    }
    else if (this.router.url.includes('view')) {
      this.isEdit = false;
      this.isCreate = false;
      this.toEdit = true;
      this.pageAgentTitle = 'View AI Worker';
      this.loadingWorkerData = true;
    }

    this.route.params.subscribe((params) => {
      this.workerName = params['name'];
      let org = sessionStorage.getItem('organization');
      this.promptService.getAgentByName(this.workerName, org).subscribe((res) => {
        if(res) {
          this.aiWorker = res;
          if(this.aiWorker.llm)
            this.selectedLlm = this.llmOptions.find(x => x.value == this.aiWorker.llm).viewValue;
          if(this.aiWorker.knowledgeBase)
            this.aiWorker.knowledgeBase = this.kbOptions.find(x => x.value == this.aiWorker.knowledgeBase).viewValue;
          if(this.aiWorker.planner)
            this.aiWorker.planner = this.promptOptions.find(x => x.value == this.aiWorker.planner).viewValue;
          if(this.aiWorker.validator)
            this.aiWorker.validator = this.promptOptions.find(x => x.value == this.aiWorker.validator).viewValue;
          if(this.aiWorker.generator)
            this.aiWorker.generator = this.promptOptions.find(x => x.value == this.aiWorker.generator).viewValue;
          this.executionType = Object.keys(JSON.parse(this.aiWorker.executor))[0];
          this.formatTaskGroup(this.aiWorker.taskGroup);
          if(this.executionType == 'pipeline') {
            this.selectedPipeline = this.pipelineOptions.find(x => x.value == Object.values(JSON.parse(this.aiWorker.executor))[0]).viewValue;
          }
          this.loadingWorkerData = false;
        }
      });
    });
  }

  formatTaskGroup(tasks) {
    this.taskGroup = JSON.parse(tasks);
    this.taskGroup.forEach((task,index) => {
      this.userInputParamsArray[index] = [];
      Object.keys(task.inputs).forEach(element => {
        this.userInputParamsArray[index].push({name: element, value: task.inputs[element]});
      });
      // this.onBotCategoryChange(task.botCategory, index);
      if(task.bots != null && task.bots != '') {
        typeof task.bots == 'string' ? task.bots = JSON.parse(task.bots) : task.bots;
        this.selectedBots[index] = [];
        task.bots.forEach(bot => {
          this.selectedBots[index].push(bot.name);
        });
      }
    })
  }

  removeTask(index?) {
    this.taskGroup.splice(index, 1);
    this.userInputParamsArray.splice(index, 1);
    this.selectedBots.splice(index, 1);
  }

  addTaskAtIndex(index?) {
    index = index ? index : this.taskGroup.length - 1;
    this.taskGroup.splice(index+1, 0, {taskName:'', inputs: {}, bots: [], description: ''});
    this.userInputParamsArray.splice(index+1, 0, []);
    this.selectedBots.splice(index+1, 0, []);
  }

  navigateToEditConfigure(name: string) {
    this.router.navigate(["../../editConfig/" + name ], { relativeTo: this.route });
  }

  getAllConnectionForPrompt() {
    let org = sessionStorage.getItem('organization');
    let providers: any =[];
    this.promptService.getPromptProviders(org).subscribe(
      res => {
        providers = res.body;
        providers.forEach(element => {
          this.llmList.push(element.type + '-' + element.alias);
          this.llmOptions.push(new OptionsDTO(element.type + '-' + element.alias, element.name ));
        });
      },
      error => {
        this.service.message('Error in fetching prompt providers.', 'error');
      }
    )

  }

  getAllPrompts() {
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    let prompts: any = [];
    // this.promptService.getPromptCards(params).subscribe((res) => {
      this.promptService.getAllPromptsList(sessionStorage.getItem('organization')).subscribe((res) => {
      if(res.body) {
        prompts = res.body;
        prompts.forEach(prompt => {
          this.promptList.push(prompt.alias);
          this.promptOptions.push(new OptionsDTO(prompt.alias, prompt.name));
        });
      }
    });
  }

  getAllKnowledgeBases() {
    let mlTopics: any = [];
    this.semanticService.getAllTopics().subscribe(res => {
      mlTopics = res;
      mlTopics.forEach(topic => {
        this.kbList.push(topic.topicname);
        this.kbOptions.push(new OptionsDTO(topic.topicname, topic.topicname));
      });
    },error => {
      this.service.message('Error in fetching knowledge bases.', 'error');
    })
  }

  getAllPipelines() {
    this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe((res) => {
      res.forEach((ele)=> {
        this.pipelineList.push(ele.alias);
        this.pipelineOptions.push(new OptionsDTO(ele.alias, ele.name));
      });
      this.selectedPipeline = this.pipelineOptions.find(x => x.value == Object.values(JSON.parse(this.aiWorker.executor))[0]).viewValue;
    }, error => {
      this.service.message('Error in fetching pipelines.', 'error');
    })
  }

  getAllBotCategory() {
    this.promptService.getAllBotCategory().subscribe((res) => {
      res.forEach((ele) => {
        this.botCategoryList.push(ele);
        this.botCategoryOptions.push(new OptionsDTO(ele, ele));
      });
    }, error => {
      this.service.message('Error in fetching bot categories.', 'error');
    });
  }

  getBotsByCategory(category) {
    this.promptService.getBotByCategory(category).subscribe((res) => {
      res.forEach((ele) => {
        let botIndex = this.botList.indexOf(ele.botName)
        if(botIndex != -1) {
          this.botList.splice(botIndex, 1);
          this.botOptions.splice(botIndex, 1);
        }
        this.botList.push(ele.botName);
        this.botOptions.push(new OptionsDTO(ele.botName, ele.id));
      });
    }, error => {
      this.service.message('Error in fetching bots.', 'error');
    });
  }

  getAllTools() {
    let params: HttpParams = new HttpParams();
    this.allTools = [];
    params = params.set('project', sessionStorage.getItem('organization'));
    this.promptService.getAllWorkerTools(params).subscribe((res) => {
      if(res.body) {
        this.allTools = res.body;
        this.allTools.forEach(ele => {
          this.toolList.push(ele.name);
          this.toolOptions.push(new OptionsDTO(ele.alias, ele.name));
          let catList = JSON.parse(ele.category);
          catList.forEach(cat => {
            if(!this.toolCategoryList.includes(cat)) {
              this.toolCategoryList.push(cat);
              this.toolCategoryOptions.push(new OptionsDTO(cat, cat));
            }
          });
        });
      }
    });
  }

  onLLMChange(event) {
    this.llmOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.llm = element.value;
      }
    });
  }

  onKbChange(event) {
    this.kbOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.knowledgeBase = element.value;
      }
    });
  }

  onPlannerChange(event) {
    this.promptOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.planner = element.value;
      }
    });
  }

  onValidatorChange(event) {
    this.promptOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.validator = element.value;
      }
    });
  }

  onExecutionTypeSelection(event) {
    this.executionType = event;
    let executor = {};
    if(event == 'bpmn') {
      executor['bpmn'] = 'landing/tickets/icms/inbox';
    }
    else {
      executor[event] = '';
    }
    this.aiWorker.executor = JSON.stringify(executor);
  }

  onExecutorPipelineChange(event) {
    this.pipelineOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.executor = JSON.stringify({[this.executionType]: element.value});
      }
    });
  }

  onGeneratorChange(event) {
    this.promptOptions.forEach(element => {
      if(element.viewValue == event) {
        this.aiWorker.generator = element.value;
      }
    });
  }

  onUserInputChange($event, index) {
    this.userInputParamsArray[index] = $event;
    // this.aiWorker.userInputs = $event;
  }

  onToolChange(event, index) {
    event.forEach(eve => {
      let filterTool = this.allTools.find(x => x.name == eve);
      let tool = {
        id: filterTool.id,
        name: filterTool.name,
        description: filterTool.description,
        input: JSON.parse(filterTool.inputParams),
        output: JSON.parse(filterTool.outputParams)
      };
      const botFound = this.taskGroup[index].bots.filter(x => x.name.toString() == eve.toString())[0];
      const botIndex = this.taskGroup[index].bots.indexOf(botFound)
      if(botIndex != -1) 
        this.taskGroup[index].bots.splice(botIndex, 1);
      this.taskGroup[index].bots.push(tool);
    });
  }

  onBotCategoryChange(event, index) {
    this.taskGroup[index].botCategory = event;
    this.getBotsByCategory(event);
  }

  onToolCategoryChange(event, index) {
    this.taskGroup[index].botCategory = event;
    this.toolOptions = [];
    this.allTools.forEach(tool => {
      if(JSON.parse(tool.category).includes(event))
        this.toolOptions.push(new OptionsDTO(tool.alias, tool.name));
    });
  }

  onBotChange(event, index) {
    event.forEach(eve => {
      let filterBot = this.botOptions.find(x => x.value == eve);
      this.promptService.getBotSpecificationById(filterBot.value).subscribe((res) => {
        let bot: Bot;
        let respp = typeof res == 'string' ? JSON.parse(res[0]) : res[0];
        let input = [];
        let output = [];
        respp.inputParameters.forEach(element => {
          input.push(element.parameterName);
        });
        respp.outputParameters.forEach(element => {
          output.push(element.parameterName);
        });
        bot = {
          id: respp.id,
          name: filterBot.viewValue.toString(),
          description: respp.description,
          input: input,
          output: output
        };
        const botFound = this.taskGroup[index].bots.filter(x => x.id.toString() == bot.id.toString())[0];
        const botIndex = this.taskGroup[index].bots.indexOf(botFound)
        if(botIndex != -1) 
          this.taskGroup[index].bots.splice(botIndex, 1);
        this.taskGroup[index].bots.push(bot);
      });
    })
  }

  removeBot(j,index) {
    this.selectedBots[j].splice(index, 1);
    this.taskGroup[j].bots.splice(index, 1);
  }

  formatTaskToSave() {
    let format = this.taskGroup;
    format.forEach((task,index) => {
      task.inputs = {};
      this.userInputParamsArray[index].forEach(element => {
        task.inputs[element.name] = element.value;
      });
    });
    this.aiWorker.taskGroup = JSON.stringify(this.taskGroup);
  }
  
  save() {
    if(this.selectedPipeline && this.executionType && this.aiWorker.alias){
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    this.formatTaskToSave();
    this.promptService.saveAgent(this.aiWorker, params).subscribe(
      (response: any) => {
        if(response.status == 200) {
          this.service.message('Agent created successfully.', 'success');
          this.router.navigate(['../../'], { relativeTo: this.route });
        }
        if(response.status == 409) {
          this.service.message('Agent name already exists.', 'error');
        }
      },
      error => {
        this.service.message('Error in creating agent.', 'error');
      }
    );
  }else{
    this.errMsgFlag = true;
  }
  }

  update() {
    if(this.selectedPipeline && this.executionType && this.aiWorker.alias){
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    this.formatTaskToSave();
    this.promptService.updateAgent(this.aiWorker, params).subscribe(
      (response: any) => {
        if(response.status == 200) {
          this.service.message('Agent updated successfully.', 'success');
          this.router.navigate(['../../'], { relativeTo: this.route });
        }
        if(response.status == 409) {
          this.service.message('Agent name already exists.', 'error');
        }
      },
      error => {
        this.service.message('Error in creating agent.', 'error');
      }
    );
  }else{
    this.errMsgFlag = true;
  }
}
}

export interface Bot {
  id: number;
  name: string;
  description: string;
  input: {};
  output: {};
}