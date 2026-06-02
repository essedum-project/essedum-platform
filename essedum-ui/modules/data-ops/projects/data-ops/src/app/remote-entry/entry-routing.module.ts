import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DatasetByNameComponent } from '../features/dataset/dataset-by-name/dataset-by-name.component';
import { DatasetDescriptionComponent } from '../features/dataset/dataset.description/dataset.description.component';
import { DatasetEditComponent } from '../features/dataset/dataset-edit/dataset-edit.component';
import { ModalConfigDatasetComponent } from '../features/dataset/modal-config-dataset/modal-config-dataset.component';

import { ModelComponent } from '../features/model/model.component';
import { ModelDescriptionComponent } from '../features/model/model.description/model.description.component';
import { ModalConfigComponent } from '../features/model/modal-config/modal-config.component';

import { DatasourceComponent } from '../features/datasource/datasource.component';
import { DatasourceConfigComponent } from '../features/datasource/datasource-config/datasource-config.component';
import { ConnectionViewComponent } from '../features/datasource/connection-view/connection-view.component';

// Routes are mounted at /data/** by the host (manifest entry data-ops.routePath = 'data').
// RouterModule.forChild ONLY — never forRoot in a remote.
const routes: Routes = [
  { path: '', redirectTo: 'datasets', pathMatch: 'full' },

  {
    path: 'datasets',
    children: [
      { path: '', component: DatasetByNameComponent },
      { path: 'create', component: ModalConfigDatasetComponent },
      { path: 'data', component: DatasetEditComponent },
      { path: ':type', component: DatasetByNameComponent },
      { path: 'view/:cname', component: DatasetDescriptionComponent },
    ],
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
    path: 'core-datasources',
    children: [
      { path: '', component: DatasourceComponent },
      { path: 'create', component: DatasourceConfigComponent },
      { path: 'view/:name/:view', component: ConnectionViewComponent },
      { path: 'edit/:name/:edit', component: ConnectionViewComponent },
      { path: 'preview/:name', component: ConnectionViewComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}
