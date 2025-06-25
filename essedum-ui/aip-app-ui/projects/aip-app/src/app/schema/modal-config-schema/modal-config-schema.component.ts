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
import { FormControl } from '@angular/forms';

import { ModalConfigSchemaEditorComponent } from '../modal-config-schema-editor/modal-config-schema-editor.component';
// import { SelectItem } from 'primeng/api';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Services } from '../../services/service';
import { SchemaRelationshipService } from '../schema-relationship.service';
import { MessageService } from '../message.service';
import { SchemaRegistryService } from '../../services/schema-registry.service';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'modal-config-schema',
  templateUrl: './modal-config-schema.component.html',
  styleUrls: ['./modal-config-schema.component.scss'],
})
export class ModalConfigSchemaComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input('searchText') searchText;
  @Input('isGridView') isGridView;
  schemaJson: any;
  selectedFormTemplate: any = {
    alias: '',
    name: '',
    organization: sessionStorage.getItem('organization'),
    schemaname: '',
    formtemplate: '',
    type: '',
    capability: '',
  };
  attributes: any;
  // @Input('directInputs') directInputs;
  // @Input('indirectInputs') indirectInputs;
  // @Output('formScriptOutput') formScriptOutput = new EventEmitter<any>();

  constructor(
    private schemaService: SchemaRegistryService,
    private messageService: MessageService,
    private schemaRelService: SchemaRelationshipService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalConfigSchemaComponent>,
    private router: Router,
    private services: Services,
    private location: Location
  ) {}

  schemaAlias: any = '';
  schemaName: any = '';
  schemaExists: any;
  schemaValue: any = {};
  schemaValueArray: any[] = [];
  schemaDescription: string;
  groups: any[] = [];
  dataSource: any[] = [];
  display: boolean = false;
  isBackHovered: boolean = false;
  isAuth = true;
  inputColumns = new FormControl();
  groupsOptions = [];
  @ViewChild('mytable', { static: false }) columnsTable: MatTable<any>;
  @ViewChild('formTable', { static: false }) formTable: MatTable<any>;
  @ViewChild('columnJsonEditor', { static: false })
  columnJsonEditor: JsonEditorComponent;
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  displayedColumns: string[] = [
    'columnorder',
    'columntype',
    'recordcolumnname',
    'recordcolumndisplayname',
    'unique',
    'required',
    'primarykey',
    'encrypted',
  ]; //primarykey
  isRawData: boolean = false;
  isInEdit: boolean = false;
  isInView: boolean = false;
  // tabValue: string = 'Schema Columns';
  tabValue: string = 'Configure';
  // formTabColumns: string[] = ['position', 'type', 'property', 'title', 'widget'];
  propertiesList: string[] = [];
  displaynameList: string[] = [];
  // titleList: SelectItem[] = [];
  formSchemaJson: any = { type: 'object', properties: {} };
  // formDataSource: any[] = [];
  schemaForm: any = {};
  schemaFormCpy: any = {};
  reqdPropsList: any[] = [];
  editorOptions = new JsonEditorOptions();
  viewForm: boolean = false;
  columnJEContents: any[] = [];
  value: any;
  error: string;
  formTemplateList = [];
  formTemplateListBackup = [];
  // originalFormTemplateList:any[] = [];
  formNameList = [];
  formListView: boolean = true;
  formName: string;
  formDesc: string;
  updateFlag: boolean = false;
  createFlag: boolean = false;
  templateTags: string[] = [];
  createAuth: boolean = false;
  // positionList: any[] = [];
  colsList: any[] = [];
  types = [];
  capabilities = [];
  selectedtype: string = '';
  selectedCapability: string = '';
  dropDownVauleCapbility: Map<string, any> = new Map<string, any>();
  // positionEle:any;
  // prevPose: any;
  public form: Object = { components: [] };
  basicReqTabChange(index: any) {
    switch (index) {
      case 0:
        this.tabValue = 'Configure';
        break;
      case 1:
        this.tabValue = 'Schema Columns';
        break;
      case 2:
        this.tabValue = 'Schema Form';
        break;
    }
  }
  Authentications() {
    this.services.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('schema-create')) this.createAuth = true;
      if (cipAuthority.includes('schema-edit')) {
        this.isAuth = false;
        this.displayedColumns = [
          'columnorder',
          'columntype',
          'recordcolumnname',
          'recordcolumndisplayname',
          'unique',
          'required',
          'primarykey',
          'encrypted',
          'action',
          'visible',
          'action',
        ];
        //primarykey
        // this.formTabColumns = ['position', 'type', 'property', 'title', 'widget', 'action'];
        this.editorOptions.modes = ['text', 'tree', 'view'];
      } else {
        this.editorOptions.mode = 'view';
      }
    });
  }

  ngOnInit() {
    this.Authentications();
    if (this.router.url.includes('view')) {
      this.isInView = true;
    }
    if (history.state.drop) {
      let cards = this.location.getState();
      this.setdropDown(cards['drop']);
    }
    if (history.state.card) {
      let cards = this.location.getState();
      this.data = cards['card'];
    }
    try {
      this.editorOptions.statusBar = true;
      this.editorOptions.enableSort = false;
      this.editorOptions.enableTransform = false;
      this.editorOptions.onChange = () => {
        if (this.tabValue == 'Schema Form') {
          let formJEContents = this.formJsonEditor.get();
          this.schemaForm = formJEContents;
          // this.rendererObj = formJEContents;
          // this.schemaForm['properties'] = formJEContents['properties'];
          // this.schemaForm['required'] = formJEContents['required'];
        } else if (this.tabValue == 'Schema Columns') {
          this.setColumnJEContents(this.columnJsonEditor.get());
        }
      };
      // this.loadGroups();
      if (this.data) {
        if (this.data.isAutoExtract) {
          this.dataSource = Array.isArray(this.data.schemavalue)
            ? this.data.schemavalue
            : JSON.parse(this.data.schemavalue);
          this.schemaValue = this.data.schemavalue;
        } else {
          if (!this.router.url.includes('create')) {
            this.onRowSelect(this.data.name);
          }
        }
        this.isInEdit = true;
      }
      // }
    } catch (Exception) {
      // this.messageService.error('Some error occured', 'Error');
      this.services.message('Some error occured', 'error');
    }
  }

  ngAfterViewInit() {}

  navigateBack() {
    this.location.back();
  }
  onCancel(from?: string) {
    if (from == 'form') {
      // this.formSchemaJson['properties'] = {};
      // this.formSchemaJson['required'] = [];
      // this.formDataSource = [];
      this.formListView = true;
      this.findByName(this.data.name);
      this.formTemplateList = this.formTemplateListBackup;
    } else {
      this.closeDialog();
    }
  }

  onRowSelect(name) {
    this.findByName(name);
  }

  saveFormTemplateChanges() {
    this.schemaForm = JSON.parse(
      JSON.stringify(this.schemaForm, (_, nestedValue1) => {
        nestedValue1?.components?.forEach((nestedValue) => {
          if (nestedValue && nestedValue['type'] == 'button') {
            if (
              !nestedValue['custom'] ||
              !nestedValue['custom'].includes(
                'let clickCount' + nestedValue['key']
              )
            ) {
              nestedValue['custom']?.length > 0
                ? !nestedValue['custom'].endsWith(';')
                  ? (nestedValue['custom'] += '; ')
                  : (nestedValue['custom'] += ' ')
                : (nestedValue['custom'] = '');
              nestedValue['custom'] +=
                'let clickCount' +
                nestedValue['key'] +
                " = Number(document.getElementById('formio-btnclk-" +
                nestedValue['key'] +
                "').innerHTML); document.getElementById('formio-btnclk-" +
                nestedValue['key'] +
                "').innerHTML=(clickCount" +
                nestedValue['key'] +
                '+1);';
            }
          }
          if (nestedValue && nestedValue['type'] == 'file') {
            if (
              nestedValue['storage'] == 'url' &&
              (!nestedValue['url'] ||
                nestedValue['url'].replace(/\s/g, '').length == 0)
            ) {
              if (nestedValue['options']) {
                try {
                  nestedValue['url'] =
                    window.location.origin +
                    '/api/aip/datasets/attachmentupload?org=' +
                    sessionStorage.getItem('organization') +
                    '&&process=' +
                    JSON.parse(nestedValue['options']).process;
                } catch (exception) {
                  console.log('Error while saving file component ' + exception);
                }
              } else {
                nestedValue['url'] =
                  window.location.origin +
                  '/api/aip/datasets/attachmentupload?org=' +
                  sessionStorage.getItem('organization');
              }
            }
          }
          if (nestedValue && nestedValue['type'] == 'select') {
            if (
              nestedValue.hasOwnProperty('data') &&
              nestedValue['dataSrc']?.localeCompare('url') == 0 &&
              !nestedValue['data']['url']
            ) {
              var url: String =
                window.location.origin +
                '/api/aip/datasets/getDataFromDatasets?org=' +
                sessionStorage.getItem('organization');
              var token = true;

              if (
                nestedValue['data'].hasOwnProperty('headers') &&
                nestedValue['data']['headers'].length > 0 &&
                !nestedValue['data']['url']
              ) {
                var datasetName: String = '';
                var api = nestedValue['key'];
                var tokenIndex;

                for (
                  var i = 0;
                  i < nestedValue['data']['headers'].length;
                  i++
                ) {
                  if (
                    nestedValue['data']['headers'][i]['key'].localeCompare(
                      'datasetName'
                    ) == 0
                  ) {
                    datasetName = nestedValue['data']['headers'][i]['value'];
                  }
                  if (
                    nestedValue['data']['headers'][i]['key'].localeCompare(
                      'Authorization'
                    ) == 0
                  ) {
                    token = false;
                    tokenIndex = i;
                  }
                }
                if (token)
                  nestedValue['data']['headers'].push({
                    key: 'Authorization',
                    value: "Bearer {{localStorage['jwtToken']}}",
                  });
                else
                  nestedValue['data']['headers'][tokenIndex] = {
                    key: 'Authorization',
                    value: "Bearer {{localStorage['jwtToken']}}",
                  };

                if (datasetName) url += '&datasetName=' + datasetName;

                if (api) url += '&api=' + api;

                if (nestedValue['disableLimit'] == true) {
                  url += '&limit=' + 2000;
                } else {
                  if (
                    !nestedValue['limit'] ||
                    nestedValue['limit'].replace(/\s/g, '').length == 0
                  ) {
                    url += '&limit=' + 100;
                  }
                }

                nestedValue['data']['url'] = url;
              }
              if (
                nestedValue.hasOwnProperty('data') &&
                nestedValue['dataSrc']?.localeCompare('url') == 0 &&
                nestedValue['data']['url']
              ) {
                nestedValue['url'] =
                  window.location.origin + nestedValue['url'];
                nestedValue['data']['headers'].push({
                  key: 'Authorization',
                  value: "Bearer {{localStorage['jwtToken']}}",
                });
              }

              if (
                nestedValue.hasOwnProperty('filter') &&
                nestedValue['filter']
              ) {
                var filter = '';
                var filtersArray = nestedValue['filter'].split(',');
                for (let i = 0; i < filtersArray.length; i++) {
                  filter +=
                    filtersArray[i].trim() +
                    ':{{data.' +
                    filtersArray[i].trim() +
                    '}},';
                }
                if (!nestedValue['filter'].includes('searchParams='))
                  nestedValue['filter'] = 'searchParams=' + filter.slice(0, -1);
              }
            }
          }
        });
        return nestedValue1;
      })
    );

    this.onFormSave();
  }

  onSave() {
    try {
      if (this.isWordValid(this.schemaAlias)) {
        let schemaJson = [{}];
        let formJson = Object.assign({}, this.schemaForm);
        if (this.isRawData === true) {
          if (this.getColumnJEContents()?.length > 0)
            this.schemaValue = this.getColumnJEContents();
          schemaJson = this.schemaValue;
        } else {
          schemaJson = this.dataSource;
          formJson['templateName'] = this.formName;
          formJson['templateTags'] = this.templateTags;
        }
        if (this.updateFlag) {
          let index = this.formTemplateList.findIndex(
            (ele) => this.schemaForm.templateName == ele.templateName
          );
          if (index > -1) this.formTemplateList.splice(index, 1, formJson);
        }
        if (this.schemaDescription?.trim().length == 0)
          this.schemaDescription = null;
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
          .subscribe(
            (res) => {
              const temp = [];
              this.isInEdit = true;
              this.schemaName = res?.name;
              this.colsList =
                res?.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];
              if (this.inputColumns.value != null) {
                this.inputColumns.value.forEach((element) => {
                  temp.push(JSON.parse(element).name);
                });
                this.services.message('Updated Sucessfully', 'success');
                this.formListView = true;
                this.location.back();
                this.schemaService
                  .addGroupModelEntity(res.name, temp, res.organization)
                  .subscribe();
                // this.messageService.info('Saved', 'Saved Sucessfully');
              }
              this.services.message('Saved Sucessfully', 'success');
              this.location.back();
            },
            (error) => {
              this.services.message(
                'Could not get the results' + error,
                'error'
              );
            }
          );
      } else {
        this.services.message('Invalid Schema Name', 'error');
      }
    } catch (Exception) {
      this.services.message('Some error occured', 'error');
    }
  }

  onFormSave() {
    try {
      if (
        (this.selectedFormTemplate.alias == undefined ||
          this.selectedFormTemplate.alias.length < 1) &&
        !this.formListView
      ) {
        // this.messageService.error('Form name cannot be empty', 'IAMP');
        this.services.message('Form name cannot be empty - IAMP', 'error');
      } else if (
        ((this.formNameList.includes(this.selectedFormTemplate.alias) &&
          this.updateFlag == false) ||
          (this.updateFlag == true &&
            this.selectedFormTemplate.alias != this.schemaForm.templateName &&
            this.formNameList.includes(this.selectedFormTemplate.alias))) &&
        !this.formListView
      ) {
        // this.messageService.error('Form Name already exist', 'IAMP');
        this.services.message('Form Name already exist - IAMP', 'error');
      } else {
        if (this.isWordValid(this.schemaAlias)) {
          if (this.schemaDescription?.trim().length == 0)
            this.schemaDescription = null;
          this.selectedFormTemplate.schemaname = this.schemaName;
          this.selectedFormTemplate.formtemplate = JSON.stringify(
            this.schemaForm
          );
          this.selectedFormTemplate.type = this.selectedtype;
          this.selectedFormTemplate.capability = this.selectedCapability;

          this.services.saveSchemaForm(this.selectedFormTemplate).subscribe(
            (resp) => {
              this.selectedFormTemplate = resp;
              // this.messageService.info('Saved successfully', 'CIP');
              this.services.message('Saved successfully -CIP', 'success');
              if (!this.updateFlag)
                this.formTemplateList.push(this.selectedFormTemplate);
              this.formListView = true;
            },
            (err) => {
              // this.messageService.error(err, 'Error');
              this.services.message(err, 'error');
            }
          );
        } else {
          // this.messageService.error('Error', 'Invalid Schema Name');
          this.services.message('Invalid Schema Name', 'error');
        }
      }
    } catch (Exception) {
      // this.messageService.error('Some error occured', 'Error');
      this.services.message('Some error occured', 'error');
    }
  }

  findByName(name) {
    try {
      this.services.getSchemaByName(name).subscribe(
        (res) => {
          if (res) {
            this.colsList =
              res.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];
            this.services.getSchemaFormsByName(name).subscribe(
              (resp) => {
                if (resp && resp.length > 0) {
                  this.form = resp[0].formtemplate;
                  this.schemaForm = resp[0].formtemplate;
                } else {
                  this.form = { components: [] };
                  this.schemaForm = { components: [] };
                }
                this.services.getGroupsForEntity(name).subscribe((res1) => {
                  const temp = [];
                  res1.forEach((element) => {
                    const index = this.groups.findIndex(
                      (i) => i.name === element.name
                    );
                    if (index !== -1) {
                      temp.push(JSON.stringify(this.groups[index]));
                    }
                  });
                  this.inputColumns.setValue(temp);
                });
                this.schemaAlias = res.alias;
                this.schemaDescription = res.description;
                this.schemaName = name;
                this.schemaValue =
                  res.schemavalue?.length > 0
                    ? JSON.parse(res.schemavalue)
                    : [];
                this.dataSource =
                  res.schemavalue?.length > 0
                    ? JSON.parse(res.schemavalue)
                    : [];
                this.dataSource.forEach((ele: any) => {
                  if (ele.isvisible == undefined) ele.isvisible = true;
                });
                if (resp) {
                  this.formTemplateList = resp;
                }
                if (!this.isInView) {
                  this.selectedtype = res.type;
                  this.capabilities = this.dropDownVauleCapbility.get(
                    this.selectedtype
                  )?.value;
                  this.selectedCapability = res.capability;
                } else {
                  this.types = [{ value: res.type, viewValue: res.type }];
                  this.selectedtype = res.type;
                  this.capabilities = [
                    { value: res.capability, viewValue: res.capability },
                  ];
                  this.selectedCapability = res.capability;
                }
                this.schemaValueArray = res;
                // this.messageService.info('Fetched', 'Fetched Sucessfully');
                this.services.message('Fetched Sucessfully', 'success');
              },
              (error) => {
                // this.messageService.error('Could not get form template', error);
                this.services.message('Could not get form template', 'error');
              }
            );
          } else {
            // this.messageService.error('Could not get the results', 'CIP');
            this.services.message('Could not get the results', 'error');
          }
        },
        (error) => {
          this.services.message('Could not get the results', 'error');
        }
      );
    } catch (Exception) {
      this.services.message('Some error occured', 'error');
    }
  }

  // loadGroups() {
  //   var length: any = 0;
  //   this.groupService.getGroupsLength().subscribe(
  //     (resp) => {
  //       length = resp;
  //     },
  //     (err) => {},
  //     () => {
  //       this.services.getSchemaGroups(0, length).subscribe((res) => {
  //         let data = res;
  //         data.forEach((res) => {
  //           let val = { viewValue: res.alias, value: res.alias };
  //           this.groupsOptions.push(val);
  //           // this.groups = res;
  //         });
  //       });
  //     }
  //   );
  // }

  selectedz(data) {
    try {
      console.log(data);
      return JSON.stringify(data);
    } catch (Exception) {
      // this.messageService.error('Some error occured', 'Error');
      this.services.message('Some error occured', 'error');
    }
  }

  closeDialog() {
    this.dialogRef.close({
      data: {
        schema: this.schemaValue,
        formTemplate: this.formTemplateList,
      },
    });
  }

  openDialog(action, obj) {
    let org = sessionStorage.getItem('organization');
    this.schemaRelService.getAllRelationships(org).subscribe((resp) => {
      let relts = resp;
      relts.forEach((r) => {
        if (
          r.schemaA == this.data.name ||
          r.schemaB == this.data.name ||
          r.schemaA == this.data.alias ||
          r.schemaB == this.data.alias
        ) {
          let relation = JSON.parse(r.schema_relation);
          if (
            relation['pCol'].includes(obj.recordcolumnname) ||
            relation['cCol'].includes(obj.recordcolumnname)
          ) {
            this.messageService.error(
              'This action will cause inconsistent relationsip',
              r.name
            );
          }
        }
      });
    });

    this.propertiesList = [];
    this.displaynameList = [];
    let propsList: string[] = Object.keys(this.formSchemaJson.properties);
    const dialogRef = this.dialog.open(ModalConfigSchemaEditorComponent, {
      minWidth:
        this.tabValue == 'Schema Form' && action != 'Delete' ? '75vw' : '25vw',
      maxWidth: action == 'Delete' ? '80vw' : '25vw',
      data: {
        obj: obj,
        action: action,
        tabValue: this.tabValue,
        propertiesList: this.propertiesList,
        displaynameList: this.displaynameList,
        // titleList: this.titleList,
        // positionList: poseList,
        colsList: this.colsList,
        // message:message
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let poseVal;
        if (result && result.data && result.data.details)
          poseVal = result.data.details.position;

        if (result.event === 'Add') {
          // if(this.positionList.find(val=>val==poseVal)){

          // }
          // else{
          //   this.positionList.push(poseVal);
          // }
          this.addRowData(result.data);
        } else if (result.event === 'Update') {
          // let poseValList=this.positionList;
          // if(this.positionList.find(val=>val==poseVal)){
          //   if(this.prevPose){
          //     poseValList=this.positionList.filter(val=>val!=this.prevPose);
          //   }

          // }
          // else{
          //   poseValList=this.positionList.filter(val=>val!=this.prevPose);
          //   poseValList.push(poseVal);
          // }
          // this.positionList=poseValList;
          this.updateRowData(result.data); //, oldObjProperty, oldObjIndex
        } else if (result.event === 'Delete') {
          // let poseValList=this.positionList;
          // if(this.positionList.find(val=>val==poseVal)){
          //   if(this.prevPose){
          //     poseValList=this.positionList.filter(val=>val!=this.prevPose);
          //   }

          // }
          // this.positionList=poseValList;
          this.deleteRowData(result.data);
        } else {
          // this.positionList.push(this.prevPose);
        }
      }
    });
    this.dataSource.forEach((ele) => {
      if (obj.recordcolumnname != ele.recordcolumnname)
        this.propertiesList.push(ele.recordcolumnname);
    });
    this.dataSource.forEach((ele) => {
      if (obj.recordcolumndisplayname != ele.recordcolumndisplayname)
        this.displaynameList.push(ele.recordcolumndisplayname);
    });
  }

  addRowData(row_obj) {
    if (!Array.isArray(this.dataSource)) {
      this.dataSource = [];
    }
    if (!this.display) {
      this.display = true;
    }
    // if(this.tabValue == "Schema Form"){
    //   this.updateObj(row_obj);
    //   let obj = this.formatTableObjects([row_obj.property,row_obj.details]);
    //   this.formDataSource.push(obj);
    //   // this.formSchemaJson[row_obj.property] = row_obj.details;
    //   this.refreshTableData();
    //   // this.formScriptOutput.emit(this.formSchemaJson);
    // }
    // else{
    this.dataSource.push({
      columntype: row_obj.columntype,
      columnorder: this.dataSource.length + 1,
      recordcolumnname: row_obj.recordcolumnname,
      recordcolumndisplayname: row_obj.recordcolumndisplayname,
      isprimarykey: row_obj.isprimarykey ? true : false,
      // isautoincrement: row_obj.isautoincrement?true:false,
      isunique: row_obj.isunique ? true : false,
      isrequired: row_obj.isrequired ? true : false,
      isencrypted: row_obj.isencrypted ? true : false,
      isvisible: row_obj.isvisible ? true : false,
    });
    if (this.columnsTable) this.columnsTable.renderRows();
  }

  updateRowData(row_obj) {
    this.dataSource = this.dataSource.filter((value, key) => {
      if (value.columnorder === row_obj.columnorder) {
        value.columntype = row_obj.columntype;
        value.recordcolumnname = row_obj.recordcolumnname;
        value.recordcolumndisplayname = row_obj.recordcolumndisplayname;
        value.isprimarykey = row_obj.isprimarykey ? true : false;
        // value.isautoincrement = row_obj.isautoincrement?true:false;
        value.isunique = row_obj.isunique ? true : false;
        value.isrequired = row_obj.isrequired ? true : false;
        value.isencrypted = row_obj.isencrypted ? true : false;
        value.isvisible = row_obj.isvisible ? true : false;
      }
      return true;
    });
  }

  deleteRowData(row_obj) {
    let count = 1;
    this.dataSource = this.dataSource.filter((value, key) => {
      return value.columnorder !== row_obj.columnorder;
    });
    if (this.dataSource.length !== 0) {
      this.dataSource.forEach((element) => {
        element.columnorder = count;
        count += 1;
      });
    } else {
      this.display = false;
    }
    // }
  }

  omit_special_char(event) {
    var k = event.charCode;
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return (
      (k >= 65 && k <= 90) ||
      (k >= 97 && k <= 122) ||
      (k >= 48 && k <= 57) ||
      [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1
    );
  }

  isWordValid(word) {
    word = word.toString();
    return true;
  }

  toggleView(isRaw?: boolean) {
    if (typeof isRaw === 'boolean') {
      this.isRawData = isRaw;
    } else {
      this.isRawData = !this.isRawData;
    }

    if (this.tabValue === 'Schema Form') {
      if (this.isRawData) {
        this.form = { ...this.schemaForm };
      } else {
        this.schemaFormCpy = { ...this.schemaForm };
      }
      this.ngAfterViewInit();
      return;
    }

    if (this.tabValue === 'Schema Columns') {
      if (this.isRawData) {
        const value = this.getColumnJEContents();
        if (value && value.length > 0) {
          this.dataSource = value;
          this.schemaValue = value;
        } else {
          this.dataSource = this.schemaValue;
        }
      } else {
        this.schemaValue = this.dataSource;
      }
      this.ngAfterViewInit();
      return;
    }

    // For other tab values, just refresh the view
    this.ngAfterViewInit();
  }

  ngOnChanges(changes: SimpleChanges): void {}
  openFormView(content: any) {
    this.viewForm = true;
    this.dialog.open(content, {
      width: '830px',
      panelClass: 'wide-dialog',
    });
  }

  closeFormView() {
    this.viewForm = false;
    this.dialogRef.close('close the modal');
  }

  setColumnJEContents(columnJEContents) {
    this.columnJEContents = columnJEContents;
  }

  getColumnJEContents() {
    return this.columnJEContents;
  }
  getFormTemplate(template) {
    if (!this.router.url.includes('view')) {
      this.selectedFormTemplate = template;
      this.updateFlag = true;
      let group = Object.assign({}, JSON.parse(template.formtemplate));
      // this.positionEle= group["properties"];

      //     for (let pose in this.positionEle){

      //       this.positionList.push(this.positionEle[pose].position);
      // }
      this.form = Object.assign({}, group);
      this.schemaForm = Object.assign({}, group);
      if (this.isRawData)
        this.schemaFormCpy = Object.assign({}, this.schemaForm);
      this.formName = group.templateName;
      this.templateTags = group.templateTags;
      this.formListView = false;
      this.formNameList = [];
      this.formTemplateList.forEach((data) => {
        if (this.formName != data.templateName)
          this.formNameList.push(data.templateName);
      });
      this.formTemplateListBackup = this.formTemplateList;
    }
  }

  createForm() {
    this.selectedFormTemplate = {
      name: '',
      organization: sessionStorage.getItem('organization'),
      schemaname: '',
      formtemplate: '',
    };
    this.updateFlag = false;
    this.formListView = false;
    // this.formDataSource = [];
    this.formName = '';
    this.templateTags = [];
    // this.formSchemaJson['properties'] = {};
    // this.formSchemaJson['required'] = [];
    // this.positionList = [];
    this.createFlag = true;
    this.formNameList = [];
    this.formTemplateList.forEach((data) => {
      // if(this.formName!=data.templateName)
      this.formNameList.push(data.templateName);
    });
    this.form = { components: [] };
    this.schemaForm = { components: [] };
  }
  delete(template) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.services.deleteFormTemplate(template.id).subscribe(
          (resp) => {
            // this.messageService.info('Deleted Successfully', 'CIP');
            this.services.message('Deleted Successfully -CIP', 'success');
            this.ngOnInit();
          },
          (error) => {
            this.services.message('Error in Deleting Schema' + error, 'error');
          }
        );
      }
    });
  }

  onChange(event) {
    this.schemaForm = event.form;
  }

  navigateToSchema() {
    if (this.checkUniqueIdColumn()) {
      // this.closeDialog();
      this.router.navigateByUrl(
        '/landing/iamp-graph/main/schema/' + this.schemaAlias
      );
    } else {
      this.services.message(
        'Please add "uniqueId" field under "recordcolumnname" for Graph View.',
        'info'
      );
    }
  }

  checkUniqueIdColumn() {
    let uniqueIdFlag = false;
    if (this.dataSource?.length <= 0) return false;
    this.dataSource?.forEach((row) => {
      if (row.recordcolumnname === 'uniqueId') {
        uniqueIdFlag = true;
      }
    });
    return uniqueIdFlag;
  }

  setdropDown(data: any) {
    this.types = data.types;
    this.dropDownVauleCapbility = data.capabilities;
  }

  onSelectionType(event: any) {
    console.log(
      'values to be shown ',
      this.dropDownVauleCapbility.get(event).value,
      this.dropDownVauleCapbility.get(event).default
    );
    this.selectedCapability = this.dropDownVauleCapbility.get(event)
      .default as string;
    this.capabilities = this.dropDownVauleCapbility.get(event).value;
  }
}
