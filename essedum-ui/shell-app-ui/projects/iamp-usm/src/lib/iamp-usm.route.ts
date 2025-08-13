import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleListComponent } from "./components/role-list/role-list.component";

import { SecretsComponent } from "./components/secrets/secrets.component";
const routes: Routes = [
    {
        path: "",
        component: SecretsComponent,
        children: [
           
            { path: "secret", component: SecretsComponent},
            { path: "secret/:key/:type", component: SecretsComponent},
          
        ],
    },
        {
        path: "",
        component: RoleListComponent,
        children: [
           
            { path: "role/list", component: RoleListComponent },
          
        ],
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
