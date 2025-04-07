// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-view-chart',
//   templateUrl: './view-chart.component.html',
//   styleUrls: ['./view-chart.component.scss']
// })
// export class ViewChartComponent {

// }

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  ViewChild,
  TemplateRef,ChangeDetectorRef, OnInit 
} from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
 import { SafePipe } from '../staticfile/directive/safe.pipe';
import { Services } from '../../services/service';
@Component({
  selector: 'app-view-chart',
  templateUrl: './view-chart.component.html',
  styleUrls: ['./view-chart.component.scss'],
})
export class ViewChartComponent implements OnChanges {
  @Input() selectedChart;
  @Input() displayDialog;
  @Output() dialogClosed = new EventEmitter();
  urlSafe: SafeResourceUrl = 'about:blank';
  displaySpinner: boolean=true;
  chartTitle: string;
   @Input() headerName;
  @ViewChild('content4') content:TemplateRef<any>;
 
  constructor(
    private modalService:LedsModalService,private cdr: ChangeDetectorRef ,private services: Services,private sanitizer: DomSanitizer
  ) {}

  pp:any;

  ngOnChanges(change: SimpleChanges) {
    if (change['displayDialog'] && change['displayDialog'].currentValue) {
      this.openModal(this.content);
    }
   
    if (change['selectedChart'] && change['selectedChart'].currentValue) {
      this.displaySpinner = true;
      this.chartTitle =
        this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
        this.urlSafe = 'https://' + this.selectedChart.url+'&dataset_name='+this.selectedChart.body;
    } else {
      if (this.selectedChart !== undefined) {
        this.displaySpinner = true;
        this.chartTitle =
          this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
          this.urlSafe = 'https://' + this.selectedChart.url+'&dataset_name='+this.selectedChart.body;
      }
    }
  }

  openModal(content: any): void {
    this.modalService.openModal(content, 'standard', {backdrop: 'static'});
  }
  
  // ngOnInit(): void {
    
  //   console.log("selectedChart",this.selectedChart);
  //   if (this.selectedChart && this.selectedChart.currentValue) {
  //     this.displaySpinner = true;
  //     this.chartTitle =
  //       this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
  //     this.pp = 'http://' + this.selectedChart.url+'&dataset_name='+this.selectedChart.body;
  //     // this.pp=this.pp.split('?')[0];
  //     // this.gg();
  //     if(this.displayDialog ){
  //       this.openModal(this.content);
  //     }
  //   } else {
  //     if (this.selectedChart !== undefined) {
  //       this.displaySpinner = true;
  //       this.chartTitle =
  //         this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
  //       this.pp = 'http://' + this.selectedChart.url+'&dataset_name='+this.selectedChart.body;;
  //       // this.pp=this.pp.split('?')[0];
  //       // this.gg();
  //       if(this.displayDialog ){
  //         this.openModal(this.content);
  //         console.log(this.selectedChart)
  //       }
  //     }
  //   }
  // }
  // sanitizedHtml:any;
//  gg(){

//   this.services.getcharthistogram(this.pp,this.selectedChart.body).subscribe((res)=>{
//     console.log("newwsdfsavsndvsgf",res);
//     this.displaySpinner = false;
//     this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(res);

//   })
//  }
  // ngOnChanges(change: SimpleChanges) {
  //   // if (change['displayDialog'] && change['displayDialog'].currentValue) {
  //   //   this.open(this.content);
  //   // }
    
  // console.log("url",this.urlSafe);
  
  //   if (change['selectedChart'] && change['selectedChart'].currentValue) {
  //     this.displaySpinner = true;
  //     this.chartTitle =
  //       this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
  //     this.urlSafe = 'http://' + this.selectedChart.url;
  //   } else {
  //     if (this.selectedChart !== undefined) {
  //       this.displaySpinner = true;
  //       this.chartTitle =
  //         this.selectedChart.attribute + ' - ' + this.selectedChart.chartType;
  //       this.urlSafe = 'http://' + this.selectedChart.url;
  //     }
  //   }
  // }



  frameLoaded(): void {
    this.displaySpinner = false;
  }
  dialogHidden(): void {
    this.modalService.dismissAll();
    this.displaySpinner = false;
    this.urlSafe = 'about:blank';
    this.dialogClosed.emit(true);
  }
 

 
}