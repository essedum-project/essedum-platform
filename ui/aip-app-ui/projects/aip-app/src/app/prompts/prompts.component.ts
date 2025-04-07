import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { HttpParams } from '@angular/common/http';
import { TagEventDTO } from '../DTO/tagEventDTO.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { Location } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';
import { PromptServices } from './prompt.service';

@Component({
  selector: 'app-prompts',
  templateUrl: './prompts.component.html',
  styleUrls: ['./prompts.component.scss'],
})

export class PromptsComponent implements OnInit, OnChanges {
  test: any;
  cards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filter: string = '';
  selectedCard: any = [];
  cardToggled: boolean = true;
  // pageSize: number;
  // pageNumber: number;
  // pageArr: number[] = [];
  // pageNumberInput: number;
  // noOfPages: number = 0;
  // prevRowsPerPageValue: number;
  // itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  // noOfItems: number;
  // @Output() pageChanged = new EventEmitter<any>();
  // @Output() pageSizeChanged = new EventEmitter<any>();
  // endIndex: number;
  // startIndex: number;
  // pageNumberChanged: boolean = true;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedTagList: any[];
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  servicev1 = 'prompt';
  tagrefresh: boolean = false;
  records: boolean = false;
  cortexwindow: any;
  isExpanded = false;
  tooltip: string = 'above';

  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent: PaginationComponent;
  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location,
    private promptService: PromptServices,
  ) {
    // this.cortexwindow = window['cortexCore'].config.getConfig().features.virtualAssistant;
    // this.route.queryParams.subscribe((params) => {
    //   this.pageNumber = params['page'] ? parseInt(params['page']) : 1;
    //   this.filter = params['search'] || this.filter;
    // });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  cardTitle: String = 'Prompts';
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','PromptsComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    this.records = false;
    this.telemetryImpression();
    //  this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedAdapterType = params['type']
          ? params['type'].split(',')
          : [];
        this.selectedAdapterInstance = params['adapterInstance']
          ? params['adapterInstance'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.pageSize = 8;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCountPrompts();
    this.getCards();
    this.Authentications();
    // this.fetchAdapters();
  }
  getCountPrompts() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) 
      params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    
    this.promptService.getCountPrompts(params).subscribe((res) => {
      this.noOfItems = res as number;
    });
    
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression('aip-app', 'list', 'PromptsComponent');
  }
  resetPage(page: number) {
    this.paginationComponent.changePage(page);
  }
  // nextPage() {
  //   if (this.pageNumber + 1 <= this.noOfPages) {
  //     this.pageNumber += 1;
  //     // this.changePage(this.pageNumber);
  //     this.changePage();
  //   }
  // }
  // prevPage() {
  //   if (this.pageNumber - 1 >= 1) {
  //     this.pageNumber -= 1;
  //     // this.changePage(this.pageNumber);
  //     this.changePage();
  //   }
  // }
  // updatequeryParam(page: number, search: string) {
  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //     queryParams: { page: page, search: search },
  //     queryParamsHandling: 'merge',
  //   });
  // }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: adapterType,
          adapterInstance: adapterInstance,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('prompt-create')) this.createAuth = true;
      if (cipAuthority.includes('prompt-edit')) this.editAuth = true;
      if (cipAuthority.includes('prompt-deleteById')) this.deleteAuth = true;
    });
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  // fetchAdapters(): boolean {
  //   let params: HttpParams = new HttpParams();
  //   this.adapterInstanceList = [];
  //   if (this.selectedAdapterType.length >= 1)
  //     params = params.set('adapterType', this.selectedAdapterType.toString());
  //   params = params.set('project', sessionStorage.getItem('organization'));
  //   this.service.getModelListAdapters(params).subscribe((res) => {
  //     let test = res.body;
  //     this.alias = test.map((item: any) => item.alias);
  //     this.options = test;
  //     test.forEach((element: any) => {
  //       this.adapterInstanceList.push({
  //         category: 'Instance',
  //         label: element.alias,
  //         value: element.name,
  //         selected: false,
  //       });
  //     });
  //   });
  //   return true;
  // }
  tagchange() {
    this.tagService.tags.forEach((element: any) => {
      console.log(element, 'element');
    });
  }
  getCards(): void {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) 
      params = params.set('query', this.filter);
    // else params = params.set('query', '');
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    
    this.promptService.getPromptCards(params).subscribe((res) => {
      this.cards = res.body;
      // this.noOfItems = this.cards.length;
      if (this.cards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
    });
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
    );
  }

  redirect() {
    // console.log('redirect');
    this.options.forEach((element: any) => {
      if (element.alias === this.selectedInstance) {
        this.selectedInstance = element.name;
      }
    });
    this.router.navigate(['./preview', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }
  redirection(card: any, type: string) {
    this.telemetryService.interact(
      'click',
      'PromptComponent',
      'open',
      card.name
    );
    this.router.navigate(['./' + type + '/' + card.name], {
      queryParams: {
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      state: {
        card,
      },
      relativeTo: this.route,
    });
    this.telemetry.addTelemetryEvent(card.alias+' viewed');
  }
  // openedit(content: any): void {
  //   this.modalService.openModal(content, 'standard');
  // }
  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
  }
  editModel(card: any) {
    console.log(card);

    this.router.navigate(['./edit'], {
      queryParams: { data: card },
      relativeTo: this.route,
    });
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  refresh() {
    // this.getCountModels();
    // this.fetchAdapters();
    this.resetPage(1);
    this.getCards();
  }
  refreshComplete() {
    this.filter = '';
    // this.getCountModels();
    // this.fetchAdapters();
    this.resetPage(1);
    this.tagrefresh = true;
    this.getCards();
  }
  filterz() {
    // setTimeout(() => {
    //   this.updatequeryParam(1, this.filter);
    // this.refresh();

    // }, 1500);
    this.refresh();
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    this.pageNumber = event.pageNumber?event.pageNumber:1;
    this.pageSize = event.pageSize?event.pageSize:4;
    this.cards= [];
    this.getCards();
    // this.getCountModels();
  }
  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1;
    // if (this.selectedAdapterType.length >= 1) {
    //   this.updatequeryParam(
    //     this.pageNumber,
    //     this.selectedAdapterType.toString()
    //   );
    // }
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }
  deletePrompt(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.promptService
          .deletePrompt(card.id)
          .subscribe(
            (res) => {
              this.service.message('Done!  Prompt deleted Successfully', 'success');
              this.telemetry.addTelemetryEvent(card.alias+' deleted');
              this.ngOnInit();
            },
            (error) => {
              this.service.message(error,'error');
            }
          );
      }
    });
  }
  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
    else return { color: 'black' };
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

  createPrompt() {
    this.router.navigate(['./create'], { relativeTo: this.route });
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
