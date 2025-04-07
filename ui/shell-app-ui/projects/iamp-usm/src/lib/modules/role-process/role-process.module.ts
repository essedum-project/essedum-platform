import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
//material module
import { SharedModule } from "../../shared-modules/shared.module";

//roleprocess
import { RoleProcessService } from "../../services/role-process.service";

import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";

import { NgBusyModule } from "ng-busy";
import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";

@NgModule({
    declarations: [],
    imports: [
     SharedModule,
     FormsModule,
     RouterModule,
    //  CommonModule,
     NgxPaginationModule,
     NgbPaginationModule,
     NgBusyModule
    ],
    exports: [],
    providers: [RoleProcessService, HelperService, MessageService],
   })
   export class RoleProcessModule {}