// import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { HomepageComponent } from './homepage/homepage.component';
import { ModelComponent } from './model/model.component';
import { ModelCreateComponent } from './model/model.create/model.create.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { PipelineCreateComponent } from './pipeline/pipeline-create/pipeline-create.component';
//import { PipelineDescriptionComponent } from './pipeline.description/pipeline.description.component';
// import { EndpointComponent } from './endpoint/endpoint.component';
import { AipComponent } from './aip.component';
import { DatasourceComponent } from './datasource/datasource.component';
// import { DatasourceComponent } from './datasource/datasource.component';
// import { DatasourceDescriptionComponent } from './datasource/datasource.description/datasource.description.component';
// import { DatasetComponent } from './dataset/dataset.component';
// import { DatasetDescriptionComponent } from './dataset/dataset.description/dataset.description.component';
// import { EndpointViewComponent } from './endpoint/endpoint-view/endpoint-view.component';
// import { EndpointEditComponent } from './endpoint/endpoint-edit/endpoint-edit.component';
// import { CreateEndpointComponent } from './endpoint/create-endpoint/create-endpoint.component';
// import { DrawFlowComponent } from './draw-flow/draw-flow.component';
// import { SchemaComponent } from './schema/schema.component';
// import { AdapterComponent } from './adapter/adapter.component';
// import { InstanceComponent } from './instance/instance.component';
// import { AppListComponent } from './apps/app-list/app-list.component';
// import { SpecTemplateComponent } from './spec-template/spec-template.component';
// import { SpecTemplateDescriptionComponent } from './spec-template/spec-template-description/spec-template-description.component';

// import { ViewAppComponent } from './apps/view-app/view-app.component';
import { ModelEditsComponent } from './model/model-edit/model-edit.component';
import { ModelDeployComponent } from './model/model-deploy/model-deploy.component';
// import { FeatureStoreComponent } from './feature-store/feature-store.component';
// import { CreateSpecTemplateComponent } from './spec-template/create-spec-template/create-spec-template.component';
// import { EditSpecTemplateComponent } from './spec-template/edit-spec-template/edit-spec-template.component';
import { DatasourceConfigComponent } from './datasource/datasource-config/datasource-config.component';
// import { CreateFeaturestoreComponent } from './feature-store/create-featurestore/create-featurestore.component';
// import { AdapterDescriptionComponent } from './adapter/adapter-description/adapter-description.component';
// import { EditFeatureStoreComponent } from './feature-store/edit-feature-store/edit-feature-store.component';
// import { InstanceCreateEditComponent } from './instance/instance-create-edit/instance-create-edit.component';
// import { TemplateComponent } from './template/template.component';
// //import { ChainPipelineComponent } from './chain-pipeline/chain-pipeline.component';
// import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { ConnectionViewComponent } from './datasource/connection-view/connection-view.component';
import { ModalConfigDatasetComponent } from './dataset/modal-config-dataset/modal-config-dataset.component';
import { ModelDescriptionComponent } from './model/model.description/model.description.component';
// import { EndpointDescriptionComponent } from './endpoint/endpoint-description/endpoint-description.component';
// import { NativeScriptComponent } from './native-script/native-script.component';
// import { DatasetEditComponent } from './dataset/dataset-edit/dataset-edit.component';
// import { PluginComponent } from './plugin/plugin.component';
// import { ModalConfigSchemaComponent } from './schema/modal-config-schema/modal-config-schema.component';
// import { EditDeleteTagsComponent } from './edit-delete-tags/edit-delete-tags.component';

// import { RelationshipComponent } from './schema/relationship/relationship.component';
// import { TicketlistComponent } from './ticketlist/ticketlist.component';
// import { FeatureStoreDescriptionComponent } from './feature-store/feature-store-description/feature-store-description.component';

// import { DgInstanceComponent } from './digital-brain/dg-instance/dg-instance.component';
// import { DgAppComponent } from './digital-brain/dg-app/dg-app.component';

// // import { VideoSoltionComponent } from './video-soltion/video-soltion.component';
// import { DatasetTemplateComponent } from './dataset/dataset-template/dataset-template.component';
// import { ClusterTicketsComponent } from './cluster-tickets/cluster-tickets.component';
// import { ConstantsComponent } from './constants/constants.component';
// import { CreateDgappComponent } from './digital-brain/dg-app/create-dgapp/create-dgapp.component';
// import { DgAppDescriptionComponent } from './digital-brain/dg-app/dg-app-description/dg-app-description.component';
// import { TicketlistdetailsComponent } from './ticketlistdetails/ticketlistdetails.component';
// import { RaiCheckListComponent } from './rai-check-list/rai-check-list.component';
// import { TicketlistsummitComponent } from './ticketlistsummit/ticketlistsummit.component';
// import { EditDgappComponent } from './digital-brain/dg-app/edit-dgapp/edit-dgapp.component';
// import { CreateDgtoolComponent } from './digital-brain/dg-instance/create-dgtool/create-dgtool.component';
// import { DgToolDescriptionComponent } from './digital-brain/dg-instance/dg-tool-description/dg-tool-description.component';
// import { EditDgToolComponent } from './digital-brain/dg-instance/edit-dg-tool/edit-dg-tool.component';

// import { MashupsComponent } from './mashups/mashups.component';
// import { MashupCreateComponent } from './mashups/mashup-create/mashup-create.component';
// import { MashupViewWrapperComponent } from './mashups/mashup-view-wrapper/mashup-view-wrapper.component';
// import { ManageGroupComponent } from './digital-brain/dg-app/manage-group/manage-group.component';
// import { EditManageGroupComponent } from './digital-brain/dg-app/edit-manage-group/edit-manage-group.component';
// import { CustomListboxComponent } from './digital-brain/custom-listbox/custom-listbox.component';
// import { AssignAppsComponent } from './digital-brain/assign-apps/assign-apps.component';
import { PaginationComponent } from './pagination/pagination.component';
// import { AgentComponent } from './digital-brain/agent/agent.component';
// import { AgentDescriptionComponent } from './digital-brain/agent/agent-description/agent-description.component';
// import { CreateAgentComponent } from './digital-brain/agent/create-agent/create-agent.component';
// import { WranglingComponent } from './dataset/wrangling/wrangling.component';
// import { DataAnalyticsComponent } from './dataset/data-analytics/data-analytics.component';
// import { DataMiningComponent } from './data-mining/data-mining.component';

// import { AipRatingViewComponent } from './aip-rating/aip-rating-view/aip-rating-view.component';
import { DatasetByNameComponent } from './dataset/dataset-by-name/dataset-by-name.component';
import { InstanceComponent } from './instance/instance.component';
import { InstanceCreateEditComponent } from './instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { SpecTemplateComponent } from './spec-template/spec-template.component';
import { CreateSpecTemplateComponent } from './spec-template/create-spec-template/create-spec-template.component';
import { SpecTemplateDescriptionComponent } from './spec-template/spec-template-description/spec-template-description.component';
import { EditSpecTemplateComponent } from './spec-template/edit-spec-template/edit-spec-template.component';
import { AdapterDescriptionComponent } from './adapter/adapter-description/adapter-description.component';
import { AdapterComponent } from './adapter/adapter.component';
import { AdapterCreateEditComponent } from './adapter/adapter-create-edit/adapter-create-edit.component';

// import { ClusteringComponent } from './clustering/clustering.component';

const routes: Routes = [
  {
    path: '',
    component: AipComponent,
    children: [
      // { path: '', redirectTo: 'home', pathMatch: 'full' },
      //{ path: 'home', component: HomepageComponent },

      {
        path: 'models',
        children: [
          { path: '', component: ModelComponent },
          { path: 'preview/:cname/:name', component: ModelCreateComponent },
          { path: 'edit/:name', component: ModelEditsComponent },
          { path: 'deploy/:name', component: ModelDeployComponent },
          { path: 'preview/:name', component: ModelDescriptionComponent },
        ],
      },
      // {
      //   path: 'featurestore',
      //   children: [
      //     { path: '', component: FeatureStoreComponent },
      //     {
      //       path: 'preview/:name',
      //       component: FeatureStoreDescriptionComponent,
      //     },
      //     { path: 'view/:cname/:name', component: CreateFeaturestoreComponent },
      //     { path: 'edit/:name', component: EditFeatureStoreComponent },
      //   ],
      // },
      // {
      //   path: 'dgThoughts',
      //   children: [
      //     { path: '', component: DgInstanceComponent },
      //     { path: 'preview/:name', component: DgToolDescriptionComponent },
      //     { path: 'view/:cname', component: CreateDgtoolComponent },
      //     { path: 'edit/:name', component: EditDgToolComponent },
      //   ],
      // },
      // {
      //   path: 'dg',
      //   children: [
      //     { path: '', component: DgAppComponent },
      //     { path: 'preview/:name', component: DgAppDescriptionComponent },
      //     { path: 'assign', component: AssignAppsComponent },
      //     { path: 'view/:cname/:name', component: CreateDgappComponent },
      //     { path: 'edit/:name', component: EditDgappComponent },
      //   ],
      // },
      // {
      //   path: 'manage',
      //   children: [
      //     { path: '', component: ManageGroupComponent },
      //     { path: 'edit/:name/:id', component: EditManageGroupComponent },
      //   ],
      // },
      // {
      //   path: 'agent',
      //   children: [
      //     { path: '', component: AgentComponent },
      //     { path: 'preview/:name', component: AgentDescriptionComponent },
      //     { path: 'view/:cname/:name', component: CreateAgentComponent },
      //   ],
      // },
      {
        path: 'pagination',
        children: [
          { path: '', component: PaginationComponent },
          //   //   { path: 'edit/:name/:id', component: EditManageGroupComponent },
        ],
      },
      {
        path: 'pipelines',
        children: [
          { path: '', component: PipelineComponent },
          // { path: 'create', component: PipelineCreateComponent },
          // { path: 'full-screen', component: DrawFlowComponent },
         // { path: 'view/drgndrp/:cname', component: PipelineDescriptionComponent },
          // { path: 'view/:cname', component: NativeScriptComponent },
          //{path:'related/:name',component:PipelineDescriptionComponent},
          // { path: 'preview/:name', component: PipelineComponent },
        ],
      },
      // {
      //   path: 'app-list',
      //   component: AppListComponent,
      // },
      // {
      //   path: 'app/:name/:type',
      //   component: ViewAppComponent,
      // },
      // {
      //   path: 'endpoints',
      //   children: [
      //     { path: '', component: EndpointComponent },
      //     { path: 'preview/:name', component: EndpointDescriptionComponent },
      //     { path: 'edit', component: EndpointEditComponent },
      //     {
      //       path: 'preview/tryout/:fedId/:adapterId',
      //       component: EndpointViewComponent,
      //     },
      //     { path: 'preview/:cname/:name', component: CreateEndpointComponent },
      //     // { path: 'view/:name', component: EndpointDescriptionComponent },
      //     // {path:'related',component:EndpointDescriptionComponent},
      //   ],
      // },
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
      // { path: 'data', component: DatasetEditComponent },
      // { path: ':type', component: DatasetByNameComponent },
      // {
      //   path: 'view/:cname',
      //   children: [
      //     { path: '', component: DatasetDescriptionComponent },
      //     // { path: 'infer', component: SemanticSearchInferComponent },
      //     { path: 'wrangling/:wname/:action/:rname', component: WranglingComponent },
      //   ],
      // },
      // { path: 'preview/:cname', component: DatasetDescriptionComponent },
       ],
      },

      // {
      //   path: 'knowledge',
      //   children: [
      //     { path: '', component: DatasetKnowledgeComponent },
      //     { path: 'create', component: ModalConfigDatasetComponent },
      //     { path: 'data', component: DatasetEditComponent },
      //     { path: ':type', component: DatasetKnowledgeComponent },
      //     {
      //       path: 'view/:cname',
      //       children: [
      //         { path: '', component: DatasetDescriptionComponent },
      //        // { path: 'infer', component: SemanticSearchInferComponent },
      //         { path: 'wrangling/:wname/:action/:rname', component: WranglingComponent },
      //       ],
      //     },
      //     { path: 'preview/:cname', component: DatasetDescriptionComponent },
      //   ],
      // },
      // {
      //   path: 'workflows',
      //   children: [
      //     {path: ':name/clustering', component: ClusteringComponent},
      //    // { path: 'create/specification', component: WorkflowTableComponent },
      //    // { path: ':name', component: WorkflowTableComponent },
      //    // {path: 'create/specification/:id', component: WorkflowCreateSpecComponent},
      //    // { path: ':name/:id', component: WorkflowDetailsComponent },
      //   ],
      // },

      // {
      //   path: 'datasetTemplates',
      //   children: [
      //     { path: '', component: DatasetTemplateComponent },
      //     { path: 'create', component: ModalConfigDatasetComponent },
      //     { path: 'data', component: DatasetEditComponent },
      //     { path: ':type', component: DatasetComponent },
      //     { path: 'view/:cname', component: DatasetDescriptionComponent },
      //     { path: 'preview/:cname', component: DatasetDescriptionComponent },
      //   ],
      // },
      // {
      //   path: 'schemas',
      //   children: [
      //     { path: '', component: SchemaComponent },
      //     { path: 'create', component: ModalConfigSchemaComponent },
      //     { path: 'view', component: ModalConfigSchemaComponent },
      //     { path: 'edit', component: ModalConfigSchemaComponent },
      //   ],
      // },

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


      // {
      //   path: 'templates',
      //   children: [
      //     { path: '', component: TemplateComponent },
      //     {
      //       path: 'view/drgndrp/:cname',
      //       component: PipelineDescriptionComponent,
      //     },
      //     { path: 'view/:cname', component: NativeScriptComponent },
      //   ],
      // },
      // {
      //   path: 'chain-list',
      //   children: [
      //     { path: '', component: ChainPipelineComponent },
      //     {
      //       path: 'view/drgndrp/:cname',
      //       component: PipelineDescriptionComponent,
      //     },
      //     { path: 'view/:cname', component: NativeScriptComponent },
      //   ],
      // },

      // {
      //   path: 'cluster',
      //   component: ClusterTicketsComponent,
      // },

      // {
      //   path: 'plugins',
      //   children: [
      //     { path: '', component: PluginComponent },
      //     { path: ':name', component: PluginComponent },
      //   ],
      // },

      // {
      //   path: 'taglist',
      //   component: EditDeleteTagsComponent,
      // },


      // {
      //   path: 'constants',
      //   children: [{ path: '', component: ConstantsComponent }],
      // },

      {
        path: 'core-datasources',
        children: [
          // { path: '', component: CoreDatasourcesComponent },
          { path: '', component: DatasourceComponent },
          { path: 'create', component: DatasourceConfigComponent },
          { path: 'view/:name/:view', component: ConnectionViewComponent },
          { path: 'edit/:name/:edit', component: ConnectionViewComponent },
          { path: 'preview/:name', component: ConnectionViewComponent },
        ],
      },

      // {
      //   path: 'relationship',
      //   component: RelationshipComponent,
      // },
      // {
      //   path: 'tickets',
      //   children: [
      //     {
      //       path: 'create-ticket/alerts',
      //       component: TicketlistsummitComponent,
      //     },
      //     { path: 'alerts', component: TicketlistComponent },
      //     { path: 'incident', component: TicketlistComponent },

      //     { path: 'tasks', component: TicketlistComponent },
      //     { path: 'changerequests', component: TicketlistComponent },
      //     { path: 'servicerequests', component: TicketlistComponent },
      //     // // { path: "uploadTicket", component: UploadTicketsComponent},
      //     { path: 'uploadTicket', component: DatasetEditComponent },
      //     // { path: "Sops-list", component: SopListComponent },
      //     // // { path: "Rca-list", component: IcmRcaListViewComponent},
      //     // // { path: "Clusters-list", component: IcmClustersListViewComponent},
      //     // { path: "create-ticket/tickets/:ticketId/:view", component: TicketsDetailComponent },
      //     // { path: "create-ticket/tickets/:ticketId", component: TicketsDetailComponent },
      //     {
      //       path: 'create-ticket/:ticketId/:view',
      //       component: TicketlistdetailsComponent,
      //     },
      //     {
      //       path: 'create-ticket/:ticketId',
      //       component: TicketlistdetailsComponent,
      //     },
      //   ],
      // },

      // {
      //   path: 'datasetAnalytics',
      //   component: DataAnalyticsComponent,
      // },
      // {
      //   path: 'scheduler-list',
      //   children: [
      //     { path: '', component: SchedulerListComponent },
      //   ],
      // },

      // {
      //   path: 'videobot',
      //   // children: [{ path: '', component: VideoSoltionComponent }],
      // },
      // { path: "mashups", component: MashupsComponent},
      // { path: "mashups/:name", component: MashupCreateComponent},
      // { path: 'mashup/:type', component: MashupViewWrapperComponent, data: {isRest:true } },
      // {
      //   path: "rating/:type", component: AipRatingViewComponent
      // },


    ],
  },
  // {
  //   path:'aip-theme',component:ColorThemeSelectorComponent
  // },
  // {
  //   path: 'data-mining',
  //   component: DataMiningComponent,
  // },

  // { path: "", redirectTo: "home", pathMatch: 'full' },
];

export const AipRouting = RouterModule.forChild(routes);
