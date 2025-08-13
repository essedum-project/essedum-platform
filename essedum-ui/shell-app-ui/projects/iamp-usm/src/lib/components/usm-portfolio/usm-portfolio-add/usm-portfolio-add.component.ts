// filepath: c:\Users\mamindla.yadav\Documents\Temp_Repo_Shell_Aip\TEMP_AI\ai-platform\essedum-ui\shell-app-ui\projects\iamp-usm\src\lib\components\usm-portfolio\usm-portfolio-add\usm-portfolio-add.component.ts
import { Component, OnInit, OnDestroy, Inject, Optional, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsmPortfolio } from '../../../models/usm-portfolio';
import { UsmPortfolioService } from '../../../services/usm-portfolio.service';
import { MessageService } from '../../../services/message.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'usm-portfolio-add',
  templateUrl: './usm-portfolio-add.component.html',
  styleUrls: ['./usm-portfolio-add.component.scss']
})
export class UsmPortfolioAddComponent implements OnInit, OnDestroy {
  // Properties
  usmPortfolio: UsmPortfolio = new UsmPortfolio();
  edit: boolean = false;
  view: boolean = false;
  buttonFlag: boolean = false;
  busy: Subscription;
  showNameLengthErrorMessage: boolean = false;
  showDescLengthErrorMessage: boolean = false;
  lengthNameErrorMessage: string = "Maximum Character Limit Reached";
  portfolioName="";
  description="";
  @Output() portfolioModelClosed = new EventEmitter<void>();
displayColumns: string[] = ["#","Project Id","Project Name", "Project Display Name"];
// Pagination properties
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
  projectList:any;
  hoverStates: boolean[] = Array(10).fill(false); // For pagination hover effects
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();  

   changeDetectionRef: ChangeDetectorRef;

  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usmPortfolioService: UsmPortfolioService,
    private messageService: MessageService,
     public dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<UsmPortfolioAddComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  changeDetectionRef: ChangeDetectorRef) {
    this.changeDetectionRef = changeDetectionRef;
  }  
  
  ngOnInit() {
    // Initialize pagination with safe defaults
    this.pageNumber = 1;
    this.startIndex = 0;
    this.endIndex = 5;
    
    console.log("UsmPortfolioAddComponent initialized");
    console.log("Dialog data:", this.data);
    
    // Check if we're using dialog mode
    if (this.data) {
      if (this.data.mode === 'edit' || this.data.mode === 'view') {
        console.log(`Opening in ${this.data.mode} mode`);
        this.projectList = this.data.projectList || [];
        console.log('Project list received:', this.projectList);
        // Log first few projects to help debugging
        if (this.projectList && this.projectList.length > 0) {
          console.log('First project:', this.projectList[0]);
        }
        
        this.usmPortfolio = this.data.portfolio || new UsmPortfolio();
        console.log('Portfolio data:', this.usmPortfolio);
        
        this.view = this.data.mode === 'view';
        this.edit = true;
        
        // Calculate pagination values with safeguards
        if (this.projectList && this.projectList.length > 0) {
          // Calculate how many pages we need
          this.noOfPages = Math.ceil(this.projectList.length / this.pageSize);
          
          // Generate page numbers array for pagination (1-based)
          this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i + 1);
          console.log(`Pagination: ${this.noOfPages} pages for ${this.projectList.length} projects`);
          
          // Set default pagination values
          this.pageNumber = 1;
          
          // Adjust start and end indexes for pagination display
          if (this.noOfPages <= 5) {
            this.startIndex = 0;
            this.endIndex = this.noOfPages;
          } else {
            this.startIndex = 0;
            this.endIndex = 5;
          }
          
          // Force change detection to update the view after a small delay to ensure DOM is ready
          setTimeout(() => {
            this.changeDetectionRef.detectChanges();
          }, 0);
        }
      } else if (this.data.mode === 'create') {
        // Create mode
        console.log('Opening in create mode');
        this.usmPortfolio = new UsmPortfolio();
        this.projectList = this.data.projectList || [];
        console.log('Project list for create:', this.projectList);
        this.edit = false;
        this.view = false;
      } else {
        // Basic create mode without projects
        console.log('Opening in basic create mode');
        this.usmPortfolio = new UsmPortfolio();
        this.projectList = [];
        this.edit = false;
        this.view = false;
      }
    } else {
      // Fallback to route parameters mode
      this.route.params.subscribe(params => {
        if (params['id']) {
          const portfolioId = +params['id'];
          if (portfolioId) {
            this.loadPortfolio(portfolioId);
            // Check if view mode or edit mode
            this.view = params['mode'] === 'view';
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
    // Trim portfolio name
    if (this.usmPortfolio && this.usmPortfolio.portfolioName) {
      this.usmPortfolio.portfolioName = this.usmPortfolio.portfolioName.trim();
    }

    // Validate portfolio name
    if (
      !this.usmPortfolio.portfolioName ||
      this.usmPortfolio.portfolioName.trim().length === 0
    ) {
      this.messageService.info("Portfolio name can't be empty", "IAMP");
      return;
    }

    // Check if portfolio name exceeds maximum length
    if (this.usmPortfolio.portfolioName.length > 100) {
      this.messageService.info("Portfolio name cannot be more than 100 characters", "IAMP");
      return;
    }

    // Validate portfolio name format
    if (!/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(this.usmPortfolio.portfolioName)) {
      this.messageService.error("Portfolio name format is incorrect", "IAMP");
      return;
    }

    // If in edit mode, update the portfolio
    if (this.edit) {
      this.updatePortfolio();
    } else {
      // Otherwise create a new portfolio
      this.createPortfolio();
    }
  }
  createPortfolio() {
    this.busy = this.usmPortfolioService.create(this.usmPortfolio).subscribe(
      (response) => {
        this.messageService.info("Portfolio Saved Successfully", "IAMP");
        if (this.dialogRef) {
          this.dialogRef.close(true); // Return true to indicate success
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
          this.dialogRef.close(true); // Return true to indicate success
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
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  checkNameMaxLength() {
    if (this.usmPortfolio.portfolioName && this.usmPortfolio.portfolioName.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescriptionMaxLength() {
    if (this.usmPortfolio.description && this.usmPortfolio.description.length >= 255) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }

  deleteSpecialChars(event: KeyboardEvent) {
    const i = event.charCode;
    return this.isValidLetter(i);
  }

  isValidLetter(i: number) {
    return ((i >= 65 && i <= 90) || (i >= 97 && i <= 122) || (i >= 48 && i <= 57) || [8, 13, 16, 17, 20, 95].indexOf(i) > -1);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.busy) {
      this.busy.unsubscribe();
    }
  }

  closePortfolioDialog():void{
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
  }
  
  changePage(page?: number) {
    // If a specific page was requested, set it as the current page
    if (page && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
    }
    
    // Validate current page is within valid bounds
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      // Update pagination UI variables for displaying page numbers
      if (this.noOfPages <= 5) {
        // If 5 or fewer pages, show all
        this.startIndex = 0;
        this.endIndex = this.noOfPages;
      } else if (this.pageNumber > 5) {
        // If more than 5 pages and we're beyond page 5
        this.endIndex = Math.min(this.pageNumber, this.noOfPages);
        this.startIndex = Math.max(0, this.endIndex - 5);
      } else {
        // First 5 pages
        this.startIndex = 0;
        this.endIndex = 5;
      }
      
      // Force change detection to update the view
      this.changeDetectionRef.detectChanges();
    }
  }
  
  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      // Recalculate pagination values when page size changes
      if (this.projectList && this.projectList.length > 0) {
        this.noOfPages = Math.ceil(this.projectList.length / this.pageSize);
        this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i + 1);
        
        // Reset to page 1 when changing page size
        this.pageNumber = 1;
        this.changePage(1);
      }
      
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }
  
  getRowNumber(index: number): number {
    // Calculate the correct row number based on page number and page size
    return (this.pageNumber - 1) * this.pageSize + index + 1;
  }
}
