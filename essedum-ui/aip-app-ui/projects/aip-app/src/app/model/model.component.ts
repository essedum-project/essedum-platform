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
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { HttpParams } from '@angular/common/http';
import { TagEventDTO } from '../DTO/tagEventDTO.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Location } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';
@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit, OnChanges {
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

  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;
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
  servicev1 = 'model';
  tagrefresh: boolean = false;
  records: boolean = false;
  cortexwindow: any;
  isExpanded = false;
  tooltip: string = 'above';
isSearchHovered=false;
isHovered=false;
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
 
  constructor(

    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  cardTitle: String = 'Model';

  ngOnInit(): void {

    this.records = false;
  
    this.route.queryParams.subscribe((params) => {      
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
        this.pageSize = 4;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCountModels();
    this.getCards();   
    this.Authentications();
    this.fetchAdapters();
  }


 
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
      if (cipAuthority.includes('model-create')) this.createAuth = true;
      if (cipAuthority.includes('model-edit')) this.editAuth = true;
      if (cipAuthority.includes('model-delete')) this.deleteAuth = true;
      if (cipAuthority.includes('model-deploy')) this.deployAuth = true;
    });
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  fetchAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    //this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelListAdapters(params).subscribe((res) => {
      let test = res.body;
      this.alias = test.map((item: any) => item.alias);
      this.options = test;
      test.forEach((element: any) => {
        this.adapterInstanceList.push({
          category: 'Instance',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
    });
    return true;
  }
  tagchange() {
    this.tagService.tags.forEach((element: any) => {
      console.log(element, 'element');
    });
  }
  getCards(): void {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);

    this.service.getModelCards(params).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        data.push(element);
        this.users.push(element.appName);
      });
      this.cards = data;
      if (this.cards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
      console.log('DATA', this.cards);

    });

    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString(),
      this.selectedAdapterInstance.toString()
    );
  }
  getCountModels() {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', false);
    this.service.getCountModels(params).subscribe((res) => {
      this.noOfItems = res;
      if (res) {
        this.records = false;
      } else {
        this.records = true;
      }
    });
  }

  redirect() {
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
    this.router.navigate(['./' + type + '/' + card.sourceName], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        adapterType: this.selectedAdapterType.toString(),
        adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      state: {
        card,
      },
      relativeTo: this.route,
    });
    
  }

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
   
  }
  refresh() {
    this.getCountModels();
    this.fetchAdapters();

    this.getCards();
  }
  refreshComplete() {
    this.tagrefresh = true;
    this.filter = '';
    this.selectedAdapterType = [];
    this.selectedTag = [];
    this.getCountModels();
    this.fetchAdapters();
   
    this.getCards();
  }
  filterz() {  
    this.refresh();
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber = event.pageNumber?event.pageNumber:1;
    this.pageSize = event.pageSize?event.pageSize:4;
    this.cards= [];
    this.getCards();
    this.getCountModels();
  }
  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1; 
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }
  deleteDeployment(card) {
    console.log('deletecard', card);
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .undeployModel(
            card.adapterId,
            card.version,
            card.sourceId,
            card.deployment
          )
          .subscribe(
            (res) => {
              this.service.messageService(
                res,
                'Done!  Model Un-deployed Successfully'
              );
              this.refresh();
            },
            (error) => {
              this.service.messageService(error);
            }
          );
      }
    });
  }
  
  deleteModels(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .deleteModels(card.sourceId, card.adapterId, card.version)
          .subscribe(
            (res) => {
              this.service.messageService(
                res,
                'Done!  Model deleted Successfully'
              );
              this.refresh();
            },
            (error) => {
              this.service.messageService(error);
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

}
