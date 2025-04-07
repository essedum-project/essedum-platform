import { NgModule } from "@angular/core";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

//material module
import { SharedModule } from "../../shared-modules/shared.module";

//process
import { CountryTimezoneService } from "../../services/countryTimezone.service";

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
     NgxPaginationModule,
     NgbPaginationModule,
     NgBusyModule
    ],
    exports: [],
    providers: [CountryTimezoneService, HelperService, MessageService],
   })
   export class CountryTimezoneModule {}