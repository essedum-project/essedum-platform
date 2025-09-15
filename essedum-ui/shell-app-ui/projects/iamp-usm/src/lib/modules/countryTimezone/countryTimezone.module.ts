import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

//material module
import { SharedModule } from "../../shared-modules/shared.module";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";

import { NgBusyModule } from "ng-busy";
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
    providers: [MessageService],
   })
   export class CountryTimezoneModule {}