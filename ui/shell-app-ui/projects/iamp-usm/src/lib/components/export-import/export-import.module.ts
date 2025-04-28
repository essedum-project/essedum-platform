/*CopyRight
* @ 2018 - 2019 Infosys Limited, Bangalore, India. All Rights Reserved.
* Version: 2.1
* Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
* this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
* rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
* transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
* recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
* criminal penalties, and will be prosecuted to the maximum extent possible under the law.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgBusyModule } from 'ng-busy';
import { ExportImportComponent } from './export-import.component';
import { SharedMaterialModule } from '../../shared-modules/material/material.module';
import { ExportImportService } from '../../services/export-import.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DashConstantService } from 'com-lib-util';
@NgModule({
    imports: [
        CommonModule,
        SharedMaterialModule,
        NgBusyModule,
        NgxMatSelectSearchModule
    ],
    providers:[ExportImportService,DashConstantService],
    declarations: [ExportImportComponent]
})
export class ExportImportModule { }