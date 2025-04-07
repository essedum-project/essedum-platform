import { Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { MetricViewerComponent } from '../../pipeline.description/metric-viewer/metric-viewer.component';
import { EventsService } from '../../services/event.service';
import { WorkareaItemsComponent } from './wk-workarea-items.component';
import { WorkareaItems } from './wk-workarea-items';
import { WorkareaDirective } from './wk-workarea.directive';
import { WkDatasetsviewComponent } from './wk-datasetsview/wk-datasetsview.component';
import { WkFormComponent } from './wk-form/wk-form.component';
import { WkLogsComponent } from './wk-logs/wk-logs.component';
import { DatasourceRegistryComponent } from '../../datasource/datasource-registry/datasource-registry.component';
import { WkSummaryviewComponent } from './wk-summaryview/wk-summaryview.component';
import { DatasetMacrobaseComponent } from '../../dataset/dataset-macrobase/dataset-macrobase.component';
import { DataCorpusViewComponent } from './wk-datacorpusview/wk-datacorpusview.component';
import { WkTimeseriesviewComponent } from './wk-timeseriesview/wk-timeseriesview.component';
import { WkDatasettableviewComponent } from './wk-datasettableview/wk-datasettableview.component';
import { WkDashboardComponent } from './wk-dashboard/wk-dashboard.component';
import { SwaggerComponent } from '../../swagger/swagger.component';
import { SchedulerComponent } from '../../scheduler/scheduler.component';
import { WkScheduleComponent } from '../wk-schedule/wk-schedule.component';

@Component({
  selector: 'app-wk-workarea',
  templateUrl: './wk-workarea.component.html',
  styleUrls: ['./wk-workarea.component.scss']
})
export class WkWorkareaComponent implements OnInit, OnChanges, DoCheck {

  interval: any;
  @Input() wkJson;
  @Input() index;
  @Input() wkData;
  @Input() selectedTab;
  @Output() event = new EventEmitter<any>();
  wkarea: WorkareaItems;
  correlationid;
  log;
  xAxis;
  yAxis;
  classes;
  oldTab = "";
  @ViewChild(WorkareaDirective, { static: true }) workarea!: WorkareaDirective;
  oldWkData;
  componentRef

  constructor(
    private eventService: EventsService,
    private messageService: Services,
    public dialog: MatDialog
    // private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.classes = {
      WkDatasettableviewComponent: WkDatasettableviewComponent,
      WkDatasetsviewComponent: WkDatasetsviewComponent,
      WkLogsComponent: WkLogsComponent,
      DisplayTimeSeriesComponent: WkTimeseriesviewComponent,
      SchedulerComponent:WkScheduleComponent,
      WkSummaryviewComponent:WkSummaryviewComponent,
      WkDashboardComponent:WkDashboardComponent,
      DatasetMacrobaseComponent:DatasetMacrobaseComponent,
      WkFormComponent:WkFormComponent,
      DataCorpusViewComponent:DataCorpusViewComponent,
      SwaggerComponent:SwaggerComponent,
      MetricViewerComponent:MetricViewerComponent,
      DatasourceRegistryComponent:DatasourceRegistryComponent,
      // TicketsListComponent:TicketsListComponent
    };
    // console.log(this.wkJson); console.log(` \n index: ${this.index} \n`)
    // console.log(this.wkData);
    // console.log(this.selectedTab);
    
    
    this.loadComponent();
  }

  loadComponent() {
//console.log("wksjon=", this.wkJson.WorkareaComponent)
    if (this.wkJson.WorkareaComponent) {
      let data = { wkJson: this.wkJson, wkData: this.wkData }
      // this.wkJson.input.stage?.forEach(stg => {
      //   data.push(this.wkData.jsondata[stg]?.output)
      // })
      // if (this.wkJson.WorkareaComponent.Component.includes('TimeSeries')) {
      //   for (let json in this.wkData.jsondata) {
      //     if (json == 'stage2')
      //       data.push(this.wkData.jsondata[json].output)
      //     else if (json == 'stage3')
      //       data.push(this.wkData.jsondata[json].output)
      //   }
      // }
      if (this.oldTab != this.wkJson.WorkareaComponent.alias) {
        const wkarea = new WorkareaItems(this.classes[this.wkJson.WorkareaComponent.Component], data)
        // const componentFactory =
        //   this.componentFactoryResolver.resolveComponentFactory(wkarea.component);

        if (this.workarea) {
          this.oldTab = this.wkJson.WorkareaComponent.alias
          const viewContainerRef = this.workarea.viewContainerRef;
          viewContainerRef.clear();
          this.componentRef?.destroy();

          this.componentRef =
            viewContainerRef.createComponent<WorkareaItemsComponent>(wkarea.component);
          this.componentRef.instance.data = wkarea.data;
          this.componentRef.instance.event.subscribe(value => this.changeStage(value));

        }
      }
    }

  }

  changeStage(value) {
    this.event.emit(value);
  }

  extractVocab() {
    // this.eventService
    //   .triggerEvent(this.wkJson.input.event, {})
    //   .subscribe((res) => {
    //     this.messageService.info("Extracting Vocab", "");
    //     this.correlationid = res;
    //   });
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  ngDoCheck() {
    if (this.wkData?.jsondata[this.wkJson.input]?.output != undefined && this.oldWkData?.jsondata[this.wkJson.input]?.output != this.wkData?.jsondata[this.wkJson.input]?.output) {
      this.oldWkData = this.wkData
      this.ngOnChanges();
    }
  }
}