  import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AipRouting } from './aip-routing';
import { AipComponent } from './aip.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
import { AutocompleteModule, BreadcrumbModule, ChatbotModule, MessagingModule, RatingModule, CheckboxModule, ChipInputModule, DataGridModule, DatepickerModule, InputFieldModule, TimepickerModule, ToggleMenuModule, TreeComponent } from 'leds-lib';
import { PanelModule } from 'leds-lib';
import { MatChipsModule } from '@angular/material/chips';
import { ModelComponent } from './model/model.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { EndpointComponent } from './endpoint/endpoint.component';
import { EnlCodeEditorComponent } from './enl-code-editor/enl-code-editor.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ModelCreateComponent } from './model.create/model.create.component';
import { PipelineDescriptionComponent } from './pipeline.description/pipeline.description.component';
import { DatasetComponent } from './dataset/dataset.component';
import { DatasourceComponent } from './datasource/datasource.component';
import { DatasourceDescriptionComponent } from './datasource/datasource.description/datasource.description.component';
import { DatasetDescriptionComponent } from './dataset/dataset.description/dataset.description.component';
import { DatasetViewComponent } from './dataset/dataset-view/dataset-view.component';
import { DatasetConfigComponent } from './dataset/dataset-config/dataset-config.component';
import { EndpointViewComponent } from './endpoint/endpoint-view/endpoint-view.component';
import { LedsModuleModule } from './leds-module/leds-module.module';
import { EndpointEditComponent } from './endpoint/endpoint-edit/endpoint-edit.component';
import { environment } from '../environments/environment';
import { Services } from './services/service';
import { PipelineService } from './services/pipeline.service'
import { CommonModule } from '@angular/common';
import { AipInterceptorService } from './services/interceptor';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModelEditsComponent } from './model-edit/model-edit.component';
import { ModelDescriptionComponent } from './model.description/model.description.component';
import { JsNodeComponent } from './js-node/js-node.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PaginationModule } from 'leds-lib';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateEndpointComponent } from './endpoint/create-endpoint/create-endpoint.component';
import { EndpointDescriptionComponent } from './endpoint/endpoint-description/endpoint-description.component';
import { ModelDeployComponent } from './model-deploy/model-deploy.component';
import { TabsFilterService } from './services/tabs-filter.service';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { ApiDropdownRenderer } from './renderers/api-dropdown.renderer';
import { TagsComponent } from './tags/tags.component';
import { DrawFlowComponent } from './draw-flow/draw-flow.component';
import { PipelinenodeDirective } from './pipeline-node.directive'
import { TreeStructureComponent } from './tree-structure/tree-structure.component';
import { SchemaComponent } from './schema/schema.component';
import { AdapterComponent } from './adapter/adapter.component';
import { InstanceComponent } from './instance/instance.component';
import { TaggingComponentComponent } from './tagging-component/tagging-component.component';
import { PipelineCreateComponent } from './pipeline-create/pipeline-create.component';
import { TreeModule } from '@ali-hm/angular-tree-component';
import { MatRadioModule } from '@angular/material/radio';
import { RadioModule } from 'leds-lib';
import { SpecTemplateComponent } from './spec-template/spec-template.component';
import { SpecTemplateDescriptionComponent } from './spec-template/spec-template-description/spec-template-description.component';
import { AdapterServices } from './adapter/adapter-service';
import { AppListComponent } from './apps/app-list/app-list.component';
import { ViewAppComponent } from './apps/view-app/view-app.component';
import { AppConfigComponent } from './app-config/app-config.component';
import { FileUploadModule } from 'ng2-file-upload';

import { CreateAppComponent } from './create-app/create-app.component';
import { AdapterCreateEditComponent } from './adapter/adapter-create-edit/adapter-create-edit.component';
import { FeatureStoreComponent } from './feature-store/feature-store.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component/confirm-delete-dialog.component'
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { ConsoleTabComponent } from './pipeline.description/console-tab/console-tab.component';
import { MetricViewerComponent } from './pipeline.description/metric-viewer/metric-viewer.component';
import { JobDataViewerComponent } from './pipeline.description/job-data-viewer/job-data-viewer.component';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ModalEditCanvasTitleComponent } from './pipeline.description/modal-edit-canvas-title/modal-edit-canvas-title.component';
import { ModalViewEditPropertiesComponent } from './pipeline.description/modal-view-edit-properties/modal-view-edit-properties.component';
import { FeatureStoreDescriptionComponent } from './feature-store/feature-store-description/feature-store-description.component';
import { CreateSpecTemplateComponent } from './spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from './spec-template/edit-spec-template/edit-spec-template.component';
import { AdapterDescriptionComponent } from './adapter/adapter-description/adapter-description.component';
import { SwaggerCustomComponent } from './swagger-custom/swagger-custom.component'

import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JobsComponent } from './jobs/jobs.component';
import { SpecTemplateCustomSwaggerComponent } from './spec-template/spec-template-custom-swagger/spec-template-custom-swagger.component';
import { CreateFeaturestoreComponent } from './feature-store/create-featurestore/create-featurestore.component';
import { CreateFeaturesComponent } from './feature/create-features/create-features.component';
import { FeatureComponent } from './feature/feature.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NativeScriptComponent } from './native-script/native-script.component';
import { MatTreeModule } from '@angular/material/tree';
import { NativeScriptDialogComponent } from './native-script/native-script-dialog/native-script-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MethodCreateEditComponent } from './adapter/method-create-edit/method-create-edit.component';
import { DashConstantService, encKey } from "com-lib-util";
import { EditFeatureStoreComponent } from './feature-store/edit-feature-store/edit-feature-store.component';
import { DatasourceConfigComponent } from './datasource/datasource-config/datasource-config.component';
import { ModalConfigRestDatasourceComponent } from './datasource/modal-config-rest-datasource/modal-config-rest-datasource.component';

import { EditFeaturesComponent } from './feature/edit-features/edit-features.component';
import { InstanceCreateEditComponent } from './instance/instance-create-edit/instance-create-edit.component';
import { FeaturesDescriptionComponent } from './feature/features-description/features-description.component';
import { TemplateComponent } from './template/template.component';
import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { JsonNodeComponent } from './json2table/json-node.component';
import { JsonTreeComponent } from './json2table/json-tree.component';
import { ConnectionViewComponent } from './datasource/connection-view/connection-view.component';
import { GroupedFeaturesComponent } from './feature/grouped-features/grouped-features.component';
import { DatasetTableViewComponent, HighlightSearch } from './dataset/dataset-table-view/dataset-table-view.component';
import { CreateLinkedComponent } from './create-linked/create-linked.component';
import { ModalConfigDatasetComponent } from './dataset/modal-config-dataset/modal-config-dataset.component';
import { DatasetServices } from './dataset/dataset-service';
import { RestDatasetConfigComponent } from './dataset/rest-dataset-config/rest-dataset-config.component';
import { DefaultComponent } from './dataset/default/default.component';
import { EventsService } from './services/event.service';
import { JobsService } from './services/jobs.service';
import { AppGlobals } from './sharedModule/shared-variables/app.globals';
import { DatasetEditComponent } from './dataset/dataset-edit/dataset-edit.component';
import { DatasetFullscreenViewComponent } from './dataset/dataset-fullscreen-view/dataset-fullscreen-view.component';
import { DatasetViewWrapperComponent } from './dataset/dataset-view-wrapper/dataset-view-wrapper.component';
import { MethodConfigComponent } from './dataset/method-config/method-config.component';
import { DatasetPowerModeViewComponent } from './dataset/dataset-power-mode-view/dataset-power-mode-view.component';
import { DatasetFormViewComponent } from './dataset/dataset-form-view/dataset-form-view.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
imports: [
  ScrollingModule
]
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RelatedComponentComponent } from './related-component/related-component.component';
import { GroupsService } from './services/groups.service';
import { SchemaRegistryService } from './services/schema-registry.service';
import { DatasetLoadComponent } from './dataset/dataset-load/dataset-load.component';
import { LogConsoleComponent } from './dataset/log-console/log-console.component';
import { PluginComponent } from './plugin/plugin.component';
import { PluginService } from './services/plugin.service';
import { PluginViewComponent } from './plugin/plugin-view/plugin-view.component';
import { PluginDialogComponent } from './plugin/plugin-dialog/plugin-dialog.component';
import { ViewerPdfComponent } from './viewer-pdf/viewer-pdf.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModalConfigSchemaComponent } from './schema/modal-config-schema/modal-config-schema.component';
import { ModalConfigSchemaEditorComponent } from './schema/modal-config-schema-editor/modal-config-schema-editor.component';
import { SchemaRelationshipService } from './schema/schema-relationship.service';
import { MessageService } from './schema/message.service';
import { ViewerImageComponent } from './viewer-image/viewer-image.component';
import { ViewerZipComponent } from './viewer-zip/viewer-zip.component';
import { FormioModule } from "@formio/angular";
import { LogViewerComponent } from './dataset/log-viewer/log-viewer.component';
import { EditDeleteTagsComponent } from './edit-delete-tags/edit-delete-tags.component';
import { FiltertagPipe } from './pipes/filtertag.pipe';
import { NgxPaginationModule } from "ngx-pagination";
import { ModalInfoComponent } from './pipeline.description/modal-info/modal-info.component';
import { CarouselModule as CModule } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'leds-lib';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ScheduleService } from './services/schedule.service';
// import { GroupsService } from './groups/groups.service';
import { PipelinesummaryService } from './pipeline-summary/pipeline-summary.service';

import { UserSecretsComponent } from './pipeline.description/user-secrets/user-secrets.component';
import { RoleService } from './services/role.service';
import { RelationshipComponent } from './schema/relationship/relationship.component';
import { RelationshipService } from './services/relationship.service';
import { FilterPipe, FirstCharacterPipe, StringToJSON } from './pipes/stringtojson.pipe';
import { ViewerAudioComponent } from './viewer-audio/viewer-audio.component';
import { TicketlistComponent } from './ticketlist/ticketlist.component';
import { ClusterTicketsComponent } from './cluster-tickets/cluster-tickets.component';

import { IncidentsService } from './itsm/incidents.service';
import { TicketsService } from './itsm/tickets.service';
import { DgInstanceComponent } from './digital-brain/dg-instance/dg-instance.component';
import { DgAppComponent } from './digital-brain/dg-app/dg-app.component';
import { VideoSoltionComponent } from './video-soltion/video-soltion.component';
import { DatasetTemplateComponent } from './dataset/dataset-template/dataset-template.component';
import { ShowOutputArtifactsComponent } from './pipeline.description/show-output-artifacts/show-output-artifacts.component';
import { ConstantsComponent } from './constants/constants.component';
import { PipelineModelService } from './pipeline-summary/pipeline-model/pipeline-model.service';
import { NgxIndexedDBModule, NgxIndexedDBService, DBConfig } from 'ngx-indexed-db';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CreateDgappComponent } from './digital-brain/dg-app/create-dgapp/create-dgapp.component';
import { DgAppDescriptionComponent } from './digital-brain/dg-app/dg-app-description/dg-app-description.component';
import { TicketlistdetailsComponent } from './ticketlistdetails/ticketlistdetails.component';
import { ViewerVideoComponent } from './viewer-video/viewer-video.component';
import { RaiCheckListComponent } from './rai-check-list/rai-check-list.component';
import { TicketlistsummitComponent } from './ticketlistsummit/ticketlistsummit.component';
import { EditDgappComponent } from './digital-brain/dg-app/edit-dgapp/edit-dgapp.component';
import { CreateDgtoolComponent } from './digital-brain/dg-instance/create-dgtool/create-dgtool.component';
import { DgToolDescriptionComponent } from './digital-brain/dg-instance/dg-tool-description/dg-tool-description.component';
import { EditDgToolComponent } from './digital-brain/dg-instance/edit-dg-tool/edit-dg-tool.component';

import { RaiservicesService } from './services/raiservices.service';
import { ChooseRuntimeComponent } from './apps/choose-runtime/choose-runtime.component';
// import { WorkflowService } from './workflows/entities/workflow.service';
// import { WorkflowCreateSpecComponent } from './workflows/workflow-create-spec/workflow-create-spec.component';
// import { WorkflowTableComponent } from './workflows/workflow-table/workflow-table.component';
// import { ModalConfigWorkflowComponent } from './workflows/modal-config-workflow/modal-config-workflow.component';
// import { WkQuestionComponent } from './workflows/wk-question/wk-question.component';
// import { WorkflowDetailsComponent } from './workflows/workflow-details/workflow-details.component';
// import { WkWorkareaComponent } from './workflows/wk-workarea/wk-workarea.component';
// import { WkDatasetsviewComponent } from './workflows/wk-workarea/wk-datasetsview/wk-datasetsview.component';
// import { WkDatasettableviewComponent } from './workflows/wk-workarea/wk-datasettableview/wk-datasettableview.component';

import { DatasourceService } from './datasource/datasource.service';
import { DatasourceRegistryComponent } from './datasource/datasource-registry/datasource-registry.component';
import { DatasetMacrobaseComponent } from './dataset/dataset-macrobase/dataset-macrobase.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { TimeSeriesComponent } from './time-series/time-series.component';

import { ViewerFolderComponent } from './viewer-folder/viewer-folder.component';
import { SemanticService } from './services/semantic.services';

// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MashupsComponent } from './mashups/mashups.component';
import { CreateMashupComponent } from './mashups/create-mashup-popup/create-mashup-popup.component';
import { MashupCreateComponent } from './mashups/mashup-create/mashup-create.component';
import { MashupViewWrapperComponent } from './mashups/mashup-view-wrapper/mashup-view-wrapper.component';
import { AibrainViewComponent } from './mashups/aibrain-view/aibrain-view.component';
import { FieldsetModule } from "primeng/fieldset";
import { MashupsService } from './mashups/mashups.service';
import { ManageGroupComponent } from './digital-brain/dg-app/manage-group/manage-group.component';
import { EditManageGroupComponent } from './digital-brain/dg-app/edit-manage-group/edit-manage-group.component';

import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { CustomListboxComponent } from './digital-brain/custom-listbox/custom-listbox.component';
import { AssignAppsComponent } from './digital-brain/assign-apps/assign-apps.component';
import { PaginationComponent } from './pagination/pagination.component';
import { AgentComponent } from './digital-brain/agent/agent.component';
import { AgentDescriptionComponent } from './digital-brain/agent/agent-description/agent-description.component';
import { CreateAgentComponent } from './digital-brain/agent/create-agent/create-agent.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WranglingComponent } from './dataset/wrangling/wrangling.component';

import { DataAnalyticsComponent } from './dataset/data-analytics/data-analytics.component';
import { AccordionModule } from 'primeng/accordion';
import { ViewChartComponent } from './dataset/view-chart/view-chart.component';
import { OpenExplorationComponent } from './dataset/open-exploration/open-exploration.component';
import { SafePipe } from './dataset/staticfile/directive/safe.pipe';
import { DragDropModule } from 'primeng/dragdrop';
import { QueryBuilderComponent } from './dataset/wrangling/query-builder/query-builder.component';
import { WranglingService } from './dataset/wrangling/wranglingService/wrangling.service';
import { SecondsToTimePipe } from './services/pipes/SecondsToTimePipe';
import { PlotlyModule } from 'angular-plotly.js';
import { DynamicRemoteLoad } from './apps/view-app/remoteLoad';
import * as PlotlyJS from 'plotly.js-dist-min';
import { DataMiningComponent } from './data-mining/data-mining.component';
import { NgBusyModule } from 'ng-busy';
import { WranglingAdvisoryComponent } from './dataset/wrangling/wrangling-advisory/wrangling-advisory.component';
import { WranglingDataService } from './dataset/wrangling/wranglingService/wrangling-data.service';
import { ExpressionBuilderUtilsService } from './dataset/wrangling/wranglingService/expression-builder-utils.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { ListboxModule } from 'primeng/listbox';
import { AddViewRecipeComponent } from './dataset/wrangling/add-view-recipe/add-view-recipe.component';
import { PipelineDialogComponent } from './pipeline-dialog/pipeline-dialog.component';
import { PivotComponent } from './dataset/pivot/pivot.component';
import { PivotFilterComponent } from './dataset/pivot/pivot-filter/pivot-filter.component';
import { PivotTableComponent } from './dataset/pivot/pivot-table/pivot-table.component';
import { DynamicControlsComponent } from './dataset/wrangling/dynamic-controls/dynamic-controls.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { ConfirmationComponent } from './dataset/wrangling/confirmation/confirmation.component';
import { MultivariateAnalyticsComponent } from './dataset/multivariate-analytics/multivariate-analytics.component';
import { SaveStoryComponent } from './dataset/open-exploration/save-story/save-story.component';
import { PdfDatasetAnnotateComponent } from './pdf-dataset-annotate/pdf-dataset-annotate.component';

import { DragDropModule as CdkDragDropModule } from '@angular/cdk/drag-drop';

import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SliderModule } from 'leds-lib';
import { QuillModule } from 'ngx-quill';
import { DatasetByNameComponent } from './dataset/dataset-by-name/dataset-by-name.component';
import { SbxServicesService } from './services/sbx-services.service';
import { AipRatingComponent } from './aip-rating/aip-rating.component';
import { AipRatingViewComponent } from './aip-rating/aip-rating-view/aip-rating-view.component';
import { ItsmSummaryComponent } from './ticketlistdetails/itsm-summary/itsm-summary.component';
import { ItsmRelatedTicketComponent } from './ticketlistdetails/itsm-related-ticket/itsm-related-ticket.component';
import { ItsmRecommendationsComponent } from './ticketlistdetails/itsm-recommendations/itsm-recommendations.component';

import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ClusterWorkflowComponent } from './cluster-workflow/cluster-workflow.component';

import { ClusteringComponent } from './clustering/clustering.component';
import { BivariateAnalyticsComponent } from './dataset/bivariate-analytics/bivariate-analytics.component';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { KeyFilterModule } from 'primeng/keyfilter';
import { HighlightSearchPipe } from './pipes/highlight.pipe';

PlotlyModule.plotlyjs = PlotlyJS;
const dbConfig: DBConfig = {
  name: 'icm_tickets',
  version: 1,
  objectStoresMeta: [{
    store: 'ticketData',
    storeConfig: { keyPath: 'number', autoIncrement: false },
    storeSchema: [
      { name: 'incidentNumber', keypath: 'incidentNumber', options: { unique: false } },
      { name: 'type', keypath: 'type', options: { unique: false } },
      { name: 'priority', keypath: 'priority', options: { unique: false } },
      { name: 'date', keypath: 'date', options: { unique: false } }
    ]
  }
    // ,
    // {
    //     store: 'tagsData',
    //     storeConfig: { keyPath: 'uniqueIdentifier', autoIncrement: false },
    //     storeSchema: [
    //       { name: 'uniqueIdentifier', keypath: 'uniqueIdentifier', options: { unique: true } },
    //       { name: 'tags', keypath: 'tags', options: { unique: false } }
    //     ]
    //   }
  ]
};

// @NgModule({
// declarations: [AipComponent, ModelComponent, ModelDescriptionComponent, HomepageComponent, PipelineComponent, PipelineDescriptionComponent, EndpointComponent, EnlCodeEditorComponent, JsNodeComponent, DatasetComponent, DatasourceComponent, DatasourceDescriptionComponent, DatasetDescriptionComponent, DatasetViewComponent, DatasetConfigComponent, JsNodeComponent,],
@NgModule({
  declarations: [
    AipComponent,
    ModelComponent,
    FeatureStoreComponent,
    FeatureComponent,
    FeaturesDescriptionComponent,
    CreateFeaturesComponent,
    CreateFeaturestoreComponent,
    EditFeatureStoreComponent,
    EditFeaturesComponent,
    FeatureStoreDescriptionComponent,
    GroupedFeaturesComponent,
    ModelCreateComponent,
    HomepageComponent,
    PipelineComponent,
    PipelineDescriptionComponent,
    EndpointComponent,
    EnlCodeEditorComponent,
    DatasetComponent,
    DatasourceComponent,
    DatasourceConfigComponent,
    ModalConfigRestDatasourceComponent,
    DatasourceDescriptionComponent,
    DatasetDescriptionComponent,
    DatasetViewComponent,
    DatasetConfigComponent,
    EndpointViewComponent,
    EndpointEditComponent,
    ModelEditsComponent,
    ModelDescriptionComponent,
    JsNodeComponent,
    CreateEndpointComponent,
    EndpointDescriptionComponent,
    ModelDeployComponent,
    ApiDropdownRenderer,
    TagsComponent,
    DrawFlowComponent,
    PipelinenodeDirective,
    TreeStructureComponent,
    SchemaComponent,
    AdapterComponent,
    InstanceComponent,
    InstanceCreateEditComponent,
    TaggingComponentComponent,
    PipelineCreateComponent,
    CreateAppComponent,
    AppListComponent,
    SpecTemplateComponent,
    SpecTemplateDescriptionComponent,
    ViewAppComponent,
    AppConfigComponent,
    AdapterCreateEditComponent,
    ConfirmDeleteDialogComponent,
    CodeEditorComponent,
    ConsoleTabComponent,
    MetricViewerComponent,
    JobDataViewerComponent,
    ShowOutputArtifactsComponent,
    ModalEditCanvasTitleComponent,
    ModalViewEditPropertiesComponent,
    CreateSpecTemplateComponent,
    EditSpecTemplateComponent,
    AdapterDescriptionComponent,
    SwaggerCustomComponent,
    JobsComponent,
    SpecTemplateCustomSwaggerComponent,
    NativeScriptComponent,
    NativeScriptDialogComponent,
    MethodCreateEditComponent,
    TemplateComponent,
    InstanceDescriptionComponent,
    JsonTreeComponent,
    JsonNodeComponent,
    ConnectionViewComponent,
    DatasetTableViewComponent,
    CreateLinkedComponent,
    ModalConfigDatasetComponent,
    RestDatasetConfigComponent,
    DefaultComponent,
  
    DatasetEditComponent,
    DatasetFullscreenViewComponent,
    DatasetViewWrapperComponent,
    MethodConfigComponent,
    DatasetPowerModeViewComponent,
    DatasetFormViewComponent,
    RelatedComponentComponent,
    DatasetLoadComponent,
    LogConsoleComponent,
    ViewerPdfComponent,
    RelatedComponentComponent,
    PluginComponent,
    PluginViewComponent,
    PluginDialogComponent,
    ModalConfigSchemaComponent,
    ModalConfigSchemaEditorComponent,
    ViewerImageComponent,
    ViewerZipComponent,
    ModalInfoComponent,
    LogViewerComponent,
    EditDeleteTagsComponent,
    FiltertagPipe, 
    UserSecretsComponent,
    RelationshipComponent,
    StringToJSON,
    HighlightSearch,
    ViewerAudioComponent,
    FirstCharacterPipe,
    TicketlistComponent,
    ClusterTicketsComponent,
    DgInstanceComponent,
    DgAppComponent,
    CreateDgappComponent,
    DgAppDescriptionComponent,
    VideoSoltionComponent,
    DatasetTemplateComponent,
    ConstantsComponent,
    TicketlistdetailsComponent,
    ViewerVideoComponent,
    TicketlistsummitComponent,
    RaiCheckListComponent,
    EditDgappComponent,
    CreateDgtoolComponent,
    DgToolDescriptionComponent,
    EditDgToolComponent,
    ManageGroupComponent,
    EditManageGroupComponent,
    ChooseRuntimeComponent,
    ViewerFolderComponent,
    // CoreDatasourcesComponent,
    TicketlistdetailsComponent,
   
    DatasourceRegistryComponent,
       DatasetMacrobaseComponent,

    SwaggerComponent,
   
    TimeSeriesComponent,
   
    SecondsToTimePipe,
    HighlightSearchPipe,
  
    MashupsComponent,
    CreateMashupComponent,
    MashupCreateComponent,
    MashupViewWrapperComponent,
    AibrainViewComponent,

    CustomListboxComponent,
    PaginationComponent,
    AgentComponent,
    CreateAgentComponent,
    AssignAppsComponent,
    AgentDescriptionComponent,
    FilterPipe,
    WranglingComponent,
   
    DataAnalyticsComponent,

    ViewChartComponent,
    OpenExplorationComponent, SafePipe,
    QueryBuilderComponent,
    DataMiningComponent,
    WranglingAdvisoryComponent,
    PipelineDialogComponent,
    PivotComponent,
    PivotFilterComponent,
    PivotTableComponent,
    AddViewRecipeComponent,
    PipelineDialogComponent,
    DynamicControlsComponent,
    ConfirmationComponent,
    MultivariateAnalyticsComponent,
    BivariateAnalyticsComponent,
    SaveStoryComponent,
    PdfDatasetAnnotateComponent,
   
    DatasetByNameComponent,
   
    AipRatingComponent,
    AipRatingViewComponent,
    ItsmSummaryComponent,
    ItsmRelatedTicketComponent,
    ItsmRecommendationsComponent,
   
    ClusterWorkflowComponent,
   
    ClusteringComponent
  ],
  imports: [
    CommonModule,
    AipRouting,
    MatCardModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatGridListModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    // MatFormFieldModule,
    // MatInputModule,
    InputFieldModule,
    PanelModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule,
    LedsModuleModule,
    PaginationModule,
    NgbModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    TreeModule,
    MatRadioModule,
    RadioModule,
    FileUploadModule,
    TableModule,
    DialogModule,
    DataGridModule,
    CheckboxModule,
    MatExpansionModule,
    NgJsonEditorModule,
    MatTreeModule,
    MatSidenavModule,
    ScrollingModule,
    ChipInputModule,
    MatAutocompleteModule,
    AutocompleteModule,
    PdfViewerModule,
    FormioModule,
    NgxPaginationModule,
    BreadcrumbModule,
    CModule,
    CarouselModule,
    MatNativeDateModule,
    DatepickerModule,
    NgxMaterialTimepickerModule,
    TimepickerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    MarkdownModule.forRoot(), // Add this line
    NgxMatSelectSearchModule,
    NgApexchartsModule,
    ChatbotModule,
    ToggleMenuModule,
    // PerfectScrollbarModule,
    RatingModule,
    MessagingModule,
    FieldsetModule,
    AngularDualListBoxModule,
    MatMenuModule,
    PlotlyModule,
    NgBusyModule,
    MatButtonModule, AccordionModule, DragDropModule,
    OverlayPanelModule,
    TooltipModule,
    ListboxModule,
    InputNumberModule,
    MenubarModule,
    InputTextModule,
    ButtonModule,
    KeyFilterModule,
    CdkDragDropModule,
    SliderModule,
    NgxSliderModule,
    QuillModule,
    BaseChartDirective,
  ],
  providers: [
    {
      provide: 'envi',
      useValue: environment.baseUrl,
    },
    { provide: "dataSets", useValue: environment.datasetsUrl },
    { provide: HTTP_INTERCEPTORS, useClass: AipInterceptorService, multi: true },

    {
      provide: 'sbx',
      useValue: '/api/exp',
    },

    Services,
    AdapterServices,
    PipelineService,
    TabsFilterService,
    DatasetServices,
    EventsService,
    JobsService,
    GroupsService,
    SchemaRegistryService,
    AppGlobals,
    encKey,
    DashConstantService,
    JobsService,
    PluginService,
    SchemaRelationshipService,
    MessageService,
    ScheduleService,
    PipelinesummaryService,
    RoleService,
    RelationshipService,
    TicketsService,
    IncidentsService,
    PipelineModelService,
    NgxIndexedDBService,
    RaiservicesService,
    DatasourceService,
    SemanticService,
    MashupsService,
    WranglingService,
    DynamicRemoteLoad,
    WranglingDataService,
    ExpressionBuilderUtilsService,
  
    SbxServicesService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    provideCharts(withDefaultRegisterables()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AipComponent],
})

export class AipModule { }
