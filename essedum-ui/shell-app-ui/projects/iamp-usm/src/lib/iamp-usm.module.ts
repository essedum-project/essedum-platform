import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { NgBusyModule, BusyConfig } from "ng-busy";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";

import { NgxPaginationModule } from "ngx-pagination";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SharedModule } from "./shared-modules/shared.module";
import { ModulesModule } from "./modules/modules.module";
import { ConfirmDeleteDialogComponent } from "./support/confirm-delete-dialog.component";
import { ConfirmProjectDeleteDialogComponent } from "./support/confirm-project-delete-dialog.component ";
import { IampUsmRouteModule } from "./iamp-usm.route";
import { IampUsmComponent } from "./iamp-usm.component";



import { FieldsetModule } from "primeng/fieldset";

import { CommonModule } from "@angular/common";

import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from "@angular-material-components/datetime-picker";
import { QuillModule } from 'ngx-quill';

import { MatDialogModule } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IampUsmService } from "./iamp-usm.service";

import { SecretsComponent } from './components/secrets/secrets.component';
import { MatTableModule } from "@angular/material/table";
import { MatTreeModule } from "@angular/material/tree";
import { RouterModule } from "@angular/router";
import { ConfirmRevokeDialogComponent } from "./support/confirm-revoke-dialog.component";
import { ConfirmRegenerateDialogComponent } from "./support/confirm-regenerate-dialog.component";

import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
@NgModule({
    imports: [
        NgBusyModule,
        CommonModule,
        FormsModule,
        SharedModule,
        NgxPaginationModule,
   
        IampUsmRouteModule,
 MatDialogModule,
        FieldsetModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
        QuillModule.forRoot(),
        HttpClientModule,
        HttpClientXsrfModule,
        RouterModule,
        MatTreeModule,
        MatTableModule,
        MatButtonModule,
       
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    
        MatCardModule,
     
        MatTooltipModule,
     
    ],
    declarations: [
  IampUsmComponent,
        SecretsComponent,

      
     
    ],
    providers: [

        MessageService,

        { provide: BusyConfig, useFactory: busyConfigFactory },
        IampUsmService,
        Ng4LoadingSpinnerService,
     
        
    ],
    exports: [IampUsmComponent,SecretsComponent],
    // entryComponents: [ConfirmDeleteDialogComponent, ConfirmProjectDeleteDialogComponent,ConfirmRevokeDialogComponent,ConfirmRegenerateDialogComponent,],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class IampUsmModule { }
export function busyConfigFactory() {
    return new BusyConfig({
        message: "Loading...",
        wrapperClass: "centerDiv",
    });
}
