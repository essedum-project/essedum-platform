import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: "resetpassword/:email", component: LogoutComponent },
  { path: "error", component: LogoutComponent },
  {
    path: "registerNewUser",
    loadChildren: () => import('./register-user/register-user.module').then(m => m.RegisterUserModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
