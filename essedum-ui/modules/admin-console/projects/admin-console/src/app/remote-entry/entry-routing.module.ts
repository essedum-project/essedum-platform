import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from '../shell/shell.component';
import { OverviewComponent } from '../features/overview/overview.component';
import { TenancyComponent } from '../features/tenancy/tenancy.component';
import { AccessComponent } from '../features/access/access.component';
import { PublishingComponent } from '../features/publishing/publishing.component';
import { ApprovalsComponent } from '../features/approvals/approvals.component';
import { AuditComponent } from '../features/audit/audit.component';
import { MenuConfigurationComponent } from '../features/menu-configuration/menu-configuration.component';

// Routes mount under `/admin-console/**` per the host manifest (routePath = 'admin-console').
const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'tenancy', component: TenancyComponent },
      { path: 'access', component: AccessComponent },
      { path: 'publishing', component: PublishingComponent },
      { path: 'approvals', component: ApprovalsComponent },
      { path: 'audit', component: AuditComponent },
      { path: 'menu-configuration', component: MenuConfigurationComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}
