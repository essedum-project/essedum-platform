import { Component } from '@angular/core';
import { Services } from '../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs as importedSaveAs } from "file-saver";
import { FileUploader } from 'ng2-file-upload';
import { PipelineService } from '../services/pipeline.service';
import { HttpParams } from '@angular/common/http';
import { PluginService } from '../services/plugin.service';
import { EventsService } from '../services/event.service';
import { RelationshipService } from '../services/relationship.service';
import { AdapterServices } from '../adapter/adapter-service';
import { MashupsService } from '../mashups/mashups.service';
import { PromptServices } from '../prompts/prompt.service';

@Component({
  selector: 'app-copy-cip',
  templateUrl: './copy-cip.component.html',
  styleUrls: ['./copy-cip.component.scss']
})

export class CopyCipComponent {

  projectId: any;
  project: any;
  projectSourceList: any = [];
  projectTargetList: any = [];

  selectedModules: any = {};
  selectedProjectSource: any = '';
  selectedProjectTarget: any = [];

  importedFile: File
  uploader: FileUploader;
  exportflag: boolean = false;

  modulesflag: boolean = true;
  jsonflag: boolean = true;
  importflag: boolean = false
  basicReqTab: any = "Copy";
  moduleList: any = [];
  selectedList: any = [];
  modules: any = {
    "Connections": [], "Datasets": [], "Pipelines": [], "Chains": [], "Grouped_Jobs": [], "Models": [],
    "Prompt": [], "Endpoints": [], "Apps": [], "Adapters_SpecTemplates": [], "Adapters_Adapters": [],
    "Adapters_Instances": [], "Datamodels_Schemas": [], "Datamodels_Relationships": [],
    "JobManagement_Events": [], "Plugins": [], "Mashups":[], "AgenticSystems_Worker": [], 
    "AgenticSystems_Tools": []
  };
  data: any;
  tableData: any = [];
  children: any = [];
  prev_openedRow: any[] = [];
  elementSelect: boolean = false;
  // elementViewFlag: boolean = true;
  params: HttpParams = new HttpParams();
  pageNumber: number = 1;
  dispModules: any = [];
  filter:string = '';
  selectedChild: any[];

  // , "JobManagement_Schedule", "JobManagement_Logs", "Workflows"
  constructor(
    private services: Services,
    private route: ActivatedRoute,
    private router: Router,
    private pipelineService: PipelineService,
    private pluginService: PluginService,
    private eventsService: EventsService,
    private relationService: RelationshipService,
    private adapterServices: AdapterServices,
    private mashupService: MashupsService,
    private promptService: PromptServices,
  ) { }

  ngOnInit() {
    this.getProjectList();
    Object.keys(this.modules).forEach((ele: any) => {
      this.moduleList.push({ value: ele, status: false })
    })
    this.selectedModules = this.modules;
    this.dispModules = Object.keys(this.modules);
  }

  getProjectList() {
    this.projectSourceList = [];
    this.services.getProjectNames().subscribe(res => {
      res.forEach((ele: any) => {
        this.projectTargetList.push({ viewValue: ele, value: ele })
      })
      this.projectSourceList = res;
    })
  }

  onSourceProjectChange(event: any) {
    this.selectedProjectSource = event;
    this.projectTargetList = [];
    this.projectSourceList.forEach((ele: any) => {
      if (this.selectedProjectSource != ele)
        this.projectTargetList.push({ viewValue: ele, value: ele })
    })
  }

  onTargetProjectChange(event: any) {
    this.selectedProjectTarget = event;
  }

  allModules() {
    this.elementSelect = false;
    this.exportflag = false;
    this.modulesflag = !this.modulesflag;
    this.selectedModules = this.modulesflag ? this.modules : {};
    this.dispModules = this.modulesflag ? Object.keys(this.modules) : [];
    this.moduleList.forEach((ele: any) => {
      ele.status = this.modulesflag ? true : false;
    })
  }

  onModuleChange(event: any) {
    this.selectedModules = {};
    this.dispModules = [];
    this.elementSelect = false;
    this.exportflag = false;
    this.moduleList.forEach((ele: any) => {
      if (ele.value == event.value) {
        ele.status = !ele.status;
      }
      if (ele.status) {
        this.selectedModules[ele.value] = "";
        this.dispModules.push(ele.value);
      }
    })
  }

  copyModules() {
    if (this.selectedProjectSource == '' || this.selectedProjectTarget?.length <= 0 || Object.keys(this.selectedModules).length == 0)
      this.services.message("Please select all the fields", "error");
    else {
      this.services.copyCip(this.selectedProjectSource, this.selectedProjectTarget, Object.keys(this.selectedModules)).subscribe(
        res => {
          this.services.message("Copy Blue Print Pipeline has started. Please check the Job Status", "success");
        }, (error) => {
          if (error instanceof TypeError)
            this.services.message("Copy Blueprint has already been done for this project", "error");
          if(error == "Scheduler Paused")
            this.services.message("Scheduler paused. Please resume and retrigger", "error");
          else 
            this.services.message("Copy blueprint failed", "IAMP");
        });
    }
  }

  import() {
    if (this.selectedProjectTarget?.length <= 0)
      this.services.message("Please select all the fields", "error");
    else {
      let formData = new FormData();
      formData.append('file', this.importedFile);
      formData.append('target', JSON.stringify(this.selectedProjectTarget));
      this.services.importCip(formData).subscribe(
        (res) => {
          this.services.message("Imported successfully", "success");
        }, 
        error => {
          if(error == "Scheduler Paused")
            this.services.message("Scheduler paused. Please resume and retrigger", "error");
          else
            this.services.message("Import failed", "error");
        }
      );
    }
  }

  getSelectedModules() {
    let sel = {}
    this.selectedList.forEach((ele: any) => {
      if (ele.status) {
        sel[ele.name] = [];
        ele.value.forEach((ele1: any) => {
          if (ele1.status) {
            sel[ele.name].push(ele1.name);
          }
        })
      }
    })
    console.log("sel", sel)
    return sel;
  }

  search() {
    if (this.selectedProjectSource == '' || this.dispModules.length <= 0)
      this.services.message("Please select source project and select modules", "error");
    else {
      this.exportflag = true;
      this.elementSelect = true;
      this.selectedList = [];
      // this.elementViewFlag = false;
      // this.params = this.params.set('page', this.pageNumber);
      this.params = this.params.set('project', this.selectedProjectSource);
      this.params = this.params.set('isCached', true);
      this.dispModules.forEach((ele: any) => {
        let obj = { name: ele, status: false, value: [] };
        switch (ele) {
          case "Connections":
            this.services.getDatasourceCards(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false, description: r.description })
              })
            })
            break;
          case "Datasets":
            this.services.getDatasetNames(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false })
              })
            })
            break;
          case "Pipelines":
            this.services.getPipelinesByInterfacetype(this.selectedProjectSource, 'pipeline').subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false, description: r.description })
              })
            })
            break;
          case "Chains":
            this.services.getPipelinesByInterfacetype(this.selectedProjectSource, 'chain').subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false, description: r.description })
              })
            })
            break;
          case "Grouped_Jobs":
            this.pipelineService.getAllChainJobs(this.selectedProjectSource, '').subscribe((res) => {
              res.forEach(r => {
                if (r.jobName) obj['value'].push({ name: r.jobName, status: false, description: r.description })
              })
            })
            break;
          case "Models":
            this.services.getAllModels(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false, description: r.description })
              })
            })
            break;
          case "Prompt":
            let promptList: any = [];
            this.promptService.getAllPromptsList(this.selectedProjectSource).subscribe((res) => {
              promptList = res.body;
              promptList.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false, description: r.description })
              });
            });
            break;
          case "Endpoints":
            this.services.getAllEndpoints(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false, description: r.description })
              })
            })
            break;
          case "Apps":
            this.services.getPipelinesByInterfacetype(this.selectedProjectSource, 'App').subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false, description: r.description })
              })
            })
            break;
          case "Adapters_SpecTemplates":
            this.adapterServices.getMlSpecTemplatesCards(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.domainname) obj['value'].push({ name: r.domainname, status: false, description: r.description })
              })
            })
            break;
          case "Adapters_Adapters":
            this.adapterServices.getAdapters(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false, description: r.description })
              })
            })
            break;
          case "Adapters_Instances":
            this.adapterServices.getInstances(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false, description: r.description })
              })
            })
            break;
          case "Datamodels_Schemas":
            let params: HttpParams = new HttpParams();
            params = params.set('orderBy', 'abc');
            params = params.set('project', this.selectedProjectSource);
            this.services.getSchemasCards(params).subscribe((res) => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false })
              })
            })
            break;
          case "Datamodels_Relationships":
            this.relationService.getAllRelationships(this.selectedProjectSource).subscribe(res => {
              res.forEach(r => {
                if (r.alias) obj['value'].push({ name: r.alias, status: false })
              })
            })
            break;
          case "JobManagement_Events":
            this.eventsService.getAllEventDetails(this.selectedProjectSource).subscribe((res) => {
              res.forEach(r => {
                if (r.eventname) obj['value'].push({ name: r.eventname, status: false, description: r.description })
              })
            })
            break;
          case "AgenticSystems_Worker":
            let ress : any = [];
            let paramss: HttpParams = new HttpParams();
            paramss = paramss.set('project', this.selectedProjectSource);
            this.promptService.getAllAgents(paramss).subscribe((res) => {
              ress = res.body;
              ress.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false })
              })
            });
            break;
          case "AgenticSystems_Tools":
            let resss : any = [];
            let par: HttpParams = new HttpParams();
            par = par.set('project', this.selectedProjectSource);
            this.promptService.getAllWorkerTools(par).subscribe((res) => {
              resss = res.body;
              resss.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false })
              })
            });
            break;
          case "Plugins":
            this.pluginService.getAllPluginsByOrg(this.selectedProjectSource).subscribe(res => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false })
              })
            })
            break;
          case "Mashups":
            this.mashupService.getAllMashups(this.selectedProjectSource).subscribe(res => {
              res.forEach(r => {
                if (r.name) obj['value'].push({ name: r.name, status: false })
              })
            })
            break;
          default:
            break;
        }
        this.selectedList.push(obj);
      })
    }
  }

  selectExportRow(event, selMod) {
    const temp = event.source._elementRef.nativeElement.closest('tr')
    event.checked ? temp.classList.add('highlight') : temp.classList.remove('highlight');
    this.selectedList.forEach((ele: any) => {
      if (ele.name == selMod) {
        ele.status = !ele.status;
        if (ele.status) {
          ele.value.forEach((ele1: any) => {
            ele1.status = true;
          })
        }
        else {
          ele.value.forEach((ele1: any) => {
            ele1.status = false;
          })
        }
      }
    })
  }

  selectExportChild(child, selMod) {
    this.selectedList.forEach((ele: any) => {
      if (ele.name == selMod) {
        ele.value.forEach((ele1: any) => {
          if (ele1.name == child) {
            ele1.status = !ele1.status;
          }
          if (ele1.status) ele.status = true;
        })
      }
    })
  }

  export() {
    if (this.selectedProjectSource == '')
      this.services.message("Please select source project", "error");
    else {
      let fileBlob: any;
      let selmodules = this.getSelectedModules();
      this.services.exportCip(this.selectedProjectSource, selmodules).subscribe(
        res => {
          this.services.message("Exported successfully", "success");
          if (res && this) {
            fileBlob = new Blob([JSON.stringify(res.body)], { type: "json" });
            importedSaveAs(fileBlob, "exportedCIP.json");
          }
        }, error => {
          if(error == "Scheduler Paused")
            this.services.message("Scheduler paused. Please resume and retrigger", "error");
          else
            this.services.message("Export failed", "error");
        }
      );
    }
  }

  addfile(event: { target: { files: File[]; }; }) {
    if (event.target.files[0].name.endsWith(".json")) {
      this.importedFile = event.target.files[0];
      this.readJson(this.importedFile);
    }
    else
      this.services.message('File format not supported.', 'error');
  }


  readJson(file1: Blob) {
    try {
      this.tableData = []
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.data = JSON.parse(reader.result.toString().trim());
          let keys = Object.keys(this.data);
          keys.forEach((ele: any) => {
            // IAI and ADP
            Object.keys(this.data[ele]).forEach((ele1: any) => {
              // module names
              Object.keys(this.data[ele][ele1]).forEach((ele2: any) => {
                let content = {}
                content['grp'] = ele;
                content['module'] = ele1;
                content['tableName'] = ele2;
                this.tableData.push(content);
              })
            })
          })
        }
        catch (error) {
          this.services.message('Uploaded file is invalid', 'error');
        }
      }
      reader.readAsText(file1);
      this.selectedProjectTarget = [sessionStorage.getItem('organization')]
    }
    catch (Exception) {
      this.services.message('Not able to read file', 'error');
    }
  }

  goToLogs() {
    this.router.navigate(["../jobs-log"], { relativeTo: this.route });
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = "Copy";
        this.refresh();
        break;
      case 1:
        this.basicReqTab = "Export";
        this.refresh();
        break;
      case 2:
        this.basicReqTab = "Import";
        this.refresh();
        break;
    }
  }

  refresh() {
    this.selectedProjectSource = '';
    this.selectedProjectTarget = [];
  }

  selectRow(event) {
    const temp = event.source._elementRef.nativeElement.closest('tr')
    event.checked ? temp.classList.add('highlight') : temp.classList.remove('highlight');
  }

  ToggleRow(eventObj: any, row) {
    const targetClass = eventObj.target.classList;
    const targetParentElement = eventObj.target.parentElement.parentElement;
    if (targetClass.contains('arrow_expand')) {
      if (this.prev_openedRow.length) {
        this.prev_openedRow[0].children[0].children[0].classList.remove('arrow_collapse', 'down-arw-icon');
        this.prev_openedRow[0].children[0].children[0].classList.add('arrow_expand');
        this.prev_openedRow[0].children[0].children[0].classList.add('next-icon');
        this.prev_openedRow[0].classList.remove('row_opened');
        this.prev_openedRow[0].nextSibling.classList.remove('open');
        this.prev_openedRow.splice(0, 1);
      }
      this.prev_openedRow.push(targetParentElement);
      targetClass.remove('arrow_expand', 'next-icon');
      targetClass.add('arrow_collapse'); targetClass.add('down-arw-icon');
      targetParentElement.classList.add('row_opened');
      targetParentElement.nextSibling.classList.add('open');
    }
    else {
      targetClass.remove('arrow_collapse', 'down-arw-icon');
      targetClass.add('arrow_expand'); targetClass.add('next-icon');
      targetParentElement.classList.remove('row_opened');
      targetParentElement.nextSibling.classList.remove('open');
      if (this.prev_openedRow.length) {
        this.prev_openedRow.splice(0, 1);
      }
    }
    this.children = [];
    this.data[row.grp][row.module][row.tableName].forEach((ele: any) => {
      if (ele) {
        let content = {}
        content['name'] = ele.name ? ele.name : ele.jobName ? ele.jobName : ele.eventname ? ele.eventname : ele.domainname ? ele.domainname : ele.alias;
        this.children.push(content);
      }
    })
    console.log("children", this.children);
  };

  ToggleExportRow(eventObj: any, row) {
    this.filter = '';
    this.selectedChild = [];
    this.selectedChild = this.selectedList.filter(ele => ele.name == row)[0]?.value;
    const targetClass = eventObj.target.classList;
    const targetParentElement = eventObj.target.parentElement.parentElement;
    if (targetClass.contains('arrow_expand')) {
      if (this.prev_openedRow.length) {
        this.prev_openedRow[0].children[0].children[0].classList.remove('arrow_collapse', 'down-arw-icon');
        this.prev_openedRow[0].children[0].children[0].classList.add('arrow_expand');
        this.prev_openedRow[0].children[0].children[0].classList.add('next-icon');
        this.prev_openedRow[0].classList.remove('row_opened');
        this.prev_openedRow[0].nextSibling.classList.remove('open');
        this.prev_openedRow.splice(0, 1);
      }
      this.prev_openedRow.push(targetParentElement);
      targetClass.remove('arrow_expand', 'next-icon');
      targetClass.add('arrow_collapse'); targetClass.add('down-arw-icon');
      targetParentElement.classList.add('row_opened');
      targetParentElement.nextSibling.classList.add('open');
    }
    else {
      targetClass.remove('arrow_collapse', 'down-arw-icon');
      targetClass.add('arrow_expand'); targetClass.add('next-icon');
      targetParentElement.classList.remove('row_opened');
      targetParentElement.nextSibling.classList.remove('open');
      if (this.prev_openedRow.length) {
        this.prev_openedRow.splice(0, 1);
      }
    }
  }

  filterz(selectedModule) {
    this.selectedChild = [];
    this.selectedList.forEach((ele: any) => {
      if (ele.name == selectedModule && this.filter !='') {
        this.selectedChild = ele.value.filter((ele1: any) => {
          return ele1.name.toLowerCase().includes(this.filter.toLowerCase());
        })
      }
    });
    if(this.filter == '') 
      this.selectedChild = this.selectedList.filter(ele => ele.name == selectedModule)[0]?.value;
  }
}
