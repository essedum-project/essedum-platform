
import { ChangeDetectorRef, Component,EventEmitter,OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsModalService,LedsLibService  } from 'leds-lib';
import { Services } from '../services/service';
import { PipelineCreateComponent } from '../pipeline-create/pipeline-create.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../services/tags.service';
import { LeapTelemetryService } from 'com-lib-util';
@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit, OnChanges {
  cardTitle: String = "Tool";
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
  itemsPerPage: number[] = [6,9,18,36,54,72]
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
  servicev1='pipelines';
  tagrefresh: boolean=false;
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];

  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  filter: string = '';
  
  // filteredCards: any;

  constructor(
    private telemetryService: LeapTelemetryService,
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public tagService: TagsService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  ngOnInit(): void {
    this.telemetryImpression();
    this.pageSize=this.itemsPerPage[0];
    this.pageNumber = 1;
    this.getCountTools();
    this.getCards();        
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
    // this.getTags();
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "ChainPipelineComponent");
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
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
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);
    params = params.set('adapter_instance', 'internal');
    params = params.set('interfacetype', 'tool');


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
      // this.filteredCards=this.cards;
      // this.noOfItems=data.length;
      // this.fetchModels();
      // this.noOfItems = this.noOfItems || data.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    });
    this.pageSize = this.pageSize || 6;
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

  }
  redirect() {
    this.selectedInstance=this.selectedCard.name
    this.router.navigate([
      './view',
      this.cardTitle,
      this.selectedInstance
    ],
    {
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
    this.getCards();
    this.getCountTools();
    this.tagrefresh=true;
    this.changePage(1)
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
    this.getCountTools();
    this.changePage(1)
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  getCountTools() {
    let params: HttpParams = new HttpParams();
   if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
      params = params.set('page', this.pageNumber);
      params = params.set('size', this.pageSize);
      params = params.set('project', sessionStorage.getItem('organization'));
      params = params.set('isCached', true);
      params = params.set('cloud_provider', 'internal');
      params = params.set('interfacetype', 'tool');

    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }
  deletePipeline(cid){
    try{
      this.service.deletePipeline(cid).subscribe((res) => {
        this.service.message("Pipeline deleted!", "success")
        this.refreshComplete()
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
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res
      const navigationExtras: NavigationExtras = {
        state: {
         cardTitle: 'Tool',
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
    
  }

}

