import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PromptServices } from '../../prompts/prompt.service';
import { AIWorkerDTO } from '../promptAgent';

@Component({
  selector: 'app-prompt-task-view',
  templateUrl: './prompt-task-view.component.html',
  styleUrl: './prompt-task-view.component.scss'
})
export class PromptTaskViewComponent implements OnInit {

  workerName: string;
  workerConfig: AIWorkerDTO;
  taskGroup: any = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private promptService: PromptServices,
  ) { }

  backToAgent() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.workerName = params['name'];
    });
    this.promptService.getAgentByName(this.workerName, sessionStorage.getItem('organization')).subscribe((res) => {
      this.workerConfig = res;
      this.formatTaskGroup(this.workerConfig.taskGroup);
    });
  }

  formatTaskGroup(tasks) {
    this.taskGroup = JSON.parse(tasks);
  }

  navigateToPrepare(name: string, taskIndex?) {
    this.router.navigate(["../../prepare-workers/" + name], { 
      relativeTo: this.route,
      state: { taskIndex: taskIndex }

      });
  }

  navigateToExecute(name, taskIndex?) {
    let executionType = Object.keys(JSON.parse(this.workerConfig.executor))[0]
    if(executionType == 'pipeline' || executionType == 'langgraph') {
      let selectedTask = this.taskGroup[taskIndex].taskName;
      this.router.navigate(["../../execute-workers/" + name], { 
        relativeTo: this.route,
        state: { 
          taskIndex: taskIndex,
          selectedTask: selectedTask,
          executionType: executionType
         }
      });
    } else {
      this.router.navigateByUrl(JSON.parse(this.workerConfig.executor)[executionType]);
    }
  }

}
