import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
//import html2canvas from 'html2canvas';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
// import { AnalyticsDataService } from 'src/app/advisory/services';

@Component({
  selector: 'app-pivot-table',
  templateUrl: './pivot-table.component.html',
  styleUrls: ['./pivot-table.component.scss']
})
export class PivotTableComponent  {
  @Input() sampleValue:any;
 //@Input('sampleValue') data;
  @Input() noOfRowsSelected: number;
  @Input() columnsSelected;
  @ViewChild('resultTable', { static: true }) resultTable: Table;
  @Input() maximize: boolean;
  tetsing :any
  private pivotTableSubscription: Subscription;
  rowData = [];
  valueData:
    | {
        colTagName: string;
        colValue: string;
        colspan: number;
        rowspan: number;
      }[]
    | any = [];
  headerData:
    | {
        colTagName: string;
        colValue: string;
        colspan: number;
        rowspan: number;
      }[]
    | any = [];

  dynamicHeight = 'calc(100vh - 434px)';
  totalColumnCount: number;
  page = 1;
  pageSize = 10; 
  noOfRows = 10;
  testData = [];
  totalRecords: number; 
  originalDataset = [];
  storyContentObj: {
    data: string;
    attributes: any;
    screenType: string;
    imagePath: string;
  };
  currentPage: number;

  constructor(
    private cd: ChangeDetectorRef,
   // private analyticsDataService: AnalyticsDataService

  ) {this.tetsing=this.sampleValue
    console.log("this is result",this.tetsing)
    console.log("this is sample",this.sampleValue)
  }


  ngOnInit() {
    this.getScreenShotActionSubscription();
  }

  // ngOnChanges(change: SimpleChanges) {
  //   if (change['sampleValue'] && change['sampleValue'].currentValue) {
  //     this.headerData = [];
  //     this.totalRecords = 0;
  //     this.convertHTMLToJSON();
  //   }
  // }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['sampleValue'] && changes['sampleValue'].currentValue) {
      this.headerData = [];
      this.totalRecords = 0;
      this.convertHTMLToJSON();
      console.log('Received Sample Data:', this.sampleValue); 
    }
  }

  ngOnDestroy() {
    if (this.cd) {
      this.cd.detach();
    }
    if (this.pivotTableSubscription) {
      this.pivotTableSubscription.unsubscribe();
    }
  }

  getScreenShotActionSubscription() {
   // this.pivotTableSubscription = this.analyticsDataService.currentgetScreenShots.subscribe(
    //   (flag) => {
    //     if (flag === true) {
    //       this.captureImageForStory();
    //     }
    //   }
   // );
  }

  convertHTMLToJSON(): void {
    const table = document.createElement('table');
    table.innerHTML = this.sampleValue + '';
    this.rowData = [];
    for (let i = 0; i < table.rows.length; i++) {
      const colTag: {
        colTagName: string;
        colValue: string;
        colspan: number;
        rowspan: number;
      }[] = [];
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        colTag.push({
          colTagName: table.rows[i].cells[j].tagName,
          colValue: table.rows[i].cells[j].innerHTML,
          colspan: table.rows[i].cells[j].getAttribute('colspan')
            ? parseInt(table.rows[i].cells[j].getAttribute('colspan'), 10)
            : 1,
          rowspan: table.rows[i].cells[j].getAttribute('rowspan')
            ? parseInt(table.rows[i].cells[j].getAttribute('rowspan'), 10)
            : 1,
        });
      }
      this.rowData.push(colTag);
    }
    this.splitHeaderRows();
  }
  splitHeaderRows() {
    this.valueData = Object.assign([]);
    this.headerData = [];
    let count = 0;
    this.rowData.forEach((singleRow) => {
      singleRow.forEach((obj) => {
        if (obj.colTagName === 'TD') {
          count = count + 1;
        }
      });
      if (count > 0) {
        this.valueData.push(singleRow);
        this.cd.detectChanges();
      } else {
        this.headerData.push(singleRow);
      }
    });
    // this.mergeFirstCells();

    // this.originalDataset = this.valueData.map(a => ({ ...a }));
    this.totalColumnCount = this.headerData[this.headerData.length - 1].length;
    if (this.noOfRowsSelected > 1) {
      this.evaluateRowSpanIndex();
    }
    this.totalRecords = this.valueData.length;
  }

  evaluateRowSpanIndex() {
    const totalPages = Math.ceil(this.valueData.length / this.noOfRows);
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        const rIndexValue = i * this.noOfRows;
        this.getAllMissingRowSpans(rIndexValue, i);
      }
    }
  }

  getAllMissingRowSpans(rIndexValue, ix: number) {
    if (
      this.valueData[rIndexValue] &&
      this.valueData[rIndexValue].length !== this.totalColumnCount
    ) {
      const currentSet = this.valueData[ix * this.noOfRows];
      let countDiff = null;
      countDiff = this.totalColumnCount - currentSet.length;
      if (countDiff > 0) {
        const previousPageData = this.valueData.slice(
          (ix - 1) * this.noOfRows,
          ix * this.noOfRows
        );
        let lastValueColumnIndex = -1;
        const predictionColLen = currentSet.length + 1;

        //a loop to get lastValueColumnIndex grater than -1 and get same length index from prev page
        for (let i = predictionColLen; i <= this.totalColumnCount; i++) {
          lastValueColumnIndex = this.getArrayIndex(previousPageData, i);
          if (lastValueColumnIndex > -1) {
            break;
          }
        }

        //if prev len not matching then go to next index
        let newlastValueColumnIndex = -1;
        for (let i = lastValueColumnIndex + 1; i < this.noOfRows; i++) {
          if (
            previousPageData[lastValueColumnIndex] &&
            previousPageData[lastValueColumnIndex].length <
              previousPageData[i].length
          ) {
            newlastValueColumnIndex = i;
          }
        }
        lastValueColumnIndex =
          newlastValueColumnIndex > lastValueColumnIndex
            ? newlastValueColumnIndex
            : lastValueColumnIndex;

        if (lastValueColumnIndex > -1) {
          const x = this.noOfRows - lastValueColumnIndex;
          const colIndex =
            previousPageData[lastValueColumnIndex].length - predictionColLen;
          let previousElementCell = null;
          //need some attention, cu + 1, got one index, then checked for highest length afterwards, got

          if (newlastValueColumnIndex > -1) {
            const newIn =
              previousPageData[lastValueColumnIndex].length -
              currentSet.length -
              1;
            previousElementCell = previousPageData[lastValueColumnIndex][newIn];
          } else if (
            previousPageData[lastValueColumnIndex].length !== predictionColLen
          ) {
            //this index we get when actual length+1 not found, will go to next length
            previousElementCell =
              previousPageData[lastValueColumnIndex][colIndex];
          } else {
            previousElementCell = previousPageData[lastValueColumnIndex][0];
          }

          if (previousElementCell.rowspan > x) {
            const newRowSpan = previousElementCell.rowspan - x;
            const newColumn = {
              colValue: previousElementCell.colValue,
              rowspan: newRowSpan,
              colspan: 1,
              colTagName: previousElementCell.colTagName,
            };
            this.valueData[ix * this.noOfRows] = [
              newColumn,
              ...this.valueData[ix * this.noOfRows],
            ];
            this.cd.detectChanges();
          }
        }
      }
    }
    if (
      this.valueData[rIndexValue] &&
      this.valueData[rIndexValue].length !== this.totalColumnCount
    ) {
      this.getAllMissingRowSpans(rIndexValue, ix);
    }
  }

  getArrayIndex(previousPageData, predictionColLen): number {
    return previousPageData
      .map((singleRow) => singleRow.length === predictionColLen)
      .lastIndexOf(true);
  }

  displayVirtualScroll() {
    this.dynamicHeight =
      this.maximize === true ? 'calc(100vh - 390px)' : 'calc(100vh - 290px)';
    return false;
  }

  captureImageForStory(): void {
    // let capturedImageData = '';
    // html2canvas(document.querySelector('#pivotTable')).then((canvas) => {
    //   capturedImageData = canvas.toDataURL('image/png', 1.0);
    //   this.storyContentObj = {
    //     data: capturedImageData,
    //     attributes: this.columnsSelected,
    //     screenType: 'pivot',
    //     imagePath: 'None',
    //   };
    //   this.analyticsDataService.updateStoryBoard(this.storyContentObj);
    // });
    // this.cd.detectChanges();
  }

  pageSelected(pageEvent) {
    console.log(pageEvent)
    this.currentPage = pageEvent.first;
    this.columnsSelected['pageNumber'] = this.currentPage;
  }
}
