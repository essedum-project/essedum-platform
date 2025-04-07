import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { ProjectListViewComponent } from "./entities/project/project-list-view.component";
import { RoleListComponent } from "./entities/role/role-list.component";
import { RoleDetailComponent } from "./entities/role/role-detail.component";
import { IampUserMgmtComponent } from "./components/iamp-user-mgmt/iamp-user-mgmt.component";
import { UsmPortfolioListViewComponent } from "./entities/usm-portfolio/usm-portfolio-list-view.component";
import { DashConstantComponent } from "./entities/dash-constant/dash-constant.component";
import { UsmRolePermissionComponent } from "./entities/usm-role-permission/usm-role-permission.component";
import { ExportImportComponent } from './components/export-import/export-import.component';
import { ThemeMgmtComponent } from "./components/theme-mgmt/theme-mgmt.component";
import { OrgDashboardComponent } from "./entities/org-dashboard/org-dashboard.component";
import { UserConfigurationComponent } from "./entities/user-configuration/user-configuration.component";
import { DelegateFormComponent } from "./components/delegate-form/delegate-form.component";
import { ProcessFormComponent } from "./components/process-form/process-form.component";
import { StageFormComponent } from "./components/stage-form/stage-form.component";
import { CopyBlueprintComponent } from "./components/copy-blueprint/copy-blueprint.component";

const routes: Routes = [
 {
  path: "",
  component: IampUserMgmtComponent,
  children: [
   { path: "manageUsers", component: ManageUsersComponent },
   { path: "manageUsers/:uid/:view", component: ManageUsersComponent },
   { path: "projectlist", component: ProjectListViewComponent },
   { path: "projectlist/:projectid/:view", component: ProjectListViewComponent },
   { path: "role/list", component: RoleListComponent },
   { path: "role/view/:rid", component: RoleDetailComponent },
   { path: "role/edit/:rid", component: RoleDetailComponent },
   { path: "role/create", component: RoleDetailComponent },
   { path: "portfoliolist", component: UsmPortfolioListViewComponent },
   { path: "portfoliolist/:id/:view", component: UsmPortfolioListViewComponent },
   { path: "portfoliolist/create", component: UsmPortfolioListViewComponent },
   { path: "permissionlist", component: UsmRolePermissionComponent },
   { path: "permissionlist/create/permission", component: UsmRolePermissionComponent },
   { path: "permissionlist/:id/:view", component: UsmRolePermissionComponent },
   { path: 'export-import', component: ExportImportComponent },
   { path: "dashconstant", component: DashConstantComponent },
   { path: "dashconstant/:dashconstantid/:dashconstantview", component: DashConstantComponent },
   { path: "theme" , component:ThemeMgmtComponent},
   { path: "subscription", component: OrgDashboardComponent },
   { path: "UserConfiguration", component: UserConfigurationComponent },
   { path: "process", component: ProcessFormComponent },
   { path: "stage", component: StageFormComponent },
   { path: 'copy-blueprint', component: CopyBlueprintComponent },
  ],
 },
];

@NgModule({
 exports: [RouterModule],
 imports: [RouterModule.forChild(routes)],
 declarations: [],
})
export class IampUsmRouteModule {}
