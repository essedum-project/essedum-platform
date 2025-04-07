import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { DatasetServices } from '../../../dataset/dataset-service';
import { WorkareaItemsComponent } from "../wk-workarea-items.component";
import { PageEvent } from '@angular/material/paginator';
import { PaginationAttributes } from "../../../dataset/dataset-view-wrapper/dataset-view-wrapper.component";


@Component({
  templateUrl: "wk-datacorpusview.component.html",
  selector: "wk-datacorpusview",
  styleUrls: ["./wk-datacorpusview.component.scss"],
})

export class DataCorpusViewComponent implements OnInit, OnChanges, WorkareaItemsComponent {

  @Input() data: any = [];
  @Output() event = new EventEmitter<any>();
  dataset: any;
  datasetDetails: any = [];
  totalCount: Number;
  array: any = [];
  buttonColor: any;
  arrayflag = false;
  colorflag = false;
  colorObject = {}
  submitDisabled = false;
  item;
  length: number;
  pageSize: number = 50;
  pageSizeOptions: number[] = [50, 100];
  pagination: PaginationAttributes = new PaginationAttributes();

  searchText: string;



  // MatPaginator Output
  pageEvent: PageEvent;

  page = 0;
  lastPage = 0;
  rows = 10;
  paginatorFirstRow: number = 0;
  searchIncident: any;

  constructor(private datasetService: DatasetServices) { }


  ngOnChanges(changes: SimpleChanges): void {
    throw new Error("Method not implemented.");

  }
  ngOnInit(): void {
    this.buttonColor = 'default'
    if (this.data.wkJson.output) {

      this.array = this.data.wkJson.output.split(",").map(String)
      if (this.array && this.array.length > 0) {
        this.array.forEach(element => {
          this.colorObject[element] = { "background-color": "lightgrey", "color": "black" }
        });
      }
      this.arrayflag = true
      this.submitDisabled = true
    }
    if (this.data.wkJson.input.dataset && this.data.wkJson.input.dataset != "") {
      this.datasetService.getDataset(this.data.wkJson.input.dataset).subscribe(resp => {
        this.dataset = resp
      }, () => { }, () => {
        this.getDatasetDetails()
        this.getDatasetDataCount()

      })
    }
    else {
      this.dataset = this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
      this.datasetService.getDataset(this.data.wkJson.input.dataset).subscribe(resp => {
        this.dataset = resp
      }, () => { }, () => {
        this.getDatasetDetails()
        this.getDatasetDataCount()

      }
      )
    }



  }
  getDatasetDataCount() {
    this.datasetService.getDatasetDataCount(this.dataset).subscribe(resp => {
      this.length = resp
    }, err => { }, () => {
    })



  }
  getDatasetDetails() {
    // let pagination: PaginationAttributes = new PaginationAttributes();
    this.pagination.page = this.page;
    this.pagination.size = this.pageSize;
    this.datasetService.getPaginatedDetails(this.dataset, this.pagination).subscribe(resp => {
      this.datasetDetails = resp
      this.totalCount = resp.length
    }, err => { },
      () => {
      })
  }
  selectWord(item, ind) {
    if (this.array && this.array.length > 0) {
      let flag = false
      this.array.forEach((element, index) => {
        if (element == item.word) {
          this.array.splice(index, 1)
          flag = true
          this.colorObject[item.word] = { "background-color": "white", "color": "black" }
        }
      });
      if (flag == false) {
        this.array.push(item.word)
        this.colorObject[item.word] = { "background-color": "lightgrey", "color": "black" }
      }
    }
    else {
      this.array.push(item.word)
      this.colorObject[item.word] = { "background-color": "lightgrey", "color": "black" }
    }
    if (this.array && this.array.length > 0) {
      this.arrayflag = true
    }
    else this.arrayflag = false

    sessionStorage.setItem("selectedword", this.array)
  }
  emit() {
    this.event.emit(this.array.toString())
  }

  removeItem(item) {
    this.datasetDetails.forEach((element, index) => {
      if (element.word == item) {
        this.colorObject[element.word] = { "background-color": "white", "color": "black" }
      }
    });
    this.array.forEach((element, index) => {
      if (element == item) this.array.splice(index, 1)
    });
    if (this.array.length == 0) {
      this.arrayflag = false
    }
  }
  goTopage(pageEvent: PageEvent) {
    this.page = pageEvent.pageIndex
    this.pageSize = pageEvent.pageSize
    this.getDatasetDetails()
  }



  onSearch($event) {

    let filtered = []
    this.datasetDetails.forEach(item => {
      if (item.word != null && item.word.includes($event)) {
        filtered.push(item)
      }
    });
    let temp = this.datasetDetails
    this.datasetDetails = filtered

  }

  sortByFrequency($event) {
    this.datasetDetails.sort((a, b) => a.frequency > b.frequency ? -1 : 1)
  }

  sortByWord($event) {
    this.datasetDetails.sort((a, b) => a.word > b.word ? 1 : -1)
  }





  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }


  

  //   goToPage(pageEvent: PageEvent) {
  //     this.lazyload.first = pageEvent.pageIndex * pageEvent.pageSize;
  //     this.lazyload.rows = pageEvent.pageSize;
  //     this.loadPage(this.lazyload);
  // }


  // goToPageNo($event) {
  //   let pgNo: number = parseInt($event.target.value);
  //   this.goToPage = pgNo;
  //   if (this.goToPage || this.goToPage == 0) {
  //     this.checkPageNo();
  //     this.page = this.goToPage - 1;
  //     this.paginatorFirstRow = this.page * this.rows;
  //     this.loadObjects(this.searchIncident);
  //   }
  // }
  // checkPageNo() {
  //   if (this.goToPage || this.goToPage == 0) {
  //     if (this.goToPage < 1) {
  //       this.goToPage = 1;
  //       setTimeout(() => document.getElementById("cip-datasetview-go-to-page").children[0].children[0]['value'] = this.goToPage);
  //     }
  //     else if (this.goToPage > ((this.length / this.rows) + 1)) {
  //       this.goToPage = Math.floor((this.length / this.rows) + 1);
  //       setTimeout(() => document.getElementById("cip-datasetview-go-to-page").children[0].children[0]['value'] = this.goToPage);
  //     }
  //   }
  // }
  // loadObjects(exampleIncident: any) {

  // }
  // decideColour(item){
  //   this.array.forEach((element,index) => {
  //     if(element==item.word) {
  //       this.colorflag=true
  //     }
  //   });
  //   if(this.colorflag==true){
  //     return  {"background-color": "grey","color": "white"}; 
  //   }
  //   else {
  //     return  null
  //   }
  // }


}