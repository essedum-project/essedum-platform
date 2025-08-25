import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


import { SecretsComponent } from "./components/secrets/secrets.component";
import { DashConstantComponent } from "./entities/dash-constant/dash-constant.component";
const routes: Routes = [
    { path: "dashconstant", component: DashConstantComponent },
    { path: "dashconstant/:dashconstantid/:dashconstantview", component: DashConstantComponent },
    { path: "dashconstant/:configtype/:dashconstantid/:dashconstantview", component: DashConstantComponent },
    { path: "dashconstant/:configtype", component: DashConstantComponent },
    {
        path: "",
        component: SecretsComponent,
        children: [

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
