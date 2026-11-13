import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IampUsmComponent } from "./iamp-usm.component";

// RBAC cutover (plan §7): projectlist/portfoliolist/role/manageUsers/
// permissionlist/dashconstant/secret all moved out — admin-console (or,
// for secret, nothing yet) is the replacement. No iamp-usm routes remain
// besides the empty shell wrapper.
const routes: Routes = [
    {
        path: "",
        component: IampUsmComponent,
        children: [],
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
    declarations: [],
})
export class IampUsmRouteModule { }
