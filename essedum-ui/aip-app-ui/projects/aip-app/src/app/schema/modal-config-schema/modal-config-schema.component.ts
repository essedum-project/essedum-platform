import {
  Component,
  OnInit,
  Input,
  Inject,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ModalConfigSchemaEditorComponent } from './modal-config-schema-editor/modal-config-schema-editor.component';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { SchemaRelationshipService } from '../schema-relationship.service';
import { SchemaRegistryService } from '../../services/schema-registry.service';

// Interfaces
interface FormTemplate {
  alias: string;
  name: string;
  organization: string;
  schemaname: string;
  formtemplate: string;
  type: string;
  capability: string;
  id?: string;
  templateName?: string;
  templateTags?: string[];
}

interface SchemaColumn {
  columntype: string;
  columnorder: number;
  recordcolumnname: string;
  recordcolumndisplayname: string;
  isprimarykey: boolean;
  isunique: boolean;
  isrequired: boolean;
  isencrypted: boolean;
  isvisible: boolean;
}

interface DropdownOption {
  value: string;
  viewValue: string;
}

interface ComponentData {
  type: string;
  key: string;
  custom?: string;
  storage?: string;
  url?: string;
  options?: string;
  dataSrc?: string;
  data?: any;
  filter?: string;
  disableLimit?: boolean;
  limit?: string;
}

enum TabValues {
  CONFIGURE = 'Configure',
  SCHEMA_COLUMNS = 'Schema Columns',
  SCHEMA_FORM = 'Schema Form',
}

@Component({
  selector: 'modal-config-schema',
  templateUrl: './modal-config-schema.component.html',
  styleUrls: ['./modal-config-schema.component.scss'],
})
export class ModalConfigSchemaComponent
  implements OnInit, OnChanges, AfterViewInit
{
  // Constants
  readonly CARD_TITLE = 'Schema Registry Details';
  readonly TOOLTIP_POSITION = 'above';
  readonly DEFAULT_FORM_STRUCTURE = { components: [] };
  readonly DEFAULT_LIMIT = 100;
  readonly MAX_LIMIT = 2000;

  // Inputs
  @Input() searchText: string;
  @Input() isGridView: boolean;

  // ViewChild references
  @ViewChild('mytable', { static: false }) columnsTable: MatTable<SchemaColumn>;
  @ViewChild('formTable', { static: false }) formTable: MatTable<any>;
  @ViewChild('columnJsonEditor', { static: false })
  columnJsonEditor: JsonEditorComponent;
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;

  schemaJson: any;
  selectedFormTemplate: FormTemplate = this.createEmptyFormTemplate();
  attributes: any;

  // Schema properties
  schemaAlias = '';
  schemaName = '';
  schemaExists: any;
  schemaValue: any = {};
  schemaValueArray: any[] = [];
  schemaDescription = '';

  // Data and display
  groups: any[] = [];
  dataSource: SchemaColumn[] = [];
  display = false;
  isBackHovered = false;

  // Permissions and states
  isAuth = true;
  createAuth = false;
  isRawData = false;
  isInEdit = false;
  isInView = false;

  // Form controls and options
  inputColumns = new FormControl(null, Validators.required);
  groupsOptions: DropdownOption[] = [];

  // Table configuration
  displayedColumns: string[] = [
    'columnorder',
    'columntype',
    'recordcolumnname',
    'recordcolumndisplayname',
    'unique',
    'required',
    'primarykey',
    'encrypted',
  ];

  // Tab and form management
  tabValue = TabValues.CONFIGURE;
  propertiesList: string[] = [];
  displaynameList: string[] = [];
  formSchemaJson: any = { type: 'object', properties: {} };
  schemaForm: any = this.DEFAULT_FORM_STRUCTURE;
  schemaFormCpy: any = this.DEFAULT_FORM_STRUCTURE;
  reqdPropsList: any[] = [];

  // Editor and view states
  editorOptions = new JsonEditorOptions();
  viewForm = false;
  columnJEContents: any = [];
  value: any;
  error: string;

  // Template management
  formTemplateList: FormTemplate[] = [];
  formTemplateListBackup: FormTemplate[] = [];
  formNameList: string[] = [];
  formListView = true;
  formName = '';
  formDesc = '';
  updateFlag = false;
  createFlag = false;
  templateTags: string[] = [];

  // Dropdown data
  colsList: any[] = [];
  types: DropdownOption[] = [];
  capabilities: DropdownOption[] = [];
  selectedtype = '';
  selectedCapability = '';
  dropDownValueCapability = new Map<string, any>();

  // Form structure
  form: Object = this.DEFAULT_FORM_STRUCTURE;

  constructor(
    private schemaService: SchemaRegistryService,
    private schemaRelService: SchemaRelationshipService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalConfigSchemaComponent>,
    private router: Router,
    private services: Services,
    private location: Location
  ) {
    this.initializeEditorOptions();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    // Placeholder for after view init logic
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input changes if needed
  }

  // Initialization methods
  private initializeComponent(): void {
    this.loadAuthentications();
    this.checkViewMode();
    this.handleHistoryState();
    this.handleDataInitialization();
  }

  private initializeEditorOptions(): void {
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.onChange = () => this.handleEditorChange();
  }

  private createEmptyFormTemplate(): FormTemplate {
    return {
      alias: '',
      name: '',
      organization: sessionStorage.getItem('organization') || '',
      schemaname: '',
      formtemplate: '',
      type: '',
      capability: '',
    };
  }

  // Authentication and permissions
  private loadAuthentications(): void {
    this.services.getPermission('cip').subscribe({
      next: (cipAuthority: string[]) => this.handlePermissions(cipAuthority),
      error: (error) => this.handleError('Failed to load permissions', error),
    });
  }

  private handlePermissions(cipAuthority: string[]): void {
    this.createAuth = cipAuthority.includes('schema-create');

    if (cipAuthority.includes('schema-edit')) {
      this.isAuth = false;
      this.displayedColumns = [
        ...this.displayedColumns,
        'action',
        'visible',
        'action',
      ];
      this.editorOptions.modes = ['text', 'tree', 'view'];
    } else {
      this.editorOptions.mode = 'view';
    }
  }

  // Navigation and state management
  private checkViewMode(): void {
    this.isInView = this.router.url.includes('view');
  }

  private handleHistoryState(): void {
    const state = this.location.getState() as any;

    if (state?.drop) {
      this.setDropDown(state.drop);
    }

    if (state?.card) {
      this.data = state.card;
    }
  }

  private handleDataInitialization(): void {
    try {
      if (this.data) {
        if (this.data.isAutoExtract) {
          this.initializeAutoExtractData();
        } else if (!this.router.url.includes('create')) {
          this.onRowSelect(this.data.name);
        }
        this.isInEdit = true;
      }
    } catch (error) {
      this.handleError('Error during initialization', error);
    }
  }

  private initializeAutoExtractData(): void {
    this.dataSource = Array.isArray(this.data.schemavalue)
      ? this.data.schemavalue
      : JSON.parse(this.data.schemavalue || '[]');
    this.schemaValue = this.data.schemavalue;
  }

  // Tab management
  basicReqTabChange(index: number): void {
    const tabMap = {
      0: TabValues.CONFIGURE,
      1: TabValues.SCHEMA_COLUMNS,
      2: TabValues.SCHEMA_FORM,
    };

    this.tabValue = tabMap[index] || TabValues.CONFIGURE;
  }

  // Editor change handling
  private handleEditorChange(): void {
    switch (this.tabValue) {
      case TabValues.SCHEMA_FORM:
        if (this.formJsonEditor) {
          const formJEContents = this.formJsonEditor.get();
          this.schemaForm = formJEContents;
        }
        break;
      case TabValues.SCHEMA_COLUMNS:
        if (this.columnJsonEditor) {
          this.setColumnJEContents(this.columnJsonEditor.get());
        }
        break;
    }
  }

  // Navigation methods
  navigateBack(): void {
    this.location.back();
  }

  onCancel(from?: string): void {
    if (from === 'form') {
      this.resetFormView();
    } else {
      this.closeDialog();
    }
  }

  private resetFormView(): void {
    this.formListView = true;
    this.findByName(this.data.name);
    this.formTemplateList = [...this.formTemplateListBackup];
  }

  // Data operations
  onRowSelect(name: string): void {
    if (name) {
      this.findByName(name);
    }
  }

  findByName(name: string): void {
    if (!name) return;

    this.services.getSchemaByName(name).subscribe({
      next: (res) => this.handleSchemaResponse(res, name),
      error: (error) => this.handleError('Could not get the results', error),
    });
  }

  private handleSchemaResponse(res: any, name: string): void {
    if (!res) {
      this.services.message('Could not get the results', 'error');
      return;
    }

    this.processSchemaData(res);
    this.loadSchemaForms(name);
  }

  private processSchemaData(res: any): void {
    this.colsList =
      res.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];
    this.schemaAlias = res.alias;
    this.schemaDescription = res.description;
    this.schemaName = res.name;
    this.schemaValue =
      res.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];
    this.dataSource = [...this.schemaValue];

    this.dataSource.forEach((ele: any) => {
      if (ele.isvisible === undefined) {
        ele.isvisible = true;
      }
    });

    this.handleTypeAndCapability(res);
    this.schemaValueArray = res;
  }

  private handleTypeAndCapability(res: any): void {
    if (!this.isInView) {
      this.selectedtype = res.type;
      this.capabilities =
        this.dropDownValueCapability.get(this.selectedtype)?.value || [];
      this.selectedCapability = res.capability;
    } else {
      this.types = [{ value: res.type, viewValue: res.type }];
      this.selectedtype = res.type;
      this.capabilities = [
        { value: res.capability, viewValue: res.capability },
      ];
      this.selectedCapability = res.capability;
    }
  }

  private loadSchemaForms(name: string): void {
    this.services.getSchemaFormsByName(name).subscribe({
      next: (resp) => this.handleSchemaFormsResponse(resp, name),
      error: (error) => this.handleError('Could not get form template', error),
    });
  }

  private handleSchemaFormsResponse(resp: FormTemplate[], name: string): void {
    if (resp && resp.length > 0) {
      this.form = resp[0].formtemplate;
      this.schemaForm = resp[0].formtemplate;
      this.formTemplateList = resp;
    } else {
      this.form = { ...this.DEFAULT_FORM_STRUCTURE };
      this.schemaForm = { ...this.DEFAULT_FORM_STRUCTURE };
    }

    this.loadGroupsForEntity(name);
    this.services.message('Fetched Successfully', 'success');
  }

  private loadGroupsForEntity(name: string): void {
    this.services.getGroupsForEntity(name).subscribe({
      next: (res1) => this.handleGroupsResponse(res1),
      error: (error) => console.error('Error loading groups:', error),
    });
  }

  private handleGroupsResponse(res1: any[]): void {
    const temp: string[] = [];
    res1.forEach((element) => {
      const index = this.groups.findIndex((i) => i.name === element.name);
      if (index !== -1) {
        temp.push(JSON.stringify(this.groups[index]));
      }
    });
    this.inputColumns.setValue(temp);
  }

  // Save operations
  onSave(): void {
    if (!this.validateSchemaAlias()) return;

    try {
      const { schemaJson, formJson } = this.prepareDataForSave();
      this.updateFormTemplateList(formJson);
      this.normalizeSchemaDescription();
      this.saveSchema(schemaJson);
    } catch (error) {
      this.handleError('Some error occurred', error);
    }
  }

  private validateSchemaAlias(): boolean {
    if (!this.isWordValid(this.schemaAlias)) {
      this.services.message('Invalid Schema Name', 'error');
      return false;
    }
    return true;
  }

  private prepareDataForSave(): { schemaJson: any; formJson: any } {
    let schemaJson = [{}];
    const formJson = { ...this.schemaForm };

    if (this.isRawData) {
      const contents = this.getColumnJEContents();
      if (contents?.length > 0) {
        this.schemaValue = contents;
      }
      schemaJson = this.schemaValue;
    } else {
      schemaJson = this.dataSource;
      formJson.templateName = this.formName;
      formJson.templateTags = this.templateTags;
    }

    return { schemaJson, formJson };
  }

  private updateFormTemplateList(formJson: any): void {
    if (this.updateFlag) {
      const index = this.formTemplateList.findIndex(
        (ele) => this.schemaForm.templateName === ele.templateName
      );
      if (index > -1) {
        this.formTemplateList.splice(index, 1, formJson);
      }
    }
  }

  private normalizeSchemaDescription(): void {
    if (this.schemaDescription?.trim().length === 0) {
      this.schemaDescription = null;
    }
  }

  private saveSchema(schemaJson: any): void {
    this.services
      .updateSchema(
        this.schemaName,
        this.schemaAlias,
        schemaJson,
        this.schemaDescription,
        this.formTemplateList,
        this.selectedtype,
        this.selectedCapability
      )
      .subscribe({
        next: (res) => this.handleSaveSuccess(res),
        error: (error) => this.handleError('Could not save the schema', error),
      });
  }

  private handleSaveSuccess(res: any): void {
    this.isInEdit = true;
    this.schemaName = res?.name;
    this.colsList =
      res?.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];

    if (this.inputColumns.value) {
      this.handleGroupModelEntity(res);
    }

    this.services.message('Saved Successfully', 'success');
    this.location.back();
  }

  private handleGroupModelEntity(res: any): void {
    const temp: string[] = [];
    this.inputColumns.value.forEach((element: string) => {
      temp.push(JSON.parse(element).name);
    });

    this.schemaService
      .addGroupModelEntity(res.name, temp, res.organization)
      .subscribe();
  }

  // Form operations
  saveFormTemplateChanges(): void {
    this.schemaForm = this.processFormComponents(this.schemaForm);
    this.onFormSave();
  }

  private processFormComponents(schemaForm: any): any {
    return JSON.parse(
      JSON.stringify(schemaForm, (_, nestedValue1) => {
        nestedValue1?.components?.forEach((component: ComponentData) => {
          this.processButtonComponent(component);
          this.processFileComponent(component);
          this.processSelectComponent(component);
        });
        return nestedValue1;
      })
    );
  }

  private processButtonComponent(component: ComponentData): void {
    if (component.type !== 'button') return;

    const clickCountScript = `let clickCount${component.key}`;

    if (!component.custom || !component.custom.includes(clickCountScript)) {
      component.custom = component.custom || '';

      if (component.custom.length > 0) {
        component.custom += component.custom.endsWith(';') ? ' ' : '; ';
      }

      component.custom += this.generateButtonClickScript(component.key);
    }
  }

  private generateButtonClickScript(key: string): string {
    return `let clickCount${key} = Number(document.getElementById('formio-btnclk-${key}').innerHTML); document.getElementById('formio-btnclk-${key}').innerHTML=(clickCount${key}+1);`;
  }

  private processFileComponent(component: ComponentData): void {
    if (component.type !== 'file' || component.storage !== 'url') return;

    if (!component.url || component.url.replace(/\s/g, '').length === 0) {
      component.url = this.generateFileUploadUrl(component);
    }
  }

  private generateFileUploadUrl(component: ComponentData): string {
    const baseUrl = `${
      window.location.origin
    }/api/aip/datasets/attachmentupload?org=${sessionStorage.getItem(
      'organization'
    )}`;

    if (component.options) {
      try {
        const process = JSON.parse(component.options).process;
        return `${baseUrl}&&process=${process}`;
      } catch (exception) {
        console.error('Error while saving file component:', exception);
      }
    }

    return baseUrl;
  }

  private processSelectComponent(component: ComponentData): void {
    if (component.type !== 'select') return;

    if (component.data && component.dataSrc === 'url' && !component.data.url) {
      this.setupSelectComponentUrl(component);
    }

    if (component.filter) {
      this.setupSelectComponentFilter(component);
    }
  }

  private setupSelectComponentUrl(component: ComponentData): void {
    let url = `${
      window.location.origin
    }/api/aip/datasets/getDataFromDatasets?org=${sessionStorage.getItem(
      'organization'
    )}`;

    this.processSelectHeaders(component, url);
    this.processSelectLimits(component, url);

    component.data.url = url;
  }

  private processSelectHeaders(
    component: ComponentData,
    baseUrl: string
  ): string {
    if (!component.data.headers?.length) return baseUrl;

    let url = baseUrl;
    let datasetName = '';
    let token = true;
    let tokenIndex = -1;

    component.data.headers.forEach((header: any, i: number) => {
      if (header.key === 'datasetName') {
        datasetName = header.value;
      }
      if (header.key === 'Authorization') {
        token = false;
        tokenIndex = i;
      }
    });

    // Add or update Authorization header
    const authHeader = {
      key: 'Authorization',
      value: "Bearer {{localStorage['jwtToken']}}",
    };

    if (token) {
      component.data.headers.push(authHeader);
    } else {
      component.data.headers[tokenIndex] = authHeader;
    }

    if (datasetName) url += `&datasetName=${datasetName}`;
    if (component.key) url += `&api=${component.key}`;

    return url;
  }

  private processSelectLimits(component: ComponentData, url: string): string {
    if (component.disableLimit) {
      return `${url}&limit=${this.MAX_LIMIT}`;
    }

    if (!component.limit || component.limit.replace(/\s/g, '').length === 0) {
      return `${url}&limit=${this.DEFAULT_LIMIT}`;
    }

    return url;
  }

  private setupSelectComponentFilter(component: ComponentData): void {
    if (!component.filter.includes('searchParams=')) {
      const filtersArray = component.filter.split(',');
      const filter = filtersArray
        .map((f) => `${f.trim()}:{{data.${f.trim()}}}`)
        .join(',');

      component.filter = `searchParams=${filter}`;
    }
  }

  onFormSave(): void {
    if (!this.validateFormSave()) return;

    try {
      this.prepareFormTemplateForSave();
      this.saveFormTemplate();
    } catch (error) {
      this.handleError('Some error occurred', error);
    }
  }

  private validateFormSave(): boolean {
    if (!this.formListView) {
      if (!this.selectedFormTemplate.alias?.length) {
        this.services.message('Form name cannot be empty - IAMP', 'error');
        return false;
      }

      if (this.isFormNameDuplicate()) {
        this.services.message('Form Name already exists - IAMP', 'error');
        return false;
      }
    }

    if (!this.isWordValid(this.schemaAlias)) {
      this.services.message('Invalid Schema Name', 'error');
      return false;
    }

    return true;
  }

  private isFormNameDuplicate(): boolean {
    const isDuplicateOnCreate =
      !this.updateFlag &&
      this.formNameList.includes(this.selectedFormTemplate.alias);

    const isDuplicateOnUpdate =
      this.updateFlag &&
      this.selectedFormTemplate.alias !== this.schemaForm.templateName &&
      this.formNameList.includes(this.selectedFormTemplate.alias);

    return isDuplicateOnCreate || isDuplicateOnUpdate;
  }

  private prepareFormTemplateForSave(): void {
    this.normalizeSchemaDescription();

    this.selectedFormTemplate.schemaname = this.schemaName;
    this.selectedFormTemplate.formtemplate = JSON.stringify(this.schemaForm);
    this.selectedFormTemplate.type = this.selectedtype;
    this.selectedFormTemplate.capability = this.selectedCapability;
  }

  private saveFormTemplate(): void {
    this.services.saveSchemaForm(this.selectedFormTemplate).subscribe({
      next: (resp) => this.handleFormSaveSuccess(resp),
      error: (error) => this.handleError('Failed to save form template', error),
    });
  }

  private handleFormSaveSuccess(resp: FormTemplate): void {
    this.selectedFormTemplate = resp;
    this.services.message('Saved successfully - CIP', 'success');

    if (!this.updateFlag) {
      this.formTemplateList.push(this.selectedFormTemplate);
    }

    this.formListView = true;
  }

  // Row operations
  addRowData(rowObj: Partial<SchemaColumn>): void {
    if (!Array.isArray(this.dataSource)) {
      this.dataSource = [];
    }

    const newRow: SchemaColumn = {
      columntype: rowObj.columntype || '',
      columnorder: this.dataSource.length + 1,
      recordcolumnname: rowObj.recordcolumnname || '',
      recordcolumndisplayname: rowObj.recordcolumndisplayname || '',
      isprimarykey: Boolean(rowObj.isprimarykey),
      isunique: Boolean(rowObj.isunique),
      isrequired: Boolean(rowObj.isrequired),
      isencrypted: Boolean(rowObj.isencrypted),
      isvisible: Boolean(rowObj.isvisible),
    };

    this.dataSource.push(newRow);
    this.display = true;

    this.columnsTable?.renderRows();
  }

  updateRowData(rowObj: Partial<SchemaColumn> & { columnorder: number }): void {
    this.dataSource = this.dataSource.map((item) => {
      if (item.columnorder === rowObj.columnorder) {
        return {
          ...item,
          columntype: rowObj.columntype || item.columntype,
          recordcolumnname: rowObj.recordcolumnname || item.recordcolumnname,
          recordcolumndisplayname:
            rowObj.recordcolumndisplayname || item.recordcolumndisplayname,
          isprimarykey: Boolean(rowObj.isprimarykey),
          isunique: Boolean(rowObj.isunique),
          isrequired: Boolean(rowObj.isrequired),
          isencrypted: Boolean(rowObj.isencrypted),
          isvisible: Boolean(rowObj.isvisible),
        };
      }
      return item;
    });
  }

  deleteRowData(rowObj: { columnorder: number }): void {
    this.dataSource = this.dataSource
      .filter((item) => item.columnorder !== rowObj.columnorder)
      .map((item, index) => ({ ...item, columnorder: index + 1 }));

    this.display = this.dataSource.length > 0;
  }

  // Dialog operations
  openDialog(action: string, obj: any): void {
    this.checkSchemaRelationships(obj);
    this.prepareDialogData(obj);
    this.openEditorDialog(action, obj);
  }

  private checkSchemaRelationships(obj: any): void {
    const org = sessionStorage.getItem('organization');
    if (!org) return;

    this.schemaRelService.getAllRelationships(org).subscribe({
      next: (relationships) => this.validateRelationships(relationships, obj),
      error: (error) => console.error('Error checking relationships:', error),
    });
  }

  private validateRelationships(relationships: any[], obj: any): void {
    relationships.forEach((r) => {
      const isRelatedSchema =
        r.schemaA === this.data.name ||
        r.schemaB === this.data.name ||
        r.schemaA === this.data.alias ||
        r.schemaB === this.data.alias;

      if (isRelatedSchema) {
        const relation = JSON.parse(r.schema_relation);
        const hasColumnRelation =
          relation.pCol?.includes(obj.recordcolumnname) ||
          relation.cCol?.includes(obj.recordcolumnname);

        if (hasColumnRelation) {
          this.services.message(
            'This action will cause inconsistent relationship' + r.name,
            'error'
          );
        }
      }
    });
  }

  private prepareDialogData(obj: any): void {
    this.propertiesList = this.dataSource
      .filter((ele) => ele.recordcolumnname !== obj.recordcolumnname)
      .map((ele) => ele.recordcolumnname);

    this.displaynameList = this.dataSource
      .filter(
        (ele) => ele.recordcolumndisplayname !== obj.recordcolumndisplayname
      )
      .map((ele) => ele.recordcolumndisplayname);
  }

  private openEditorDialog(action: string, obj: any): void {
    const dialogWidth =
      this.tabValue === TabValues.SCHEMA_FORM && action !== 'Delete'
        ? '75vw'
        : '25vw';
    const dialogMaxWidth = action === 'Delete' ? '80vw' : '85vw';

    const dialogRef = this.dialog.open(ModalConfigSchemaEditorComponent, {
      minWidth: dialogWidth,
      maxWidth: dialogMaxWidth,
      data: {
        obj,
        action,
        tabValue: this.tabValue,
        propertiesList: this.propertiesList,
        displaynameList: this.displaynameList,
        colsList: this.colsList,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result) => this.handleDialogResult(result));
  }

  private handleDialogResult(result: any): void {
    if (!result) return;

    switch (result.event) {
      case 'Add':
        this.addRowData(result.data);
        break;
      case 'Update':
        this.updateRowData(result.data);
        break;
      case 'Delete':
        this.deleteRowData(result.data);
        break;
    }
  }

  closeDialog(): void {
    this.dialogRef.close({
      data: {
        schema: this.schemaValue,
        formTemplate: this.formTemplateList,
      },
    });
  }

  // Form template operations
  getFormTemplate(template: FormTemplate): void {
    if (this.router.url.includes('view')) return;

    this.selectedFormTemplate = template;
    this.updateFlag = true;

    const group = { ...JSON.parse(template.formtemplate) };
    this.form = { ...group };
    this.schemaForm = { ...group };

    if (this.isRawData) {
      this.schemaFormCpy = { ...this.schemaForm };
    }

    this.formName = group.templateName;
    this.templateTags = group.templateTags || [];
    this.formListView = false;

    this.updateFormNameList();
    this.formTemplateListBackup = [...this.formTemplateList];
  }

  private updateFormNameList(): void {
    this.formNameList = this.formTemplateList
      .filter((data) => this.formName !== data.templateName)
      .map((data) => data.templateName);
  }

  createForm(): void {
    this.selectedFormTemplate = this.createEmptyFormTemplate();
    this.resetFormCreation();
  }

  private resetFormCreation(): void {
    this.updateFlag = false;
    this.formListView = false;
    this.formName = '';
    this.templateTags = [];
    this.createFlag = true;

    this.formNameList = this.formTemplateList.map((data) => data.templateName);
    this.form = { ...this.DEFAULT_FORM_STRUCTURE };
    this.schemaForm = { ...this.DEFAULT_FORM_STRUCTURE };
  }

  delete(template: FormTemplate): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteFormTemplate(template);
      }
    });
  }

  private deleteFormTemplate(template: FormTemplate): void {
    if (!template.id) return;

    this.services.deleteFormTemplate(template.id).subscribe({
      next: () => {
        this.services.message('Deleted Successfully - CIP', 'success');
        this.ngOnInit();
      },
      error: (error) => this.handleError('Error in Deleting Schema', error),
    });
  }

  // Utility methods
  toggleView(isRaw?: boolean): void {
    if (typeof isRaw === 'boolean') {
      this.isRawData = isRaw;
    } else {
      this.isRawData = !this.isRawData;
    }

    this.handleToggleView();
    this.ngAfterViewInit();
  }

  private handleToggleView(): void {
    switch (this.tabValue) {
      case TabValues.SCHEMA_FORM:
        if (this.isRawData) {
          this.form = { ...this.schemaForm };
        } else {
          this.schemaFormCpy = { ...this.schemaForm };
        }
        break;

      case TabValues.SCHEMA_COLUMNS:
        if (this.isRawData) {
          const value = this.getColumnJEContents();
          if (value?.length > 0) {
            this.dataSource = value;
            this.schemaValue = value;
          } else {
            this.dataSource = this.schemaValue;
          }
        } else {
          this.schemaValue = this.dataSource;
        }
        break;
    }
  }

  checkUniqueIdColumn(): boolean {
    if (!this.dataSource?.length) return false;

    return this.dataSource.some((row) => row.recordcolumnname === 'uniqueId');
  }

  navigateToSchema(): void {
    if (this.checkUniqueIdColumn()) {
      this.router.navigateByUrl(
        `/landing/iamp-graph/main/schema/${this.schemaAlias}`
      );
    } else {
      this.services.message(
        'Please add "uniqueId" field under "recordcolumnname" for Graph View.',
        'info'
      );
    }
  }

  // Validation methods
  omit_special_char(event: KeyboardEvent): boolean {
    return this.isValidLetter(event.charCode);
  }

  isValidLetter(charCode: number): boolean {
    return (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 48 && charCode <= 57) || // 0-9
      [8, 9, 13, 16, 17, 20, 95].includes(charCode) // Special keys
    );
  }

  isWordValid(word: string): boolean {
    // Add proper validation logic here
    return Boolean(word?.toString().trim());
  }

  // Dropdown operations
  setDropDown(data: any): void {
    this.types = data.types || [];
    this.dropDownValueCapability = data.capabilities || new Map();
  }

  onSelectionType(event: string): void {
    const capabilityData = this.dropDownValueCapability.get(event);

    if (capabilityData) {
      this.selectedCapability = capabilityData.default;
      this.capabilities = capabilityData.value || [];
    }
  }

  // JSON Editor operations
  setColumnJEContents(contents: any): void {
    this.columnJEContents = contents;
  }

  getColumnJEContents(): any {
    return this.columnJEContents;
  }

  // Form view operations
  openFormView(content: any): void {
    this.viewForm = true;
    this.dialog.open(content, {
      width: '830px',
      panelClass: 'wide-dialog',
    });
  }

  closeFormView(): void {
    this.viewForm = false;
    this.dialogRef.close('close the modal');
  }

  // Event handlers
  onChange(event: any): void {
    if (event?.form) {
      this.schemaForm = event.form;
    }
  }

  onSearch(event: any): void {
    // Implement search functionality
  }

  onRefresh(): void {
    // Implement refresh functionality
  }

  get isValidSchemaAlias(): boolean {
    return this.schemaAlias && this.schemaAlias.length > 3;
  }

  get isValidSchemaForForm(): boolean {
    return (
      this.schemaName &&
      this.schemaName.trim() !== '' &&
      this.schemaName !== 'new' &&
      this.isInEdit
    );
  }

  get canAddRows(): boolean {
    return !this.isInView && !this.isAuth;
  }

  get hasDataSource(): boolean {
    return this.dataSource && this.dataSource.length > 0;
  }

  get canCreateForm(): boolean {
    return this.formListView && !this.isAuth && !this.isInView;
  }

  trackByColumnOrder(index: number, item: any): any {
    return item.columnorder || index;
  }

  trackByFormAlias(index: number, item: any): any {
    return item.alias || index;
  }

  selectedz(data: any): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      this.handleError('Error serializing data', error);
      return '';
    }
  }

  // Error handling
  private handleError(message: string, error?: any): void {
    console.error(message, error);
    this.services.message(message, 'error');
  }
}
