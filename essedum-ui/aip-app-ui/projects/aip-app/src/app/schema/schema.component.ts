import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss'],
})
export class SchemaComponent implements OnInit, OnChanges {
  cardTitle: String = 'Schemas';
  isSearchHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isMenuHovered: boolean = false;
  test: any;
  cards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any;
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: any;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 12, 18, 24, 30, 36];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean = true;
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
  records: boolean = false;
  dropDown: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.getCards(this.pageNumber, this.pageSize, this.filt);
    this.tagchange();
    this.updatePageSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }

  updatePageSize() {
    this.pageSize = 0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    }
  }

  ngOnInit(): void {
    this.records = false;
    this.updatePageSize();
    this.service.getConstantByKey('icip.schema.system').subscribe((res) => {
      this.createDropdown(JSON.parse(res.body));
    });
    // this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = parseInt(params['page']);
        this.filt = params['search'];
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCards(this.pageNumber, this.pageSize, this.filt);
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
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
    this.getCards(this.pageNumber, this.pageSize, this.filt);
  }

  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }

  selectedButton(i) {
    if (i == this.pageNumber) {
      return { color: 'white', background: '#0094ff' };
    } else return { color: 'black' };
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // schema-create permission
      if (cipAuthority.includes('schema-create')) this.createAuth = true;
      // schema-edit/update permission
      if (cipAuthority.includes('schema-edit')) this.editAuth = true;
      // schema-delete permission
      if (cipAuthority.includes('schema-delete')) this.deleteAuth = true;
    });
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {});
  }

  details(card: any, type: any, dropDown: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        card: card,
        drop: dropDown,
      },
      relativeTo: this.route,
    };
    this.router.navigate(['./' + type], navigationExtras);
  }

  createSchema(dropDown: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        drop: dropDown,
      },
      relativeTo: this.route,
    };
    this.router.navigate(['./create'], navigationExtras);
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getCards(page: any, size: any, filter: any): void {
    let params: HttpParams = new HttpParams();
    if (filter?.length > 0) {
      params = params.set('filter', filter);
    }
    params = params.set('orderBy', 'abc');
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getSchemasCards(params).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        data.push(element);
        this.users.push(element.alias);
      });
      this.cards = data;
      this.noOfItems = data.length;
      this.noOfItems = this.noOfItems || data.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      if (res.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
    });

    // this.pageSize = this.pageSize || 6;
    this.updateQueryParam(this.pageNumber, this.filt);
  }

  desc(card: any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
  }

  redirect() {
    this.selectedInstance = this.selectedCard.name;
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }

  filterz(event: any) {
    this.getCards((this.pageNumber = 1), this.pageSize, this.filt);
  }

  refresh() {
    this.filt = '';
    this.pageNumber = 1;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.changePage(this.pageNumber);
  }

  deleteSchema(card: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteSchema(card.name).subscribe(
          (res) => {
            this.getCards(this.pageNumber, this.pageSize, this.filt);
            this.service.message('Schema Deleted Successfully', 'success');
          },
          (error) => {
            this.service.message('Error in Deleting Schema' + error, 'error');
          }
        );
      }
    });
  }

  updateQueryParam(
    page: number = 1,
    search: string = '',

    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  createDropdown(data: any) {
    let capabilitiesMap: Map<string, any> = new Map<string, any>();
    let types = [];
    data.forEach((element) => {
      if (element != null && typeof element === 'object')
        Object.keys(element).forEach((key) => {
          types.push({ value: key, viewValue: key });
          let capabilityList: any = [];
          let def: any = '';
          let isdef = false;
          element[key].forEach((ele) => {
            Object.entries(ele).forEach(([key1, value1]) => {
              if (key1 == 'Capability' && value1 != null && value1 != '')
                capabilityList.push({ value: value1, viewValue: value1 });
              if (!isdef && key1 != 'default') def = value1;
              console.log('this is default value', def);
              if (key1 == 'default' && !isdef) isdef = value1 as boolean;
            });
          });
          let temp: any = {
            default: def,
            value: capabilityList,
          };
          capabilitiesMap.set(key, temp);
        });
    });
    let drop: any = {
      types: types,
      capabilities: capabilitiesMap,
    };
    this.dropDown = drop;

    console.log('this is dropDown', this.dropDown);
  }
}
