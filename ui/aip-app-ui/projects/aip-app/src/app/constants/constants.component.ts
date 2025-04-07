import { Component, OnInit } from '@angular/core';
// import { time } from 'highcharts';
import { DashConstant, DashConstantService } from 'com-lib-util';
import { Project } from 'com-lib-util';
// import { PipelineModelService } from '../../entities/pipeline-model/pipeline-model.service';
import { Services } from '../services/service';
import { PipelineModelService } from '../pipeline-summary/pipeline-model/pipeline-model.service';

@Component({
  selector: 'app-constants',
  templateUrl: './constants.component.html',
  styleUrls: ['./constants.component.scss']
})
export class ConstantsComponent {
  status
  bootstrap_time
  upload_fail_check_time
  server_status_check_time
  bootstrap_ack_time
  constants: DashConstant[] = []
  selectedConstant: DashConstant[] = []
  isEdit = false
  editing = false
  taskList = []
  selected 
  isMenuOpen = false
  title
  isCollapsed = true
  clonedProducts: { [s: string]: DashConstant; } = {};
  editIndex
  editMode= false;

  constructor(private dashconstantService: DashConstantService,
    private modelservice: PipelineModelService,
    private service: Services) { }

  ngOnInit(): void {
    this.getValues("icip.");
    this.selected
  }

  getValues(key) {
    try{
      let dashconstant: DashConstant = new DashConstant
      let project : Project = JSON.parse(sessionStorage.getItem("project"))
      dashconstant.project_name = project.name;
      dashconstant.keys = key;
      let lazyloadevent = { first: 0, rows: 10000, sortField: null, sortOrder: 1 };
      this.dashconstantService.findAll(dashconstant, lazyloadevent).subscribe((res) => {
        this.constants = res.content
        this.constants.forEach(ele => {
          let key = ele.keys.split(".")[1]
          if(!this.taskList.includes(key))
            this.taskList.push(key)
        });
        this.title = this.taskList[0]
        this.selected = this.constants.filter(e => e.keys.includes(this.taskList[0]))
      })
    }
    catch(Exception){
      this.service.message("Some error occured", "Error")
    }

  }

  onRowEditInit(item,j,i) {
    this.isEdit = true
    this.clonedProducts[item.id] = {...item}; 
    this.editIndex=j*10+i
    this.editMode=true
  }

  onRowEditSave(item) {
    this.editIndex=-1
    this.editMode=false
    this.dashconstantService.update(item).subscribe(res => {
      this.service.message("Saved Successfully", "success")
      delete this.clonedProducts[item.id];
    },
      err => {
        this.service.message("Error occured", err)
      },
      () => {
        this.dashconstantService.refresh().subscribe();
      })
  }

  onRowEditCancel(item, index: number) {
    this.isEdit = false
    let itm : DashConstant = this.selectedConstant.splice(this.selectedConstant.indexOf(item), 1)[0]
    this.constants.splice(this.constants.indexOf(item), 1)
    this.constants.push(this.clonedProducts[item.id])
    delete this.clonedProducts[item.id];
  }

  public onSidenavClick(): void {
    this.isMenuOpen = false;
  }

  select(t){
    this.selected = this.constants.filter(e => e.keys.includes(t))
    return this.constants.filter(e => e.keys.includes(t))
  }
}

