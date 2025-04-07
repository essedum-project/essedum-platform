import { Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginationAttributes } from '../../dataset/dataset-view/dataset-view.component';
import { DatasetServices } from '../../dataset/dataset-service';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Services } from '../../services/service';

@Component({
  selector: 'app-wk-question',
  templateUrl: './wk-question.component.html',
  styleUrls: ['./wk-question.component.scss']
})
export class WkQuestionComponent implements OnInit, OnChanges, DoCheck {
    searchTerm= new FormControl();
    protected onDestroy = new Subject<void>();
    filteredCols: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    autoSelection: any = [];
    error: boolean =false;
    constructor(
      private services:Services ,
      public dialog: MatDialog, private datasetService: DatasetServices
    ) {
    }
  
    @Input() wkJson;
    @Input() wkData;
    @Input() workflow;
    @Output() selectedCols = new EventEmitter<any>()
    @Output() skip = new EventEmitter<any>()
    @Output() nextstage = new EventEmitter<any>()
    @Output() showTab = new EventEmitter<any>() 
    colList: any = []
    columns: any
    selectedRadio: any
    next = false;
    out
    newOutput;
    oldWkData
    selectedDataset
    questionList
    
    ngOnInit() {
      this.questionList = []
      for(let jsn in this.wkData.jsondata){
        this.questionList.push(this.wkData.jsondata[jsn])
        if(typeof(this.wkData.jsondata[jsn]['output'])!='string' && JSON.stringify(this.wkData.jsondata[jsn]['output'])=="{}") 
          this.wkData.jsondata[jsn]['output'] = ""
          if(this.wkData.jsondata[jsn].QuestionComponent.includes('selectComponent') && this.colList.length<=0)
            this.getColumnNames(this.wkData.jsondata[this.wkData.jsondata[jsn].input.inp1])
          if(this.wkData.jsondata[jsn].QuestionComponent.includes('selectComponent') && this.autoSelection.length<=0 && this.colList.length>0 && !this.error)
            this.chooseFeatures()
      }
      // if (this.wkData?.jsondata[this.wkJson[this.wkJson.length - 1]?.input.inp1]?.output && this.colList.length<=0)
      // if(this.colList.length<=0)
      //   this.getColumnNames()
      this.wkJson.forEach(json => {
        if (json.QuestionComponent == 'RadioComponent') {
          this.selectedRadio = json.output ? json.output : null
        }
      }) 
      this.searchTerm.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filteredCols.next(
          this.colList.filter(col => col.toLowerCase().indexOf(this.searchTerm.value) > -1)
        );
      });
    }
    
    generateToolTip(i){
      return this.wkData.jsondata['stage'+i].Description
    }
  
    showWorkarea(i){
      this.showTab.emit(i+1)
    }
  
    add(i) {
      return i + 1
    }
  
    ngOnChanges() {
      this.ngOnInit()
    }
  
    getColumnNames(stagedetails) {
      let pagination: PaginationAttributes = new PaginationAttributes();
      pagination.page = 0;
      pagination.size = 1;
      this.datasetService.getDataset(stagedetails?.output.name).subscribe(res => {
        this.datasetService.getPaginatedDetails(res, pagination).subscribe(resp => {
          this.colList = []
          for (let col in resp[0]) {
            this.colList.push(col)
          }
          this.filteredCols.next(this.colList.slice());
        })
      })
    }
  
    fetchSchemaColNames(val) {
      this.colList = []
      this.services.getSchemas(val).subscribe(res => {
        let schemavalue = JSON.parse(res.schemavalue)
        if (schemavalue.length >= 1) {
          schemavalue.forEach(element => {
            if (element.recordcolumnname) {
              this.colList.push(element.recordcolumnname);
            }
          });
        }
      });
    }
  
    fieldChosen(columns?,update?,index?) {
      if(columns){
        this.next = true;
        if(update == 'Update'){
          let event = {}
          event['update']=index+1
          event['json']=columns
          event['gonext']=false
          this.selectedCols.emit(event)
        }
        else
          this.selectedCols.emit(columns)
        this.columns = undefined
        this.out = undefined
      }
      else{
        this.skip.emit()
      }
    }
  
    radioChange() {
      this.selectedCols.emit(this.selectedRadio)
    }
  
    goNext(event?) {
      if (event && event == 'finish') {
        event = ''
        this.services.info("Completed", "Workflow")
      }
      this.selectedCols.emit(event)
    }
  
    ngDoCheck() {
      if (this.wkData.jsondata.stage1 && this.wkData?.jsondata[this.wkJson[this.wkJson.length - 1]?.input.inp1]?.output!=undefined) {
        if (this.oldWkData?.jsondata[this.wkJson[this.wkJson.length - 1].input.inp1]?.output != this.wkData.jsondata[this.wkJson[this.wkJson.length - 1].input.inp1]?.output && this.colList.length<=0) {
          this.oldWkData = this.wkData
          this.getColumnNames(this.wkData.jsondata[this.wkJson[this.wkJson.length - 1].input.inp1]);
        }
          if(this.wkData.jsondata['stage' + this.wkJson.length].QuestionComponent.includes('selectComponent') && this.autoSelection.length<=0 && this.colList.length>0 && !this.error){
            this.chooseFeatures()
         }
      }
    }
  
    decideBgColor(index){
      if(index == this.wkJson.length-1)
        return {"background-color":"#c7fffc"}
      else if(index<this.wkJson.length-1)
        return {"background-color":"#caffce"}
      else
        return {"background-color":"#fffdbe"}
    }
  
    decideBorderColor(index){
      if(index<=this.wkJson.length-1)
        return {"border":"2px solid var(--base-color)"}
      else
        return {"border":"2px solid grey"}
    }
  
  
  
  
    chooseFeatures(){
      let inp1 = this.wkJson[this.wkJson.length-1].input.inp1
      let inp2 = this.wkJson[this.wkJson.length -1].input.inp2
      if(this.wkData.jsondata[inp2]?.output?.alias?.includes(this.wkData.jsondata[inp1]?.output?.alias + "_" +this.wkData.jsondata[inp2]?.input?.outputDatasetName )){
        this.error = true
          let pagination: PaginationAttributes = new PaginationAttributes();
          pagination.page = 0;
          pagination.size = 1;
           let newDataset = this.wkData.jsondata[this.wkJson[this.wkJson.length-2].input.outputDataset].output.name + "_" + this.wkJson[this.wkJson.length-2].input.outputDatasetName
  //console.log("newDataset",newDataset)
           this.datasetService.getDataset(newDataset).subscribe(res=>{
            this.datasetService.getPaginatedDetails(res, pagination).subscribe(resp => {
              this.error = false
              this.autoSelection = []
              for (let col in resp[0]) {
                 this.autoSelection.push(col)
              }
              this.wkData.jsondata['stage' + this.wkJson.length].output = this.autoSelection
            },err=>{this.error = true})
           },err=>{this.error=true})   
      }
    }
}
