import { ChangeDetectorRef, Component,EventEmitter,HostListener,OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsModalService,LedsLibService  } from 'leds-lib';
import { Services } from '../services/service';
import { PipelineCreateComponent } from '../pipeline-create/pipeline-create.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../services/tags.service';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-chain-pipeline',
  templateUrl: './chain-pipeline.component.html',
  styleUrls: ['./chain-pipeline.component.scss']
})
export class ChainPipelineComponent implements OnInit, OnChanges {
  cardTitle: String = "Chain";
  cardToggled: boolean = true;
  users:any=[];
  cards: any;
  selectedCard: any=[];
  selectedInstance: any;
  toggle: boolean = false;
  filt:any;
  pageSize:number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number=1;
  noOfPages: number=0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = []
  noOfItems:number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged:boolean=true;
  category=[];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus={};
  catStatus={};
  selectedTag=[];
  selectedTagList: any[];
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  // streamItem: import("c:/Leds_AIP/aip/ui/aip-app-ui/projects/aip-app/src/app/streaming-services/streaming-service").StreamingServices;
  streamItem: any;
  servicev1='chain';
  tagrefresh: boolean=false;
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];

  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  filter: string = '';
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  organization: string;
  chainConstantsKey: string = 'icip.chain.includeCore';
  
  // filteredCards: any;

  constructor(
    private telemetryService: LeapTelemetryService,
     private telemetry: OpenTelemetryService,
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public tagService: TagsService, private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if(this.organization) {
      this.refresh();
      this.updatePageSize();
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }
  updatePageSize() {
    this.pageSize=0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards();
      this.getCountChains();
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards();
      this.getCountChains();
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards();
      this.getCountChains();
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards();
      this.getCountChains();
    } else if (window.innerWidth < 768 ) {
      this.itemsPerPage = [4,8,12,16,20,24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards();
      this.getCountChains();
    }
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','ChainPipelineComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    this.service.getConstantByKey(this.chainConstantsKey).subscribe((response) => {
      if(response.body == 'true')
        this.organization = 'Core,' + sessionStorage.getItem('organization');
      else
        this.organization = sessionStorage.getItem('organization');
      
      this.records = false;
      this.telemetryImpression();
      // this.pageSize=this.itemsPerPage[0];
      // this.pageNumber = 1;
      this.route.queryParams.subscribe((params) => {
        // Update this.pageNumber if the page query param is present
        if (params['page']) {
          this.pageNumber = params['page'];
          this.filt = params['search'];
          this.selectedAdapterType = params['chainType']
            ? params['chainType'].split(',')
            : [];
          // this.selectedAdapterInstance = params['adapterInstance']
          //   ? params['adapterInstance'].split(',')
          //   : [];
        } else {
          this.pageNumber = 1;
          this.filt = '';
        }
      });
      this.updatePageSize();
      this.updateQueryParam(this.pageNumber);


      this.getCountChains();
      // this.getCards();        
      if (this.pageNumberChanged) {

        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.Authentications();
      // this.getTags();
    });
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    chainType: string = '',
    // adapterInstance: string = '',
    org: string = this.organization,
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          chainType: chainType,
          // adapterInstance: adapterInstance,
          org: org,
          roleId:roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "ChainPipelineComponent");
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
      // this.updateQueryParam(this.pageNumber);
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
      // this.updateQueryParam(this.pageNumber);
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
      // this.updateQueryParam(this.pageNumber);
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
      // this.updateQueryParam(this.pageNumber);
    }
    this.getCards();
  }
  rowsPerPageChanged() {
    if(this.pageSize == 0)
    {
     this.pageSize = this.prevRowsPerPageValue;
    }
    else
    {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }}

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
  changedToogle(event:any){
    this.cardToggled = event;

  }
  tagchange() {
    this.tagService.tags.forEach((element: any) => {
    });
  }
  getCards(): void {
    let params: HttpParams = new HttpParams();
    if (this.selectedAdapterType.length >= 1)
        params = params.set('type', this.selectedAdapterType.toString());      
    if (this.filt.length >= 1) params = params.set('query', this.filt);
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', this.organization);
    params = params.set('isCached', true);
    params = params.set('adapter_instance', 'internal');
    params = params.set('interfacetype', 'chain');
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());

    this.service.getPipelinesCards(params).subscribe((res) => {
      let data:any=[];
      let test = res;
      // test = test.filter(pipeline => (pipeline.target.type != 'App'));

      test.forEach((element: any) => {
        // if(element.type != 'App' || element.is_template == null || element.is_template == false){
        //   if(element.is_template == null)
        //     element.is_template = false
          data.push(element);
          this.users.push(element.alias)
        // }
        
      });
      this.cards = data;
      if(this.cards.length==0){
        this.records=true;
      }
      else{
        this.records=false;
      }
      // this.filteredCards=this.cards;
      // this.noOfItems=data.length;
      // this.fetchModels();
      // this.noOfItems = this.noOfItems || data.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    });
    this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedAdapterType.toString()
    );
  }
  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getCards();
  }
  desc(card:any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard=card;
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res
    });
    this.router.navigate([card.jobName],{ queryParams: {
      page: this.pageNumber,
      search: this.filt,
      adapterType: this.selectedAdapterType.toString(),
      // adapterInstance: this.selectedAdapterInstance.toString(),
      org: this.organization,
      roleId:  JSON.parse(sessionStorage.getItem('role')).id
    },
    queryParamsHandling: 'merge', relativeTo: this.route });

  }
  redirect() {
    this.selectedInstance=this.selectedCard.name
    this.router.navigate([
      './view',
      this.cardTitle,
      this.selectedInstance
    ],
    {queryParams: {
      page: this.pageNumber,
      search: this.filt,
      adapterType: this.selectedAdapterType.toString(),
      // adapterInstance: this.selectedAdapterInstance.toString(),
      org: this.organization,
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
  filterz(){
    this.refresh();
    this.updateQueryParam(this.pageNumber,this.filt,this.selectedAdapterType.toString());
    // let data:any=[];
    // console.log(this.filt);
    // this.filteredCards = this.cards.filter(item => item.alias.toLowerCase().includes(this.filt.toLowerCase()))
  }

  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh=false;
    this.refresh();
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  // getTags() {
   
  //   this.tags = {};
  //   this.tagsBackup = {};
  //   // this.category.push("platform")
  //   let param= new HttpParams();
  //   param = param.set('project', sessionStorage.getItem('organization'));
  //   param = param.set('pipeline', this.servicev1);
  //     this.service.getMlTags().subscribe((resp) => {
  //     // this.service.getMlTagswithparams(param).subscribe((resp) => {
  //       this.allTags = resp;
  //       resp.forEach((tag) => {
  //         if(this.category.indexOf(tag.category) == -1){
  //        this.category.push(tag.category);}
  //        this.tagStatus[tag.category + " - " + tag.label] = false;
  //       });
  //       this.category.forEach((cat) => {
  //         this.tags[cat] = this.allTags
  //           .filter((tag) => tag.category == cat)
  //           .slice(0, 10);
  //         this.tagsBackup[cat] = this.allTags.filter(
  //           (tag) => tag.category == cat
  //         );
  //         this.catStatus[cat] = false;
  //       });
  //     });
   
  // }
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
  refreshComplete() {
    // this.filt=""
    this.service.getConstantByKey(this.chainConstantsKey).subscribe((response) => {
      if(response.body == 'true')
        this.organization = 'Core,' + sessionStorage.getItem('organization');
      else
        this.organization = sessionStorage.getItem('organization');
      
      this.filter = '';
      this.tagrefresh = true;
      this.selectedAdapterType = [];
      this.selectedTag = [];
      this.getCards();
      this.getCountChains();
      this.changePage(1)
    });
  }
  // filterByTag(tag) {
  //   this.tagStatus[tag.category + " - " + tag.label] =
  //     !this.tagStatus[tag.category + " - " + tag.label];

  //   if(!this.selectedTag.includes(tag)){
  //     this.selectedTag.push(tag);
  //   }
  //   else{
  //     this.selectedTag.splice(this.selectedTag.indexOf(tag),1)
  //   }
   
  // }

  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  
  refresh() {
    this.getCards();
    this.getCountChains();
    this.changePage(1)
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  getCountChains() {
    let params: HttpParams = new HttpParams();
   if (this.filt.length >= 1) params = params.set('query', this.filt);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
      params = params.set('page', this.pageNumber);
      params = params.set('size', this.pageSize);
      params = params.set('project', this.organization);
      params = params.set('isCached', true);
      params = params.set('cloud_provider', 'internal');
      params = params.set('interfacetype', 'chain');
      if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }
  deletePipeline(cid){
    try{
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === "delete") {
          this.service.deletePipeline(cid).subscribe((res) => {
            this.service.message("Pipeline deleted!", "success")
            this.refreshComplete()
            this.telemetry.addTelemetryEvent('chain deleted');
          });
        }
      });
    }catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }

  editPipeline(id) {
    this.service.getStreamingServices(id).subscribe(
      (pageResponse) => {
        const dialogRef = this.dialog.open(PipelineCreateComponent, {
          height: "80%",
          width: "60%",
          minWidth: "60vw",
          disableClose: true,
          data: {
            canvasData: pageResponse,
            edit: true            
          },
        });
        dialogRef.afterClosed().subscribe((result) => { });
      },
      (error) => this.service.messageService("Could not get the results", "error")
    );
  }
  redirection(card: any) {
    // this.telemetry.addTelemetryEvent(card.alias+ ' viewed');
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res
      const navigationExtras: NavigationExtras = {
        state: {
         cardTitle: 'Pipeline',
         pipelineAlias: this.streamItem.alias,
         streamItem: this.streamItem,
          card: card,
        },
        relativeTo: this.route,
      }
      if (this.streamItem.type === 'NativeScript'){
        this.router.navigate(['./view'+'/'+card.name],navigationExtras);
      }else{
        this.router.navigate(['./view/drgndrp'+'/'+card.name], navigationExtras);
      }     
    });
    this.telemetry.addTelemetryEvent(card.alias+ ' viewed');
  }

  selectedButton(i){
    if(i==this.pageNumber)
      return {"color": "white","background": "#7b39b1"}
    else
      return {"color":"black"}
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
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
