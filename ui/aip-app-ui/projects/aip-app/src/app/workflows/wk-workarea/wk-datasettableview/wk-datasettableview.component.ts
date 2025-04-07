import { EventEmitter, Output } from "@angular/core";
import { Component, Input, OnInit } from "@angular/core";
import { DatasetServices } from '../../../dataset/dataset-service';
import { WorkareaItemsComponent } from "../wk-workarea-items.component";

@Component({
  selector: "wk-datasettableview",
  templateUrl: "./wk-datasettableview.component.html",
  styleUrls: ["./wk-datasettableview.component.css"],
})
export class WkDatasettableviewComponent implements OnInit, WorkareaItemsComponent {

  constructor(private datasetService: DatasetServices) { }

  @Input() data: any;
  @Output() event = new EventEmitter<any>();
  dataset:any
  isTrue = false;

  ngOnInit(): void {
    if(this.data.wkJson.input.dataset && this.data.wkJson.input.dataset!=""){
      this.datasetService.getDataset(this.data.wkJson.input.dataset).subscribe(resp=>{
        this.dataset = resp
        this.isTrue=true;
      })
    }      
    else{
      this.dataset=this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
      this.isTrue=true
    }
    
  }
}
