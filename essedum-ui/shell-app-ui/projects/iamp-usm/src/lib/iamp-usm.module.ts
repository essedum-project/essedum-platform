import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { NgBusyModule, BusyConfig } from "ng-busy";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";
import { RoleService } from "./services/role.service";
import { UserProjectRoleService } from "./services/user-project-role.service";
import { ProjectService } from "./services/project.service";
import { NgxPaginationModule } from "ngx-pagination";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SharedModule } from "./shared-modules/shared.module";
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
import { UsmRolePermissionsService } from "./services/usm-role-permissions.service";
import { UsmPermissionsService } from "./services/usm-permission.service";
import { DashConstantService } from "./services/dash-constant.service";

import { SecretsComponent } from './components/secrets/secrets.component';
import { RoleListComponent } from "./components/role-list/role-list.component";
import { AipHeaderComponent } from "./components/aip-header/aip-header.component";
import { AipFilterComponent } from "./components/aip-filter/aip-filter.component";
import { MatTableModule } from "@angular/material/table";
import { MatTreeModule } from "@angular/material/tree";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { AipPaginationComponent } from './components/aip-pagination/aip-pagination.component';
import { PortfolioListViewComponent } from "./components/portfolio/portfolio-list-view.component";
import { PortfolioAddComponent } from "./components/portfolio/portfolio-add/portfolio-add.component";
import { UsmRolePermissionComponent } from "./components/usm-role-permission/usm-role-permission.component";
import { RolePermissionAddComponent } from "./components/usm-role-permission/role-permission-add/role-permission-add/role-permission-add.component";

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
        MatFormFieldModule,        MatInputModule,
        MatSelectModule,    
        MatCardModule,     
        MatTooltipModule,
        MatIconModule,
        AipFilterComponent,
    ],    declarations: [
        IampUsmComponent,
        SecretsComponent,
        RoleListComponent, 
        AipHeaderComponent,        
        AipPaginationComponent,
        PortfolioListViewComponent,
        PortfolioAddComponent,UsmRolePermissionComponent, RolePermissionAddComponent   ],providers: [
        MessageService,RoleService,ProjectService,UserProjectRoleService,
        { provide: BusyConfig, useFactory: busyConfigFactory },
        IampUsmService,
        Ng4LoadingSpinnerService,
        UsmRolePermissionsService,
        UsmPermissionsService,
        DashConstantService,    
    ],
    exports: [IampUsmComponent,SecretsComponent,RoleListComponent],
   // entryComponents: [UsmPortfolioAddComponent, DeleteComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class IampUsmModule { }
export function busyConfigFactory() {
    return new BusyConfig({
        message: "Loading...",
        wrapperClass: "centerDiv",
    });
}
