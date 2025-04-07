//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParamArgumentPopupComponent } from './param-argument-popup/param-argument-popup.component';
import { TreeComponent } from '@ali-hm/angular-tree-component';
import { ModalEditCanvasTitleComponent } from './modal-edit-canvas-title/modal-edit-canvas-title.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConsoleTabComponent } from './console-tab/console-tab.component';
import { JobDataViewerComponent } from './job-data-viewer/job-data-viewer.component';
import { MetricViewerComponent } from './metric-viewer/metric-viewer.component';
import { ModalViewEditPropertiesComponent } from './modal-view-edit-properties/modal-view-edit-properties.component';
import { ShowOutputArtifactsComponent } from './show-output-artifacts/show-output-artifacts.component';



@NgModule({
  declarations: [
    ParamArgumentPopupComponent,
    ModalEditCanvasTitleComponent,
    ConsoleTabComponent,
    JobDataViewerComponent,
    MetricViewerComponent,
    ModalViewEditPropertiesComponent,
    ShowOutputArtifactsComponent
  ],
  imports: [
    CommonModule,
    TreeComponent,
    MatDialogModule
  ]
})
export class PipelineDescriptionModule { }


