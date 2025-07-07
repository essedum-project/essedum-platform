import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, takeUntil, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Services } from '../../services/service';

@Component({
  selector: 'app-native-script-dialog',
  templateUrl: './native-script-dialog.component.html',
  styleUrls: ['./native-script-dialog.component.scss']
})
export class NativeScriptDialogComponent implements OnInit, OnDestroy {

  paramsAlias: any;
  paramsKey: any;
  paramsValue: any;
  paramsType: any;
  paramsDataType:any;
  buttonName: any;
  oldAlias: any;
  oldKey: any;
  oldValue: any;
  oldType: any;
  index: any;
  public tagsList: Array<string> = ['OTHER'];
  allTags = this.tagsList;

  values: any[] = [];
  protected _onDestroy = new Subject<void>();

  valueTypes = []

  datasourceControl = new FormControl();
  filteredDatasourceOptions: Observable<String[]>;
  datasources: any[];
  currentDatasources: any;

  datasetControl = new FormControl();
  filteredDatasetOptions: Observable<String[]>;
  datasets: any[];
  currentDatasets: any;
  chipCtrl = new FormControl();
  schemaControl = new FormControl();
  filteredSchemaOptions: Observable<String[]>;
  schemas: any[];
  currentSchemas: any;
  source:any
  typeint: boolean= false
  Tags: boolean= false
  typeString:boolean=false
  typeFloat:boolean=false
  separatorKeysCodes = [ENTER, COMMA];
  public addOnBlur: boolean = true;
  filteredChips: Observable<any[]>;
  flags: boolean=false
  constructor(
    public dialogRef: MatDialogRef<NativeScriptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private service: Services,
  ) {
    this.valueTypes = ["Text", "Datasource", "Dataset", "Schema"]
    this.filteredChips = this.chipCtrl.valueChanges.pipe(
      startWith(<string>null),
      map((tag: string | null) => tag ? this.filter(tag) : this.allTags.slice()));
  }
  

  ngOnInit() {

    if (this.data.type == undefined || this.data.type == null) {
      this.data.type = this.valueTypes[0]
    }
    this.buttonName = this.data.button;
    this.paramsKey = this.data.name;
    this.paramsValue = this.data.value;
    this.paramsType = this.data.type;
    this.paramsAlias = this.data.alias;
    this.oldKey = this.data.name;
    this.oldValue = this.data.value;
    this.oldType = this.data.type;
    this.oldAlias = this.data.alias;
    this.index = this.data.index;
    this.source = this.data.source? this.data.source:"native"
    switch (this.paramsType) {
      case this.valueTypes[1]:
        this.currentDatasources = this.paramsValue+';'+this.paramsAlias
        break;
      case this.valueTypes[2]:
        this.currentDatasets = this.paramsValue+';'+this.paramsAlias
        break;
      case this.valueTypes[3]:
        this.currentSchemas = this.paramsValue+';'+this.paramsAlias
        break;
    }
    this.service.getDatasourcesNames().subscribe(resp => {
      this.datasources = resp;
      this.filteredDatasourceOptions = this.datasourceControl.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          if(value!=""){
            this.currentDatasources = value;
            return this._filter(this.datasources, value);
          }
        })
      );
    }, err => {}, ()=>{
      this.datasourceControl.setValue(this.paramsValue+';'+this.paramsAlias)
    });
    this.service.getDatasetNames(sessionStorage.getItem('organization')).subscribe(resp => {
      this.datasets = resp;
      this.filteredDatasetOptions = this.datasetControl.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            this.currentDatasets = value;
            return this._filter(this.datasets, value);
          })
        );
    }, err => {}, ()=>{
      this.datasetControl.setValue(this.paramsValue+';'+this.paramsAlias)
    });
    this.service.getAllSchemas().subscribe(resp => {
      this.schemas = resp;
      this.filteredSchemaOptions = this.schemaControl.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            this.currentSchemas = value;
            return this._filter(this.schemas, value);
          })
        );
    }, err => {}, ()=>{
      this.schemaControl.setValue(this.paramsValue+';'+this.paramsAlias)
    });
  }

  filter(name: string) {
    return this.allTags.filter(tag =>
      tag.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  addOrModify() {
    if (this.paramsKey) {
      if (this.paramsKey == '' || this.paramsKey == null)
        this.service.message("Invalid Key!Argument not saved",'error')
      else {
        let currentObj;
        switch (this.paramsType) {
          case this.valueTypes[1]:
            currentObj = this.currentDatasources
            break;
          case this.valueTypes[2]:
            currentObj = this.currentDatasets
            break;
          case this.valueTypes[3]:
            currentObj = this.currentSchemas
            break;
        }
        if (currentObj) {
          let tmpValue = currentObj.split(";",2)
          this.paramsValue = tmpValue[0];
          this.paramsAlias = tmpValue[1];
        } else {
          this.paramsAlias = this.paramsValue
        }

        if(this.paramsDataType==="Integer"){
         this.paramsValue=parseInt(this.paramsValue);
        }
        else if(this.paramsDataType==="Float"){
          this.paramsValue=parseFloat(this.paramsValue)
        }
        else if(this.paramsDataType==="Boolean"){
        if(this.paramsValue.toLowerCase()==="true"){
          this.paramsValue=true
        }else{
          this.paramsValue=false
        }
        }
        else if(this.paramsDataType==="List"){
          let values:any[]=this.paramsValue.split(',');
          for(var i=0; i<values.length;i++){
            if(this.hasFloat(values[i])){
              values[i]=parseFloat(values[i])

            }else if(this.hasNumber(values[i])){
              values[i]=parseInt(values[i])            

            }else if(values[i].toLowerCase()=="true" || values[i].toLowerCase()=="false"){
             if(values[i].toLowerCase() === "true"){
              values[i]=true
             }else{
              values[i]=false
             }
            }

          }
          this.paramsValue=values;
        }
        this.paramsAlias=this.paramsValue
        console.log(this.paramsValue)
        this.dialogRef.close({
          "name": this.paramsKey, "value": this.paramsValue, "type": this.paramsType, "alias": this.paramsAlias, "oldName": this.oldKey, "oldValue": this.oldValue, "oldType": this.oldType, "oldAlias": this.oldAlias, "index": this.index
        });
      }
    }
  }
   hasNumber(myString) {
    return /\d/.test(myString);
  }
  hasFloat(mystring){
    return /\d+(\.)\d+/.test(mystring);
  }
  add(event): void {
    let input = event.input;
    let value = event.value;

    // Add our tag
    if ((value || '').trim()) {
       var k =this.hasNumber(value)
       if(k){
       value = this.convertsting(value)
       }
      this.tagsList.push(value.trim());
     this.paramsValue=this.tagsList


    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.chipCtrl.setValue(null);
  }
  convertsting(tName){
    return (tName.match(/\d+/));
  }
  remove(tag: any): void {
    let index = this.tagsList.indexOf(tag);

    if (index >= 0) {
      this.tagsList.splice(index, 1);
    }
  }
  chacheFn(flag){
    this.paramsValue=flag
  }
  paramsTypechange(type){
    switch(type){
      case'Integer':
        this.typeint = true
        this.flags= false
        this.Tags= false
        this.typeFloat=false
        this.typeString=false
        break;
        case'List':
        this.Tags = true
        this.typeint=false
        this.flags=false
        this.typeFloat=false
        this.typeString=false
        break;
        case'Boolean':
        this.flags = true
        this.typeint=false
        this.Tags=false
        this.typeFloat=false
        this.typeString=false
        break;
        case 'String':
        this.typeString=true
        this.flags = false
        this.typeint=false
        this.Tags=false
        this.typeFloat=false
        break;
        case 'Float':
        this.typeFloat=true
        this.flags = false
        this.typeint=false
        this.Tags=false
        this.typeString=false
        break;

    }
  }
  displayDatasources(value): string {
    return value ? value.split(";",2)[1] : "";
  }

  displayDatasets(value): string {
    return value ? value.split(";",2)[1] : "";
  }

  displaySchemas(value): string {
    return value ? value.split(";",2)[1] : "";
  }

  private _filter(array: any[], value: string): string[] {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.alias.toLowerCase().includes(filterValue));
  }

}
