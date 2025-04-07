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
import { ChainsViewComponent } from './chains-view/chains-view.component';
import { ChainsComponent } from './chains/chains.component';
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
import { ChainPipelineComponent } from './chain-pipeline/chain-pipeline.component';
import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { JsonNodeComponent } from './json2table/json-node.component';
import { JsonTreeComponent } from './json2table/json-tree.component';
import { ConnectionViewComponent } from './datasource/connection-view/connection-view.component';
import { GroupedFeaturesComponent } from './feature/grouped-features/grouped-features.component';
import { DatasetTableViewComponent, HighlightSearch } from './dataset/dataset-table-view/dataset-table-view.component';
import { CreateLinkedComponent } from './create-linked/create-linked.component';
import { ChainsLogComponent } from './chains-log/chains-log.component';
import { ModalConfigDatasetComponent } from './dataset/modal-config-dataset/modal-config-dataset.component';
import { DatasetServices } from './dataset/dataset-service';
import { RestDatasetConfigComponent } from './dataset/rest-dataset-config/rest-dataset-config.component';
import { DefaultComponent } from './dataset/default/default.component';
import { EventsComponent } from './events/events.component';
import { CreateeventComponent } from './events/createevent/createevent.component';
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
import { JobsLogComponent } from './jobs-log/jobs-log.component';
import { ViewerPdfComponent } from './viewer-pdf/viewer-pdf.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ToolsComponent } from './tools/tools.component';
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
import { IvmComponent } from './ivm/ivm.component';
import { CarouselModule as CModule } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'leds-lib';
import { IvmCreateModalComponent } from './ivm/ivm-create-modal/ivm-create-modal.component';
import { IvmInboxComponent } from './ivm/ivm-inbox/ivm-inbox.component';
import { IvmViewInitiativeComponent } from './ivm/ivm-view-initiative/ivm-view-initiative.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SchedulerListComponent } from './scheduler/scheduler-list/scheduler-list.component';
import { ScheduleService } from './services/schedule.service';
// import { GroupsService } from './groups/groups.service';
import { PipelinesummaryService } from './pipeline-summary/pipeline-summary.service';

import { UserSecretsComponent } from './pipeline.description/user-secrets/user-secrets.component'; import { CopyPipelinesComponent } from './copy-pipelines/copy-pipelines.component';
import { IvmViewAllInitiativeComponent } from './ivm/ivm-view-all-initiative/ivm-view-all-initiative.component';
import { RoleService } from './services/role.service';
import { RelationshipComponent } from './schema/relationship/relationship.component';
import { RelationshipService } from './services/relationship.service';
import { FilterPipe, FirstCharacterPipe, StringToJSON } from './pipes/stringtojson.pipe';
import { IvmRecentArtifactsComponent } from './ivm/ivm-recent-artifacts/ivm-recent-artifacts.component';
import { FormatStringPipe, InitialsPipe } from './pipes/format-string.pipe';
import { IvmViewInitiativeDetailComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-detail/ivm-view-initiative-detail.component';
import { IvmViewInitiativeQuestionareComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-questionare/ivm-view-initiative-questionare.component';
import { ViewerAudioComponent } from './viewer-audio/viewer-audio.component';
import { TicketlistComponent } from './ticketlist/ticketlist.component';
import { ClusterTicketsComponent } from './cluster-tickets/cluster-tickets.component';

import { IncidentsService } from './itsm/incidents.service';
import { TicketsService } from './itsm/tickets.service';
import { CopydatasetsComponent } from './copydatasets/copydatasets.component';
import { SolutionBotComponent } from './solution-bot/solution-bot.component';
import { DgInstanceComponent } from './digital-brain/dg-instance/dg-instance.component';
import { DgAppComponent } from './digital-brain/dg-app/dg-app.component';
import { SearchAllComponent } from './ivm/search-all/search-all.component';
import { VideoSoltionComponent } from './video-soltion/video-soltion.component';
import { CopyCipComponent } from './copy-cip/copy-cip.component';
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
import { IntiativeFormComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-questionare/intiative-form/intiative-form.component';
import { QuestionareFormComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-questionare/questionare-form/questionare-form.component';
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

import { WkLogsComponent } from './workflows/wk-workarea/wk-logs/wk-logs.component';
import { WkFormComponent } from './workflows/wk-workarea/wk-form/wk-form.component';
import { DatasourceService } from './datasource/datasource.service';
import { DatasourceRegistryComponent } from './datasource/datasource-registry/datasource-registry.component';
import { WkSummaryviewComponent } from './workflows/wk-workarea/wk-summaryview/wk-summaryview.component';
import { DataCorpusViewComponent } from './workflows/wk-workarea/wk-datacorpusview/wk-datacorpusview.component';
import { DatasetMacrobaseComponent } from './dataset/dataset-macrobase/dataset-macrobase.component';
import { WkTimeseriesviewComponent } from './workflows/wk-workarea/wk-timeseriesview/wk-timeseriesview.component';
import { WkDashboardComponent } from './workflows/wk-workarea/wk-dashboard/wk-dashboard.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { WkPublishComponent } from './workflows/wk-publish/wk-publish.component';
import { WkExecuteComponent } from './workflows/wk-execute/wk-execute.component';
import { WorkareaDirective } from './workflows/wk-workarea/wk-workarea.directive';
import { TimeSeriesComponent } from './time-series/time-series.component';
import { WorkflowCreateSpecComponent } from './workflows/workflow-create-spec/workflow-create-spec.component';
import { WorkflowTableComponent } from './workflows/workflow-table/workflow-table.component';
import { ModalConfigWorkflowComponent } from './workflows/modal-config-workflow/modal-config-workflow.component';
import { WkQuestionComponent } from './workflows/wk-question/wk-question.component';
import { WorkflowDetailsComponent } from './workflows/workflow-details/workflow-details.component';
import { WkWorkareaComponent } from './workflows/wk-workarea/wk-workarea.component';
import { WkDatasetsviewComponent } from './workflows/wk-workarea/wk-datasetsview/wk-datasetsview.component';
import { WkDatasettableviewComponent } from './workflows/wk-workarea/wk-datasettableview/wk-datasettableview.component';
import { WorkflowService } from './workflows/entities/workflow.service';
import { ViewerFolderComponent } from './viewer-folder/viewer-folder.component';
import { SemanticSearchDialogComponent } from './semantic-search-dialog/semantic-search-dialog.component';
import { SemanticSearchConfigComponent } from './semantic-search-dialog/semantic-search-config/semantic-search-config.component';
import { SemanticService } from './services/semantic.services';
import { SemanticSearchInferComponent } from './semantic-search-dialog/semantic-search-infer/semantic-search-infer.component';
import { AddWorkGroupComponent } from './ivm/add-work-group/add-work-group.component';
import { ConfigureTemplatesComponent } from './ivm/configure-templates/configure-templates.component';
import { AddTemplateComponent } from './ivm/configure-templates/add-template/add-template.component';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InitiativeApproveComponent } from './ivm/initiative-approve/initiative-approve.component';
import { MashupsComponent } from './mashups/mashups.component';
import { CreateMashupComponent } from './mashups/create-mashup-popup/create-mashup-popup.component';
import { MashupCreateComponent } from './mashups/mashup-create/mashup-create.component';
import { MashupViewWrapperComponent } from './mashups/mashup-view-wrapper/mashup-view-wrapper.component';
import { AibrainViewComponent } from './mashups/aibrain-view/aibrain-view.component';
import { FieldsetModule } from "primeng/fieldset";
import { MashupsService } from './mashups/mashups.service';
import { ManageGroupComponent } from './digital-brain/dg-app/manage-group/manage-group.component';
import { EditManageGroupComponent } from './digital-brain/dg-app/edit-manage-group/edit-manage-group.component';
import { SemanticSearchDataSetViewDialogComponent } from './semantic-search-dialog/semantic-search-dataset-view/semantic-search-dataset-view-dialog.component';
import { WkScheduleComponent } from './workflows/wk-schedule/wk-schedule.component';

import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { CustomListboxComponent } from './digital-brain/custom-listbox/custom-listbox.component';
import { AssignAppsComponent } from './digital-brain/assign-apps/assign-apps.component';
import { PaginationComponent } from './pagination/pagination.component';
import { AgentComponent } from './digital-brain/agent/agent.component';
import { InitiativeActivityComponent } from './ivm/initiative-activity/initiative-activity.component';
import { AgentDescriptionComponent } from './digital-brain/agent/agent-description/agent-description.component';
import { CreateAgentComponent } from './digital-brain/agent/create-agent/create-agent.component';
import { CommonCreateComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-detail/common-create/common-create.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WranglingComponent } from './dataset/wrangling/wrangling.component';
import { InitiativeActifactDetailsComponent } from './ivm/ivm-view-initiative/initiative-actifact-details/initiative-actifact-details.component';
import { ColorThemeSelectorComponent } from './ivm/color-theme-selector/color-theme-selector.component';
import { DataAnalyticsComponent } from './dataset/data-analytics/data-analytics.component';
import { AccordionModule } from 'primeng/accordion';
import { ViewChartComponent } from './dataset/view-chart/view-chart.component';
import { OpenExplorationComponent } from './dataset/open-exploration/open-exploration.component';
import { SafePipe } from './dataset/staticfile/directive/safe.pipe';
import { DragDropModule } from 'primeng/dragdrop';
import { RemoteConsoleComponent } from './remote-console/remote-console.component';
import { QueryBuilderComponent } from './dataset/wrangling/query-builder/query-builder.component';
import { WranglingService } from './dataset/wrangling/wranglingService/wrangling.service';
import { SecondsToTimePipe } from './services/pipes/SecondsToTimePipe';
import { PlotlyModule } from 'angular-plotly.js';
import { DatasetSemanticComponent } from './dataset/dataset-semantic/dataset-semantic.component';
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
import { SemanticSearchFeedbackPopup } from './semantic-search-dialog/semantic-search-feedback-popup/semantic-search-feedback-popup.component';
import { PivotComponent } from './dataset/pivot/pivot.component';
import { PivotFilterComponent } from './dataset/pivot/pivot-filter/pivot-filter.component';
import { PivotTableComponent } from './dataset/pivot/pivot-table/pivot-table.component';
import { DynamicControlsComponent } from './dataset/wrangling/dynamic-controls/dynamic-controls.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { ConfirmationComponent } from './dataset/wrangling/confirmation/confirmation.component';
import { SemanticSearchDataSetSummaryViewDialogComponent } from './semantic-search-dialog/semantic-search-dataset-summary-view/semantic-search-dataset-summary-view-dialog.component';
import { MultivariateAnalyticsComponent } from './dataset/multivariate-analytics/multivariate-analytics.component';
import { SaveStoryComponent } from './dataset/open-exploration/save-story/save-story.component';
import { PdfDatasetAnnotateComponent } from './pdf-dataset-annotate/pdf-dataset-annotate.component';
import { DocumentsLibraryComponent } from './documents-library/documents-library.component';
import { PromptsComponent } from './prompts/prompts.component';
import { PromptCreateComponent } from './prompts/prompt-create/prompt-create.component';
import { PromptTemplateComponent } from './prompts/prompt-template/prompt-template.component';
import { PromptEditComponent } from './prompts/prompt-edit/prompt-edit.component';
import { DragDropModule as CdkDragDropModule } from '@angular/cdk/drag-drop';
import { OutputSchemaComponent } from './prompts/output-schema/output-schema.component'; // Import from Angular CDK
import { PromptServices } from './prompts/prompt.service';
import { HighlightPipe, HighlightSearchPipe } from './prompts/highlight.pipe';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SliderModule } from 'leds-lib';
import { AnnotateConfigComponent } from './annotate-config/annotate-config.component';
import { DocumentCreateComponent } from './documents-library/document-create/document-create.component';
import { QuillModule } from 'ngx-quill';
import { DocumentViewComponent } from './documents-library/document-view/document-view.component';
import { DatasetByNameComponent } from './dataset/dataset-by-name/dataset-by-name.component';
import { DatasetKnowledgeComponent } from './dataset/dataset-knowledge/dataset-knowledge.component';
import { DataEnchrichmentComponent } from './data-enchrichment/data-enchrichment.component';
import { CommonEditComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-detail/common-edit/common-edit.component';
import { SbxServicesService } from './services/sbx-services.service';
import { AipRatingComponent } from './aip-rating/aip-rating.component';
import { AipRatingViewComponent } from './aip-rating/aip-rating-view/aip-rating-view.component';
import { ItsmSummaryComponent } from './ticketlistdetails/itsm-summary/itsm-summary.component';
import { ItsmRelatedTicketComponent } from './ticketlistdetails/itsm-related-ticket/itsm-related-ticket.component';
import { ItsmRecommendationsComponent } from './ticketlistdetails/itsm-recommendations/itsm-recommendations.component';
import { CommonCreateDialogComponent } from './ivm/ivm-view-initiative/ivm-view-initiative-detail/common-create/common-create-dialog.component';
import { PromptAgentComponent } from './prompt-agent/prompt-agentList/prompt-agent.component';
import { PromptAgentCreateComponent } from './prompt-agent/prompt-agent-create/prompt-agent-create.component';
import { PrepareAgentComponent } from './prompt-agent/prepare-agent/prepare-agent.component';
import { PromptAgentExecuteComponent } from './prompt-agent/prompt-agent-execute/prompt-agent-execute.component';
import { PromptTaskViewComponent } from './prompt-agent/prompt-task-view/prompt-task-view.component';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ClusterWorkflowComponent } from './cluster-workflow/cluster-workflow.component';

import { WorkerToolsComponent } from './worker-tools/worker-tools.component';
import { CreateWorkerToolsComponent } from './worker-tools/create-worker-tools/create-worker-tools.component';
import { ClusteringComponent } from './clustering/clustering.component';
import { BivariateAnalyticsComponent } from './dataset/bivariate-analytics/bivariate-analytics.component';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { KeyFilterModule } from 'primeng/keyfilter';

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
    ChainsComponent,
    ChainsViewComponent,
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
    ChainPipelineComponent,
    InstanceDescriptionComponent,
    JsonTreeComponent,
    JsonNodeComponent,
    JobsLogComponent,
    ConnectionViewComponent,
    DatasetTableViewComponent,
    CreateLinkedComponent,
    ChainsLogComponent,
    ModalConfigDatasetComponent,
    RestDatasetConfigComponent,
    DefaultComponent,
    EventsComponent,
    CreateeventComponent,
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
    ToolsComponent,
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
    FiltertagPipe, CopyPipelinesComponent,
    UserSecretsComponent,
    IvmComponent,
    IvmCreateModalComponent,
    IvmInboxComponent,
    IvmViewInitiativeComponent,
    SchedulerComponent,
    SchedulerListComponent,
    IvmViewAllInitiativeComponent,
    RelationshipComponent,
    StringToJSON,
    HighlightSearch,
    IvmRecentArtifactsComponent,
    ViewerAudioComponent,
    FormatStringPipe,
    InitialsPipe,
    IvmViewInitiativeDetailComponent,
    IvmViewInitiativeQuestionareComponent,
    FirstCharacterPipe,
    TicketlistComponent,
    ClusterTicketsComponent,
    CopydatasetsComponent,
    SolutionBotComponent,
    DgInstanceComponent,
    DgAppComponent,
    CreateDgappComponent,
    DgAppDescriptionComponent,
    SearchAllComponent,
    VideoSoltionComponent,
    CopyCipComponent,
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
    IntiativeFormComponent,
    QuestionareFormComponent,
    ChooseRuntimeComponent,
    ViewerFolderComponent,
    // CoreDatasourcesComponent,
    TicketlistdetailsComponent,
    WorkflowCreateSpecComponent,
    WorkflowTableComponent,
    ModalConfigWorkflowComponent,
    WkQuestionComponent,
    WorkflowDetailsComponent,
    WkWorkareaComponent,
    WkDatasetsviewComponent,
    WkDatasettableviewComponent,
    WkLogsComponent,
    WkFormComponent,
    DatasourceRegistryComponent,
    WkSummaryviewComponent,
    DataCorpusViewComponent,
    DatasetMacrobaseComponent,
    WkTimeseriesviewComponent,
    WkDashboardComponent,
    SwaggerComponent,
    WkPublishComponent,
    WkExecuteComponent,
    WorkareaDirective,
    TimeSeriesComponent,
    QuestionareFormComponent,
    SemanticSearchDialogComponent,
    SemanticSearchConfigComponent,
    SemanticSearchInferComponent,
    SemanticSearchFeedbackPopup,
    SecondsToTimePipe,
    AddWorkGroupComponent,
    ConfigureTemplatesComponent,
    AddTemplateComponent,
    InitiativeApproveComponent,
    MashupsComponent,
    CreateMashupComponent,
    MashupCreateComponent,
    MashupViewWrapperComponent,
    AibrainViewComponent,
    SemanticSearchDataSetViewDialogComponent,
    SemanticSearchDataSetSummaryViewDialogComponent,
    WkScheduleComponent,
    CustomListboxComponent,
    PaginationComponent,
    AgentComponent,
    CreateAgentComponent,
    AssignAppsComponent,
    AgentDescriptionComponent,
    InitiativeActivityComponent,
    FilterPipe,
    WranglingComponent,
    CommonCreateComponent,
    InitiativeActifactDetailsComponent,
    ColorThemeSelectorComponent,
    DataAnalyticsComponent,

    ViewChartComponent,
    OpenExplorationComponent, SafePipe,
    QueryBuilderComponent,
    RemoteConsoleComponent,
    DataMiningComponent,
    WranglingAdvisoryComponent,
    DatasetSemanticComponent,
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
    DocumentsLibraryComponent,
    PromptsComponent,
    PromptCreateComponent,
    PromptTemplateComponent,
    PromptEditComponent,
    OutputSchemaComponent,
    HighlightPipe,
    HighlightSearchPipe,
    AnnotateConfigComponent,
    DocumentCreateComponent,
    DocumentViewComponent,
    DatasetByNameComponent,
    DatasetKnowledgeComponent,
    DataEnchrichmentComponent,
    CommonEditComponent,
    AipRatingComponent,
    AipRatingViewComponent,
    ItsmSummaryComponent,
    ItsmRelatedTicketComponent,
    ItsmRecommendationsComponent,
    CommonCreateDialogComponent,
    PromptAgentComponent,
    PromptAgentCreateComponent,
    PrepareAgentComponent,
    PromptAgentExecuteComponent,
    PromptTaskViewComponent,
    ClusterWorkflowComponent,
    WorkerToolsComponent,
    CreateWorkerToolsComponent,
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
    WorkflowService,
    DatasourceService,
    SemanticService,
    MashupsService,
    WranglingService,
    DynamicRemoteLoad,
    WranglingDataService,
    ExpressionBuilderUtilsService,
    HighlightPipe,
    HighlightSearchPipe,
    PromptServices,
    SbxServicesService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    provideCharts(withDefaultRegisterables()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AipComponent],
})

export class AipModule { }
