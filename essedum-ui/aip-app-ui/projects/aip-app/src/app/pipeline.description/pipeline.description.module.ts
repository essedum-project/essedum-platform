import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ParamArgumentPopupComponent } from './param-argument-popup/param-argument-popup.component';
import { TreeComponent } from '@ali-hm/angular-tree-component';
//import { ModalEditCanvasTitleComponent } from './modal-edit-canvas-title/modal-edit-canvas-title.component';
import { MatDialogModule } from '@angular/material/dialog';
//import { MatDialogModule } from '@angular/material/dialog';
//import { ConsoleTabComponent } from './console-tab/console-tab.component';
//import { JobDataViewerComponent } from './job-data-viewer/job-data-viewer.component';
//import { MetricViewerComponent } from './metric-viewer/metric-viewer.component';
//import { ModalViewEditPropertiesComponent } from './modal-view-edit-properties/modal-view-edit-properties.component';
//import { ShowOutputArtifactsComponent } from './show-output-artifacts/show-output-artifacts.component';



@NgModule({
  declarations: [
    //ParamArgumentPopupComponent,
   // ModalEditCanvasTitleComponent,
   // ConsoleTabComponent,
  //  JobDataViewerComponent,
    //MetricViewerComponent,
   // ModalViewEditPropertiesComponent,
    //ShowOutputArtifactsComponent
  ],
  imports: [
    CommonModule,
    //TreeComponent,
    MatDialogModule
  ]
})
export class PipelineDescriptionModule { }


