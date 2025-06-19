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
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from '../adapter/adapter-service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-spec-template',
  templateUrl: './spec-template.component.html',
  styleUrls: ['./spec-template.component.scss'],
})
export class SpecTemplateComponent implements OnInit, OnChanges {
  cardTitle: String = 'Specs';
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
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  filteredCards: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedCapabilityType: string[] = [];
  tagrefresh: boolean = false;
  servicev1 = 'specs';
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  filtbackup: any = '';
  allCardsFiltered: any;
  allCards: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges): void {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {}

  updatePageSize() {
    this.pageSize = 0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber, this.pageSize);
    }
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.records = false;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedCapabilityType = params['capabilityTypes']
          ? params['capabilityTypes'].split(',')
          : [];
        if (
          this.selectedCapabilityType &&
          this.selectedCapabilityType.length > 0
        ) {
          this.isExpanded = true;
        }
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCountSpecTemplates();
    this.getCards(this.pageNumber, this.pageSize);

    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
  }

  updateQueryParam(
    page: number = 1,
    search: string = '',
    capabilityTypes: string = '',
    org: string = sessionStorage.getItem('organization') || '',
    roleId: string = (() => {
      const role = sessionStorage.getItem('role');
      return role ? JSON.parse(role).id : '';
    })()
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          capabilityTypes: capabilityTypes,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      }
      this.getCards(this.pageNumber, this.pageSize);
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType?.toString() ?? ''
      );
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      if (this.pageNumber <= 5) {
        this.startIndex = 0;
        this.endIndex = 5;
      } else {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      }
      this.getCards(this.pageNumber, this.pageSize);
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType?.toString() ?? ''
      );
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.getCards(this.pageNumber, this.pageSize);
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType?.toString() ?? ''
      );
    }
  }

  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.pageNumber = 1; // Reset to first page when changing page size

      // Update pagination
      this.getCountSpecTemplates();
      this.getCards(this.pageNumber, this.pageSize);

      // Update URL params
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType?.toString() ?? ''
      );
    }
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // spectemplate-create permission
      if (cipAuthority.includes('spectemplate-create')) this.createAuth = true;
      // spectemplate-edit/update permission
      if (cipAuthority.includes('spectemplate-edit')) this.editAuth = true;
      // spectemplate-delete permission
      if (cipAuthority.includes('spectemplate-delete')) this.deleteAuth = true;
    });
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {});
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getCountSpecTemplates() {
    let params: HttpParams = new HttpParams();

    const org = sessionStorage.getItem('organization');
    if (this.filt?.length >= 1) {
      params = params.set('query', this.filt);
    }

    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);

    if (this.selectedCapabilityType?.length >= 1) {
      params = params.set(
        'capabilityTypes',
        this.selectedCapabilityType.toString()
      );
    }

    // Assuming `this.organization` is passed as a path variable to the service
    this.adapterServices
      .getCountSpecTemplates(org, this.filt, this.selectedCapabilityType.join())
      .subscribe((res) => {
        this.noOfItems = res;
        console.log('No of Items: ', this.noOfItems);
      });
  }

  // Update getCards to not call filterSelectedCards
  getCards(page?: number, size?: number, query?: string, type?: string): void {
    if (page) {
      this.pageNumber = page;
    }
    if (size) {
      this.pageSize = size;
    }
    if (query) {
      this.filt = query;
    }
    if (type) {
      this.selectedCapabilityType = type.split(',');
    }

    this.pageSize = this.pageSize || 9;
    const timezoneOffset = new Date().getTimezoneOffset();
    const org = sessionStorage.getItem('organization');

    this.adapterServices
      .getMlSpecTemplatesCards(
        org,
        this.pageNumber,
        this.pageSize,
        this.filt,
        this.selectedCapabilityType.join(',')
      )
      .subscribe({
        next: (res) => {
          const data: any[] = [];
          this.users = []; // clear previous users

          res.forEach((element: any) => {
            element.lastmodifiedon = new Date(
              new Date(element.lastmodifiedon).getTime() -
                timezoneOffset * 60 * 1000
            );
            data.push(element);
            this.users.push(element.domainname);
          });

          this.cards = data;
          this.records = this.cards.length === 0;

          // Calculate pagination
          this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
          this.pageArr = [...Array(this.noOfPages).keys()];

          // Update pagination indexes
          if (this.pageNumber > 5) {
            this.endIndex = this.pageNumber;
            this.startIndex = this.endIndex - 5;
          } else {
            this.startIndex = 0;
            this.endIndex = 5;
          }

          this.changeDetectionRef.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching cards:', error);
          this.records = true;
        },
      });
  }

  desc(card: any) {
    this.router.navigate(['../specs/' + card.domainname], {
      relativeTo: this.route,
    });
  }

  redirect() {
    this.selectedInstance = this.selectedCard.name;
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }

  filterz() {
    if (this.filt.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }

    // Update query parameters and refresh data from backend
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCapabilityType?.toString() ?? ''
    );

    // Fetch new data with filter
    this.getCards(this.pageNumber, this.pageSize, this.filt);
    // Get updated count
    this.getCountSpecTemplates();
  }

  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;
      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
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

  filterByTag(tag) {
    this.tagStatus[tag.category + ' - ' + tag.label] =
      !this.tagStatus[tag.category + ' - ' + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    } else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
    }
  }

  createSpecTemplate() {
    this.router.navigate(['./create'], {
      relativeTo: this.route,
    });
  }

  refresh() {
    this.getCards(this.pageNumber, this.pageSize);
  }

  openEdit() {
    console.log('openEdit');
  }

  redirectToEdit(dname) {
    this.router.navigate(['./edit/' + dname], {
      relativeTo: this.route,
    });
  }

  delete(domainname) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices
          .deleteApiSpecTemplate(
            domainname,
            sessionStorage.getItem('organization')
          )
          .subscribe((resp: any) => {
            if (resp.body) {
              if (resp.body.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Spec Deleted Successfully'
                );
                this.refresh();
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Spec Can't be Deleted, It's being used by adapter(s)"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
          });
      }
    });
  }

  tagSelectedEvent(event) {
    this.selectedCapabilityType =
      event.getSelectedMlSpecTemplateCapabilityType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.changeDetectionRef.detectChanges();
    this.filterSelectedCards(this.pageNumber);
  }

  filterSelectedCards(page: any, size?: any) {
    this.tagrefresh = false;
    if (page) {
      this.pageNumber = page;
    }

    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCapabilityType?.toString() ?? ''
    );

    // Fetch new data with filters
    this.getCards(
      this.pageNumber,
      this.pageSize,
      this.filt,
      this.selectedCapabilityType.join(',')
    );
    // Get updated count
    this.getCountSpecTemplates();
  }

  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#0094ff' };
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

  completeRefresh() {
    this.filt = '';
    this.tagrefresh = true;
    this.changeDetectionRef.detectChanges();
    if (!this.isExpanded) {
      this.selectedCapabilityType = [];
      this.updateQueryParam(1, '', '', '');
      this.pageNumber = 1;
      this.filt = '';
      this.tagrefresh = true;
      this.updatePageSize();
    }
  }

  updatePageSizeOnly() {
    this.pageSize = 0;
    if (window.innerWidth > 1440) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
    }
  }
}
