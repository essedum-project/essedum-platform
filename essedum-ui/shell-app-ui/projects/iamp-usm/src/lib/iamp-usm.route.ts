import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleListComponent } from "./components/role-list/role-list.component";

import { SecretsComponent } from "./components/secrets/secrets.component";
import { UsmPortfolioListViewComponent } from "./components/usm-portfolio/usm-portfolio-list-view.component";
import { UsmPortfolioAddComponent } from "./components/usm-portfolio/usm-portfolio-add/usm-portfolio-add.component";
const routes: Routes = [
           
            { path: "secret", component: SecretsComponent},
            { path: "secret/:key/:type", component: SecretsComponent},
            { path: "portfoliolist", component: UsmPortfolioListViewComponent },
            { path: "portfoliolist/:id/:view", component: UsmPortfolioAddComponent },
            { path: "portfoliolist/create", component: UsmPortfolioAddComponent },
            { path: "role/list", component: RoleListComponent },

];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
