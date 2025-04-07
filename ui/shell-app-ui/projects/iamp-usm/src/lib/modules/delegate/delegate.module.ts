import { NgModule } from "@angular/core";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

//material module
import { SharedModule } from "../../shared-modules/shared.module";

//delegate
import { DelegateService } from "../../services/delegate.service";

import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";

import { NgBusyModule } from "ng-busy";
import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import { DelegateFormComponent } from "../../components/delegate-form/delegate-form.component";
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from "@angular-material-components/datetime-picker";
import { NgxMatMomentModule } from "@angular-material-components/moment-adapter";
import { QuillModule } from 'ngx-quill';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
  },
}; 

@NgModule({
    declarations: [DelegateFormComponent],
    imports: [
     SharedModule,
     FormsModule,
     RouterModule,
     NgxPaginationModule,
     NgbPaginationModule,
     NgBusyModule,
     NgxMatDatetimePickerModule,
     NgxMatTimepickerModule,
     NgxMatMomentModule,
     QuillModule.forRoot(),
    ],
    exports: [],
    providers: [DelegateService, HelperService, MessageService]
   })

   export class DelegateModule {}