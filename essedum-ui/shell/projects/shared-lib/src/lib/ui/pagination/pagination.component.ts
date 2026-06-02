import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges ,OnInit {

  pageNumber: number;
  pageSize: number;
  pageArr: number[] = [];
  pageNumberInput: number;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [];
  @Input() currentPage: number;
  @Input() changeColor: boolean;
  @Input() noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  @Output() pageAndSizeChanged = new EventEmitter<{ pageNumber: number; pageSize: number }>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  constructor(
    private changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
      }
    });
  //  if (changes['noOfItems'].currentValue) {
      console.log('ngONchange',changes);
      this.noOfItems = changes['noOfItems'].currentValue;
      if(changes['noOfItems'].previousValue==undefined){this.updatePageSize();}
    if (changes['noOfItems'].previousValue === undefined ||
      changes['noOfItems'].previousValue !== changes['noOfItems'].currentValue) {
      if (changes['noOfItems'].currentValue === 0) {
        this.pageNumber = 0;
      } else {
        this.route.queryParams.subscribe((params) => {
          // Update this.pageNumber if the page query param is present
          if (params['page']) {
            this.pageNumber = params['page'];
          } else {
            this.pageNumber = 1;
          }
        });
      }
    }
      this.countPage(this.pageSize, this.noOfItems);
    this.indexChanged();

  //  }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }
  updatePageSize() {
    this.pageSize=0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      this.countPage(this.pageSize, this.noOfItems)
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      this.countPage(this.pageSize, this.noOfItems)
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      this.countPage(this.pageSize, this.noOfItems)
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      this.countPage(this.pageSize, this.noOfItems)
    } else if (window.innerWidth < 768 ) {
      this.itemsPerPage = [4,8,12,16,20,24];
      this.pageSize = this.pageSize || 4; //xs
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      this.countPage(this.pageSize, this.noOfItems)
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = params['page'];
      } else {
        this.pageNumber = 1;
      }
    });
    // this.pageNumber = 1;
    // this.pageSize = this.pageSize || 6;
    this.updatePageSize();
    // this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
    this.indexChanged();
  }

  indexChanged() {
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = Number(this.pageNumber) + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage(this.pageNumber);
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage(this.pageNumber);
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      //this.pageChanged.emit(this.pageNumber);
      this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
      if (this.pageNumber >= 5) {
        this.endIndex = this.pageNumber + 2;
        this.startIndex = this.endIndex - 3;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
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
  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    //  this.pageSizeChanged.emit(this.pageSize);
    this.pageNumber = 1;
    //  this.pageChanged.emit(this.pageNumber);
    this.pageAndSizeChanged.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize });
    this.countPage(this.pageSize, this.noOfItems)
  }
  selectedButton(i) {
    if (i == this.pageNumber)
      return { color: 'white', background: '#0094ff' };
    else
      return { color: 'black' };

  }
  countPage(pageSize, noOfItems) {
      this.noOfPages = Math.ceil(noOfItems / pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
  }

}
