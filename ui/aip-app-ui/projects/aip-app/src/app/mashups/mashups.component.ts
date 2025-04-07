import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Mashup } from '../DTO/mashup';
import { MashupsService } from '../mashups/mashups.service';
import { Services } from '../services/service';
import { LedsModalService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { AdapterServices } from '../adapter/adapter-service';

@Component({
  selector: 'lib-mashups',
  templateUrl: './mashups.component.html',
  styleUrls: ['./mashups.component.scss']
})
export class MashupsComponent implements OnInit {

  cardTitle: String = "Mashups";
  createAction = 'create';
  editAction = 'edit';
  test: any;
  cards: any;
  allCards: any;
  allCardsFiltered: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any = "";
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [8, 12, 16, 20, 24, 48]
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
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedConnectionNamesList: string[] = [];
  selectedCategoryList: string[] = [];
  selectedSpecList: string[] = [];
  records: boolean = false;

  mashuplist: any[];
  cols: any[] = [];
  busy: Subscription;
  showList;
  name;
  isGridView = true
  addmashup = false
  mashup: Mashup = new Mashup()
  id
  showBreadcrumb = true;

  breadcrumb: any[] = [];
  constructor(
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private mashupService: MashupsService,
    private modalService: LedsModalService,
    private adapterServices: AdapterServices,
  ) { }

  ngOnInit() {
    this.name = this.router.url.split("/")[this.router.url.split("/").length - 1];
    this.Authentications()
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    this.getCards(this.pageNumber, this.pageSize);
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 7;
    }
  }

  filterz() {
    let data: any = [];
    this.allCardsFiltered.forEach((element: any) => {
      if (element.name.toLowerCase().includes(this.filt.toLowerCase())) {
        data.push(element);
      }
    });
    this.cards = data;
    if (this.cards.length == 0) {
      this.records = true;
    }
    else {
      this.records = false;
    }
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 7;
    }
  }

  Authentications() {
    this.createAuth = true;
    this.deleteAuth = true;
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("mashup-create")) this.createAuth = true;
        if (cipAuthority.includes("mashup-delete")) this.deleteAuth = true;
      }
    );
  }
  getAllMashups() {
    this.busy = this.mashupService
      .getAllMashups(sessionStorage.getItem("organization"))
      .subscribe((res) => {
        this.mashuplist = res;
        if (this.mashuplist.length > 0) this.showList = true;
      });
  }

  selectedButton(i) {
    if (i == this.pageNumber)
      return { "color": "white", "background": "#7b39b1" }
    else
      return { "color": "black" }
  }

  addMashup() {
    this.addmashup = true
  }

  openedit(content: any): void {
    this.modalService.openModal(content, 'standard');
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  saveDetails() {
    this.mashup.organization = sessionStorage.getItem("organization")
    this.mashupService.createMashup(this.mashup).subscribe(resp => {
      this.service.messageService(resp, "Done!  Mashup Created Successfully");
      this.addmashup = false
      this.ngOnInit()
    })
  }


  navigate(mashupName) {
    this.router.navigate([mashupName], { relativeTo: this.route })
  }

  deleteMashup(mashupName) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.mashupService.deleteMashupByName(mashupName).subscribe(resp => {
          this.adapterServices.messageNotificaionService('success', "Done!  Mashup Deleted Successfully");
          this.ngOnInit()
        });
      }
    });
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
      if (this.pageNumber > 7) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 7;
      } else {
        this.startIndex = 0;
        this.endIndex = 7;
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
    }
  }

  getCards(page: any, size: any): void {
    this.mashupService
      .getAllMashups(sessionStorage.getItem("organization")).subscribe((res) => {
        let data = res;
        this.cards = data;
        this.allCards = data;
        this.allCardsFiltered = data;
        this.noOfItems = data.length;
        this.noOfItems = this.noOfItems || data.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      });
    this.pageSize = this.pageSize || 8;
  }
}
