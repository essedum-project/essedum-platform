import { loadRemoteModule } from '@angular-architects/module-federation';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { AppHomeComponent } from './app-home/app-home.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { LandingComponent } from './landing.component';
import { StaticLandingComponent } from './static-landing/static-landing.component';

export const routes: Routes = [
  {
    path: '', component: LandingComponent, children: [
      {
        path: '', canActivate: [AuthGuardService], component: AppHomeComponent
      },
      
      {
        path: "feature/:name", component: AppNavigationComponent
      },
      {
        path: "feature1/:name", component: AppNavigationComponent
      },
      {
        path: "virtual-cc", component: StaticLandingComponent
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
