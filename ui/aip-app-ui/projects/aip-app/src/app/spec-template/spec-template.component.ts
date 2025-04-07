import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from '../adapter/adapter-service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { Location } from '@angular/common';
import * as _ from "lodash";
@Component({
  selector: 'app-spec-template',
  templateUrl: './spec-template.component.html',
  styleUrls: ['./spec-template.component.scss'],
})
export class SpecTemplateComponent implements OnInit, OnChanges {
  cardTitle: String = "Specs";
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
  itemsPerPage: number[] = [6,9,18,36,54,72]
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
  servicev1 = "specs";
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  filtbackup: any="";
  allCardsFiltered: any;
  allCards: any;

  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) { }
  ngOnChanges(changes: SimpleChanges): void {

  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
  }
  updatePageSize() {
    this.pageSize=0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber,this.pageSize);
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber,this.pageSize);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber,this.pageSize); 
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber,this.pageSize);
    } else if (window.innerWidth < 768 ) {
      this.itemsPerPage = [4,8,12,16,20,24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber,this.pageSize);
    }
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','SpecTemplateComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    this.updatePageSizeOnly();
    this.records= false;
    this.telemetryImpression();
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedCapabilityType = params['capabilityTypes'] ? params['capabilityTypes'].split(',') : [];
        if (this.selectedCapabilityType && this.selectedCapabilityType.length > 0) {
          this.isExpanded = true;
        }
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber,this.filt);
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
          roleId: roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "SpecTemplateComponent");
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
    this.getCards(this.pageNumber, this.pageSize);
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
          // spectemplate-create permission
          if (cipAuthority.includes("spectemplate-create")) this.createAuth = true;
          // spectemplate-edit/update permission
          if (cipAuthority.includes("spectemplate-edit")) this.editAuth = true;
          // spectemplate-delete permission
          if (cipAuthority.includes("spectemplate-delete")) this.deleteAuth = true;
        }
      );
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
  getCards(page: any, size: any): void {
    if (page)
      this.pageNumber = page;
    if (size)
      this.pageSize = size || 8;
    let timezoneOffset = new Date().getTimezoneOffset();
    let org = sessionStorage.getItem("organization");
    this.adapterServices.getMlSpecTemplatesCards(org).subscribe((res) => {
      let data: any = [];
      let test = res;
      test = test.filter((element) => {
        return element.organization === sessionStorage.getItem('organization');
      });
      test.forEach((element: any) => {
        element.createdon = new Date(new Date(element.createdon).getTime() - timezoneOffset * 60 * 1000);
        data.push(element);
        this.users.push(element.domainname)
      });
      this.cards = data;
      this.allCards=data;
      this.allCardsFiltered=data;
      this.filterSelectedCards(page, size);
    });
    this.pageSize = this.pageSize || 9;
  }
  desc(card: any) {
    // this.telemetry.addTelemetryEvent(card.alias+" viewed");
    this.router.navigate(["../specs/"+card.domainname], { relativeTo: this.route });
    this.telemetry.addTelemetryEvent(card.alias+" viewed");
  }
  redirect() {
    this.selectedInstance = this.selectedCard.name;
    this.router.navigate([
      './view',
      this.cardTitle,
      this.selectedInstance
    ],
      {
        relativeTo: this.route,
      });
  }

  filterz() {
    if(this.filt.length!=this.filtbackup.length){
      this.pageNumber=1;
      this.filtbackup=this.filt;
    }
    let data:any=[];
    this.allCardsFiltered.forEach((element:any) => {
      if(element.domainname.toLowerCase().includes(this.filt.toLowerCase())){
        data.push(element);
      }
    });
    this.cards=data;
    if(this.cards.length==0){
      this.records=true;
    }
    else{
      this.records=false;
    }
    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCapabilityType?.toString() ?? ''
    );

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
  createSpecTemplate() {
    this.router.navigate([
      './create'],
      {
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

    this.router.navigate([
      './edit/' + dname],
      {
        relativeTo: this.route,
      });
  }
  delete(domainname) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.adapterServices.deleteApiSpecTemplate(domainname, sessionStorage.getItem("organization")).subscribe((resp: any) => {
          if (resp.body) {
            if (resp.body.message == "success") {
              this.adapterServices.messageNotificaionService('success', "Done!  Spec Deleted Successfully");
              this.refresh();
              this.telemetry.addTelemetryEvent(domainname+ ' Deleted');
            }
            else
              this.adapterServices.messageNotificaionService('warning', "Spec Can't be Deleted, It's being used by adapter(s)");
          } else
            this.adapterServices.messageNotificaionService('error', "Error");
        });
      }

    });
  }

  tagSelectedEvent(event) {
    this.selectedCapabilityType = event.getSelectedMlSpecTemplateCapabilityType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.filterSelectedCards(this.pageNumber);
  }
  filterSelectedCards(page:any,size?:any) {
    this.tagrefresh = false;
      if (this.selectedCapabilityType.length > 0) {
        let data:any = new Set();
        this.selectedCapabilityType.forEach((element: any) => {
          this.allCards.forEach((ele: any) => {
            if (ele.capability?.includes(element)) {
              data.add(ele);
            }
          });
        });
        this.allCardsFiltered =  Array.from(data);
        this.cards = this.allCardsFiltered;
      } else {
        this.allCardsFiltered = this.allCards;
        this.cards = this.allCards;
      }
      if (this.cards.length == 0) {
        this.records = true;
      }
      else {
        this.records = false;
      }
      if (this.filt.length >= 1) {
        this.filterz();
      }  else{
        this.filt = "";
      }
      if(page)
        this.pageNumber=page;
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType?.toString() ?? ''
      );
      this.noOfItems = this.cards.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
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
  completeRefresh() {
    this.filt = '';
    this.tagrefresh = true;
    if (!this.isExpanded) {
      this.selectedCapabilityType = [];
      this.updateQueryParam(1, '', '', '');
      this.pageNumber = 1;
      this.filt = "";
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
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
