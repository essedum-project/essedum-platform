import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { Services } from '../services/service';
import { PipelineCreateComponent } from '../pipeline-create/pipeline-create.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../services/tags.service';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss'],
})
export class PipelineComponent implements OnInit, OnChanges {
  cardTitle: String = 'Pipelines';
  cardToggled: boolean = true;
  users: any = [];
  cards: any;
  selectedCard: any = [];
  selectedInstance: any;
  toggle: boolean = false;
  filt: any;
  // pageSize: number;
  // pageNumber: any;
  // pageArr: number[] = [];
  // pageNumberInput: number = 1;
  // noOfPages: number = 0;
  // prevRowsPerPageValue: number;
  // itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  // noOfItems: number;
  // @Output() pageChanged = new EventEmitter<any>();
  // @Output() pageSizeChanged = new EventEmitter<any>();
  // endIndex: number;
  // startIndex: number;
  // pageNumberChanged: boolean = true;
  
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent:PaginationComponent;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedTagList: any[];
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  // streamItem: import("c:/Leds_AIP/aip/ui/aip-app-ui/projects/aip-app/src/app/streaming-services/streaming-service").StreamingServices;
  streamItem: any;
  servicev1 = 'pipelines';
  tagrefresh: boolean = false;
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
  pipelineConstantsKey: string = 'icip.pipeline.includeCore';

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
    public tagService: TagsService,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    // this.getOrganization();
    if(this.organization)
    this.refresh();
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    pipelineType: string = '',
    org: string = this.organization,
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          pipelineType: pipelineType,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','PipelineComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    // this.getOrga4nization();
    if(this.organization){
    this.records = false;
    if (this.router.url.includes('preview')) {
      let cards = this.location.getState();
      console.log('relatedData', cards['relatedData'].data);
      this.streamItem = cards['relatedData'].data;
      this.desc(this.streamItem);
    }
    //this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedAdapterType = params['pipelineType']
          ? params['pipelineType'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.pageSize = 4;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCountPipelines();
    this.getCards();
    // if (this.pageNumberChanged) {
    //   this.pageNumber = 1;
    //   this.startIndex = 0;
    //   this.endIndex = 5;
    // }
    //this.pageNumber = parseInt(this.pageNumber);
    // if (this.pageNumber && this.pageNumber >= 5) {
    //   this.endIndex = this.pageNumber + 2;
    //   this.startIndex = this.endIndex - 5;
    // } else {
    //   this.startIndex = 0;
    //   this.endIndex = 5;
    // }
    // this.getTags();
  }
    this.telemetryImpression();
    this.Authentications();
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression('aip-app', 'list', 'PipelineComponent');
  }
  resetPage(page:number){
    this.paginationComponent.changePage(page);
  }

  // nextPage() {
  //   if (this.pageNumber + 1 <= this.noOfPages) {
  //     this.pageNumber += 1;
  //     this.changePage();
  //   }
  // }
  // prevPage() {
  //   if (this.pageNumber - 1 >= 1) {
  //     this.pageNumber -= 1;
  //     this.changePage();
  //   }
  // }
  // changePage(page?: number) {
  //   if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
  //   if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
  //     this.pageChanged.emit(this.pageNumber);
  //     if (this.pageNumber > 5) {
  //       this.endIndex = this.pageNumber;
  //       this.startIndex = this.endIndex - 5;
  //     } else {
  //       this.startIndex = 0;
  //       this.endIndex = 5;
  //     }
  //   }
  //   this.getCards();
  // }
  // selectedButton(i) {
  //   if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
  //   else return { color: 'black' };
  // }
  // rowsPerPageChanged() {
  //   if (this.pageSize == 0) {
  //     this.pageSize = this.prevRowsPerPageValue;
  //   } else {
  //     this.pageSizeChanged.emit(this.pageSize);
  //     this.prevRowsPerPageValue = this.pageSize;
  //     this.changeDetectionRef.detectChanges();
  //   }
  // }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // pipeline-create permission
      if (cipAuthority.includes('pipeline-create')) this.createAuth = true;
      // pipeline-edit/update permission
      if (cipAuthority.includes('pipeline-edit')) this.editAuth = true;
      // pipeline-delete permission
      if (cipAuthority.includes('pipeline-delete')) this.deleteAuth = true;
    });
  }
  changedToogle(event: any) {
    this.cardToggled = event;
    this.streamItem = this.streamItem.reset;
  }
  tagchange() {
    this.tagService.tags.forEach((element: any) => {});
  }
  getCards(): void {
    let params: HttpParams = new HttpParams();
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', this.organization);
    params = params.set('isCached', true);
    params = params.set('adapter_instance', 'internal');
    params = params.set('interfacetype', 'pipeline');
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());

    this.service.getPipelinesCards(params).subscribe((res) => {
      let data: any = [];
      let test = res;
      // test = test.filter(pipeline => (pipeline.target.type != 'App'));
      if (test.length) {
        test.forEach((element: any, index) => {
          // if(element.type != 'App' || element.is_template == null || element.is_template == false){
          //   if(element.is_template == null)
          //     element.is_template = false
          data.push(element);
          this.users.push(element.alias);
          if (index == test.length - 1) {
            this.cards = data;
            if (this.cards.length == 0) {
              this.records = true;
            } else {
              this.records = false;
            }
          }
        });
      }else{
        this.cards = data;
        this.records = true;
      }
      
      // this.cards = data;
      // if (this.cards.length == 0) {
      //   this.records = true;
      // } else {
      //   this.records = false;
      // }

      // this.filteredCards=this.cards;
      // this.noOfItems=data.length;
      // this.fetchModels();
      // this.noOfItems = this.noOfItems || data.length;
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
    });
  //  this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString(),
    );
  }
  // optionChange(event: Event) {
  //   let i: number = event.target['selectedIndex'];
  //   this.pageSize = this.itemsPerPage[i];
  //   this.pageNumber = 1;
  //   this.getCards();
  // }
  desc(card: any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res;
    });
  }
  redirect() {
    this.selectedInstance = this.selectedCard.name;
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }

  filterz() {
    this.refresh();
    // let data:any=[];
    // console.log(this.filt);
    // this.filteredCards = this.cards.filter(item => item.alias.toLowerCase().includes(this.filt.toLowerCase()))
  }

  tagSelectedEvent(event) {

    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber=1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }

  numSequence(n: number): Array<number> {
    return Array(n);
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
  refreshComplete() {
    this.records = false;
    this.tagrefresh = true;
    this.pageNumber = 1;
    this.pageSize = 8;
    this.filter = '';
    this.selectedAdapterType = [];
    this.selectedTag = [];
    this.getCountPipelines();
    this.getCards();
    this.resetPage(1);
    // this.filt="";
    // this.ngOnInit()
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    // console.log('Page number:', event.pageNumber);
    // console.log('Page size:', event.pageSize);
    this.service.getConstantByKey(this.pipelineConstantsKey).subscribe((response) => {

      if(response.body == 'true')
        this.organization = 'Core,'+sessionStorage.getItem('organization');
      else
        this.organization = sessionStorage.getItem('organization');

      this.pageNumber=event.pageNumber?event.pageNumber:1;
      this.pageSize=event.pageSize?event.pageSize:4;
      this.getCountPipelines();
      this.getCards();
    });
  }

  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }

  refresh() {
    this.records = false;
    this.getCards();
    this.getCountPipelines();
    //this.changePage(1);
    this.resetPage(1);
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  getCountPipelines() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', this.organization);
    params = params.set('isCached', true);
    params = params.set('cloud_provider', 'internal');
    params = params.set('interfacetype', 'pipeline');
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }
  deletePipeline(cid) {
    try {

      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.service.deletePipeline(cid).subscribe((res) => {
            this.service.message('Pipeline deleted!', 'success');
            this.refreshComplete();
            //this.telemetry.addTelemetryEvent('pipeline deleted');
          });
        }
      });
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }
  editPipeline(id) {
    this.service.getStreamingServices(id).subscribe(
      (pageResponse) => {
        const dialogRef = this.dialog.open(PipelineCreateComponent, {
          height: '80%',
          width: '60%',
          minWidth: '60vw',
          disableClose: true,
          data: {
            canvasData: pageResponse,
            edit: true,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {});
      },
      (error) =>
        this.service.messageService('Could not get the results', 'error')
    );
  }
  redirection(card: any) {
    // //this.telemetry.addTelemetryEvent(card.alias + 'viewed successfully')
    this.telemetryService.interact(
      'click',
      'PipelineComponent',
      'open',
      card.alias
    );
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res;
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page: this.pageNumber,
          search: this.filter,
          pipelineType: this.selectedAdapterType.toString(),
          org: this.organization,
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',
        state: {
          cardTitle: 'Pipeline',
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: card,
        },
        relativeTo: this.route,
      };
      if (this.streamItem.type === 'NativeScript') {
        this.router.navigate(['./view' + '/' + card.name], navigationExtras);
      } else {
        this.router.navigate(
          ['./view/drgndrp' + '/' + card.name],
          navigationExtras
        );
      }
    });
    //this.telemetry.addTelemetryEvent(card.alias + 'viewed successfully')
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

  getOrganization() {
    this.service.getConstantByKey(this.pipelineConstantsKey).subscribe((response) => {
      if(response.body == 'true')
        this.organization = 'Core,'+sessionStorage.getItem('organization');
      else
        this.organization = sessionStorage.getItem('organization');
    });
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
