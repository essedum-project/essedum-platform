import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleListComponent } from "./components/role-list/role-list.component";
import { RoleDetailComponent } from "./components/role-detail/role-detail.component";
import { SecretsComponent } from "./components/secrets/secrets.component";
import { DashConstantComponent } from "./entities/dash-constant/dash-constant.component";
import { ProjectListViewComponent } from "./components/project/project-list-view.component";
import { ProjectDetailComponent } from "./components/project-detail/project-detail.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { PortfolioListViewComponent } from "./components/portfolio/portfolio-list-view.component";
import { PortfolioAddComponent } from "./components/portfolio/portfolio-add/portfolio-add.component";
import { UsmRolePermissionComponent } from "./components/usm-role-permission/usm-role-permission.component";
import { IampUsmComponent } from "./iamp-usm.component";

const routes: Routes = [
    { path: "dashconstant", component: DashConstantComponent },
    { path: "dashconstant/:dashconstantid/:dashconstantview", component: DashConstantComponent },
    { path: "dashconstant/:configtype/:dashconstantid/:dashconstantview", component: DashConstantComponent },
    { path: "dashconstant/:configtype", component: DashConstantComponent },
    {
        path: "",
        component: IampUsmComponent,
        children: [

            { path: "secret", component: SecretsComponent },
            { path: "secret/:key/:type", component: SecretsComponent },
            { path: "manageUsers", component: ManageUsersComponent },
            { path: "manageUsers/:uid/:view", component: ManageUsersComponent },
            { path: "projectlist", component: ProjectListViewComponent },
            { path: "projectlist/:projectid/:view", component: ProjectDetailComponent },
            { path: "role/list", component: RoleListComponent },
            { path: "role/view/:rid", component: RoleDetailComponent },
            { path: "role/edit/:rid", component: RoleDetailComponent },
            { path: "role/create", component: RoleDetailComponent },
            { path: "portfoliolist", component: PortfolioListViewComponent },
            { path: "portfoliolist/:id/:view", component: PortfolioAddComponent },
            { path: "portfoliolist/create", component: PortfolioAddComponent },
            { path: "permissionlist", component: UsmRolePermissionComponent },
            { path: "permissionlist/create/permission", component: UsmRolePermissionComponent },
            { path: "permissionlist/:id/:view", component: UsmRolePermissionComponent },
            { path: "secret", component: SecretsComponent },
            { path: "secret/:key/:type", component: SecretsComponent },
        ],
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
