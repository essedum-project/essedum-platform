import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';

@Component({
  selector: 'app-wk-form',
  templateUrl: './wk-form.component.html',
  styleUrls: ['./wk-form.component.scss']
})
export class WkFormComponent implements OnInit, WorkareaItemsComponent {

  constructor(private datasetService: DatasetServices) { }

  @Input() data: any;
  @Output() event = new EventEmitter<any>();
  dataset:any


  ngOnInit(): void {
    this.datasetService.getDataset(this.data.wkJson.input.dataset).subscribe(resp=>{
      this.dataset=resp
    })

  }

  checkResult(event){
//console.log("event=", event)
    this.event.emit(event)
  }
}
