import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: "",
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'landing',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  }

];
@NgModule({
  exports: [RouterModule],
  // The initalNavigation has to be disabled, this is required for OAUTH
  imports: [RouterModule.forRoot(routes, { useHash: true, initialNavigation: 'disabled' })],
  declarations: []
})
export class AppRoutingModule { }
