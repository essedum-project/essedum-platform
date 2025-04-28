import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessEnvOptions } from 'child_process';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Project } from '../../models/project';
import { MessageService } from '../../services/message.service';
import { ProjectService } from '../../services/project.service';
import { ApisService } from 'src/app/services/apis.service';
import { JobServices } from './jobs/jobservice';
import { DashConstantService } from 'com-lib-util';
import { JobsComponent } from './jobs/jobs.component';


@Component({
  selector: 'lib-copy-blueprint',
  templateUrl: './copy-blueprint.component.html',
  styleUrls: ['./copy-blueprint.component.css']
})
export class CopyBlueprintComponent implements OnInit {
  @ViewChild(JobsComponent) jobsComponent: JobsComponent;
  busy: Subscription;
  fromProject: Project = new Project();
  toProject: Project = new Project();
  clickedcopyblueprint: boolean = false;

  public dashCtrl: FormControl = new FormControl();
  public destProjectFilterCtrl: FormControl = new FormControl();
  public projectFilterCtrl: FormControl = new FormControl();
  public filteredDestProjectList: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredProjectList: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  dashLength: number = 0;

  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null
  };
  sourceProjectList: Project[] = [];
  destinationProjectList: Project[] = [];
  copyDisabled: boolean = false;
  constructor(
    protected dashConstantService: DashConstantService,
    private messageService: MessageService,
    private projectService: ProjectService,
    private route: Router,
    private router: ActivatedRoute,
    private apisService: ApisService,
    private service: JobServices,
  ) { }
  cols12 = 5;
  colspan2 = 1;
  role: any;
  processdata: any;
  filteredProjectListcopy = [];
  desProj: string;
  onResize(event) {
    this.cols12 = (event.target.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (event.target.outerWidth <= 640) ? 1 : 1;
  }


  ngOnInit(): void {
    this.lazyloadevent.rows=this.dashConstantService.getrowCount();
    this.desProj = sessionStorage.getItem("organization");
    let totalJobs = 0;
    let internalJobs = ['CopyPipelines', 'CopyDatasets', 'CopyDashboards']
    internalJobs.forEach((job, index) => {
      this.service.fetchInternalJobLenByname(job, this.desProj).
        subscribe(
          response => {
            var n: Number = new Number(response);
            totalJobs = totalJobs + n.valueOf();
            if (index == internalJobs.length - 1) {
              if (totalJobs > 0) {
                this.copyDisabled = true;
              }
            }
          },
          error => this.service.message('Could not fetch jobs', 'error')
        );
    });
    this.cols12 = (window.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (window.outerWidth <= 640) ? 1 : 1;
    let project: Project = new Project();
    this.projectService.findAll(project, this.lazyloadevent).subscribe(
      response => {
        this.sourceProjectList = response.content.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        let index = this.sourceProjectList.findIndex(x => x.name === sessionStorage.getItem("organization"));
        this.toProject = this.sourceProjectList[index];
        try {
          this.role = JSON.parse(sessionStorage.getItem("role"));
        } catch (e: any) {
          this.role = null;
          console.error("JSON.parse error - ", e.message);
        }
        if (this.role.projectadmin) {
          this.apisService.getUserInfoData().subscribe((pageResponse) => {
            this.processdata = pageResponse["porfolios"];
            this.processdata.forEach((element) => {
              if (element.porfolioId.id) {
                element.projectWithRoles.forEach((element1) => {
                  this.sourceProjectList.forEach((ele) => {
                    if (ele.id == element1.projectId.id) {
                      this.filteredProjectListcopy.push(ele);
                    }
                  })
                });
              }
            });
          });
        }
        this.sourceProjectList = this.sourceProjectList.filter((project) => project.name.toLowerCase() != "core");
        this.destinationProjectList = Object.assign([], this.sourceProjectList)
        if (this.role.projectadmin) {
          this.destinationProjectList = Object.assign([], this.filteredProjectListcopy)
        }
        this.filteredProjectList.next(this.sourceProjectList.slice());
        this.filteredDestProjectList.next(this.destinationProjectList.slice());
      }
    );

    this.destProjectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDestProject();
      });
    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProject();
      });
  }

  filterProject() {
    if (!this.sourceProjectList) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredProjectList.next(this.sourceProjectList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the projects
    this.filteredProjectList.next(
      this.sourceProjectList.filter(project => project.name.toLowerCase().indexOf(search) > -1)
    );
  }
  filterDestProject() {
    if (!this.destinationProjectList) {
      return;
    }
    // get the search keyword
    let search = this.destProjectFilterCtrl.value;
    if (!search) {
      this.filteredDestProjectList.next(this.destinationProjectList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the projects
    this.filteredDestProjectList.next(
      this.destinationProjectList.filter(project => project.name.toLowerCase().indexOf(search) > -1)
    );
  }
  copy() {
    this.clickedcopyblueprint = true;
    if (this.fromProject == null || this.fromProject == undefined) {
      this.service.message("Source Project Should be Selected", "error");
      this.clickedcopyblueprint = false;
    }
    else if (!this.toProject.name || this.toProject.name == null || this.toProject.name == undefined) {
      this.service.message("Destination Project Should be Selected", "error");
      this.clickedcopyblueprint = false;
    }
    else if(this.toProject.name.toLowerCase() == "core"){
      this.service.message("Cannot copy to Core Project", "error");
      this.clickedcopyblueprint = false;
    }
    else if (this.fromProject.name == this.toProject.name) {
      this.service.message("Source Project and Destination Project cannot be same", "error");
      this.clickedcopyblueprint = false;
    }
    else {
      this.busy = this.projectService
        .copyDatasets(this.fromProject.name, this.toProject.name, this.toProject.id)
        .subscribe(
          (res) => {
            this.service.message("Copy Blue Print Pipeline has started. Please check the Job Status", "success");
            this.jobsComponent.onRefresh(); 
          },
          (error) => {
            if (error instanceof TypeError)
              this.service.message("Copy Blueprint has already been done for this project", "error");
            else this.service.message("Copy blueprint failed", "error");
          }
        );
      this.jobsComponent.onRefresh(); 
    }
    
  }
  trackByMethod(index, item) {
    return item;
  }

  setDisable($event) {
    this.copyDisabled = $event;
    
  }
}
