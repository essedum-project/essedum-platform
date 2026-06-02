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
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxPaginationModule } from 'ngx-pagination';
import { CarouselModule as CModule } from 'ngx-owl-carousel-o';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkdownModule } from 'ngx-markdown';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { NgBusyModule } from 'ng-busy';
import { QuillModule } from 'ngx-quill';

// Routing
import { EntryRoutingModule } from './entry-routing.module';

// Features: dataset
import { DatasetComponent } from '../features/dataset/dataset.component';
import { DatasetDescriptionComponent } from '../features/dataset/dataset.description/dataset.description.component';
import { DatasetViewComponent } from '../features/dataset/dataset-view/dataset-view.component';
import { DatasetConfigComponent } from '../features/dataset/dataset-config/dataset-config.component';
import { DatasetEditComponent } from '../features/dataset/dataset-edit/dataset-edit.component';
import { DatasetByNameComponent } from '../features/dataset/dataset-by-name/dataset-by-name.component';
import { DatasetFullscreenViewComponent } from '../features/dataset/dataset-fullscreen-view/dataset-fullscreen-view.component';
import { DatasetPowerModeViewComponent } from '../features/dataset/dataset-power-mode-view/dataset-power-mode-view.component';
import { DatasetTableViewComponent, HighlightSearch } from '../features/dataset/dataset-table-view/dataset-table-view.component';
import { ModalConfigDatasetComponent } from '../features/dataset/modal-config-dataset/modal-config-dataset.component';
import { RestDatasetConfigComponent } from '../features/dataset/rest-dataset-config/rest-dataset-config.component';
import { DefaultComponent } from '../features/dataset/default/default.component';
import { DatasetServices } from '../features/dataset/dataset-service';

// Features: model
import { ModelComponent } from '../features/model/model.component';
import { ModelDescriptionComponent } from '../features/model/model.description/model.description.component';
import { ModalConfigComponent } from '../features/model/modal-config/modal-config.component';

// Features: datasource
import { DatasourceComponent } from '../features/datasource/datasource.component';
import { DatasourceConfigComponent } from '../features/datasource/datasource-config/datasource-config.component';
import { ConnectionViewComponent } from '../features/datasource/connection-view/connection-view.component';
import { ModalConfigRestDatasourceComponent } from '../features/datasource/modal-config-rest-datasource/modal-config-rest-datasource.component';

// Shared local UI
import { TagsComponent } from '@essedum/shared-lib';

// sharedModule local UI primitives — only the ones still MFE-private.
// AipCard, AipPagination, AipHeader, AipEmptyState, AipSnackbarCustom, AipLoading,
// AipDeleteConfirmation now come from @essedum/shared-lib (SharedLibUiModule).
import { AipFilterComponent } from '../features/sharedModule/aip-filter/aip-filter.component';
import { AipSwaggerCustomComponent } from '../features/sharedModule/aip-swagger-custom/aip-swagger-custom.component';
import { AipMethodCreateEditComponent } from '../features/sharedModule/aip-swagger-custom/aip-method-create-edit/aip-method-create-edit.component';

// Services
import { Services } from '@essedum/shared-lib';
import { EventsService } from '../features/services/event.service';
import { SchemaRegistryService } from '../features/services/schema-registry.service';
import { RaiservicesService } from '../features/services/raiservices.service';
import { SemanticService } from '../features/services/semantic.services';
import { TagsService } from '@essedum/shared-lib';
import { TabsFilterService } from '../features/services/tabs-filter.service';
import { DashConstantService } from '@essedum/shared-lib';
import { encKey } from '@essedum/shared-lib';
import { AdapterServices } from '@essedum/shared-lib';
import { AipSnackbarCustomService } from '@essedum/shared-lib';

// Pipes — FirstCharacterPipe is now declared in SharedLibUiModule (shared-lib).

// Shared-lib: API config + auth interceptor + consolidated UI primitives
import { API_CONFIG, ApiConfig, AuthInterceptor, SharedLibUiModule } from '@essedum/shared-lib';

// Environment is now only used as a fallback if the host hasn't provided API_CONFIG.
import { environment } from '../../environments/environment';

PlotlyModule.plotlyjs = PlotlyJS;

const dbConfig: DBConfig = {
  name: 'data_ops_mfe',
  version: 1,
  objectStoresMeta: [
    {
      store: 'datasetCache',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
      ],
    },
  ],
};

@NgModule({
  declarations: [
    // dataset
    DatasetComponent,
    DatasetDescriptionComponent,
    DatasetViewComponent,
    DatasetConfigComponent,
    DatasetEditComponent,
    DatasetByNameComponent,
    DatasetFullscreenViewComponent,
    DatasetPowerModeViewComponent,
    DatasetTableViewComponent,
    ModalConfigDatasetComponent,
    RestDatasetConfigComponent,
    DefaultComponent,
    // model
    ModelComponent,
    ModelDescriptionComponent,
    ModalConfigComponent,
    // datasource
    DatasourceComponent,
    DatasourceConfigComponent,
    ConnectionViewComponent,
    ModalConfigRestDatasourceComponent,
    // shared local UI
    // sharedModule aip-* — remaining MFE-private ones (AipCard/Pagination/Header/etc
    // moved to @essedum/shared-lib SharedLibUiModule)
    AipFilterComponent,
    AipSwaggerCustomComponent,
    AipMethodCreateEditComponent,
    // pipes / directives
    HighlightSearch,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    EntryRoutingModule,
    // Angular Material
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
    // CDK
    ScrollingModule,
    CdkDragDropModule,
    // Third-party
    NgbModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    NgJsonEditorModule,
    FileUploadModule,
    PdfViewerModule,
    NgxPaginationModule,
    CModule,
    NgxMaterialTimepickerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    MarkdownModule.forRoot(),
    NgxMatSelectSearchModule,
    AngularDualListBoxModule,
    PlotlyModule,
    NgBusyModule,
    NgxSliderModule,
    QuillModule,
    // Consolidated UI primitives (formerly duplicated in each MFE)
    SharedLibUiModule,
  ],
  providers: [
    // Canonical API config — single source of truth from @essedum/shared-lib.
    // Host can override this provider; remote falls back to the MFE-local environment.
    {
      provide: API_CONFIG,
      useValue: {
        baseUrl: environment.baseUrl ?? '/api/aip',
        datasetsUrl: environment.datasetsUrl ?? '/api/aip',
        sandboxUrl: '/api/exp',
      } as ApiConfig,
    },
    // Legacy string tokens kept for backwards-compat with ~50 existing `@Inject('envi')` call-sites.
    // They derive from API_CONFIG so there's still a single source of truth.
    { provide: 'envi',     useFactory: (cfg: ApiConfig) => cfg.baseUrl,     deps: [API_CONFIG] },
    { provide: 'dataSets', useFactory: (cfg: ApiConfig) => cfg.datasetsUrl, deps: [API_CONFIG] },
    { provide: 'sbx',      useFactory: (cfg: ApiConfig) => cfg.sandboxUrl,  deps: [API_CONFIG] },
    // Domain services (MFE-private)
    Services,
    DatasetServices,
    AdapterServices,
    EventsService,
    SchemaRegistryService,
    RaiservicesService,
    SemanticService,
    TagsService,
    TabsFilterService,
    DashConstantService,
    encKey,
    AipSnackbarCustomService,
    // HTTP interceptor — shared implementation from @essedum/shared-lib.
    // Registered locally because each MFE's HttpClientModule shadows the host's interceptor chain.
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Dialog defaults
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
