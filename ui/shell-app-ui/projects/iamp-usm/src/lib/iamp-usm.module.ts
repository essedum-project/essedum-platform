import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { NgBusyModule, BusyConfig } from "ng-busy";
import { FormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";
import { OrgUnitService } from "./services/org-unit.service";
import { AuthService } from "./services/auth.service";
import { UserUnitService } from "./services/user-unit.service";
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "./shared-modules/shared.module";
import { ModulesModule } from "./modules/modules.module";
import { ConfirmDeleteDialogComponent } from "./support/confirm-delete-dialog.component";
import { ConfirmProjectDeleteDialogComponent } from "./support/confirm-project-delete-dialog.component ";
import { IampUsmRouteModule } from "./iamp-usm.route";
import { IampUsmComponent } from "./iamp-usm.component";
import { IampUserMgmtComponent } from "./components/iamp-user-mgmt/iamp-user-mgmt.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { UsmRolePermissionComponent } from "./entities/usm-role-permission/usm-role-permission.component";
import { UsmPermissionsService } from "./services/usm-permission.service";
import { UsmRolePermissionsService } from "./services/usm-role-permissions.service";
import { ExportImportModule } from './components/export-import/export-import.module';
import { FieldsetModule } from "primeng/fieldset";
import { ThemeService } from "./services/theme.service";
import { CommonModule } from "@angular/common";
import { ApisService } from "./services/apis.service";
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from "@angular-material-components/datetime-picker";
import { QuillModule } from 'ngx-quill';
import { ProcessFormComponent } from './components/process-form/process-form.component';
import { RoleProcessFormComponent } from './components/role-process-form/role-process-form.component';
import { StageFormComponent } from './components/stage-form/stage-form.component';
import { CopyBlueprintComponent } from './components/copy-blueprint/copy-blueprint.component';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IampUsmService } from "./iamp-usm.service";
import { IampUsmInterceptorService } from "./services/iamp-usm-interceptor.service";

@NgModule({
    imports: [
        NgBusyModule,
        CommonModule,
        FormsModule,
        SharedModule,
        NgxPaginationModule,
        ModulesModule,
        IampUsmRouteModule,
        ExportImportModule,
        FieldsetModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
        QuillModule.forRoot(),
        HttpClientModule,
        HttpClientXsrfModule
    ],
    declarations: [
        ConfirmDeleteDialogComponent,
        IampUsmComponent,
        IampUserMgmtComponent,
        ManageUsersComponent,
        ConfirmProjectDeleteDialogComponent,
        UsmRolePermissionComponent,
        ProcessFormComponent,
        RoleProcessFormComponent,
        StageFormComponent,
        CopyBlueprintComponent
    ],
    providers: [
        OrgUnitService,
        AuthService,
        UserUnitService,
        MessageService,
        UsmRolePermissionsService,
        ThemeService,
        UsmPermissionsService,
        ApisService,
        { provide: BusyConfig, useFactory: busyConfigFactory },
        IampUsmService,
        { provide: HTTP_INTERCEPTORS, useClass: IampUsmInterceptorService, multi: true }
    ],
    exports: [IampUsmComponent],
    entryComponents: [ConfirmDeleteDialogComponent, ConfirmProjectDeleteDialogComponent,],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class IampUsmModule { }
export function busyConfigFactory() {
    return new BusyConfig({
        message: "Loading...",
        wrapperClass: "centerDiv",
    });
}
