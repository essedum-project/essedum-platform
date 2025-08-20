import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleListComponent } from "./components/role-list/role-list.component";
import { RoleDetailComponent } from "./components/role-detail/role-detail.component";
import { SecretsComponent } from "./components/secrets/secrets.component";
import { ProjectListViewComponent } from "./components/project/project-list-view.component";
import { ProjectDetailComponent } from "./components/project-detail/project-detail.component";
const routes: Routes = [
    {
        path: "",
        component: SecretsComponent,
        children: [

            { path: "secret", component: SecretsComponent },
            { path: "secret/:key/:type", component: SecretsComponent },

        ],
    },
    {
        path: "",
        component: RoleListComponent,
        children: [

            { path: "role/list", component: RoleListComponent },



        ],
    },
    { path: "role/view/:rid", component: RoleDetailComponent },
    { path: "role/edit/:rid", component: RoleDetailComponent },
    { path: "role/create", component: RoleDetailComponent },
     {
        path: "",
        component: ProjectListViewComponent,
        children: [
           
           { path: "projectlist", component: ProjectListViewComponent },
           
        ],
    },
    { path: "projectlist/:projectid/:view", component: ProjectDetailComponent },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
