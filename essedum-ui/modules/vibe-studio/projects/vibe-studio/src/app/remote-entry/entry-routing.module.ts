import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout
import { AipComponent } from '../features/aip/aip.component';

// Features
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { ModelComponent } from '../features/model/model.component';
import { ModalConfigComponent } from '../features/model/modal-config/modal-config.component';
import { ModelDescriptionComponent } from '../features/model/model.description/model.description.component';
import { PaginationComponent } from '../features/pagination/pagination.component';
import { PipelineComponent } from '../features/pipeline/pipeline.component';
import { PipelineEditorComponent } from '../features/pipeline/wizard/editor/pipeline-editor.component';
import { NativeScriptComponent } from '../features/native-script/native-script.component';
import { AgentPipelineDashboardComponent } from '../features/agent-pipeline/agent-pipeline-dashboard/agent-pipeline-dashboard.component';
import { AgentPipelineComponent } from '../features/agent-pipeline/agent-pipeline.component';
import { AgentComponent } from '../features/agent/agent.component';
import { LitellmComponent } from '../features/litellm/litellm.component';
import { LangfuseComponent } from '../features/langfuse/langfuse.component';
import { SalusComponent } from '../features/salus/salus.component';
import { AppListComponent } from '../features/apps/app-list/app-list.component';
import { ViewAppComponent } from '../features/apps/view-app/view-app.component';
import { DatasourceComponent } from '../features/datasource/datasource.component';
import { DatasourceConfigComponent } from '../features/datasource/datasource-config/datasource-config.component';
import { ConnectionViewComponent } from '../features/datasource/connection-view/connection-view.component';
import { AgentDirectoryComponent } from '../features/agent-directory/agent-directory.component';
import { AgentDirectoryViewComponent } from '../features/agent-directory/agent-directory-view/agent-directory-view.component';
import { AgentDirectoryEditComponent } from '../features/agent-directory/agent-directory-edit/agent-directory-edit.component';
import { DatasetByNameComponent } from '../features/dataset/dataset-by-name/dataset-by-name.component';
import { ModalConfigDatasetComponent } from '../features/dataset/modal-config-dataset/modal-config-dataset.component';
import { DatasetEditComponent } from '../features/dataset/dataset-edit/dataset-edit.component';
import { DatasetDescriptionComponent } from '../features/dataset/dataset.description/dataset.description.component';
import { SchemaComponent } from '../features/schema/schema.component';
import { ModalConfigSchemaComponent } from '../features/schema/modal-config-schema/modal-config-schema.component';
import { AdapterComponent } from '../features/adapter/adapter.component';
import { AdapterCreateEditComponent } from '../features/adapter/adapter-create-edit/adapter-create-edit.component';
import { AdapterDescriptionComponent } from '../features/adapter/adapter-description/adapter-description.component';
import { InstanceComponent } from '../features/instance/instance.component';
import { InstanceCreateEditComponent } from '../features/instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from '../features/instance/instance-description/instance-description.component';
import { SpecTemplateComponent } from '../features/spec-template/spec-template.component';
import { CreateSpecTemplateComponent } from '../features/spec-template/create-spec-template/create-spec-template.component';
import { SpecTemplateDescriptionComponent } from '../features/spec-template/spec-template-description/spec-template-description.component';
import { EditSpecTemplateComponent } from '../features/spec-template/edit-spec-template/edit-spec-template.component';
import { VibeStudioComponent } from '../features/vibe-studio/vibe-studio/vibe-studio.component';

const routes: Routes = [
  {
    path: '',
    component: AipComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        children: [{ path: '', component: DashboardComponent }],
      },
      {
        path: 'models',
        children: [
          { path: '', component: ModelComponent },
          { path: 'create', component: ModalConfigComponent },
          { path: 'edit-model/:id', component: ModalConfigComponent },
          { path: 'preview/:id', component: ModelDescriptionComponent },
        ],
      },
      {
        path: 'pagination',
        children: [{ path: '', component: PaginationComponent }],
      },
      {
        path: 'pipelines',
        children: [
          { path: '', component: PipelineComponent },
          { path: 'view/:cname', component: NativeScriptComponent },
          { path: 'view-wizard/:cname', component: PipelineEditorComponent },
        ],
      },
      {
        path: 'training-pipelines',
        children: [
          { path: '', component: PipelineComponent },
          { path: 'view-wizard/:cname', component: PipelineEditorComponent },
        ],
      },
      {
        path: 'agent-pipeline',
        children: [
          { path: '', component: AgentPipelineDashboardComponent },
          { path: 'view/:cname', component: AgentPipelineComponent },
        ],
      },
      {
        path: 'agent',
        children: [{ path: '', component: AgentComponent }],
      },
      {
        path: 'lite-llm',
        children: [{ path: '', component: LitellmComponent }],
      },
      {
        path: 'langfuse',
        children: [{ path: '', component: LangfuseComponent }],
      },
      {
        path: 'salus',
        children: [{ path: '', component: SalusComponent }],
      },
      { path: 'app-list', component: AppListComponent },
      { path: 'app/:name/:type', component: ViewAppComponent },
      {
        path: 'connections',
        children: [
          { path: '', component: DatasourceComponent },
          { path: 'create', component: DatasourceConfigComponent },
          { path: 'create-new', component: DatasourceConfigComponent },
          { path: 'view/:name/:view', component: ConnectionViewComponent },
          { path: 'edit/:name/:edit', component: ConnectionViewComponent },
          { path: 'preview/:name', component: ConnectionViewComponent },
        ],
      },
      {
        path: 'agent-directory',
        children: [
          { path: '', component: AgentDirectoryComponent },
          { path: 'create', component: DatasourceConfigComponent },
          { path: 'view/:name', component: AgentDirectoryViewComponent },
          { path: 'edit/:name', component: AgentDirectoryEditComponent },
          { path: 'add', component: AgentDirectoryEditComponent },
        ],
      },
      {
        path: 'datasets',
        children: [
          { path: '', component: DatasetByNameComponent },
          { path: 'create', component: ModalConfigDatasetComponent },
          { path: 'data', component: DatasetEditComponent },
          { path: ':type', component: DatasetByNameComponent },
          {
            path: 'view/:cname',
            children: [{ path: '', component: DatasetDescriptionComponent }],
          },
        ],
      },
      {
        path: 'schemas',
        children: [
          { path: '', component: SchemaComponent },
          { path: 'create', component: ModalConfigSchemaComponent },
          { path: 'view', component: ModalConfigSchemaComponent },
          { path: 'edit', component: ModalConfigSchemaComponent },
        ],
      },
      {
        path: 'implementations',
        children: [
          { path: '', component: AdapterComponent },
          { path: 'create', component: AdapterCreateEditComponent },
          { path: ':adapter', component: AdapterDescriptionComponent },
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
        path: 'specs',
        children: [
          { path: '', component: SpecTemplateComponent },
          { path: 'create', component: CreateSpecTemplateComponent },
          { path: ':cname', component: SpecTemplateDescriptionComponent },
          { path: 'edit/:dname', component: EditSpecTemplateComponent },
        ],
      },
      {
        path: 'core-datasources',
        children: [
          { path: '', component: DatasourceComponent },
          { path: 'create', component: DatasourceConfigComponent },
          { path: 'view/:name/:view', component: ConnectionViewComponent },
          { path: 'edit/:name/:edit', component: ConnectionViewComponent },
          { path: 'preview/:name', component: ConnectionViewComponent },
        ],
      },
      {
        path: 'vibe-studio',
        children: [{ path: '', component: VibeStudioComponent }],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}
