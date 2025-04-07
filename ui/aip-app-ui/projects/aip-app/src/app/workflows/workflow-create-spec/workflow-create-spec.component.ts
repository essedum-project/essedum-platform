import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
// import { MessageService } from 'com-lib-util';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkflowService } from '../entities/workflow.service';
import { DatasetServices } from '../../dataset/dataset-service';
import { WorkflowSpec } from '../entities/workflowspec';
import { Services } from '../../services/service';

@Component({
  selector: 'app-workflow-create-spec',
  templateUrl: './workflow-create-spec.component.html',
  styleUrls: ['./workflow-create-spec.component.scss']
})
  export class WorkflowCreateSpecComponent implements OnInit {
    selectedwkareaComp =[];
    selectedquesComp =[];
    isCollapsed = true
  
  
    constructor(private _formBuilder: FormBuilder, 
      private workflowSerice: WorkflowService,
      private datasetService:DatasetServices,
      private router: Router,
      public services: Services) { }
  
    public orderForm: FormGroup;
    finalFormValue;
    questionComponents =["EmptyComponent", "ChooseDatasetComponent", "PublishComponent","InputComponent", "SingleselectComponent", "MultiselectComponent", "TextComponent", "ExecuteComponent","ScheduleComponent","NextComponent","DashboardFilterComponent"]
    questionComponentsledsOptn =[];
    mandatoryoption = ["True", "False"];
    jobTypes= ["Chain","Internal","Pipeline"];
    jobTypesledsOptn =[];    
    mandatoryoptionOptn=[];
    wkareaComponents = ["WkDatasetsviewComponent","SchedulerComponent", "WkDatasettableviewComponent", "WkLogsComponent", "WkSummaryviewComponent", "WkDashboardComponent", "DisplayTimeSeriesComponent","SwaggerComponent","MetricViewerComponent", "DatasetMacrobaseComponent", "WkFormComponent","DataCorpusViewComponent","DatasourceRegistryComponent","TicketsListComponent"]
    wkareaComponentsledsOptn = [];
    datasetAlias = new FormControl();
    inpFormValue = {}
    inpFormArray = []
    questComp;
    wkareaComp;
    inputfields 
    input = []
    allDatasets;
    searchTerm= new FormControl();
    protected onDestroy = new Subject<void>();
    filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredDatasetsledsoptn=[];
    dictDatasetAliasNameMap={};
    dictDatasetNameAliasMap={};
    workflowSpec:WorkflowSpec = new WorkflowSpec()

    ngOnInit(): void {
      for(let json in this.questionComponents){
        let val={viewValue:this.questionComponents[json],value:this.questionComponents[json]};
        this.questionComponentsledsOptn.push(val);
      }
      for(let json in this.mandatoryoption){
        let val={viewValue:this.mandatoryoption[json],value:this.mandatoryoption[json]};
        this.mandatoryoptionOptn.push(val);
      }
      for(let json in this.wkareaComponents){
        let val={viewValue:this.wkareaComponents[json],value:this.wkareaComponents[json]};
        this.wkareaComponentsledsOptn.push(val);
      }
      for(let json in this.jobTypes){
        let value ;
        if(json===("Chain")){
          value= "chain";
        }
        else if(json===("Internal")){
          value= "internal";
        }
        else{
          value= "pipeline";
        }
        let val={viewValue:this.jobTypes[json],value:value};
        this.jobTypesledsOptn.push(val);
      }
      this.orderForm = this._formBuilder.group({
        jsondata: this._formBuilder.array([this.createItem()])
      })
      let specname = this.router.url.split("/")[this.router.url.split("/").length - 1]
      this.workflowSerice.getWorkflowSpecByName(specname).subscribe(resp=>{
        let wkspec = JSON.parse(resp.wkspec);
        for (let key in wkspec.jsondata){
        
          if(wkspec.jsondata[key].input){
            if(wkspec.jsondata[key].input.dataset){
              let dsetName= wkspec.jsondata[key].input.dataset;
              if(wkspec.jsondata[key].input.datasetAlias){
              wkspec.jsondata[key].input.dataset=wkspec.jsondata[key].input.datasetAlias;
              }
              wkspec.jsondata[key].input.datasetAlias = dsetName;
            }
          }
        }
        resp.wkspec = JSON.stringify(wkspec);
        this.workflowSpec = resp;


      },err=>{},
      ()=>{
        if(this.workflowSpec.wkspec){
        // this.inputfields = JSON.parse(this.workflowSpec.wkspec)
        this.orderForm = this._formBuilder.group({
          jsondata: this._formBuilder.array(this.addExistingItem())
        })
        }
      // else{
        this.workflowSerice.getWorkflowSpecByName("specification").subscribe(resp=>{
          this.inputfields = JSON.parse(resp.wkspec)
        })
      // }
      })
      this.getAllDatasets()
      this.searchTerm.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filteredDatasets.next(
          this.allDatasets.filter(col => col.alias.toLowerCase().indexOf(this.searchTerm.value) > -1)
        );
      });
 
     
     
    }
    getAllDatasets(){
      this.datasetService.getDatasets().subscribe(resp=>{
        this.allDatasets = resp
        this.filteredDatasets.next(this.allDatasets.slice());
        resp.forEach( (element) => {
          // let val={value:element.alias,view:element.name};
          if(!this.dictDatasetAliasNameMap[element.alias]){
            this.dictDatasetAliasNameMap[element.alias] = element.name;
          }
          if(!this.dictDatasetNameAliasMap[element.name]){
            this.dictDatasetNameAliasMap[element.name] = element.name;
          }
         
          
          this.filteredDatasetsledsoptn.push(element.alias);
        });
        
      })
    }
  
    removeStage(index) {
      this.jsondata.removeAt(index)
      this.selectedquesComp.splice(index,1)    
      this.selectedwkareaComp.splice(index,1)
    }
  
    addStage(): void {
      this.jsondata.push(this.createItem());
  
    }
  
    addStageAtIndex(i){
      this.jsondata.insert(i+1, this.createItem());
    }
  
    get jsondata(): FormArray {
      return this.orderForm.get('jsondata') as FormArray;
    };
  
  
    createItem(): FormGroup {
      return this._formBuilder.group({
        Question: '',
        QuestionComponent: '',
        mandatory:'',
        Description:'',
        WorkareaComponent: this._formBuilder.group({ Component: '', alias: '' }),
        input: this._formBuilder.group({}),
        output: {},
        Tab: ''
      });
    }
  
    addExistingItem() {
      let spec= JSON.parse(this.workflowSpec.wkspec)
      let formarray = []
      for(let json in spec.jsondata){
        let val = spec['jsondata'][json]
        let inp = val.input
        this.selectedquesComp.push(val.QuestionComponent)
        this.selectedwkareaComp.push(val.WorkareaComponent.Component)
        formarray.push(this._formBuilder.group({
          Question: val.Question,
          QuestionComponent: val.QuestionComponent,
          mandatory:val.mandatory?val.mandatory:'true',
          Description: val.Description,
          WorkareaComponent: this._formBuilder.group({ Component: val.WorkareaComponent.Component, alias: val.WorkareaComponent.alias }),
          input: this._formBuilder.group(inp),
          output: {},
          Tab: val.Tab
        }))
      }
      return formarray
    }
  
  
  
    setInputProp(index, event, comp ){
      this.inpFormValue = {}
      if(comp=='QuestionComponent') this.selectedquesComp[index]=event
      else if(comp=='WorkareaComponent') this.selectedwkareaComp[index]=event
  
      if(comp=='QuestionComponent'  && this.inputfields[this.selectedwkareaComp[index]]){ 
        let val:any
        for(val of this.inputfields[this.selectedwkareaComp[index]]){
                this.inpFormValue[val]=new FormControl("")
              }
      }
      if(comp=='WorkareaComponent' && this.inputfields[this.selectedquesComp[index]]){ 
        let val:any
        for(val of this.inputfields[this.selectedquesComp[index]]){
                this.inpFormValue[val]=new FormControl("")
              }
      }
  
      if(this.inputfields[event]){
        let val:any
        for(val of this.inputfields[event]){
          this.inpFormValue[val] = new FormControl("")
          
        }
        (this.jsondata.at(index) as FormGroup).setControl('input',this._formBuilder.group(this.inpFormValue));
      }
      else (this.jsondata.at(index) as FormGroup).setControl('input',this._formBuilder.group(this.inpFormValue));
  //console.log("jsondata=", this.inpFormValue)
    }
  
    OnSubmit(formValue) {
      console.log(formValue);
      this.finalFormValue = { jsondata: {} }
      for (let i = 0; i < formValue.jsondata.length; i++) {
        if(formValue.jsondata[i]["input"]){
          if(formValue.jsondata[i]["input"]["dataset"]){
            let dsetAlias= formValue.jsondata[i]["input"]["dataset"];
            if(this.dictDatasetAliasNameMap[dsetAlias]){
              formValue.jsondata[i]["input"]["datasetAlias"]=dsetAlias;
              formValue.jsondata[i]["input"]["dataset"]=this.dictDatasetAliasNameMap[dsetAlias];
            }
          }
        }
        this.finalFormValue.jsondata["stage" + (i + 1)] = formValue.jsondata[i]
      }
      this.workflowSpec.wkspec = JSON.stringify(this.finalFormValue)
      this.workflowSerice.update(this.workflowSpec).subscribe(resp=>{
        this.services.message("Updated Successfully")
      })
  //console.log("value=", JSON.stringify(this.finalFormValue))
    }
  

}
