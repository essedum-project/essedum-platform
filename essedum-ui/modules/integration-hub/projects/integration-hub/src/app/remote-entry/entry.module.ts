import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
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

// Third-party
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { QuillModule } from 'ngx-quill';
import { NgBusyModule } from 'ng-busy';

// Routing
import { EntryRoutingModule } from './entry-routing.module';

// Features: adapter
import { AdapterComponent } from '../features/adapter/adapter.component';
import { AdapterCreateEditComponent } from '../features/adapter/adapter-create-edit/adapter-create-edit.component';
import { AdapterDescriptionComponent } from '../features/adapter/adapter-description/adapter-description.component';
import { MethodCreateEditComponent } from '../features/adapter/method-create-edit/method-create-edit.component';

// Features: pipeline
import { PipelineComponent } from '../features/pipeline/pipeline.component';
import { PipelineCreateComponent } from '../features/pipeline/pipeline-create/pipeline-create.component';

// Features: pipeline-dialog
import { PipelineDialogComponent } from '../features/pipeline-dialog/pipeline-dialog.component';

// Features: pipeline.description
import { JobDataViewerComponent } from '../features/pipeline.description/job-data-viewer/job-data-viewer.component';
import { ShowOutputArtifactsComponent } from '../features/pipeline.description/show-output-artifacts/show-output-artifacts.component';
import { NotebookDialogComponent } from '../features/pipeline.description/notebook-dialog/notebook-dialog.component';
import { UserSecretsComponent } from '../features/pipeline.description/user-secrets/user-secrets.component';

// Features: native-script (ported from legacy aip-app-ui — fixes NG04002 on pipelines/view/:cname)
import { NativeScriptComponent } from '../features/native-script/native-script.component';
import { NativeScriptDialogComponent } from '../features/native-script/native-script-dialog/native-script-dialog.component';
// app-enl-code-editor selector used inside native-script template; without it the
// element fell through to CUSTOM_ELEMENTS_SCHEMA and the Script tab eventually
// OOM-killed the renderer.
import { EnlCodeEditorComponent } from '../features/enl-code-editor/enl-code-editor.component';

// Features: apps
import { AppListComponent } from '../features/apps/app-list/app-list.component';
import { ViewAppComponent } from '../features/apps/view-app/view-app.component';
import { CreateAppComponent } from '../features/apps/create-app/create-app.component';
import { ChooseRuntimeComponent } from '../features/apps/choose-runtime/choose-runtime.component';
import { DynamicRemoteLoad } from '../features/apps/view-app/remoteLoad';

// Features: instance
import { InstanceComponent } from '../features/instance/instance.component';
import { InstanceCreateEditComponent } from '../features/instance/instance-create-edit/instance-create-edit.component';
import { InstanceDescriptionComponent } from '../features/instance/instance-description/instance-description.component';

// Features: jobs
import { JobsComponent } from '../features/jobs/jobs.component';
import { JobsService } from '../features/services/jobs.service';

// swagger-custom
import { SwaggerCustomComponent } from '../features/swagger-custom/swagger-custom.component';

// Features: schema (moved from data-ops MFE 2026-05-26 per user request)
import { SchemaComponent } from '../features/schema/schema.component';
import { ModalConfigSchemaComponent } from '../features/schema/modal-config-schema/modal-config-schema.component';
import { ModalConfigSchemaEditorComponent } from '../features/schema/modal-config-schema/modal-config-schema-editor/modal-config-schema-editor.component';
import { ModalConfigSchemaHeaderComponent } from '../features/schema/modal-config-schema/modal-config-schema-header/modal-config-schema-header.component';
import { SchemaRelationshipService } from '../features/schema/schema-relationship.service';

// Migrated from legacy aip-app-ui (2026-05-25): salus iframe wrapper.
// Dashboard moved to host (shell/landing/dashboard) per MFE plan §1.
import { SalusComponent } from '../features/salus/salus.component';

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
import { SchemaRegistryService } from '../features/services/schema-registry.service';
import { PipelineService } from '../features/services/pipeline.service';
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

// Environment is now only a fallback if the host hasn't provided API_CONFIG.
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [
    // adapter
    AdapterComponent,
    AdapterCreateEditComponent,
    AdapterDescriptionComponent,
    MethodCreateEditComponent,
    // pipeline
    PipelineComponent,
    PipelineCreateComponent,
    PipelineDialogComponent,
    JobDataViewerComponent,
    ShowOutputArtifactsComponent,
    NotebookDialogComponent,
    UserSecretsComponent,
    // native-script
    NativeScriptComponent,
    NativeScriptDialogComponent,
    EnlCodeEditorComponent,
    // apps
    AppListComponent,
    ViewAppComponent,
    CreateAppComponent,
    ChooseRuntimeComponent,
    // instance
    InstanceComponent,
    InstanceCreateEditComponent,
    InstanceDescriptionComponent,
    // jobs
    JobsComponent,
    // schema (moved from data-ops 2026-05-26)
    SchemaComponent,
    ModalConfigSchemaComponent,
    ModalConfigSchemaEditorComponent,
    ModalConfigSchemaHeaderComponent,
    // swagger-custom
    SwaggerCustomComponent,
    // migrated from legacy aip-app-ui (dashboard moved to host)
    SalusComponent,
    // Shared local UI
    // sharedModule aip-* — remaining MFE-private (rest moved to SharedLibUiModule)
    AipFilterComponent,
    AipSwaggerCustomComponent,
    AipMethodCreateEditComponent,
    // Pipes
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    EntryRoutingModule,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
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
    SchemaRegistryService,
    SchemaRelationshipService,
    PipelineService,
    JobsService,
    RaiservicesService,
    SemanticService,
    TagsService,
    DashConstantService,
    encKey,
    AipSnackbarCustomService,
    DynamicRemoteLoad,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
