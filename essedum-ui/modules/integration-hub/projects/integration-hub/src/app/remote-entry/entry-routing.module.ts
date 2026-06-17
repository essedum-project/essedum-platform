import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdapterComponent } from '../features/adapter/adapter.component';
import { AdapterCreateEditComponent } from '../features/adapter/adapter-create-edit/adapter-create-edit.component';
import { AdapterDescriptionComponent } from '../features/adapter/adapter-description/adapter-description.component';

import { PipelineComponent } from '../features/pipeline/pipeline.component';
import { NativeScriptComponent } from '../features/native-script/native-script.component';

import { AppListComponent } from '../features/apps/app-list/app-list.component';
import { ViewAppComponent } from '../features/apps/view-app/view-app.component';

import { InstanceComponent } from '../features/instance/instance.component';
import { InstanceCreateEditComponent } from '../features/instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from '../features/instance/instance-description/instance-description.component';

import { JobsComponent } from '../features/jobs/jobs.component';

// Schema moved back to data-ops MFE on 2026-06-03.

// 2026-06-03: moved here from vibe-studio MFE.
import { SpecTemplateComponent } from '../features/spec-template/spec-template.component';
import { CreateSpecTemplateComponent } from '../features/spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from '../features/spec-template/edit-spec-template/edit-spec-template.component';
import { SpecTemplateDescriptionComponent } from '../features/spec-template/spec-template-description/spec-template-description.component';

// Migrated from legacy aip-app-ui (2026-05-25): salus iframe wrapper.
// Dashboard moved to host (shell/landing/dashboard) per MFE plan §1.
import { SalusComponent } from '../features/salus/salus.component';
import { PipelineEditorComponent } from '../features/pipeline/wizard/editor/pipeline-editor.component';

// Routes mount under `/integration/**` per the host manifest (integration.routePath = 'integration').
const routes: Routes = [
  { path: '', redirectTo: 'implementations', pathMatch: 'full' },

  { path: 'salus', component: SalusComponent },

  {
    path: 'implementations',
    children: [
      { path: '', component: AdapterComponent },
      { path: 'create', component: AdapterCreateEditComponent },
      { path: ':adapter', component: AdapterDescriptionComponent },
    ],
  },

  {
    path: 'pipelines',
    children: [
      { path: '', redirectTo: '/landing/agent/pipeline', pathMatch: 'full' },
      { path: 'view/:cname', component: NativeScriptComponent },
      { path: 'view-wizard/:cname', component: PipelineEditorComponent },
    ],
  },
  {
    path: 'training-pipelines',
    children: [
      { path: '', redirectTo: '/landing/agent/pipeline', pathMatch: 'full' },
      { path: 'view-wizard/:cname', component: PipelineEditorComponent },
    ],
  },

  {
    path: 'apps',
    children: [
      { path: '', component: AppListComponent },
      { path: ':name/:type', component: ViewAppComponent },
    ],
  },

  {
    path: 'instances',
    children: [
      { path: '', component: InstanceComponent },
      { path: 'create', component: InstanceCreateEditComponent },
      { path: ':instance', component: InstanceDescriptionComponent },
    ],
  },

  {
    path: 'jobs',
    children: [
      { path: '', component: JobsComponent },
    ],
  },

  // 2026-06-03: /scripts moved here from vibe-studio. NativeScriptComponent
  // was already declared in integration-hub.
  {
    path: 'scripts',
    children: [
      { path: '', component: NativeScriptComponent },
      { path: 'view/:cname', component: NativeScriptComponent },
    ],
  },

  // 2026-06-03: /spec-templates moved here from vibe-studio.
  {
    path: 'spec-templates',
    children: [
      { path: '', component: SpecTemplateComponent },
      { path: 'create', component: CreateSpecTemplateComponent },
      { path: 'edit/:dname', component: EditSpecTemplateComponent },
      { path: ':cname', component: SpecTemplateDescriptionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule { }
