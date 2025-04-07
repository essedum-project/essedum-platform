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

@Component({
  selector: 'lib-copy-blueprint',
  templateUrl: './copy-blueprint.component.html',
  styleUrls: ['./copy-blueprint.component.css']
})
export class CopyBlueprintComponent implements OnInit {

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
  constructor(
    private messageService: MessageService,
    private projectService: ProjectService,
    private route: Router,
    private router: ActivatedRoute
  ) { }
  cols12=5;
  colspan2=1;
  onResize(event) {
    this.cols12 = (event.target.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (event.target.outerWidth <= 640) ? 1 : 1; 
  }

    
  ngOnInit(): void {
    this.cols12 = (window.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (window.outerWidth <= 640) ? 1 : 1;
    let project: Project = new Project();
    this.projectService.findAll(project, this.lazyloadevent).subscribe(
      response => {
        this.sourceProjectList = response.content.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        this.sourceProjectList= this.sourceProjectList.filter((project) => project.name.toLowerCase()!="core");
        this.destinationProjectList=Object.assign([],this.sourceProjectList)
        this.filteredProjectList.next(this.sourceProjectList.slice());
        this.filteredDestProjectList.next(this.sourceProjectList.slice());
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
      this.messageService.info("Source Project Should be Selected", "IAMP");
      this.clickedcopyblueprint = false;
    } 
    else if (!this.toProject.name || this.toProject.name == null || this.toProject.name == undefined) {
      this.messageService.info("Destiantion Project Should be Selected", "IAMP");
      this.clickedcopyblueprint = false;
    } 
    else if (this.fromProject.name == this.toProject.name) {
      this.messageService.info("Source Project and Destination Project cannot be same", "IAMP");
      this.clickedcopyblueprint = false;
    }
    else {
        this.busy = this.projectService
        .copyBluePrint(this.fromProject.name,this.toProject.name, this.toProject.id)
        .subscribe(
          (res) => {
            this.messageService.info("Copy Blue Print Pipeline has started. Please check the Job Status", "IAMP");
          },
          (error) => {
            if (error instanceof TypeError)
              this.messageService.error("Copy Blueprint has already been done for this project", "IAMP");
            else this.messageService.error("Copy blueprint failed", "IAMP");
          }
        );
    }
  }
  trackByMethod(index, item) {
    return item;
  }

}
