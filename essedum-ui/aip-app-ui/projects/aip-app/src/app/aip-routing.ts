import { RouterModule, Routes } from '@angular/router';
import { ModelComponent } from './model/model.component';
import { ModelCreateComponent } from './model/model.create/model.create.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { PipelineCreateComponent } from './pipeline/pipeline-create/pipeline-create.component';
import { PipelineDescriptionComponent } from './pipeline.description/pipeline.description.component';
import { AipComponent } from './aip.component';
import { DatasourceComponent } from './datasource/datasource.component';
import { DatasetDescriptionComponent } from './dataset/dataset.description/dataset.description.component';
import { SchemaComponent } from './schema/schema.component';
import { AdapterComponent } from './adapter/adapter.component';
import { InstanceComponent } from './instance/instance.component';
import { AppListComponent } from './apps/app-list/app-list.component';
import { SpecTemplateComponent } from './spec-template/spec-template.component';
import { SpecTemplateDescriptionComponent } from './spec-template/spec-template-description/spec-template-description.component';
import { ViewAppComponent } from './apps/view-app/view-app.component';
import { ModelEditsComponent } from './model/model-edit/model-edit.component';
import { ModelDeployComponent } from './model/model-deploy/model-deploy.component';
import { CreateSpecTemplateComponent } from './spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from './spec-template/edit-spec-template/edit-spec-template.component';
import { DatasourceConfigComponent } from './datasource/datasource-config/datasource-config.component';
import { AdapterCreateEditComponent } from './adapter/adapter-create-edit/adapter-create-edit.component';
import { AdapterDescriptionComponent } from './adapter/adapter-description/adapter-description.component';
import { InstanceCreateEditComponent } from './instance/instance-create-edit/instance-create-edit.component';

import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { ConnectionViewComponent } from './datasource/connection-view/connection-view.component';
import { ModalConfigDatasetComponent } from './dataset/modal-config-dataset/modal-config-dataset.component';
import { ModelDescriptionComponent } from './model/model.description/model.description.component';
import { NativeScriptComponent } from './native-script/native-script.component';
import { DatasetEditComponent } from './dataset/dataset-edit/dataset-edit.component';
import { ModalConfigSchemaComponent } from './schema/modal-config-schema/modal-config-schema.component';
import { PaginationComponent } from './pagination/pagination.component';
import { DatasetByNameComponent } from './dataset/dataset-by-name/dataset-by-name.component';
import { ModalConfigComponent } from './model/modal-config/modal-config.component';

const routes: Routes = [
  {
    path: '',
    component: AipComponent,
    children: [
  
      {
        path: 'models',
        children: [
          { path: '', component: ModelComponent },
          { path: 'create', component: ModalConfigComponent },
          { path: 'edit-model/:id', component: ModalConfigComponent },
          { path: 'preview/:cname/:name', component: ModelCreateComponent }, 
          { path: 'preview/:id', component: ModelDescriptionComponent },
        ],
      },
      
     
      {
        path: 'pagination',
        children: [
          { path: '', component: PaginationComponent },
        ],
      },
      {
        path: 'pipelines',
        children: [
          { path: '', component: PipelineComponent },
        
          { path: 'view/:cname', component: NativeScriptComponent },
    
        ],
      },
      {
        path: 'app-list',
        component: AppListComponent,
      },
      {
        path: 'app/:name/:type',
        component: ViewAppComponent,
      },
      
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
        path: 'datasets',
        children: [
          { path: '', component: DatasetByNameComponent },
          { path: 'create', component: ModalConfigDatasetComponent },
          { path: 'data', component: DatasetEditComponent },
           { path: ':type', component: DatasetByNameComponent },
           {
             path: 'view/:cname',
             children: [
              { path: '', component: DatasetDescriptionComponent },
              
             ],
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

    ],
  },
  

];

export const AipRouting = RouterModule.forChild(routes);
