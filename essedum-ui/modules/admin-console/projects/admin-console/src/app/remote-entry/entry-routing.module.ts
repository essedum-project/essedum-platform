import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from '../shell/shell.component';
import { OverviewComponent } from '../features/overview/overview.component';
import { TenancyComponent } from '../features/tenancy/tenancy.component';
import { AccessComponent } from '../features/access/access.component';
import { PublishingComponent } from '../features/publishing/publishing.component';
import { CatalogComponent } from '../features/catalog/catalog.component';
import { ApprovalsComponent } from '../features/approvals/approvals.component';
import { AuditComponent } from '../features/audit/audit.component';
import { IdentitySyncComponent } from '../features/identity-sync/identity-sync.component';
import { MenuConfigurationComponent } from '../features/menu-configuration/menu-configuration.component';
import { MyDetailsComponent } from '../features/my-details/my-details.component';
import { RankGuard } from '../core/rank.guard';

// Routes mount under `/admin-console/**` per the host manifest (routePath = 'admin-console').
// minRank thresholds mirror the rbac_menu_item seed (changelog/rbac/rbac.xml):
// project_admin=2, org_admin=3, platform_admin=4.
const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent, canActivate: [RankGuard], data: { minRank: 2 } },
      { path: 'tenancy', component: TenancyComponent, canActivate: [RankGuard], data: { minRank: 2 } },
      { path: 'access', component: AccessComponent, canActivate: [RankGuard], data: { minRank: 2 } },
      { path: 'publishing', component: PublishingComponent, canActivate: [RankGuard], data: { minRank: 1 } },
      { path: 'catalog', component: CatalogComponent, canActivate: [RankGuard], data: { minRank: 1 } },
      { path: 'approvals', component: ApprovalsComponent, canActivate: [RankGuard], data: { minRank: 2 } },
      { path: 'audit', component: AuditComponent, canActivate: [RankGuard], data: { minRank: 3 } },
      { path: 'identity-sync', component: IdentitySyncComponent, canActivate: [RankGuard], data: { minRank: 3 } },
      { path: 'menu-configuration', component: MenuConfigurationComponent, canActivate: [RankGuard], data: { minRank: 4 } },
      { path: 'my-details', component: MyDetailsComponent, canActivate: [RankGuard], data: { minRank: 1 } },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}

