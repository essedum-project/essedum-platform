import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { LedsModalService } from 'leds-lib';
import { PipelineCreateComponent } from '../../pipeline-create/pipeline-create.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { PromptServices } from '../../prompts/prompt.service';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { EventsService } from '../../services/event.service';
import { Events } from '../../sharedModule/events/events';
import { DatasetServices } from '../../dataset/dataset-service';
import { J } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-worker-tools',
  templateUrl: './create-worker-tools.component.html',
  styleUrl: './create-worker-tools.component.scss'
})
export class CreateWorkerToolsComponent {

  type: any;
  option: any;
  toolName: any;
  toolsForm: FormGroup;
  isEdit: boolean = true;
  fetchTagsList: any = [];
  fetchedtagsOptions = [];
  inputParamsArray: any = [];
  outputParamsArray: any = [];
  isCreateTool: boolean = true;
  loadingToolData: boolean = false;
  toolListPipeline: OptionsDTO[] = [];
  toolPageTitle: string = 'Create Tool';
  toolTypeOption: OptionsDTO[] = [{ value: 'Pipeline', viewValue: 'Pipeline' }];
  options: OptionsDTO[] = [{ value: 'new', viewValue: 'Create New' }, { value: 'list', viewValue: 'Choose from existing' }];
  streamingService: StreamingServices;
  event: any;
  selectedCategory: any = [];
  selectedJsonContent: any;
  selectedPipelineName: any;
  selectCat: any = [];

  constructor(
    private router: Router,
    private services: Services,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private eventsService: EventsService,
    private promptService: PromptServices,
    private modalService: LedsModalService,
    private datasetsService: DatasetServices,
  ) { }

  ngOnInit() {
    this.toolsForm = this.formBuilder.group({
      alias: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      toolType: ['', Validators.required],
      inputParams: [''],
      outputParams: [''],
    });

    this.Authentications();
    this.fetchTags();
    this.getToolsPipeline();

    if (this.router.url.includes('edit')) {
      this.isEdit = true;
      this.isCreateTool = false;
      this.toolPageTitle = 'Edit Tool';
      this.loadingToolData = true;
      this.getToolData();
    }
    else if (this.router.url.includes('view')) {
      this.isEdit = false;
      this.isCreateTool = false;
      this.toolPageTitle = 'View Tool';
      this.loadingToolData = true;
      this.getToolData();
    }
  }

  getToolData() {
    this.route.params.subscribe((params) => {
      this.toolName = params['name'];
      let eventId;
      let org = sessionStorage.getItem('organization');
      this.promptService.getWorkerTool(this.toolName, org).subscribe((data) => {
        eventId = JSON.parse(data['jsonContent']).eventId;
        this.inputParamsArray = JSON.parse(data['inputParams']);
        this.outputParamsArray = JSON.parse(data['outputParams']);
        this.selectedCategory = JSON.parse(data['category']);
        this.selectCat = JSON.parse(data['category']);
        this.selectedJsonContent = JSON.parse(data['jsonContent']);
        this.selectedPipelineName = this.selectedJsonContent.pipelineName;
        if(this.isEdit){
          this.getPipeline(this.selectedJsonContent.pipelineName);
          this.eventsService.getEventbyID(eventId).subscribe((res) => {
            this.event = res;
          });
        }
        this.toolsForm.get('alias').setValue(data['alias']);
        this.toolsForm.get('description').setValue(data['description']);
        this.toolsForm.get('toolType').setValue(data['toolType']);
        this.type = data['toolType'];
        this.option = 'list';
        this.loadingToolData = false;
      });
    });
  }

  getPipeline(pipelineName) {
    let org = sessionStorage.getItem('organization');
    this.services.getStreamingServicesByName(pipelineName, org).subscribe((res) => {
      this.streamingService = res;
      this.selectedJsonContent = {};
      this.selectedJsonContent.pipelineId = res.cid;
      this.selectedJsonContent.pipelineName = res.name;
    });
  }

  getToolsPipeline() {
    let org = sessionStorage.getItem('organization');
    this.services.getPipelinesByInterfacetype(org, 'tool').subscribe((res) => {
      res.forEach((element: any) => {
        this.toolListPipeline.push({ viewValue: element.alias, value: element.name });
      });
    });
  }

  Authentications() {
    this.services.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("create-tool")) {
          // this.isCreateTool = true;
        }
      }
    );
  }

  fetchTags() {
    this.datasetsService.getMlTags().subscribe(res => {
      let fetchedtags = res;
      fetchedtags.forEach((opt) => {
        let val = { viewValue: opt.category + ' : ' + opt.label, value: opt.category + ' : ' + opt.label };
        this.fetchedtagsOptions.push(val)
        this.fetchTagsList.push( opt.category + ' : ' + opt.label)
      })
      if(this.toolPageTitle == 'Edit Tool' || this.toolPageTitle == 'View Tool'){
        this.toolsForm.get('category').setValue(this.selectCat);
      }
    });
  }

  onTagChange(event) {
    this.selectedCategory = event;
    this.selectCat = [];
    this.selectCat.push(event);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  toolTypeChange(event) {
    this.type = event;
  }

  optionChange(event) {
    this.option = event;
  }

  onPipelineToolChange(event) {
    this.getPipeline(event);
  }

  onInputChange($event) {
    this.inputParamsArray = $event;
  }

  onOutputChange($event) {
    this.outputParamsArray = $event;
  }

  updateParams() {
    this.toolsForm.get('inputParams').setValue(JSON.stringify(this.inputParamsArray));
    this.toolsForm.get('outputParams').setValue(JSON.stringify(this.outputParamsArray));
  }

  saveTool() {
    this.updateParams();
    if (this.toolsForm.valid) {
      const org = sessionStorage.getItem('organization');
      let tooltype = this.toolsForm.get('toolType').value;
      if (tooltype === 'Pipeline' && this.option === 'new') {
        const newCanvas = new StreamingServices();
        newCanvas.alias = this.toolsForm.get('alias').value;
        newCanvas.description = this.toolsForm.get('description').value;
        newCanvas.type = 'Tool';
        newCanvas.interfacetype = 'tool';
        newCanvas.is_template = false;
        newCanvas.organization = org;
        this.services.create(newCanvas).subscribe((data: StreamingServices) => {
          let tooldata = this.toolsForm.value;
          const eventCanvas = new Events();
          eventCanvas.eventname = this.toolsForm.get('alias').value + 'Event';
          eventCanvas.description = this.toolsForm.get('description').value;
          eventCanvas.body = "{}";
          eventCanvas.jobdetails = JSON.stringify([{ "name": data.name, "type": "pipeline", "runtime": {}}]);
          this.eventsService.createEvent(eventCanvas).subscribe((response) => {
            tooldata['jsonContent'] = JSON.stringify({
              "pipelineName": data.name || '',
              "pipelineId": data.cid || '',
              "eventId": response.id || ''
            })
            tooldata['category'] = JSON.stringify(this.selectCat);
            this.promptService.createWorkerTool(tooldata, org).subscribe((res) => {
              this.services.message('Worker Tool created successfully', 'success');
              this.modalService.dismissAll();
              // this.backToTools();
              this.router.navigate(['../../../pipelines/view/drgndrp' + '/' + data.name], { relativeTo: this.route });
            });
          })
        });
      }
      else if (tooltype === 'Pipeline' && this.option === 'list') {
        let tooldata = this.toolsForm.value;
        tooldata['jsonContent'] = JSON.stringify({
          "pipelineName": this.selectedJsonContent.pipelineName || '',
          "pipelineId": this.selectedJsonContent.pipelineId || '',
          "eventId": this.selectedJsonContent.eventId || ''
        })
        tooldata['category'] = JSON.stringify(this.selectCat);
        this.promptService.createWorkerTool(tooldata, org).subscribe((res) => {
          this.services.message('Worker Tool created successfully', 'success');
          this.modalService.dismissAll();
          this.backToTools();
        });
      }
    }
    else {
      this.services.message('Please fill all the required fields', 'error');
      this.toolsForm.markAllAsTouched();
    }
  }

  editTool() {
    this.updateParams();
    if (this.toolsForm.valid) {
      if (this.toolsForm.get('toolType').value === 'Pipeline' && this.option === 'new') {
        this.streamingService.alias = this.toolsForm.get('alias').value;
        this.streamingService.description = this.toolsForm.get('description').value;
        this.services.update(this.streamingService).subscribe((res) => {
          this.event.eventname = this.toolsForm.get('alias').value + 'Event';
          this.event.description = this.toolsForm.get('description').value;
          this.eventsService.createEvent(this.event).subscribe((response) => {
            let tooldata = this.toolsForm.value;
            tooldata['jsonContent'] = JSON.stringify({
              "pipelineName": res.name,
              "pipelineId": res.cid,
              "eventId": response.id
            })
            tooldata['category'] = JSON.stringify(this.selectCat);
            this.promptService.updateWorkerTool(this.toolName, tooldata).subscribe((data) => {
              this.services.message('Worker Tool updated successfully', 'success');
              this.modalService.dismissAll();
              this.backToTools();
            });
          });
        });
      }
      else if (this.toolsForm.get('toolType').value === 'Pipeline' && this.option === 'list') {
        let tooldata = this.toolsForm.value;
        tooldata['jsonContent'] = JSON.stringify({
          "pipelineName": this.streamingService.name,
          "pipelineId": this.streamingService.cid
        })
        tooldata['category'] = JSON.stringify(this.selectCat);
        this.promptService.updateWorkerTool(this.toolName, tooldata).subscribe((res) => {
          this.services.message('Worker Tool updated successfully', 'success');
          this.modalService.dismissAll();
          this.backToTools();
        });
      }
    }
    else {
      this.services.message('Please fill all the required fields', 'error');
      this.toolsForm.markAllAsTouched();
    }
  }

  backToTools() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  navigateToEditTool(name) {
    this.updateParams();
    this.router.navigate(['../../edit/' + name], {
      relativeTo: this.route,
      state: { toolData: this.toolsForm.value }
    });
  }

}
