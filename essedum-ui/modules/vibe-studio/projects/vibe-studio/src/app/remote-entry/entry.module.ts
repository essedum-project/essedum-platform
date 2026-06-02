import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatError, MatHint, MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';

// CDK
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule as CdkDragDropModule } from '@angular/cdk/drag-drop';

// Third-party (NOTE: ngx-quill, ang-jsoneditor are MFE-private — bundled here, not shared)
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { QuillModule } from 'ngx-quill';
import { NgBusyModule } from 'ng-busy';
import { FileUploadModule } from 'ng2-file-upload';

// Routing
import { EntryRoutingModule } from './entry-routing.module';

// Features: vibe-studio
import { VibeStudioComponent } from '../features/vibe-studio/vibe-studio/vibe-studio.component';
import { VibeLeftPanelComponent } from '../features/vibe-studio/vibe-left-panel/vibe-left-panel.component';
import { VibeRightPanelComponent } from '../features/vibe-studio/vibe-right-panel/vibe-right-panel.component';
import { VibeStudioService } from '../features/vibe-studio/services/vibe-studio.service';

// Features: enl-code-editor
import { EnlCodeEditorComponent } from '../features/enl-code-editor/enl-code-editor.component';

// Features: native-script
import { NativeScriptComponent } from '../features/native-script/native-script.component';
import { NativeScriptDialogComponent } from '../features/native-script/native-script-dialog/native-script-dialog.component';

// Features: spec-template
import { SpecTemplateComponent } from '../features/spec-template/spec-template.component';
import { SpecTemplateDescriptionComponent } from '../features/spec-template/spec-template-description/spec-template-description.component';
import { CreateSpecTemplateComponent } from '../features/spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from '../features/spec-template/edit-spec-template/edit-spec-template.component';
import { SpecTemplateCustomSwaggerComponent } from '../features/spec-template/spec-template-custom-swagger/spec-template-custom-swagger.component';

// Cross-domain stubs needed by native-script.component.ts imports
import { PipelineCreateComponent } from '../features/pipeline/pipeline-create/pipeline-create.component';
import { NotebookDialogComponent } from '../features/pipeline.description/notebook-dialog/notebook-dialog.component';

// swagger-custom (used by spec-template-custom-swagger transitively)
import { SwaggerCustomComponent } from '../features/swagger-custom/swagger-custom.component';

// Shared local UI
import { TagsComponent } from '@essedum/shared-lib';

// sharedModule local UI primitives — remaining MFE-private ones.
// AipCard, AipPagination, AipHeader, AipEmptyState, AipSnackbarCustom, AipLoading,
// AipDeleteConfirmation now come from @essedum/shared-lib (SharedLibUiModule).
import { AipFilterComponent } from '../features/sharedModule/aip-filter/aip-filter.component';
import { AipSwaggerCustomComponent } from '../features/sharedModule/aip-swagger-custom/aip-swagger-custom.component';
import { AipMethodCreateEditComponent } from '../features/sharedModule/aip-swagger-custom/aip-method-create-edit/aip-method-create-edit.component';

// Services
import { Services } from '@essedum/shared-lib';
import { EventsService } from '../features/services/event.service';
import { RaiservicesService } from '../features/services/raiservices.service';
import { TagsService } from '@essedum/shared-lib';
import { DashConstantService } from '@essedum/shared-lib';
import { encKey } from '@essedum/shared-lib';
import { DatasetServices } from '../features/dataset/dataset-service';
import { SemanticService } from '../features/services/semantic.services';
import { AipSnackbarCustomService } from '@essedum/shared-lib';
import { AdapterServices } from '@essedum/shared-lib';

// Pipes — FirstCharacterPipe is now declared in SharedLibUiModule (shared-lib).

// Shared-lib: API config + auth interceptor + consolidated UI primitives
import { API_CONFIG, ApiConfig, AuthInterceptor, SharedLibUiModule } from '@essedum/shared-lib';

// Features: agent
import { AgentComponent } from '../features/agent/agent.component';

// Features: litellm
import { LitellmComponent } from '../features/litellm/litellm.component';

// Features: langfuse
import { LangfuseComponent } from '../features/langfuse/langfuse.component';

// Features: salus
import { SalusComponent } from '../features/salus/salus.component';

// Features: agent-pipeline
import { AgentPipelineComponent } from '../features/agent-pipeline/agent-pipeline.component';
import { AgentPipelineDashboardComponent } from '../features/agent-pipeline/agent-pipeline-dashboard/agent-pipeline-dashboard.component';
import { GithubLoginComponent } from '../features/agent-pipeline/github-login/github-login.component';
import { PlaygroundTabComponent } from '../features/agent-pipeline/playground-tab/playground-tab.component';
import { DeploymentFormComponent, BranchSelectionDialogComponent } from '../features/agent-pipeline/deployment-form/deployment-form.component';

// Features: agent-directory
import { AgentDirectoryComponent } from '../features/agent-directory/agent-directory.component';
import { AgentDirectoryViewComponent } from '../features/agent-directory/agent-directory-view/agent-directory-view.component';
import { AgentDirectoryCreateComponent } from '../features/agent-directory/agent-directory-create/agent-directory-create.component';
import { GeneralComponent } from '../features/agent-directory/general/general.component';
import { AgentDirectoryEditComponent } from '../features/agent-directory/agent-directory-edit/agent-directory-edit.component';
import { AgentDirectoryService } from '../features/agent-directory/agent-directory.service';

// Features: dashboard
import { DashboardComponent } from '../features/dashboard/dashboard.component';

// Features: pipeline wizard
import { DataPipelineWizardComponent } from '../features/pipeline/wizard/data-pipeline-wizard/data-pipeline-wizard.component';
import { TrainingPipelineWizardComponent } from '../features/pipeline/wizard/training-pipeline-wizard/training-pipeline-wizard.component';
import { GitLinkStepComponent } from '../features/pipeline/wizard/shared/git-link-step.component';
import { PipelineEditorComponent } from '../features/pipeline/wizard/editor/pipeline-editor.component';
import { CodeEditorTabComponent } from '../features/pipeline/wizard/editor/tabs/code-editor-tab.component';
import { VibeCodeTabComponent } from '../features/pipeline/wizard/editor/tabs/vibe-code-tab.component';
import { GitTabComponent } from '../features/pipeline/wizard/editor/tabs/git-tab.component';
import { ConfigTabComponent } from '../features/pipeline/wizard/editor/tabs/config-tab.component';
import { RunHistoryTabComponent } from '../features/pipeline/wizard/editor/tabs/run-history-tab.component';
import { MetricsTabComponent } from '../features/pipeline/wizard/editor/tabs/metrics-tab.component';
import { LogsTabComponent } from '../features/pipeline/wizard/editor/tabs/logs-tab.component';
import { FunctionLibraryComponent } from '../features/pipeline/wizard/editor/function-library/function-library.component';

// Features: sharedModule additions
import { GitHubPushComponent } from '../features/sharedModule/github-push/github-push.component';
import { GitHubService } from '../features/sharedModule/services/github.service';

// Additional services
import { PipelineService } from '../features/services/pipeline.service';
import { SchemaRegistryService } from '../features/services/schema-registry.service';
import { GitLinkService } from '../features/services/git-link.service';

// Material: stepper
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';

// Features: aip (layout)
import { AipComponent } from '../features/aip/aip.component';

// Features: model
import { ModelComponent } from '../features/model/model.component';
import { ModelDescriptionComponent } from '../features/model/model.description/model.description.component';
import { ModalConfigComponent } from '../features/model/modal-config/modal-config.component';

// Features: pipeline
import { PipelineComponent } from '../features/pipeline/pipeline.component';

// Features: datasource
import { DatasourceComponent } from '../features/datasource/datasource.component';
import { DatasourceService } from '../features/datasource/datasource.service';
import { DatasourceConfigComponent } from '../features/datasource/datasource-config/datasource-config.component';
import { ConnectionViewComponent } from '../features/datasource/connection-view/connection-view.component';
import { ModalConfigRestDatasourceComponent } from '../features/datasource/modal-config-rest-datasource/modal-config-rest-datasource.component';

// Features: dataset
import { DatasetDescriptionComponent } from '../features/dataset/dataset.description/dataset.description.component';
import { DatasetViewComponent } from '../features/dataset/dataset-view/dataset-view.component';
import { DatasetConfigComponent } from '../features/dataset/dataset-config/dataset-config.component';
import { DatasetEditComponent } from '../features/dataset/dataset-edit/dataset-edit.component';
import { DatasetByNameComponent } from '../features/dataset/dataset-by-name/dataset-by-name.component';
import { ModalConfigDatasetComponent } from '../features/dataset/modal-config-dataset/modal-config-dataset.component';
import { RestDatasetConfigComponent } from '../features/dataset/rest-dataset-config/rest-dataset-config.component';
import { DefaultComponent } from '../features/dataset/default/default.component';
import { DatasetFullscreenViewComponent } from '../features/dataset/dataset-fullscreen-view/dataset-fullscreen-view.component';
import { DatasetPowerModeViewComponent } from '../features/dataset/dataset-power-mode-view/dataset-power-mode-view.component';
import { DatasetTableViewComponent, HighlightSearch } from '../features/dataset/dataset-table-view/dataset-table-view.component';

// Features: schema
import { SchemaComponent } from '../features/schema/schema.component';
import { ModalConfigSchemaComponent } from '../features/schema/modal-config-schema/modal-config-schema.component';
import { ModalConfigSchemaEditorComponent } from '../features/schema/modal-config-schema/modal-config-schema-editor/modal-config-schema-editor.component';
import { ModalConfigSchemaHeaderComponent } from '../features/schema/modal-config-schema/modal-config-schema-header/modal-config-schema-header.component';

// Features: adapter
import { AdapterComponent } from '../features/adapter/adapter.component';
import { AdapterCreateEditComponent } from '../features/adapter/adapter-create-edit/adapter-create-edit.component';
import { AdapterDescriptionComponent } from '../features/adapter/adapter-description/adapter-description.component';

// Features: instance
import { InstanceComponent } from '../features/instance/instance.component';
import { InstanceCreateEditComponent } from '../features/instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from '../features/instance/instance-description/instance-description.component';

// Features: apps
import { AppListComponent } from '../features/apps/app-list/app-list.component';
import { ViewAppComponent } from '../features/apps/view-app/view-app.component';
import { CreateAppComponent } from '../features/apps/create-app/create-app.component';
import { AppConfigComponent } from '../features/app-config/app-config.component';
import { ChooseRuntimeComponent } from '../features/apps/choose-runtime/choose-runtime.component';
import { DynamicRemoteLoad } from '../features/apps/view-app/remoteLoad';

// Features: pagination
import { PaginationComponent } from '../features/pagination/pagination.component';

// Features: jobs
import { JobsComponent } from '../features/jobs/jobs.component';
import { JobsService } from '../features/services/jobs.service';
import { JobDataViewerComponent } from '../features/pipeline.description/job-data-viewer/job-data-viewer.component';
import { ShowOutputArtifactsComponent } from '../features/pipeline.description/show-output-artifacts/show-output-artifacts.component';
import { UserSecretsComponent } from '../features/pipeline.description/user-secrets/user-secrets.component';

// Features: json2table
import { JsonNodeComponent } from '../features/json2table/json-node.component';
import { JsonTreeComponent } from '../features/json2table/json-tree.component';

// Features: confirm-delete-dialog
import { ConfirmDeleteDialogComponent } from '../features/confirm-delete-dialog.component/confirm-delete-dialog.component';

// Features: pipeline-dialog
import { PipelineDialogComponent } from '../features/pipeline-dialog/pipeline-dialog.component';

// Additional services
import { SchemaRelationshipService } from '../features/schema/schema-relationship.service';

// Pipes
import { HighlightSearchPipe } from '../features/pipes/highlight.pipe';



// Environment is now only a fallback if the host hasn't provided API_CONFIG.
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [
    // vibe-studio
    VibeStudioComponent,
    VibeLeftPanelComponent,
    VibeRightPanelComponent,
    // enl-code-editor
    EnlCodeEditorComponent,
    // native-script
    NativeScriptComponent,
    NativeScriptDialogComponent,
    // spec-template
    SpecTemplateComponent,
    SpecTemplateDescriptionComponent,
    CreateSpecTemplateComponent,
    EditSpecTemplateComponent,
    SpecTemplateCustomSwaggerComponent,
    // Cross-domain stubs
    PipelineCreateComponent,
    NotebookDialogComponent,
    // swagger-custom
    SwaggerCustomComponent,
    // Shared local UI
    // sharedModule aip-* — remaining MFE-private (rest moved to SharedLibUiModule)
    AipFilterComponent,
    AipSwaggerCustomComponent,
    AipMethodCreateEditComponent,
    // aip (layout)
    AipComponent,
    // model
    ModelComponent,
    ModelDescriptionComponent,
    ModalConfigComponent,
    // pipeline
    PipelineComponent,
    PipelineDialogComponent,
    // datasource
    DatasourceComponent,
    DatasourceConfigComponent,
    ModalConfigRestDatasourceComponent,
    ConnectionViewComponent,
    // dataset
    DatasetDescriptionComponent,
    DatasetViewComponent,
    DatasetConfigComponent,
    DatasetEditComponent,
    DatasetByNameComponent,
    ModalConfigDatasetComponent,
    RestDatasetConfigComponent,
    DefaultComponent,
    DatasetFullscreenViewComponent,
    DatasetPowerModeViewComponent,
    DatasetTableViewComponent,
    HighlightSearch,
    // schema
    SchemaComponent,
    ModalConfigSchemaComponent,
    ModalConfigSchemaEditorComponent,
    ModalConfigSchemaHeaderComponent,
    // adapter
    AdapterComponent,
    AdapterCreateEditComponent,
    AdapterDescriptionComponent,
    // instance
    InstanceComponent,
    InstanceCreateEditComponent,
    InstanceDescriptionComponent,
    // apps
    AppListComponent,
    ViewAppComponent,
    CreateAppComponent,
    AppConfigComponent,
    ChooseRuntimeComponent,
    // pagination
    PaginationComponent,
    // jobs
    JobsComponent,
    JobDataViewerComponent,
    ShowOutputArtifactsComponent,
    UserSecretsComponent,
    // json2table
    JsonTreeComponent,
    JsonNodeComponent,
    // confirm-delete-dialog
    ConfirmDeleteDialogComponent,
    // Pipes
    HighlightSearchPipe,
    // Agent
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
    // Dashboard
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
    FormsModule,
    ReactiveFormsModule,
    EntryRoutingModule,
    MatCardModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatError,
    MatHint,
    MatDialogModule,
    MatRadioModule,
    MatExpansionModule,
    MatTreeModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggle,
    MatSliderModule,
    MatSnackBarModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    ScrollingModule,
    CdkDragDropModule,
    NgbModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    NgJsonEditorModule,
    FileUploadModule,
    NgxPaginationModule,
    NgxMatSelectSearchModule,
    MarkdownModule.forRoot(),
    QuillModule,
    NgBusyModule,
    GithubLoginComponent,
    MatStepperModule,
    MatGridListModule,

    // Consolidated UI primitives (formerly duplicated in each MFE)
    SharedLibUiModule,
  ],
  providers: [
    {
      provide: API_CONFIG,
      useValue: {
        baseUrl: environment.baseUrl ?? '/api/aip',
        datasetsUrl: environment.datasetsUrl ?? '/api/aip',
        sandboxUrl: '/api/exp',
      } as ApiConfig,
    },
    { provide: 'envi',     useFactory: (cfg: ApiConfig) => cfg.baseUrl,     deps: [API_CONFIG] },
    { provide: 'dataSets', useFactory: (cfg: ApiConfig) => cfg.datasetsUrl, deps: [API_CONFIG] },
    { provide: 'sbx',      useFactory: (cfg: ApiConfig) => cfg.sandboxUrl,  deps: [API_CONFIG] },
    Services,
    DatasetServices,
    AdapterServices,
    EventsService,
    RaiservicesService,
    SemanticService,
    TagsService,
    DashConstantService,
    encKey,
    AipSnackbarCustomService,
    PipelineService,
    SchemaRegistryService,
    AgentDirectoryService,
    GitHubService,
    VibeStudioService,
    GitLinkService,
    DatasourceService,
    JobsService,
    SchemaRelationshipService,
    DynamicRemoteLoad,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
