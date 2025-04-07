import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Services } from '../../services/service';
// import { JobsService } from '../../entities/jobs/jobs.service';
// import { StreamingServicesService } from '../../entities/streaming-services/streaming-services.service';
// import { MessageService } from '../../sharedModule/service/message.service';
// import { DatasetsService } from '../../entities/datasets/datasets.service';

@Component({
  selector: 'app-metric-viewer',
  templateUrl: './metric-viewer.component.html',
  styleUrls: ['./metric-viewer.component.scss']
})

export class MetricViewerComponent implements OnInit {

  metrickeys = [];
  paramkeys = [];
  imagekeys: any;
  imageList = []
  imageToShow:any;
  @Input() data: any;
  @Input() wkJson;
  @Input() wkData;
  corelid
  jobsList: any;
  totalJobs: any;

  constructor(@Inject(MAT_DIALOG_DATA) public mtData: any,
    public dialogRef: MatDialogRef<MetricViewerComponent>,
    // public messageService: MessageService,
    // public jobsService:JobsService,
    private sanitizer: DomSanitizer,
    private service: Services,
    // private datasetService:DatasetsService,
    // private streamingService:StreamingServicesService
    ) {
      try{
        if (this.mtData) {
          if (this.mtData.metric && this.mtData.metric.toString().trim() != "") {
            this.mtData.metric = JSON.parse(this.mtData.metric)
          }
          if (this.mtData.param && this.mtData.param.toString().trim() != "") {
            this.mtData.param = JSON.parse(this.mtData.param)
          }
          if (this.mtData.image && this.mtData.image.toString().trim() != "") {
            this.mtData.image = JSON.parse(this.mtData.image)
          }
        }
      }
      catch(Exception){
      this.service.message("Some error occured", "error")
      }
      
  }

  ngOnInit() {
//console.log("metric init", this.data)
//console.log("mtdata",this.mtData)
    if (this.mtData && this.mtData.metric) {
      this.metrickeys = Object.keys(this.mtData.metric)
    }
    if (this.mtData && this.mtData.param) {
      this.paramkeys = Object.keys(this.mtData.param)
    }
    if (this.mtData && this.mtData.image) {
      this.imagekeys = Object.keys(this.mtData.image)
      this.fetchImages()
    }
//     if(this.data?.wkJson.WorkareaComponent.Component == 'MetricViewerComponent'){
//       this.corelid = this.service.getCorelId()
//       this.datasetService.findByCoreid(this.corelid).subscribe(resp => {
//         this.jobsList=resp[0]
//         let jobObj = {}
//         jobObj["metric"] = JSON.parse(this.jobsList.jobmetric)
//         jobObj["param"] = JSON.parse(this.jobsList.jobparam)
//         jobObj["image"] = JSON.parse(this.jobsList.image)
//         this.mtData = jobObj
// //console.log("matdata=", this.mtData)
//         if (this.mtData && this.mtData.metric) {
//           this.metrickeys = Object.keys(this.mtData.metric)
//         }
//         if (this.mtData && this.mtData.param) {
//           this.paramkeys = Object.keys(this.mtData.param)
//         }
//         if (this.mtData && this.mtData.image) {
//           this.imagekeys = Object.keys(this.mtData.image)
//           this.fetchImages()
//         }
//       })
//     }
  }

  onClose() {
    this.dialogRef.close();
  }

  fetchImages(){
    this.imagekeys.forEach(key => {
      this.service.getImageByPath(this.mtData.image[key]).subscribe(resp=>{
//console.log(resp)
        //let buffer = this.arrayBufferToBase64(resp)
        //const blob = new Blob([resp], { type: "image/jpeg" });
        // let url
        this.createImageFromBlob(resp,key)
      
        
    
      })
    });
  }
  createImageFromBlob(image: Blob,key) {
    let reader = new FileReader();
    let imageToShow 
    reader.addEventListener("load", () => {
    
      imageToShow = reader.result;
      this.imageList.push({"imageName":key,"image":imageToShow})
    }, false);
 
    if (image) {
       reader.readAsDataURL(image);
    }
 }
  

  
}

