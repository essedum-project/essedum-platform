import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LeapTelemetryService } from 'com-lib-util';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { TagsService } from '../../services/tags.service';
import { DatasetServices } from '../dataset-service';

@Component({
  selector: 'app-dataset-template',
  templateUrl: './dataset-template.component.html',
  styleUrls: ['./dataset-template.component.scss']
})
  export class DatasetTemplateComponent implements OnInit, OnChanges{
    edit:boolean =false
    cardTitle: String = "Template Datasets";
    test: any;
    cards: any;
    options = [];
    alias = [];
    datasetTypes = [];
    copyDataset: boolean = false;
    OptionType: any;
    selectedInstance: any;
    keys: any = [];
    users:any=[];
    filt:any;
    selectedCard: any=[];
    cardToggled: boolean = true;
    pageSize:number;
    pageNumber: number;
    pageArr: number[] = [];
    pageNumberInput: number=1;
    noOfPages: number=0;
    prevRowsPerPageValue: number;
    itemsPerPage: number[] = [6,12,18,24,30]
    noOfItems:number;
    @Output() pageChanged = new EventEmitter<any>();
    @Output() pageSizeChanged = new EventEmitter<any>();
    endIndex: number;
    startIndex: number;
    pageNumberChanged:boolean=true;
    createAuth: boolean;
    editAuth: boolean;
    deleteAuth: boolean;
    deployAuth: boolean;
    category=[];
    tags;
    tagsBackup;
    allTags: any;
    tagStatus={};
    catStatus={};
    selectedTag=[];  
    type: any;
    resp: any;
    filteredCards: any;
    allCards: any;
    finalDataList: any=[];
    selectedAdapterInstance: string[] = [];
    selectedAdapterType: string[] = [];
    filter: string = '';
    tagrefresh: boolean=false;
    records: boolean = false;
    isExpanded = false;
    tooltip: string = 'above';
  
    constructor(
      private telemetryService: LeapTelemetryService,
      private route: ActivatedRoute,
      private modalService: LedsModalService,
      private router: Router,
      private service: Services,
      private datasetService: DatasetServices,
      private changeDetectionRef: ChangeDetectorRef,
      public tagService:TagsService,
      private ledsLibService: LedsLibService,
      private dialog: MatDialog
    ) {}
    ngOnChanges(changes: SimpleChanges): void {
      this.getCards(this.pageNumber,this.pageSize);
      this.tagchange();
    }
    ngOnInit(): void {
      this.records= false;
      this.route.params.subscribe( params => this.type = params.type );  
      let params :HttpParams = new HttpParams();
      let session =sessionStorage.getItem('organization')
      params = params.set('project', session);
      params = params.set('isTemplate', true);
      this.datasetService.getCountDatasets(params).subscribe((res) => { 
        this.noOfItems = res;
      });
      this.service.getDatasetCards("","1000","",true).subscribe((res) => {
        this.allCards = res;
      })
      this.telemetryImpression(); 
      this.pageSize=this.itemsPerPage[0];
      this.pageNumber = 1;
      this.getCards(this.pageNumber,this.pageSize);       
      if (this.pageNumberChanged) {
        this.pageNumber = 1;
        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.authentications(); 
      this.getTags();
    }
  
    telemetryImpression() {
      this.telemetryService.start();
      this.telemetryService.impression("aip-app", "list", "DatasetComponent");
    }
  
    open(){
      if(this.type) 
      this.router.navigate(["../create"],{relativeTo:this.route});
      else
      this.router.navigate(["./create"],{relativeTo:this.route});
    }
  
    openedit(name: any){
      this.edit = true;
      this.router.navigate(["./edit/" +name, +this.edit],{relativeTo:this.route});
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
      if(this.filt)
        this.filterz();
      else if(this.finalDataList.length >= 1){
        this.filterCards()
      }
      else
        this.getCards(this.pageNumber,this.pageSize);
    }
    rowsPerPageChanged() {
      if(this.pageSize == 0)
      {
       this.pageSize = this.prevRowsPerPageValue;
      }
      else
      {
        this.pageSizeChanged.emit(this.pageSize);
        this.prevRowsPerPageValue = this.pageSize;
        this.changeDetectionRef.detectChanges();
      }}
  
    authentications() {
      this.service.getPermission("cip").subscribe(
        (cipAuthority) => {
          if (cipAuthority.includes("dataset-create")) this.createAuth = true;
          if (cipAuthority.includes("dataset-edit")) this.editAuth = true;
          if (cipAuthority.includes("dataset-delete")) this.deleteAuth = true;
        }
      );
    }
  
    changedToogle(event:any){
      this.cardToggled = event;
    }
  
    tagchange(){
      this.tagService.tags.forEach((element:any) => {
      });
    }
  
    numSequence(n: number): Array<number> {
      return Array(n);
    }
    getCards(page:any,size:any): void {
      if(this.type){
        this.getDatasetByConnection();
      }
        else{
        this.service.getDatasetCards(this.pageNumber,this.pageSize,"",true).subscribe((res) => {
          let data:any=[];
          let test = res;
          test.forEach((element: any) => {
            data.push(element);
            this.users.push(element.alias)
          });
          this.cards = data;
          let sort : any = []
          this.cards.forEach((e)=>{
            e.lastmodifieddate = new Date(e.lastmodifieddate)
                    sort.push(e) 
        })
        // this.filteredCards = sort.sort((a,b)=>b.lastmodifieddate-a.lastmodifieddate)
          this.filteredCards=this.cards;
          this.noOfItems = this.noOfItems || data.length;
          this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
          this.pageArr = [...Array(this.noOfPages).keys()];
        });
      }
      this.pageSize = this.pageSize || 6;
    }
    desc(card:any) {
      if(this.type)
      this.router.navigate(["../view/" + card.name], { state: { card }, relativeTo: this.route });
      else
      this.router.navigate(["./view/" + card.name], { state: { card }, relativeTo: this.route });
    }
    
    redirect() {
      this.selectedInstance=this.selectedCard.name
      this.router.navigate([
        './view',
        this.cardTitle,
        this.selectedInstance
      ],
      {
        relativeTo: this.route,
      });
    }
    
  
    filterz(){
      this.service.getDatasetCards(this.pageNumber,this.pageSize,this.filt,true).subscribe((res) => {
        this.filteredCards =res
      });
      if(this.filteredCards.length==0){
        this.records=true;
      }
      else{
        this.records=false;
      }
      let params :HttpParams = new HttpParams();
      let session =sessionStorage.getItem('organization')
      params = params.set('project', session);
      params = params.set('query', this.filt);
      params = params.set('isTemplate', true);
      this.datasetService.getCountDatasets(params).subscribe((resp)=>{
        this.noOfItems = resp
      })
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    }
    getTags() {
     
      this.tags = {};
      this.tagsBackup = {};
      // this.category.push("platform")
        this.service.getMlTags().subscribe((resp) => {
          this.allTags = resp;
          resp.forEach((tag) => {
            if(this.category.indexOf(tag.category) == -1){
           this.category.push(tag.category);}
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
  
      if(!this.selectedTag.includes(tag)){
        this.selectedTag.push(tag);
      }
      else{
        this.selectedTag.splice(this.selectedTag.indexOf(tag),1)
      }
     
    }
    tagSelectedEvent(event) {
      this.selectedAdapterInstance = event.getSelectedAdapterInstance();
      this.selectedAdapterType = event.getSelectedAdapterType();
      this.selectedTag = event.getSelectedTagList();
      this.tagrefresh=false;
      this.filterCards();
    }
    filterCards(){
      if(this.selectedTag.length > 0){
      let multiFilter;
      this.finalDataList=[]
      for (let i = 0; i < this.selectedTag.length; i++) {
        multiFilter = this.allCards.filter(
          (data) =>
            data.tags?.includes(
              this.selectedTag[i]
            ) 
        );
        // multiFilter = [...new Set(multiFilter.map(item=>item.name))]
        this.finalDataList.push(...multiFilter); 
      }
      this.filteredCards = this.finalDataList
      this.filteredCards =this.filteredCards.slice(((this.pageNumber-1) * this.pageSize),((this.pageNumber-1) * this.pageSize + this.pageSize))
      this.noOfItems=this.finalDataList.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      }
      else if(this.selectedAdapterType.length > 0){
        let multiFilter;
        this.finalDataList=[]
        for (let i = 0; i < this.selectedAdapterType.length; i++) {
          multiFilter = this.allCards.filter(
            (data) =>
              data.datasource?.type.includes(
                this.selectedAdapterType[i]
              ) 
          );
          // multiFilter = [...new Set(multiFilter.map(item=>item.name))]
          this.finalDataList.push(...multiFilter); 
        }
        this.filteredCards = this.finalDataList
        this.filteredCards =this.filteredCards.slice(((this.pageNumber-1) * this.pageSize),((this.pageNumber-1) * this.pageSize + this.pageSize))
        this.noOfItems=this.finalDataList.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        }
      else
      this.ngOnInit();
    }
  
     deleteAdapter(name: string) {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === "delete") {
          this.datasetService.deleteDatasets(name).subscribe((res) => {
             this.service.messageNotificaionService('success', "Dataset Deleted Successfully");
              this.ngOnInit(); 
            },((error)=>{
              this.service.messageNotificaionService('error', "Error");
            }));
        }
      });
    }
    navigateTo(card:any){
      let selectedCard = card;
      if(this.type)
      this.router.navigate(['../data'], {
        state: {
          selectedCard,
        },
         relativeTo: this.route });
         else
      this.router.navigate(['./data'], {
        state: {
          selectedCard,
        },
         relativeTo: this.route });
    }
    selectedButton(i){
      if(i==this.pageNumber)
        return {"color": "white","background": "#7b39b1"}
      else
        return {"color":"black"}
    }
    routeBackToConnections(){
      this.router.navigate(["../../connections"],{relativeTo:this.route});
    }
    clickactive(eventObj: any) {
      this.ledsLibService.clickactive(eventObj);
    }
  
    getDatasetByConnection(){
      let params :HttpParams = new HttpParams();
      let session =sessionStorage.getItem('organization')
      params = params.set('project', session);
      params = params.set('datasource', this.type);
      params = params.set('isTemplate', true);
      this.datasetService.getCountDatasets(params).subscribe((res) => { 
        this.noOfItems = res;
      });
      this.datasetService.getDatasetsByDatasource(this.type,"",this.pageNumber,this.pageSize).subscribe((res) => {
        let resp = res;
        this.filteredCards = resp;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      });
      }
  
      navigate(content:any){
        this.copyDataset = true;
        this.modalService.openModal(content, 'standard');
      }
  
      refreshcards(event){
        this.ngOnInit();
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
