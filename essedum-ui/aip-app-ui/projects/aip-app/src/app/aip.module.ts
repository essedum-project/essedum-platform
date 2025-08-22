import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { ModelCreateComponent } from './model/model.create/model.create.component';
import { PipelineDescriptionComponent } from './pipeline.description/pipeline.description.component';
import { DatasourceComponent } from './datasource/datasource.component';
import { DatasetDescriptionComponent } from './dataset/dataset.description/dataset.description.component';
import { DatasetViewComponent } from './dataset/dataset-view/dataset-view.component';
import { DatasetConfigComponent } from './dataset/dataset-config/dataset-config.component';
import { environment } from '../environments/environment';
import { Services } from './services/service';
import { PipelineService } from './services/pipeline.service';
import { AipInterceptorService } from './services/interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModelEditsComponent } from './model/model-edit/model-edit.component';
import { ModelDescriptionComponent } from './model/model.description/model.description.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModelDeployComponent } from './model/model-deploy/model-deploy.component';
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
    ModelCreateComponent,
    PipelineComponent,
    PipelineCreateComponent,
    PipelineDescriptionComponent,
    EnlCodeEditorComponent,
    DatasourceComponent,
    ModalConfigRestDatasourceComponent,
    DatasetDescriptionComponent,
    DatasetViewComponent,
    DatasetConfigComponent,
    ModelEditsComponent,
    ModelDescriptionComponent,
    ModelDeployComponent,
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
    ModalConfigComponent
  ],
  imports: [
    AipRouting,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
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
    encKey,
    DashConstantService,
    SchemaRelationshipService,
    RaiservicesService,
    SemanticService,
    DynamicRemoteLoad,
    AipSnackbarCustomService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AipComponent],
})
export class AipModule { }
