import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { NgBusyModule, BusyConfig } from "ng-busy";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";
import { UsmPortfolioService } from "./services/usm-portfolio.service";
import { RoleService } from "./services/role.service";
import { UserProjectRoleService } from "./services/user-project-role.service";
import { ProjectService } from "./services/project.service";
import { DatePipe } from '@angular/common';

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

// import { MatDialogModule } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IampUsmService } from "./iamp-usm.service";
import { HelperService } from "./services/helper.service";
import { UsersService } from "./services/users.service";
import { encKey } from "./models/encKey";

import { SecretsComponent } from './components/secrets/secrets.component';
import { RoleListComponent } from "./components/role-list/role-list.component";
import { RoleDetailComponent } from "./components/role-detail/role-detail.component";
import { RoleRoleComponent } from "./components/Role-Role/role-role.component";
import { UserProjectRoleListComponent } from "./components/user-project-role-list/user-project-role-list.component";
import { RoleroleService } from "./services/role-role.service";
import { AipHeaderComponent } from "./components/aip-header/aip-header.component";
import { ProjectListViewComponent } from "./components/project/project-list-view.component";
import { MatTableModule } from "@angular/material/table";
import { MatTreeModule } from "@angular/material/tree";
import { RouterModule } from "@angular/router";
import { ConfirmRevokeDialogComponent } from "./support/confirm-revoke-dialog.component";
import { ConfirmRegenerateDialogComponent } from "./support/confirm-regenerate-dialog.component";
// import { ConfirmDeleteDialogComponent } from "./support/confirm-delete-dialog.component";
// import { ConfirmProjectDeleteDialogComponent } from "./support/confirm-project-delete-dialog.component ";
import { DashConstantService } from "./services/dash-constant.service";

import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
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
        MatPaginatorModule,
        MatSortModule,
        MatTabsModule,
     
    ],
    declarations: [
        IampUsmComponent,
        SecretsComponent,
        RoleListComponent, 
        RoleDetailComponent,
        RoleRoleComponent,
        UserProjectRoleListComponent,
        AipHeaderComponent,
        ConfirmDeleteDialogComponent,
        ConfirmProjectDeleteDialogComponent,        ProjectListViewComponent,

        ConfirmRevokeDialogComponent,
        ConfirmRegenerateDialogComponent,
    ],
    providers: [
        MessageService,
        RoleService,
        ProjectService,
        UserProjectRoleService,
        HelperService,
        UsersService,
        UsmPortfolioService,
        RoleroleService,
        DashConstantService,
        { provide: BusyConfig, useFactory: busyConfigFactory },
        IampUsmService,
        Ng4LoadingSpinnerService,
        DatePipe,
        encKey,
    ],
    exports: [IampUsmComponent, SecretsComponent, RoleListComponent, RoleDetailComponent, RoleRoleComponent, UserProjectRoleListComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class IampUsmModule { }
export function busyConfigFactory() {
    return new BusyConfig({
        message: "Loading...",
        wrapperClass: "centerDiv",
    });
}
