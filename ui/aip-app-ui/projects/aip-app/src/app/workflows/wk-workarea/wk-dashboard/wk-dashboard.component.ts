import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wk-dashboard',
  templateUrl: './wk-dashboard.component.html',
  styleUrls: ['./wk-dashboard.component.scss']
})
  export class WkDashboardComponent implements OnInit, WorkareaItemsComponent {
    autoselectedfilterwidgetdata
    autoselecteddependentfilterjson
    autoselectedfilterjson;
  
    constructor(private datasetService: DatasetServices,
      private router: Router,
      private route: ActivatedRoute,
    ) { }
  
    @Input() data: any;
    @Output() event = new EventEmitter<any>();
    dashboardname:any
    params: any;
    dashfilter:any;
    dashboardfiltervalues:any;
  
  
    ngOnInit(): void {
      if(this.data.wkJson.input.dashboardname.startsWith("stage")){
        this.dashboardname = this.data.wkData.jsondata[this.data.wkJson.input.dashboardname].output
      }
      else{
        this.dashboardname = this.data.wkJson.input.dashboardname
      }
      if(this.data.wkJson.input.dashboardfilter)
      this.loadDashboardFilter()
    }
  
    loadDashboardFilter(){
      
      this.dashfilter = JSON.parse(this.data.wkJson.input.dashboardfilter)
      this.params = {}
      this.autoselectedfilterjson = JSON.parse(sessionStorage.getItem("Filter"))
      this.autoselecteddependentfilterjson = JSON.parse(sessionStorage.getItem("TopFilter"))
      this.autoselectedfilterwidgetdata = [,[]]
      
      let index=0
      for (let json in this.dashfilter) {
        if (this.data.wkData.jsondata[this.dashfilter[json]]){
          if (index == 0)
            this.autoselectedfilterwidgetdata[index++] = this.data.wkData.jsondata[this.dashfilter[json]].output? this.data.wkData.jsondata[this.dashfilter[json]].output.toString() : "FALSE"
          else
            this.autoselectedfilterwidgetdata[index++] = this.data.wkData.jsondata[this.dashfilter[json]].output? this.data.wkData.jsondata[this.dashfilter[json]].output : "FALSE"
        }
        else{
          this.params[json] = this.dashfilter[json]
        }
      }
  
      // this.autoselectedfilterjson = {"variantId":"'variant314','variant739'"}
      // this.autoselectedfilterwidgetdata = [["variant314, variant739"],["FALSE"]]
    }
  
  
    selectedFilterWidgetdata(result:any){
      //values selected in dashboard by filters
      //dashboard json inputs
      let out
      let index=0 
      let dash = JSON.parse(this.data.wkJson.input.dashboardfilter)
      for (let json in dash){
        if (dash[json] == '')
        out = result[index]
        index++
      }
      this.event.emit(out)
    }

    navigate(){
      if(this.dashboardname == "EASE Analytics"){
        this.router.navigate(['../../../../dynamicDashboard/grid/OCC/9'],{relativeTo: this.route})
      }
      if(this.dashboardname == "Ticket Cluster"){
        this.router.navigate(['../../../../dynamicDashboard/grid/OCC/3'],{relativeTo : this.route})
      }
    }

}
