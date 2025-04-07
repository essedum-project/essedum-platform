import { ChangeDetectorRef, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { Services } from '../services/service';
import { PipelineService } from '../services/pipeline.service'
import { MatDialog } from '@angular/material/dialog';
import { JSONContent, Elements, ChainJob } from '../DTO/chainJob';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
@Component({
  selector: 'app-chains',
  templateUrl: './chains.component.html',
  styleUrls: ['./chains.component.scss']
})
export class ChainsComponent implements OnInit, OnChanges {
  cardTitle: String = "Grouped Jobs";
  cardToggled: boolean = true;
  users: any = [];
  cards: any;
  selectedCard: any = [];
  selectedInstance: any;
  toggle: boolean = false;
  filt: any="";
  pageSize: number;
  pageNumber: number = 1;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6,12,18,24,30]
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  nameOfEdit;
  jobdescriptionOfEdit;
  catStatus = {};
  selectedTag = [];
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  // streamItem: import("c:/Leds_AIP/aip/ui/aip-app-ui/projects/aip-app/src/app/streaming-services/streaming-service").StreamingServices;
  streamItem: any;
  jobname: any;
  jobdescription: any;
  chainedJob: ChainJob = new ChainJob();
  records: boolean = false;

  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private pipelineService: PipelineService,
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private location: Location
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.getCards(this.pageNumber, this.pageSize,this.filt);
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','ChainsComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    this.records= false;
    this.telemetryImpression();
    this.pageSize = this.itemsPerPage[0];
    // this.pageNumber = 1;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search']?params['search']:'';
        // this.selectedAdapterType = params['type']
        //   ? params['type'].split(',')
        //   : [];
        // this.selectedAdapterInstance = params['adapterInstance']
        //   ? params['adapterInstance'].split(',')
        //   : [];
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.updateQueryParam(this.pageNumber,this.filt);


    this.getCards(this.pageNumber, this.pageSize,this.filt);
    if (this.pageNumberChanged) {
    
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
    this.getTags();
   
    
  }
  
  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "ChainsComponent");
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    // adapterType: string = '',
    // adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          // type: adapterType,
          // adapterInstance: adapterInstance,
          org: org,
          roleId:roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
      this.updateQueryParam(this.pageNumber);
    }
  }
  
  refresh(){
    this.filt="";
    this.updateQueryParam(this.pageNumber = 1);
    this.ngOnInit()
    this.changePage(1);
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
      this.updateQueryParam(this.pageNumber);
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages)
    { this.pageNumber = page;
      this.updateQueryParam(this.pageNumber);
    }
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.updateQueryParam(this.pageNumber);
    }
  }
  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    }
    else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }

  Authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // pipeline-create permission
        if (cipAuthority.includes("pipeline-create")) this.createAuth = true;
        // pipeline-edit/update permission
        if (cipAuthority.includes("pipeline-edit")) this.editAuth = true;
        // pipeline-delete permission
        if (cipAuthority.includes("pipeline-delete")) this.deleteAuth = true;
      }
    );
  }

  changedToogle(event: any) {
    this.cardToggled = event;

  }
  getCards(page: any, size: any,filter:any): void {
    let org: any = sessionStorage.getItem('organization');
    
    this.pipelineService.getAllChainJobs(org, filter).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        data.push(element);
        this.users.push(element.alias)
      });
      this.cards = data;
      if(this.cards.length==0){
        this.records=true;
      }
      else{
        this.records=false;
      }
      this.noOfItems = data.length;
      // this.fetchModels();
      this.noOfItems = this.noOfItems || data.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    });
    this.pageSize = this.pageSize || 9;
    this.updateQueryParam(
      this.pageNumber,
      this.filt
    );
    
  }
  desc(card: any) {
    // this.telemetry.addTelemetryEvent(card.alias +" GroupJob viewed");
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    this.router.navigate([card.jobName],{ queryParams: {
      page: this.pageNumber,
      search: this.filt,
      // adapterType: this.selectedAdapterType.toString(),
      // adapterInstance: this.selectedAdapterInstance.toString(),
      org: sessionStorage.getItem('organization'),
      roleId:  JSON.parse(sessionStorage.getItem('role')).id
    },
    queryParamsHandling: 'merge', relativeTo: this.route });
    // this.pipelineService.getChainByName(card.name).subscribe((res) => {
    //   console.log("selected_card")
    //   console.log(res)
    //   this.streamItem = res

    // });

  }
  redirect() {

    this.selectedInstance = this.selectedCard.name
    this.router.navigate([
      './view',
      this.cardTitle,
      this.selectedInstance
    ],{
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        // adapterType: this.selectedAdapterType.toString(),
        // adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId:  JSON.parse(sessionStorage.getItem('role')).id
      },
      queryParamsHandling: 'merge',
      
      relativeTo: this.route,
    });
  }
  // desc(card:any) {
  //   this.toggle = true
  //   console.log("description");
  //   this.selectedCard = card
  //   // this.router.navigate(["View/:cardTitle"],{relativeTo:this.route,state:{data:this.cardTitle}});
  //   this.router.navigate(["./view/" + this.cardTitle], { relativeTo: this.route });
  // }
  filterz() {
    let data: any = [];
    this.getCards(this.pageNumber, this.pageSize,this.filt);
    // this.cards.forEach((element: any) => {
    //   console.log(element.appName.includes(this.filt));

    //   if (element.appName.includes(this.filt)) {
    //     data.push(element);
    //     console.log(data);
    //     this.cards = data;
    //   }
    // });
    // this.users.filter(user:any => user.name.includes(this.filt))
    this.updateQueryParam(this.pageNumber = 1,this.filt);


  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getTags() {

    this.tags = {};
    this.tagsBackup = {};
    // this.category.push("platform")
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;
      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + " - " + tag.label] = false;
      });
      this.category.forEach((cat) => {
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });

  }
  showMore(category) {
    this.catStatus[category] = !this.catStatus[category];
    if (this.catStatus[category])
      this.tags[category] = this.allTags.filter(
        (tag) => tag.category == category
      );
    else
      this.tags[category] = this.allTags
        .filter((tag) => tag.category == category)
        .slice(0, 10);
  }

  openedit(card,content){


    this.jobname=card.jobName;
    this.jobdescription=card.description;
    this.modalService.openModal(content, 'mini');
  }

  opendelete(cid){
      try{
        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
          if (result === "delete") {
            this.pipelineService.deleteChain(cid).subscribe((res) => {
              this.service.message("Chain deleted!", "success")
              this.refresh();
              this.telemetry.addTelemetryEvent(cid + ' GroupJobs Deleted')
            });
          }
        });
      }catch (Exception) {
        this.service.message("Some error occured", "error")
      }
    }
  
  filterByTag(tag) {
    this.tagStatus[tag.category + " - " + tag.label] =
      !this.tagStatus[tag.category + " - " + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    }
    else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1)
    }

  }

  udpateChainJob(card){
    this.pipelineService.updateChainByID(card.id,this.jobname,this.jobdescription)
    .subscribe(res => {
      this.modalService.dismissAll();
      this.refresh()
    }, error => {
      this.service.messageService("Error in Editing Chain", error);
      // this.close();
    })
    
  }

  createChainJob(isParallel: number) {
    if (this.isWordValid(this.jobname)) {
      this.chainedJob.jobName = this.jobname;
      this.chainedJob.jobDesc = this.jobdescription;
      this.chainedJob.org = sessionStorage.getItem("organization");
      // this.chainedJob.jsonContent = this.chainList
      this.chainedJob.jsonContent = new JSONContent();
      this.chainedJob.jsonContent.element = new Elements();
      this.chainedJob.flowjson = null
      this.chainedJob.parallelchain = isParallel;
      this.pipelineService.createChainJob(this.chainedJob).subscribe(res => {
        this.modalService.dismissAll();
        this.service.message("Chain saved successfully");
        this.refresh();
      }, error => {
        this.service
        this.service.messageService("Error in Saving Chain", error);
        // this.close();
      })
      // } else {
      //   this.messageService.error("Error", "Invalid Job Name");
      // }
    }
  }

  

  isWordValid(word) {
    word = word.toString()
    for (var i = 0, j = word.length; i < j; i++) {
      if (!this.isValidLetter(word.charCodeAt(i))) {
        return false
      }
    }
    return true
  }

  open(content: any): void {
    this.modalService.openModal(content, 'mini');
    // this.router.navigate(['create'], { relativeTo: this.route })
  }

  closemodalcreate(){
    this.modalService.dismissAll();
  }


  omit_special_char(event) {
    var k = event.charCode;
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  selectedButton(i){
    if(i==this.pageNumber)
      return {"color": "white","background": "#7b39b1"}
    else
      return {"color":"black"}
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
