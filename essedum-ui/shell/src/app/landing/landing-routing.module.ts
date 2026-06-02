import { loadRemoteModule } from '@angular-architects/module-federation';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { AppHomeComponent } from './app-home/app-home.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { LandingComponent } from './landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Legacy → new-MFE redirects (router-level fallback).
// The sidebar's URL_REMAP rewrites menu hrefs before render, but other code
// paths (iamp-usm library's internal navigation, hard-coded
// router.navigate(['/landing/aip/...']) calls, bookmarks, DashConsts records
// the sidebar didn't walk) still emit raw legacy URLs. Registering these as
// proper router redirects catches every caller without us having to find them.
// Remove once DashConsts and downstream libs are fully migrated to the new paths.
const LEGACY_REDIRECTS: Routes = [
  // Data Ops
  { path: 'aip/datasets',         redirectTo: 'data/datasets',     pathMatch: 'full' },
  { path: 'aip/datasources',      redirectTo: 'data/connections',  pathMatch: 'full' },
  { path: 'aip/connections',      redirectTo: 'data/connections',  pathMatch: 'full' },
  { path: 'aip/models',           redirectTo: 'data/models',       pathMatch: 'full' },
  { path: 'aip/schemas',          redirectTo: 'integration/schemas',      pathMatch: 'full' },
  { path: 'aibrain/datasets',     redirectTo: 'data/datasets',     pathMatch: 'full' },
  { path: 'aibrain/datasources',  redirectTo: 'data/connections',  pathMatch: 'full' },
  { path: 'aibrain/connections',  redirectTo: 'data/connections',  pathMatch: 'full' },
  { path: 'aibrain/coreDatasources', redirectTo: 'data/connections', pathMatch: 'full' },
  { path: 'aibrain/models',       redirectTo: 'data/models',       pathMatch: 'full' },
  { path: 'aibrain/schemas',      redirectTo: 'integration/schemas',      pathMatch: 'full' },

  // Agents
  { path: 'aip/agent',            redirectTo: 'agent/studio',      pathMatch: 'full' },
  { path: 'aip/agent-pipeline',   redirectTo: 'agent/pipeline',    pathMatch: 'full' },
  { path: 'aip/agent-directory',  redirectTo: 'agent/directory',   pathMatch: 'full' },
  { path: 'aibrain/agent',        redirectTo: 'agent/studio',      pathMatch: 'full' },
  { path: 'aibrain/agents',       redirectTo: 'agent/pipeline',    pathMatch: 'full' },
  { path: 'aibrain/agent-directory', redirectTo: 'agent/directory', pathMatch: 'full' },
  { path: 'aip/lite-llm',         redirectTo: 'agent/litellm',     pathMatch: 'full' },
  { path: 'aip/litellm',          redirectTo: 'agent/litellm',     pathMatch: 'full' },
  { path: 'aibrain/litellm',      redirectTo: 'agent/litellm',     pathMatch: 'full' },
  { path: 'aip/langfuse',         redirectTo: 'agent/langfuse',    pathMatch: 'full' },
  { path: 'aibrain/langfuse',     redirectTo: 'agent/langfuse',    pathMatch: 'full' },

  // Integration
  { path: 'aip/pipelines',        redirectTo: 'integration/pipelines',       pathMatch: 'full' },
  { path: 'aip/implementations',  redirectTo: 'integration/implementations', pathMatch: 'full' },
  { path: 'aip/app-list',         redirectTo: 'integration/apps',            pathMatch: 'full' },
  { path: 'aip/apps',             redirectTo: 'integration/apps',            pathMatch: 'full' },
  { path: 'aip/instances',        redirectTo: 'integration/instances',       pathMatch: 'full' },
  { path: 'aip/jobs',             redirectTo: 'integration/jobs',            pathMatch: 'full' },
  { path: 'aibrain/pipelines',    redirectTo: 'integration/pipelines',       pathMatch: 'full' },
  { path: 'aibrain/jobs/chain',   redirectTo: 'integration/jobs',            pathMatch: 'full' },
  { path: 'aibrain/jobs/scheduled', redirectTo: 'integration/jobs',          pathMatch: 'full' },
  { path: 'aibrain/jobs/logs',    redirectTo: 'integration/jobs',            pathMatch: 'full' },
  // Dashboard now owned by host (was temporarily in integration MFE)
  { path: 'aip/dashboard',        redirectTo: 'dashboard',                   pathMatch: 'full' },
  { path: 'aibrain/dashboard',    redirectTo: 'dashboard',                   pathMatch: 'full' },
  { path: 'integration/dashboard',redirectTo: 'dashboard',                   pathMatch: 'full' },
  { path: 'aip/salus',            redirectTo: 'integration/salus',           pathMatch: 'full' },
  { path: 'aibrain/salus',        redirectTo: 'integration/salus',           pathMatch: 'full' },

  // Vibe Studio
  { path: 'aip/vibe-studio',      redirectTo: 'vibe/editor',         pathMatch: 'full' },
  { path: 'aip/specs',            redirectTo: 'vibe/spec-templates', pathMatch: 'full' },
];

export const routes: Routes = [
  {
    path: '', component: LandingComponent, children: [
      {
        path: '', canActivate: [AuthGuardService], component: AppHomeComponent
      },

      // Cross-MFE platform dashboard — owned by the host per MFE plan §1.
      { path: 'dashboard', canActivate: [AuthGuardService], component: DashboardComponent },

      ...LEGACY_REDIRECTS,

      {
        path: "feature/:name", component: AppNavigationComponent
      },
      {
        path: "feature1/:name", component: AppNavigationComponent
      },
        {
        path: "iamp-usm",
        loadChildren: () => import('../../../projects/iamp-usm/src/public-api').then(m => m.IampUsmModule),
      },
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
