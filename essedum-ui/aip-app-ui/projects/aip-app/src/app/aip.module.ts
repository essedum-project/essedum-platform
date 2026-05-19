import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AipRouting } from './aip-routing';
import { AipComponent } from './aip.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatasetServices } from './dataset/dataset-service';
import { EventsService } from './services/event.service';
import { MatChipsModule } from '@angular/material/chips';
import { ModelComponent } from './model/model.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { EnlCodeEditorComponent } from './enl-code-editor/enl-code-editor.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatError, MatHint, MatSelectModule } from '@angular/material/select';
import { NotebookDialogComponent } from './pipeline.description/notebook-dialog/notebook-dialog.component';
import { DatasourceComponent } from './datasource/datasource.component';
import { DatasetDescriptionComponent } from './dataset/dataset.description/dataset.description.component';
import { DatasetViewComponent } from './dataset/dataset-view/dataset-view.component';
import { DatasetConfigComponent } from './dataset/dataset-config/dataset-config.component';
import { environment } from '../environments/environment';
import { Services } from './services/service';
import { PipelineService } from './services/pipeline.service';
import { AgentDirectoryService } from './agent-directory/agent-directory.service';
import { AipInterceptorService } from './services/interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModelDescriptionComponent } from './model/model.description/model.description.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { TagsComponent } from './tags/tags.component';
import { SchemaComponent } from './schema/schema.component';
import { AdapterComponent } from './adapter/adapter.component';
import { InstanceComponent } from './instance/instance.component';
import { PipelineCreateComponent } from './pipeline/pipeline-create/pipeline-create.component';
import { MatRadioModule } from '@angular/material/radio';
import { SpecTemplateComponent } from './spec-template/spec-template.component';
import { SpecTemplateDescriptionComponent } from './spec-template/spec-template-description/spec-template-description.component';
import { AppListComponent } from './apps/app-list/app-list.component';
import { ViewAppComponent } from './apps/view-app/view-app.component';
import { AppConfigComponent } from './app-config/app-config.component';
import { FileUploadModule } from 'ng2-file-upload';
import { CreateAppComponent } from './apps/create-app/create-app.component';
import { AdapterCreateEditComponent } from './adapter/adapter-create-edit/adapter-create-edit.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component/confirm-delete-dialog.component';
import { JobDataViewerComponent } from './pipeline.description/job-data-viewer/job-data-viewer.component';
import { CreateSpecTemplateComponent } from './spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from './spec-template/edit-spec-template/edit-spec-template.component';
import { AdapterDescriptionComponent } from './adapter/adapter-description/adapter-description.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JobsComponent } from './jobs/jobs.component';
import { SpecTemplateCustomSwaggerComponent } from './spec-template/spec-template-custom-swagger/spec-template-custom-swagger.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NativeScriptComponent } from './native-script/native-script.component';
import { MatTreeModule } from '@angular/material/tree';
import { NativeScriptDialogComponent } from './native-script/native-script-dialog/native-script-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { encKey } from './services/encKey';
import { DashConstantService } from './services/dash-constant.service';
import { RaiservicesService } from './services/raiservices.service';
import { SemanticService } from './services/semantic.services';
import { JobsService } from './services/jobs.service';
import { DatasourceConfigComponent } from './datasource/datasource-config/datasource-config.component';
import { ModalConfigRestDatasourceComponent } from './datasource/modal-config-rest-datasource/modal-config-rest-datasource.component';
import { InstanceCreateEditComponent } from './instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from './instance/instance-description/instance-description.component';
import { JsonNodeComponent } from './json2table/json-node.component';
import { JsonTreeComponent } from './json2table/json-tree.component';
import { ConnectionViewComponent } from './datasource/connection-view/connection-view.component';
import {
  DatasetTableViewComponent,
  HighlightSearch,
} from './dataset/dataset-table-view/dataset-table-view.component';
import { ModalConfigDatasetComponent } from './dataset/modal-config-dataset/modal-config-dataset.component';
import { RestDatasetConfigComponent } from './dataset/rest-dataset-config/rest-dataset-config.component';
import { DefaultComponent } from './dataset/default/default.component';
import { DatasetEditComponent } from './dataset/dataset-edit/dataset-edit.component';
import { DatasetFullscreenViewComponent } from './dataset/dataset-fullscreen-view/dataset-fullscreen-view.component';
import { DatasetPowerModeViewComponent } from './dataset/dataset-power-mode-view/dataset-power-mode-view.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModalConfigSchemaComponent } from './schema/modal-config-schema/modal-config-schema.component';
import { ModalConfigSchemaEditorComponent } from './schema/modal-config-schema/modal-config-schema-editor/modal-config-schema-editor.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CarouselModule as CModule } from 'ngx-owl-carousel-o';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { UserSecretsComponent } from './pipeline.description/user-secrets/user-secrets.component';
import { FirstCharacterPipe } from './services/pipes/stringtojson.pipe';
import { ShowOutputArtifactsComponent } from './pipeline.description/show-output-artifacts/show-output-artifacts.component';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { ChooseRuntimeComponent } from './apps/choose-runtime/choose-runtime.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { PaginationComponent } from './pagination/pagination.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { NgBusyModule } from 'ng-busy';
import { PipelineDialogComponent } from './pipeline-dialog/pipeline-dialog.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { DragDropModule as CdkDragDropModule } from '@angular/cdk/drag-drop';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { QuillModule } from 'ngx-quill';
import { DatasetByNameComponent } from './dataset/dataset-by-name/dataset-by-name.component';
import { AdapterServices } from './sharedModule/services/adapter-service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SchemaRegistryService } from './services/schema-registry.service';
import { SchemaRelationshipService } from './schema/schema-relationship.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HighlightSearchPipe } from './pipes/highlight.pipe';
import { DynamicRemoteLoad } from './apps/view-app/remoteLoad';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { AipCardComponent } from './sharedModule/aip-card/aip-card.component';
import { AipPaginationComponent } from './sharedModule/aip-pagination/aip-pagination.component';
import { AipHeaderComponent } from './sharedModule/aip-header/aip-header.component';
import { AipEmptyStateComponent } from './sharedModule/aip-empty-state/aip-empty-state.component';
import { AipFilterComponent } from './sharedModule/aip-filter/aip-filter.component';
import { AipSnackbarCustomComponent } from './sharedModule/aip-snackbar-custom/aip-snackbar-custom.component';
import { AipSnackbarCustomService } from './sharedModule/services/aip-snackbar-custom.service';
import { AipLoadingComponent } from './sharedModule/aip-loading/aip-loading.component';
import { ModalConfigComponent } from './model/modal-config/modal-config.component';
import { ModalConfigSchemaHeaderComponent } from './schema/modal-config-schema/modal-config-schema-header/modal-config-schema-header.component';
import { AipDeleteConfirmationComponent } from './sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';
import { AipSwaggerCustomComponent } from './sharedModule/aip-swagger-custom/aip-swagger-custom.component';
import { AipMethodCreateEditComponent } from './sharedModule/aip-swagger-custom/aip-method-create-edit/aip-method-create-edit.component';
import { GitHubPushComponent } from './sharedModule/github-push/github-push.component';
import { GitHubService } from './sharedModule/services/github.service';
import { AgentComponent } from './agent/agent.component';
import { LitellmComponent } from './litellm/litellm.component';
import { LangfuseComponent } from './langfuse/langfuse.component';
import { SalusComponent } from './salus/salus.component';
import { AgentPipelineComponent } from './agent-pipeline/agent-pipeline.component';
import { AgentPipelineDashboardComponent } from './agent-pipeline/agent-pipeline-dashboard/agent-pipeline-dashboard.component';
import { GithubLoginComponent } from './agent-pipeline/github-login/github-login.component';
import { PlaygroundTabComponent } from './agent-pipeline/playground-tab/playground-tab.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgentDirectoryComponent } from './agent-directory/agent-directory.component';
import { AgentDirectoryViewComponent } from './agent-directory/agent-directory-view/agent-directory-view.component';
import { AgentDirectoryCreateComponent } from './agent-directory/agent-directory-create/agent-directory-create.component';
import { GeneralComponent } from './agent-directory/general/general.component';
import { AgentDirectoryEditComponent } from './agent-directory/agent-directory-edit/agent-directory-edit.component';
import { DeploymentFormComponent, BranchSelectionDialogComponent } from './agent-pipeline/deployment-form/deployment-form.component';
import { VibeStudioComponent } from './vibe-studio/vibe-studio/vibe-studio.component';
import { VibeLeftPanelComponent } from './vibe-studio/vibe-left-panel/vibe-left-panel.component';
import { VibeRightPanelComponent } from './vibe-studio/vibe-right-panel/vibe-right-panel.component';
import { VibeStudioService } from './vibe-studio/services/vibe-studio.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatStepperModule } from '@angular/material/stepper';

// Wizard imports (data-pipelines + training-pipelines)
import { DataPipelineWizardComponent } from './pipeline/wizard/data-pipeline-wizard/data-pipeline-wizard.component';
import { TrainingPipelineWizardComponent } from './pipeline/wizard/training-pipeline-wizard/training-pipeline-wizard.component';
import { GitLinkStepComponent } from './pipeline/wizard/shared/git-link-step.component';
import { PipelineEditorComponent } from './pipeline/wizard/editor/pipeline-editor.component';
import { CodeEditorTabComponent } from './pipeline/wizard/editor/tabs/code-editor-tab.component';
import { VibeCodeTabComponent } from './pipeline/wizard/editor/tabs/vibe-code-tab.component';
import { GitTabComponent } from './pipeline/wizard/editor/tabs/git-tab.component';
import { ConfigTabComponent } from './pipeline/wizard/editor/tabs/config-tab.component';
import { RunHistoryTabComponent } from './pipeline/wizard/editor/tabs/run-history-tab.component';
import { MetricsTabComponent } from './pipeline/wizard/editor/tabs/metrics-tab.component';
import { LogsTabComponent } from './pipeline/wizard/editor/tabs/logs-tab.component';
import { FunctionLibraryComponent } from './pipeline/wizard/editor/function-library/function-library.component';
import { GitLinkService } from './services/git-link.service';

PlotlyModule.plotlyjs = PlotlyJS;
const dbConfig: DBConfig = {
  name: 'icm_tickets',
  version: 1,
  objectStoresMeta: [
    {
      store: 'ticketData',
      storeConfig: { keyPath: 'number', autoIncrement: false },
      storeSchema: [
        {
          name: 'incidentNumber',
          keypath: 'incidentNumber',
          options: { unique: false },
        },
        { name: 'type', keypath: 'type', options: { unique: false } },
        { name: 'priority', keypath: 'priority', options: { unique: false } },
        { name: 'date', keypath: 'date', options: { unique: false } },
      ],
    },
  ],
};

@NgModule({
  declarations: [
    AipComponent,
    ModelComponent,
    DatasourceConfigComponent,
    PipelineComponent,
    PipelineCreateComponent,
    NotebookDialogComponent,
    EnlCodeEditorComponent,
    DatasourceComponent,
    ModalConfigRestDatasourceComponent,
    DatasetDescriptionComponent,
    DatasetViewComponent,
    DatasetConfigComponent,
    ModelDescriptionComponent,
    TagsComponent,
    SchemaComponent,
    AdapterComponent,
    InstanceComponent,
    InstanceCreateEditComponent,
    CreateAppComponent,
    AppListComponent,
    ChooseRuntimeComponent,
    SpecTemplateComponent,
    SpecTemplateDescriptionComponent,
    ViewAppComponent,
    AppConfigComponent,
    AdapterCreateEditComponent,
    ConfirmDeleteDialogComponent,
    JobDataViewerComponent,
    ShowOutputArtifactsComponent,
    CreateSpecTemplateComponent,
    EditSpecTemplateComponent,
    AdapterDescriptionComponent,
    JobsComponent,
    SpecTemplateCustomSwaggerComponent,
    NativeScriptComponent,
    NativeScriptDialogComponent,
    InstanceDescriptionComponent,
    JsonTreeComponent,
    JsonNodeComponent,
    ConnectionViewComponent,
    DatasetTableViewComponent,
    ModalConfigDatasetComponent,
    RestDatasetConfigComponent,
    DefaultComponent,
    DatasetEditComponent,
    DatasetFullscreenViewComponent,
    DatasetPowerModeViewComponent,
    ModalConfigSchemaComponent,
    ModalConfigSchemaEditorComponent,
    UserSecretsComponent,
    HighlightSearch,
    FirstCharacterPipe,
    HighlightSearchPipe,
    PaginationComponent,
    PipelineDialogComponent,
    DatasetByNameComponent,
    AipSnackbarCustomComponent,
    AipCardComponent,
    AipPaginationComponent,
    AipHeaderComponent,
    AipEmptyStateComponent,
    AipFilterComponent,
    AipLoadingComponent,
    AipDeleteConfirmationComponent,
    AipSwaggerCustomComponent,
    AipMethodCreateEditComponent,
    ModalConfigSchemaHeaderComponent,
    ModalConfigComponent,
    AgentComponent,
    LitellmComponent,
    LangfuseComponent,
    SalusComponent,
    AgentPipelineComponent,
    AgentPipelineDashboardComponent,
    PlaygroundTabComponent,
    GitHubPushComponent,
    AgentDirectoryComponent,
    AgentDirectoryViewComponent,
    AgentDirectoryCreateComponent,
    GeneralComponent,
    AgentDirectoryEditComponent,
    DeploymentFormComponent,
    BranchSelectionDialogComponent,
    VibeStudioComponent,
    VibeLeftPanelComponent,
    VibeRightPanelComponent,
    DashboardComponent,
    // Wizard / editor components
    DataPipelineWizardComponent,
    TrainingPipelineWizardComponent,
    GitLinkStepComponent,
    PipelineEditorComponent,
    CodeEditorTabComponent,
    VibeCodeTabComponent,
    GitTabComponent,
    ConfigTabComponent,
    RunHistoryTabComponent,
    MetricsTabComponent,
    LogsTabComponent,
    FunctionLibraryComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AipRouting,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    GithubLoginComponent,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule,
    MatError,
    MatHint,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggle,
    MatSliderModule,
    MatSnackBarModule,
    MatTabsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    NgbModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    MatRadioModule,
    FileUploadModule,
    MatExpansionModule,
    NgJsonEditorModule,
    MatTreeModule,
    MatSidenavModule,
    ScrollingModule,
    MatAutocompleteModule,
    PdfViewerModule,
    NgxPaginationModule,
    CModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    MarkdownModule.forRoot(),
    NgxMatSelectSearchModule,
    AngularDualListBoxModule,
    MatMenuModule,
    PlotlyModule,
    NgBusyModule,
    MatButtonModule,
    CdkDragDropModule,
    NgxSliderModule,
    QuillModule,
  ],
  providers: [
    {
      provide: 'envi',
      useValue: environment.baseUrl,
    },
    { provide: 'dataSets', useValue: environment.datasetsUrl },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AipInterceptorService,
      multi: true,
    },
    {
      provide: 'sbx',
      useValue: '/api/exp',
    },
    Services,
    AdapterServices,
    PipelineService,
    DatasetServices,
    EventsService,
    JobsService,
    SchemaRegistryService,
    AgentDirectoryService,
    encKey,
    DashConstantService,
    SchemaRelationshipService,
    RaiservicesService,
    SemanticService,
    DynamicRemoteLoad,
    AipSnackbarCustomService,
    GitHubService,
    VibeStudioService,
    GitLinkService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AipComponent],
})
export class AipModule { }
