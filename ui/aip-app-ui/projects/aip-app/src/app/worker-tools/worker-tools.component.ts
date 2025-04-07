import { HttpParams } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PromptServices } from '../prompts/prompt.service';
import { Services } from '../services/service';
import { AccordionComponent, LedsModalService } from 'leds-lib';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EventsService } from '../services/event.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-worker-tools',
  templateUrl: './worker-tools.component.html',
  styleUrl: './worker-tools.component.scss'
})
export class WorkerToolsComponent implements OnInit {

  cardTitle: string = "Tools";
  filter: string = "";
  workerToolList: [];
  collapseAll: boolean = true;
  noOfItems: number;
  pageNumber: number = 1;
  pageSize: number = 10;
  noRecords: boolean = false;
  toolCreate: boolean = false;
  workerTags: any = [];
  wTagsList: any = [];

  catSize: number = 5;
  catPageNo: number = 1;
  catgegoryCount: number = 0;
  actualIndex: any = 0;

  @ViewChild("ledsAccordion", { static: true }) ledsAccordion!: AccordionComponent;
  isExpanded: boolean = false;
  selectedAdapterType: string[] = [];
  tagrefresh: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private service: Services,
    private route: ActivatedRoute,
    private eventService: EventsService,
    private promptService: PromptServices,
    private modalService: LedsModalService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedAdapterType = params['toolsType']
          ? params['toolsType'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.pageSize = 10;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getWorkerTags();
    this.Authentications();
    this.getAllWorkerToolsCount();
    this.getAllWorkerTools("", this.pageNumber, this.pageSize);
  }
  getAllWorkerToolsCount() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1)
      params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    if (this.selectedAdapterType.length >= 1)
      params = params.set('category', this.selectedAdapterType.toString());
   
    // if (this.selectedAdapterType.length >= 1)
    //   params = params.set('category', this.selectedAdapterType.toString());
   
    // if(category && category != '')
    //   params = params.set('category', category);
    // params = params.set('page', pageNumber);
    // params = params.set('size', pageSize);

    this.promptService.getAllWorkerToolsCount(params).subscribe(
      (response: any) => {
        this.noOfItems = response;
      });
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    toolsType: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          toolsType: toolsType,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  getWorkerTags() {
    this.promptService.getAllToolCategory().subscribe(
      (response: any) => {
        this.workerTagsUpdate(response);
      },
      error => {
        console.log(error);
      });
  }

  workerTagsUpdate(response: any) {
    this.wTagsList = [];
    this.workerTags = response;
    this.workerTags.forEach((res, index) => {
      let tag = {
        name: res.substr(res.indexOf(':') + 2),
        status: false
      }
      if (index == 0) tag.status = true;
      this.wTagsList.push(tag);
    })
    this.catgegoryCount = this.workerTags.length;
  }

  Authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("create-workerConfig"))
          this.toolCreate = true;
      }
    );
  }

  open(stepIndex: any) {
    this.workerToolList = [];
    this.noOfItems = 0;
    this.actualIndex = (this.catPageNo - 1) * this.catSize + stepIndex;
    this.wTagsList.forEach((res, index) => {
      if (index == this.actualIndex) {
        res.status = true;
        this.getAllWorkerTools(this.workerTags[this.actualIndex]);
      }
      else
        res.status = false;
    })
  }

  close(stepIndex: any) {
    this.actualIndex = (this.catPageNo - 1) * this.catSize + stepIndex;
    this.wTagsList.forEach((res, index) => {
      if (index == this.actualIndex) {
        res.status = false;
        this.actualIndex = '';
      }
    })
  }

  getAllWorkerTools(category?, pageNumber?, pageSize?) {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1)
      params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    if (this.selectedAdapterType.length >= 1)
      params = params.set('category', this.selectedAdapterType.toString());
   
    if(category && category != '')
      params = params.set('category', category);
    params = params.set('page', pageNumber);
    params = params.set('size', pageSize);

    this.promptService.getAllWorkerTools(params).subscribe(
      (response: any) => {
        this.workerToolList = response.body;
        // this.noOfItems = this.workerToolList.length
        if(this.filter.length >= 1 && category==''){
          let catList = [];
          this.workerToolList.forEach((res) => {
            if(!catList.includes(JSON.parse(res["category"])[0]))
              catList.push(JSON.parse(res["category"])[0]);
          });
          this.workerTagsUpdate(catList);
        } 
        if (this.workerToolList.length > 0) {
          this.noRecords = false;
        } else {
          this.noRecords = true;
        }
        // this.noOfItems = this.workerToolList.length;
        this.pageSize = 10;
        this.pageNumber = 1;
      },
      error => {
        console.log(error);
      }
    );
  }

  refresh() {
    this.filter = "";
    this.actualIndex = '';
    this.catPageNo = 1;
    this.catgegoryCount = 0;
    this.workerTags = [];
    this.noOfItems = 0;
    this.workerToolList = [];
    this.selectedAdapterType = [];
    this.tagrefresh = true;
    // this.closeAllPanel();
    this.ngOnInit();
  }

  filterz() {
    this.catPageNo = 1;
    let cat = this.actualIndex!=''? this.workerTags[this.actualIndex] : '';
    this.getAllWorkerToolsCount();
    this.getAllWorkerTools(cat, this.pageNumber, this.pageSize);
  }

  pageChanged(event: any) {
    this.catPageNo = event.pageIndex + 1;
  }

  categoryPageChanged(event: any) {
    this.pageNumber = event.pageIndex + 1;
  }

  closeAllPanel(): void {
    this.ledsAccordion.collapseAll();
  }

  openCreate() {
    this.router.navigate(['./create/new'], { relativeTo: this.route });
  }

  configureTool(tool: any) {
    this.router.navigate(['./preview/' + tool.name], { relativeTo: this.route });
  }

  modelTool(workerTool: any) {
    let pipelineName = JSON.parse(workerTool.jsonContent).pipelineName;
    this.service.getStreamingServicesByName(pipelineName).subscribe((res) => {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page: this.pageNumber,
          search: this.filter,
          pipelineType: 'Tool',
          org: sessionStorage.getItem('organization'),
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',
        state: {
          cardTitle: 'Pipeline',
          pipelineAlias: res.alias,
          streamItem: res
        },
        relativeTo: this.route,
      };
      this.router.navigate(['../pipelines/view/drgndrp' + '/' + pipelineName], navigationExtras);
    });
  }

  deleteTool(workerTool: any) {
    let org = sessionStorage.getItem('organization');
    let eventId = JSON.parse(workerTool.jsonContent).eventId;
    let pipelineId = JSON.parse(workerTool.jsonContent).pipelineId;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.eventService.deleteEventbyId(eventId);
        this.service.deleteStreamingService(pipelineId);
        this.promptService.deleteWorkerTool(workerTool.name, org).subscribe((res) => {
          this.service.message('Worker Tool deleted successfully', 'success');
          this.refresh();
        });
      }
    });
  }

  tagSelectedEvent(event) {

    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber=1;
    this.tagrefresh = false;
    this.ngOnInit();
    // this.refresh();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '80%', margin: '0 0 0 20%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    // console.log('Page number:', event.pageNumber);
    // console.log('Page size:', event.pageSize);

    this.pageNumber=event.pageNumber?event.pageNumber:1;
    this.pageSize=event.pageSize?event.pageSize:10;
    this.getAllWorkerToolsCount();
    this.getAllWorkerTools("", this.pageNumber, this.pageSize)
  }

  getToolType(category){
    return category.substr(category.indexOf(':') + 2).slice(0, -2);
  }
}
