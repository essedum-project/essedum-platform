import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


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
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
