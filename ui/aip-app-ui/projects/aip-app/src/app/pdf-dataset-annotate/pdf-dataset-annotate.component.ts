import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from 'formiojs';
import { AdapterServices } from '../adapter/adapter-service';
import { DatasetServices } from '../dataset/dataset-service';
import { Services } from '../services/service';

@Component({
  selector: 'app-pdf-dataset-annotate',
  templateUrl: './pdf-dataset-annotate.component.html',
  styleUrls: ['./pdf-dataset-annotate.component.scss']
})
export class PdfDatasetAnnotateComponent implements OnInit ,OnChanges{
  @ViewChild('taskStepper') taskStepper: MatStepper;
  @Input() fileName;
  public tagsList: Array<string> = ['OTHER'];
  config_flag: boolean = false;
  organization = localStorage.getItem('organization')
  AnnotateList: any = [];
  listOfTags: any;
  selectedFile: any;
  OCR_ID: any;
  nocontent: boolean =false;
  constructor(private router: Router,
    private apiservice: AdapterServices,
    private Service: Services) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.fileName.currentValue !== changes.fileName.previousValue && changes.fileName.previousValue !== undefined){
      this.config_flag = false
      this.nocontent=false
      this.fileName=changes.fileName.currentValue.split('/');
      this.fileName=this.fileName[this.fileName.length - 1];
      this.TokenView(this.fileName)
    }
  }

  ngOnInit(): void {
    try{
      let url = this.router.url
      this.OCR_ID= url.substring(url.lastIndexOf('/') + 1);
      this.config_flag = false
      this.fileName = this.fileName.split('/');
      this.fileName=this.fileName[this.fileName.length - 1];
      this.TokenView(this.fileName)
    }
    catch{
      this.Service.message("No Tagged Data Found", "error")
    }
  }

  TokenView(name) {
    var datas = {
      "datasetID": this.OCR_ID,
      "FileName": name,
      "Organization": this.organization
    }
    this.apiservice.TokenView(datas).subscribe((resp) => {
      if (resp.Result == undefined || resp.Result == null) {
        this.Service.message("No Tagged Data Found", "error")
        this.config_flag = true
        this.nocontent =true
      }
      else{
        this.gettaggeddata(resp.Result);
        this.Service.message("Fetched Successfully", "success")
      }
      
    })
  }

  gettaggeddata(file) {
    this.selectedFile = file;
    this.AnnotateList = file.taggedData
    this.listOfTags = file.listOfTags
    this.config_flag = true
  }

  upload_tagged_data(data) {
    this.config_flag = false
    var datas = {
      "Organization": this.organization,
      "datasetID": this.OCR_ID,
      "FileName": this.selectedFile.datasetName,
      "taggeddata": JSON.stringify(data)
    }
    this.apiservice.UploadTaggedData(datas).subscribe((resp) => {
      this.OCR_ID=this.OCR_ID
      this.Service.message("Tagged Data Uploaded Successfully", "success")
      this.config_flag = true
    })
  }

  ChangeGroupTag(event, ischecked) { }
}
