import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
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

// Features: agent
import { AgentComponent } from '../features/agent/agent.component';

// Features: agent-pipeline
import { AgentPipelineComponent } from '../features/agent-pipeline/agent-pipeline.component';
import { AgentPipelineDashboardComponent } from '../features/agent-pipeline/agent-pipeline-dashboard/agent-pipeline-dashboard.component';
import { PipelineInExecutionComponent } from '../features/agent-pipeline/pipeline-in-execution/pipeline-in-execution.component';
import { PodLogDialogComponent } from '../features/agent-pipeline/pipeline-in-execution/pod-log-dialog/pod-log-dialog.component';
import { GithubLoginComponent } from '../features/agent-pipeline/github-login/github-login.component';
import { PlaygroundTabComponent } from '../features/agent-pipeline/playground-tab/playground-tab.component';
import { DeploymentFormComponent, BranchSelectionDialogComponent } from '../features/agent-pipeline/deployment-form/deployment-form.component';
import { AgentPipelineService } from '../features/agent-pipeline/agent-pipeline.service';

// Features: agent-directory
import { AgentDirectoryComponent } from '../features/agent-directory/agent-directory.component';
import { AgentDirectoryViewComponent } from '../features/agent-directory/agent-directory-view/agent-directory-view.component';
import { AgentDirectoryCreateComponent } from '../features/agent-directory/agent-directory-create/agent-directory-create.component';
import { AgentDirectoryEditComponent } from '../features/agent-directory/agent-directory-edit/agent-directory-edit.component';
import { GeneralComponent } from '../features/agent-directory/general/general.component';
import { AgentDirectoryService } from '../features/agent-directory/agent-directory.service';

// Cross-MFE-domain stubs copied for compile-time satisfaction (pipeline-create is integration domain)
import { PipelineCreateComponent } from '../features/pipeline/pipeline-create/pipeline-create.component';

// Local wizard components (lightweight versions of integration-hub wizards)
import { DataPipelineWizardLocalComponent } from '../features/agent-pipeline/wizard/data-pipeline-wizard/data-pipeline-wizard.component';
import { TrainingPipelineWizardLocalComponent } from '../features/agent-pipeline/wizard/training-pipeline-wizard/training-pipeline-wizard.component';
import { GitLinkStepLocalComponent } from '../features/agent-pipeline/wizard/shared/git-link-step.component';

// Migrated from legacy aip-app-ui (2026-05-25): LLM ops + observability iframe wrappers
import { LitellmComponent } from '../features/litellm/litellm.component';
import { LangfuseComponent } from '../features/langfuse/langfuse.component';

// Features: skills
import { SkillsComponent } from '../features/skills/skills.component';
import { SkillsAddComponent } from '../features/skills/skills-add/skills-add.component';
import { SkillsEditViewComponent } from '../features/skills/skills-edit-view/skills-edit-view.component';
import { SkillsService } from '../features/services/skills.service';

// EnlCodeEditorComponent now lives in @essedum/shared-lib (2026-06-03 refactor).
// It's declared by SharedLibUiModule which agent-studio already imports below.

// Shared local UI (copied verbatim from monolith for now)
import { TagsComponent } from '@essedum/shared-lib';

// sharedModule local UI primitives — remaining MFE-private ones.
// AipCard, AipPagination, AipHeader, AipEmptyState, AipSnackbarCustom, AipLoading,
// AipDeleteConfirmation now come from @essedum/shared-lib (SharedLibUiModule).
import { AipFilterComponent } from '../features/sharedModule/aip-filter/aip-filter.component';
import { GitHubPushComponent } from '../features/sharedModule/github-push/github-push.component';

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
import { GitHubService } from '../features/sharedModule/services/github.service';
import { AdapterServices } from '@essedum/shared-lib';

// Pipes — FirstCharacterPipe is now declared in SharedLibUiModule (shared-lib).

// Shared-lib: single source of API config + auth interceptor
import { API_CONFIG, ApiConfig, AuthInterceptor, SharedLibUiModule } from '@essedum/shared-lib';

// Environment is now only a fallback if the host hasn't provided API_CONFIG.
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [
    AgentComponent,
    AgentPipelineComponent,
    AgentPipelineDashboardComponent,
    PipelineInExecutionComponent,
    PodLogDialogComponent,
    PlaygroundTabComponent,
    DeploymentFormComponent,
    BranchSelectionDialogComponent,
    AgentDirectoryComponent,
    AgentDirectoryViewComponent,
    AgentDirectoryCreateComponent,
    AgentDirectoryEditComponent,
    GeneralComponent,
    PipelineCreateComponent,
    // Local wizard components
    DataPipelineWizardLocalComponent,
    TrainingPipelineWizardLocalComponent,
    GitLinkStepLocalComponent,
    // migrated from legacy aip-app-ui
    LitellmComponent,
    LangfuseComponent,
    SkillsComponent,
    SkillsAddComponent,
    SkillsEditViewComponent,
    GitHubPushComponent,
    // sharedModule aip-* — remaining MFE-private (rest moved to SharedLibUiModule)
    AipFilterComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    EntryRoutingModule,
    // Standalone components live in `imports`
    GithubLoginComponent,
    // Angular Material
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatChipsModule,
    MatStepperModule,
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
    // CDK
    ScrollingModule,
    CdkDragDropModule,
    // Third-party
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
        langflowUrl: environment.langflowUrl ?? '/langflow/',
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
    GitHubService,
    AgentPipelineService,
    AgentDirectoryService,
    SkillsService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
