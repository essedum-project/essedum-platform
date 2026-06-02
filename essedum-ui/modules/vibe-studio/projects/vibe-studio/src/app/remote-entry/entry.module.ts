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
    RaiservicesService,
    SemanticService,
    TagsService,
    DashConstantService,
    encKey,
    AipSnackbarCustomService,
    VibeStudioService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
