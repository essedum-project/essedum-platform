//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/modules/entity.module.ts.e.vm
//

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { SharedMaterialModule } from "../../shared-modules/material/material.module";
import { NgbTimepickerModule } from "@ng-bootstrap/ng-bootstrap";
import { FileUploadModule } from "ng2-file-upload";
import { DashConstantComponent } from "../../entities/dash-constant/dash-constant.component";
import { NgxPaginationModule } from "ngx-pagination";
import { NgBusyModule, BusyConfig } from 'ng-busy';
import {MatTreeModule} from '@angular/material/tree';
import { DashConstantService } from "../../services/dash-constant.service";
import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import {DragDropModule} from '@angular/cdk/drag-drop';

import { FieldsetModule } from "primeng/fieldset";
import { ThemeMgmtComponent } from "../../components/theme-mgmt/theme-mgmt.component";

@NgModule({
 declarations: [DashConstantComponent,ThemeMgmtComponent],
 imports: [
  //material
  SharedMaterialModule,
  NgxPaginationModule,
  DragDropModule,

  //angular
  FormsModule,
  
  RouterModule,
//   CommonModule,

  //ng2 bootstrap
  NgbTimepickerModule,

  //prime-ng
  FileUploadModule,
  NgBusyModule,
  MatTreeModule,
  FieldsetModule
 ],
 providers: [DashConstantService, HelperService, MessageService,{ provide: BusyConfig, useFactory: busyConfigFactory }],
})
export class DashConstantModule {}

export function busyConfigFactory() {
    return new BusyConfig({
        message: "Loading...",
        wrapperClass: "centerDiv",
    });
}