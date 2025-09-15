import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { NgBusyModule, BusyConfig } from "ng-busy";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";
import { UsmPortfolioService } from "./services/usm-portfolio.service";
import { RoleService } from "./services/role.service";
import { UserProjectRoleService } from "./services/user-project-role.service";
import { ProjectService } from "./services/project.service";
import { DatePipe } from "@angular/common";
import { NgxPaginationModule } from "ngx-pagination";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { SharedModule } from "./shared-modules/shared.module";
import { IampUsmRouteModule } from "./iamp-usm.route";
import { IampUsmComponent } from "./iamp-usm.component";
import { FieldsetModule } from "primeng/fieldset";
import { CommonModule } from "@angular/common";
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { QuillModule } from "ngx-quill";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import {
  HttpClientModule,
  HttpClientXsrfModule,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { IampUsmService } from "./iamp-usm.service";
import { HelperService } from "./services/helper.service";
import { UsersService } from "./services/users.service";
import { encKey } from "./models/encKey";
import { UsmRolePermissionsService } from "./services/usm-role-permissions.service";
import { UsmPermissionsService } from "./services/usm-permission.service";
import { DashConstantService } from "./services/dash-constant.service";
import { AuthService } from "./services/auth.service";

import { SecretsComponent } from "./components/secrets/secrets.component";
import { RoleListComponent } from "./components/role-list/role-list.component";
import { RoleDetailComponent } from "./components/role-detail/role-detail.component";
import { RoleRoleComponent } from "./components/Role-Role/role-role.component";
import { UserProjectRoleListComponent } from "./components/user-project-role-list/user-project-role-list.component";
import { RoleroleService } from "./services/role-role.service";
import { OrgUnitService } from "./services/org-unit.service";
import { UserUnitService } from "./services/user-unit.service";
import { AipHeaderComponent } from "./components/aip-header/aip-header.component";
import { ProjectListViewComponent } from "./components/project/project-list-view.component";
import { ProjectDetailComponent } from "./components/project-detail/project-detail.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { AipFilterComponent } from "./components/aip-filter/aip-filter.component";
import { MatTableModule } from "@angular/material/table";
import { MatTreeModule } from "@angular/material/tree";
import { RouterModule } from "@angular/router";
import { ConfirmRevokeDialogComponent } from "./support/confirm-revoke-dialog.component";
import { ConfirmRegenerateDialogComponent } from "./support/confirm-regenerate-dialog.component";
import { ConfirmDeleteDialogComponent } from "./support/confirm-delete-dialog.component";
import { ConfirmProjectDeleteDialogComponent } from "./support/confirm-project-delete-dialog.component ";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { AipPaginationComponent } from "./components/aip-pagination/aip-pagination.component";
import { PortfolioAddComponent } from "./components/portfolio/portfolio-add/portfolio-add.component";
import { UsmRolePermissionComponent } from "./components/usm-role-permission/usm-role-permission.component";
import { RolePermissionAddComponent } from "./components/usm-role-permission/role-permission-add/role-permission-add/role-permission-add.component";
import { PortfolioListViewComponent } from "./components/portfolio/portfolio-list-view.component";
import { DashConstantComponent } from "./entities/dash-constant/dash-constant.component";
import { AipHeadersComponent } from "./shared-modules/aip-header/aip-header.component";
import { AipPaginationsComponent } from "./shared-modules/aip-pagination/aip-pagination.component";
import { ThemeMgmtComponent } from "./components/theme-mgmt/theme-mgmt.component";

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
    AipPaginationComponent,
    PortfolioAddComponent,
    AipFilterComponent,
    MatIconModule,
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
    ConfirmProjectDeleteDialogComponent,
    ProjectListViewComponent,
    ProjectDetailComponent,
    ManageUsersComponent,
    ConfirmRevokeDialogComponent,
    ConfirmRegenerateDialogComponent,
    PortfolioListViewComponent,
    UsmRolePermissionComponent,
    RolePermissionAddComponent,
    DashConstantComponent,
    AipHeadersComponent,
    AipPaginationsComponent,
    ThemeMgmtComponent,
    AipHeaderComponent,
  ],
  providers: [
    MessageService,
    UserProjectRoleService,
    HelperService,
    UsersService,
    UsmPortfolioService,
    RoleroleService,
    OrgUnitService,
    UserUnitService,
    UsmRolePermissionsService,
    UsmPermissionsService,
    { provide: BusyConfig, useFactory: busyConfigFactory },
    IampUsmService,
    Ng4LoadingSpinnerService,
    DatePipe,
    DashConstantService,
    ProjectService,
    RoleService,
    UsersService,
    encKey,
    AuthService,
    { provide: BusyConfig, useFactory: busyConfigFactory },
    IampUsmService,
    Ng4LoadingSpinnerService,
  ],
  exports: [
    IampUsmComponent,
    SecretsComponent,
    RoleListComponent,
    RoleDetailComponent,
    RoleRoleComponent,
    UserProjectRoleListComponent,
    ManageUsersComponent,
    AipPaginationComponent,
    PortfolioAddComponent,
    AipFilterComponent,
    PortfolioListViewComponent,
    UsmRolePermissionComponent,
    RolePermissionAddComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class IampUsmModule {}
export function busyConfigFactory() {
  return new BusyConfig({
    message: "Loading...",
    wrapperClass: "centerDiv",
  });
}
