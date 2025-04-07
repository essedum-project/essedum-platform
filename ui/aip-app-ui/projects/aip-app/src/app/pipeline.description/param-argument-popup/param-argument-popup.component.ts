import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit,Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DataSetTable } from '../../sharedModule/pipeline-model/canvas';

interface Elementt {
  name: string;
  value: string;
  type: string;
  alias: string;
  children?: Elementt[];
  index: string;
}


@Component({
  selector: 'app-param-argument-popup',
  templateUrl: './param-argument-popup.component.html',
  styleUrls: ['./param-argument-popup.component.scss']
})




export class ParamArgumentPopupComponent implements OnInit,OnDestroy{
  native=false;
  dragndrop=false;
  dragndroplite=false;
  binary=false;
  treeControl = new NestedTreeControl<Elementt>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Elementt>();
  datasetarray:any=[];
  binaryargs:any;
  
  

  constructor(public dialogRef: MatDialogRef<ParamArgumentPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data1: any) { 

    }
  



  ngOnInit(): void {
    if(this.data1.type=="native"){
    this.native=true
    this.treeControl=this.data1.treecontrol;
    this.dataSource=this.data1.datasource;
    }
    else if(this.data1.type=="dragndrop"){
      this.dragndrop=true;
      this.datasetarray;
//console.log(this.data1.stream);
      

      this.data1.stream.forEach(ele => {


        if (ele.attributes.dataset) {
          const result = Object.entries(ele.attributes.dataset.attributes).map(([id, name]) => ({ id, name }));
          
        
        
           this.datasetarray.push(new DataSetTable(ele.alias,(result)))
             
          
        }
        else{
          
         
          const result = Object.entries(ele.attributes).map(([id, name]) => ({ id, name }));
         
          this.datasetarray.push(new DataSetTable(ele.alias,(result)))

        }
      })
//console.log(this.datasetarray);
    }
    else if(this.data1.type=="binary")
    {
      this.binary=true;
      this.binaryargs=this.data1.stream;
//console.log(this.binaryargs);

    }

    
  }
  ngOnDestroy():void{

  }

  getAlias(node) {
    return node.alias ? node.alias : node.value
  }
  close(){
    this.native=false;
    this.dragndrop=false;
  this.dragndroplite=false;
  this.binary=false;
    this.dialogRef.close();

  }
  continue(){
    this.native=false;
    this.dragndrop=false;
  this.dragndroplite=false;
  this.binary=false;
    this.dialogRef.close({"button":"CONTINUE"});

  }
  checkrow(att:any){
    const isEmpty = (val: any) => val == null || !(Object.keys(val) || val).length;
    
    return (isEmpty(att)) ? false:true;
  }
}

