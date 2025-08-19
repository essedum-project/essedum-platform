import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleListComponent } from "./components/role-list/role-list.component";
import { SecretsComponent } from "./components/secrets/secrets.component";
import { PortfolioListViewComponent } from "./components/portfolio/portfolio-list-view.component";
import { PortfolioAddComponent } from "./components/portfolio/portfolio-add/portfolio-add.component";
import { UsmRolePermissionComponent } from "./components/usm-role-permission/usm-role-permission.component";
const routes: Routes = [
           
            { path: "secret", component: SecretsComponent},
            { path: "secret/:key/:type", component: SecretsComponent},
            { path: "portfoliolist", component: PortfolioListViewComponent },
            { path: "portfoliolist/:id/:view", component: PortfolioAddComponent },
            { path: "portfoliolist/create", component: PortfolioAddComponent },
            { path: "role/list", component: RoleListComponent },
            { path: "permissionlist", component: UsmRolePermissionComponent },
            { path: "permissionlist/create/permission", component: UsmRolePermissionComponent },
            { path: "permissionlist/:id/:view", component: UsmRolePermissionComponent },

];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
