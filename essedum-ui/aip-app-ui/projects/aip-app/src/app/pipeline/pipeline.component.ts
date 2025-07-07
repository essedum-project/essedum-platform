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
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../services/tags.service';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { PipelineCreateComponent } from './pipeline-create/pipeline-create.component';
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
  isHovered: boolean =  false;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;

  noOfItems: number;
  isSearchHovered: boolean;
  
filteredCards: any[] = [];
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
  streamItem: any;
  servicev1 = 'pipelines';
  tagrefresh: boolean = false;
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  finalDataList: any = [];

  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  filter: string = '';
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  organization: string;
  pipelineConstantsKey: string = 'icip.pipeline.includeCore';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public tagService: TagsService,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.organization) this.refresh();
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
  ngOnInit(): void {
    this.filteredCards = [];
    this.organization = sessionStorage.getItem('organization');
    if (this.organization) {
      this.records = false;
      if (this.router.url.includes('preview')) {
        let cards = this.location.getState();
        console.log('relatedData', cards['relatedData'].data);
        this.streamItem = cards['relatedData'].data;
        this.desc(this.streamItem);
      }
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
          this.pageSize = 8;
          this.filter = '';
        }
      });
      this.updateQueryParam(this.pageNumber);
      this.getCountPipelines();
      this.getCards();
     
    }
    this.Authentications();
  }



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
   
          data.push(element);
          this.users.push(element.alias);
          if (index == test.length - 1) {
            this.cards = data;
            this.filteredCards = data; 
            if (this.cards.length == 0) {
              this.records = true;
            } else {
              this.records = false;
            }
          }
        });
      } else {
        this.cards = data;
        this.filteredCards = data;
        this.records = true;
      }

     
    });

    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString()
    );
  }

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
 

  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1;
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
    // this.resetPage(1);
    this.filt="";
    this.ngOnInit()
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {

    this.service
      .getConstantByKey(this.pipelineConstantsKey)
      .subscribe((response) => {
        if (response.body == 'true')
          this.organization = 'Core,' + sessionStorage.getItem('organization');
        else this.organization = sessionStorage.getItem('organization');

        this.pageNumber = event.pageNumber ? event.pageNumber : 1;
        this.pageSize = event.pageSize ? event.pageSize : 8;
        this.getCountPipelines();
        this.getCards();
      });
  }

  open(): void {
    const dialogRef = this.dialog.open(PipelineCreateComponent, {
      height: '80%',
      width: '60%',
      minWidth: '60vw',
      disableClose: true,
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  refresh() {
    this.records = false;
    this.getCards();
    this.getCountPipelines();

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
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.refresh();
          }
        });
      },
      (error) =>
        this.service.messageService('Could not get the results', 'error')
    );
  }

  redirection(card: any) {

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
    this.service
      .getConstantByKey(this.pipelineConstantsKey)
      .subscribe((response) => {
        if (response.body == 'true')
          this.organization = 'Core,' + sessionStorage.getItem('organization');
        else this.organization = sessionStorage.getItem('organization');
      });
  }

 
  filterz() {
    const search = (this.filt || '').toLowerCase().trim();
  if (!search) {
    this.filteredCards = this.cards;
  } else {
    this.filteredCards = this.cards.filter(card =>
      (card.alias || '').toLowerCase().includes(search)
    );
  }
  }
  


  filterCards(page?: number) {
    if (page)
      this.pageNumber = page;
    else
      this.pageNumber = 1;
    if (this.selectedAdapterType.length > 0) {
      let multiFilter;
      this.finalDataList = [];
      this.records = true;
      for (let i = 0; i < this.selectedAdapterType.length; i++) {
        multiFilter = this.cards.filter((data) => {
          const isAdapterTypeIncluded = data.type?.includes(this.selectedAdapterType[i]);
          const isFiltIncluded = this.filt && this.filt.trim() !== '' ? (data.alias.toLowerCase().includes(this.filt.toLowerCase()) || data.name.toLowerCase().includes(this.filt.toLowerCase())) : true;
          if (this.records)
            this.records = !(isAdapterTypeIncluded && isFiltIncluded);
          return isAdapterTypeIncluded && isFiltIncluded;
        }

        );
        this.finalDataList.push(...multiFilter);
      }
      this.filteredCards = this.finalDataList;
      this.noOfItems = this.filteredCards.length;
      this.noOfItems = this.noOfItems || this.filteredCards.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    } else {
      if (this.filt && this.filt != '') {
        this.records = true;
        this.filteredCards = this.cards.filter((data) => {
          const match = data.alias.toLowerCase().includes(this.filt.toLowerCase()) || data.name.toLowerCase().includes(this.filt.toLowerCase());
          if (match) {
            this.records = false;
          }
          return match;
        });
        this.noOfItems = this.filteredCards.length;
        this.noOfItems = this.noOfItems || this.filteredCards.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      } else {
        if (!page)
          this.refreshComplete();
      }
    }
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString());
  }
  
}