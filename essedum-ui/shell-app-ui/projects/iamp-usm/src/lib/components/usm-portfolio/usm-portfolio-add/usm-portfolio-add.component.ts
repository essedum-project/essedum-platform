import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Optional,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UsmPortfolio } from "../../../models/usm-portfolio";
import { UsmPortfolioService } from "../../../services/usm-portfolio.service";
import { MessageService } from "../../../services/message.service";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";

@Component({
  selector: "usm-portfolio-add",
  templateUrl: "./usm-portfolio-add.component.html",
  styleUrls: ["./usm-portfolio-add.component.scss"],
})
export class UsmPortfolioAddComponent implements OnInit, OnDestroy {
  usmPortfolio: UsmPortfolio = new UsmPortfolio();
  edit: boolean = false;
  view: boolean = false;
  buttonFlag: boolean = false;
  busy: Subscription;
  showNameLengthErrorMessage: boolean = false;
  showDescLengthErrorMessage: boolean = false;
  lengthNameErrorMessage: string = "Maximum Character Limit Reached";
  portfolioName = "";
  description = "";
  @Output() portfolioModelClosed = new EventEmitter<void>();
  displayColumns: string[] = [
    "#",
    "Project Id",
    "Project Name",
    "Project Display Name",
  ];
  pageSize = 5;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [5, 10, 20];
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  pageNumber: number = 0;
  projectList: any;
  hoverStates: boolean[] = Array(10).fill(false); 
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();

  changeDetectionRef: ChangeDetectorRef;
  isPrevHovered: boolean = false;
  isNextHovered: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usmPortfolioService: UsmPortfolioService,
    private messageService: MessageService,
    public dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<UsmPortfolioAddComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    changeDetectionRef: ChangeDetectorRef
  ) {
    this.changeDetectionRef = changeDetectionRef;
  }  ngOnInit() {
    this.pageNumber = 1;
    this.startIndex = 0;
    this.endIndex = 5;

    if (this.projectList && this.projectList.length > 0) {
      this.noOfPages = Math.ceil(this.projectList.length / this.pageSize);

      this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i);
      console.log(`Portfolio dialog initialized with ${this.projectList.length} projects, ${this.noOfPages} pages`);

      this.pageNumber = 1;

      if (this.noOfPages <= 5) {
        this.startIndex = 0;
        this.endIndex = this.noOfPages;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }

    if (this.data) {
      if (this.data.mode === "edit" || this.data.mode === "view") {
        this.projectList = this.data.projectList || [];
        console.log("Project list received:", this.projectList);
        this.usmPortfolio = this.data.portfolio || new UsmPortfolio();
        this.view = this.data.mode === "view";
        this.edit = true;      
        if (this.projectList && this.projectList.length > 0) {
          this.noOfPages = Math.ceil(this.projectList.length / this.pageSize);
          this.pageArr = Array(this.noOfPages)
            .fill(0)
            .map((x, i) => i);
        }
      } else if (this.data.mode === "create") {
        this.usmPortfolio = new UsmPortfolio();
        this.projectList = this.data.projectList || [];
        this.edit = false;
        this.view = false;
      } else {
        this.usmPortfolio = new UsmPortfolio();
        this.projectList = [];
        this.edit = false;
        this.view = false;
      }
    } else {
      this.route.params.subscribe((params) => {
        if (params["id"]) {
          const portfolioId = +params["id"];
          if (portfolioId) {
            this.loadPortfolio(portfolioId);
            this.view = params["mode"] === "view";
            this.edit = true;
          }
        }
      });
    }
  }

  loadPortfolio(id: number) {
    this.usmPortfolioService.getUsmPortfolio(id).subscribe(
      (portfolio) => {
        this.usmPortfolio = portfolio;
      },
      (error) => {
        this.messageService.error("Could not load portfolio details", "IAMP");
      }
    );
  }

  onSave() {
    if (this.usmPortfolio && this.usmPortfolio.portfolioName) {
      this.usmPortfolio.portfolioName = this.usmPortfolio.portfolioName.trim();
    }

    if (
      !this.usmPortfolio.portfolioName ||
      this.usmPortfolio.portfolioName.trim().length === 0
    ) {
      this.messageService.info("Portfolio name can't be empty", "IAMP");
      return;
    }

    if (this.usmPortfolio.portfolioName.length > 100) {
      this.messageService.info(
        "Portfolio name cannot be more than 100 characters",
        "IAMP"
      );
      return;
    }

    if (
      !/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(
        this.usmPortfolio.portfolioName
      )
    ) {
      this.messageService.error("Portfolio name format is incorrect", "IAMP");
      return;
    }

    if (this.edit) {
      this.updatePortfolio();
    } else {
      this.createPortfolio();
    }
  }
  createPortfolio() {
    this.busy = this.usmPortfolioService.create(this.usmPortfolio).subscribe(
      (response) => {
        this.messageService.info("Portfolio Saved Successfully", "IAMP");
        if (this.dialogRef) {
          this.dialogRef.close(true); 
        } else {
          this.listView();
        }
      },
      (error) => {
        this.messageService.error("Could not create Portfolio", "IAMP");
      }
    );
  }

  updatePortfolio() {
    this.busy = this.usmPortfolioService.update(this.usmPortfolio).subscribe(
      (response) => {
        this.messageService.info("Portfolio updated successfully", "IAMP");
        if (this.dialogRef) {
          this.dialogRef.close(true); 
        } else {
          this.listView();
        }
      },
      (error) => {
        this.messageService.error("Could not update Portfolio", "IAMP");
      }
    );
  }
  clearWave() {
    if (this.edit || this.view) {
      this.usmPortfolio.portfolioName = null;
      this.usmPortfolio.description = null;
    } else {
      this.usmPortfolio = new UsmPortfolio();
    }
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
  }
  listView() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(["../"], { relativeTo: this.route });
    }
  }

  checkNameMaxLength() {
    if (
      this.usmPortfolio.portfolioName &&
      this.usmPortfolio.portfolioName.length >= 255
    ) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescriptionMaxLength() {
    if (
      this.usmPortfolio.description &&
      this.usmPortfolio.description.length >= 255
    ) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }

  deleteSpecialChars(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    return this.isValidLetter(charCode);
  }

  isValidLetter(charCode: number): boolean {
    return (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 48 && charCode <= 57) || // 0-9
      [8, 13, 16, 17, 20, 95].indexOf(charCode) > -1
    );
  }

  ngOnDestroy() {
    if (this.busy) {
      this.busy.unsubscribe();
    }
  }

  closePortfolioDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof UsmPortfolioAddComponent) {
        dialog.close();
        this.dialogRef.afterClosed().subscribe(() => {
          this.portfolioModelClosed.emit();
        });
      }
    }
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
  }  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
    }
    
    console.log(`Changing to page ${this.pageNumber} of ${this.noOfPages}, showing items ${(this.pageNumber-1)*this.pageSize+1}-${Math.min(this.pageNumber*this.pageSize, this.projectList?.length || 0)} of ${this.projectList?.length || 0}`);

    if (this.noOfPages <= 5) {
      this.startIndex = 0;
      this.endIndex = this.noOfPages;
    } else if (this.pageNumber <= 3) {
      this.startIndex = 0; 
      this.endIndex = 5;
    } else if (this.pageNumber >= this.noOfPages - 2) {
      this.startIndex = Math.max(0, this.noOfPages - 5); 
      this.endIndex = this.noOfPages;
    } else {
      this.startIndex = Math.max(0, this.pageNumber - 3);
      this.endIndex = this.pageNumber + 2;
    }

    this.changeDetectionRef.detectChanges();
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
  getRowNumber(index: number): number {
    return (this.pageNumber - 1) * this.pageSize + index + 1;
  }

  
  onPrevPage() {
    this.prevPage(); 
  }

  onNextPage() {
    this.nextPage(); 
  }

  onChangePage(page: number) {
    this.changePage(page); 
  }
  getButtonStyle(page: number, idx: number) {
    return {
      "font-weight": page === this.pageNumber ? "bold" : "normal"
    };
  }

  trackByMethod(index: number, item: any): number {
    return item.id;
  }
}
