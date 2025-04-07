import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PluginService } from '../../services/plugin.service';
import { Services } from '../../services/service';
import { PluginDialogComponent } from '../plugin-dialog/plugin-dialog.component';

@Component({
  selector: 'app-plugin-view',
  templateUrl: './plugin-view.component.html',
  styleUrls: ['./plugin-view.component.scss']
})
export class PluginViewComponent {
  @Input() data
  @Input() createNew
  @Input() auth
  @Output() plug = new EventEmitter();
  formKeys;
  formValueType;
  codeKeys = [[]];
  codeValueType = [{}];
  defaultkeys;
  strData;
  selectedModel: any;
  toJson: boolean = false;
  scriptAlter: any;
  id;
  screentog: boolean = true;
  authDelete: boolean = false;
  authUpdate: boolean = false;
  aliasList: any = [];

  constructor(
    private _formBuilder: FormBuilder,
    private service: Services,
    private pluginService: PluginService,
    public dialog: MatDialog
  ) { }

  public pluginForm: FormGroup;

  ngOnInit(): void {
    this.selectedModel = history?.state.model
    this.defaultkeys = (this.selectedModel.editortype == "jsplumb") ?
      ['id', 'name', 'category', 'parentCategory', 'classname', 'attributes', 'inputEndpoints', 'outputEndpoints', 'codeGeneration'] :
      ['id', 'name', 'category', 'parentCategory', 'html', 'component', 'inputs', 'outputs', 'codeGeneration']
    this.refresh()
    this.screentog = true;
    if (this.auth) this.autheticate();
    if (this.createNew) {
      // to get new form with basic fields 
      // this.id = this.data.countId
      this.aliasList = this.data?.aliasList
      this.id = 0
      if (this.selectedModel.editortype == "jsplumb") {
        this.formKeys = ['id', 'name', 'category', 'parentCategory', 'classname', 'attributes', 'inputEndpoints', 'outputEndpoints', 'codeGeneration']
        this.formValueType = { 'id': 'Number', 'name': 'String', 'category': 'String', 'parentCategory': 'String', 'classname': 'String', 'attributes': 'Array', 'inputEndpoints': 'Array', 'outputEndpoints': 'Array', 'codeGeneration': 'Object' }
      }
      else {
        this.formKeys = ['id', 'name', 'category', 'parentCategory', 'html', 'component', 'inputs', 'outputs', 'codeGeneration']
        this.formValueType = { 'id': 'Number', 'name': 'String', 'category': 'String', 'parentCategory': 'String', 'html': 'String', 'component': 'String', 'inputs': 'Array', 'outputs': 'Array', 'codeGeneration': 'Object' }
      }

      this.codeKeys[0] = ['imports', 'requirements', 'script']
      this.codeValueType[0] = { 'imports': 'Array', 'requirements': 'Array', 'script': 'Code' }
      this.pluginForm = this.createNewForm()
      // this.pluginForm.patchValue({ id: this.data.countId })
      let d = this.pluginForm.value
      delete d['id']
      this.strData = JSON.stringify(d)
      this.scriptAlter = ''
    }
    else {
      // to create a form with existing data
      this.id = this.data.selectedPluginData?.id
      this.formValueType = {}
      this.formKeys = (this.data?.selectedPluginData) ? Object.keys(this.data.selectedPluginData) : []
      this.formKeys.forEach(e => {
        this.formValueType[e] = this.data?.selectedPluginData[e]?.constructor.name
        if (e == 'attributes')
          this.formValueType[e] = 'Array'
      })
      this.codeValueType = [{}]
      this.codeKeys[0] = this.data?.selectedPluginData?.codeGeneration ? Object.keys(this.data.selectedPluginData.codeGeneration) : []
      this.codeKeys[0].forEach(e => {
        this.codeValueType[0][e] = this.data?.selectedPluginData?.codeGeneration[e]?.constructor.name
        if (e == 'script')
          this.codeValueType[0][e] = 'Code'
      })
      this.pluginForm = this.createNewForm()
      if (this.data?.selectedPluginName) {
        this.pluginForm.patchValue(this.addDataToForm(this.structPlugData(this.data.selectedPluginData)))
        let d = this.data.selectedPluginData
        delete d['id']
        this.strData = JSON.stringify(d)
        this.scriptAlter = this.data?.selectedPluginData?.codeGeneration?.script.replace(/"/g, "\"").split('\n');
      }
    }
  }

  autheticate() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // plug-delete/update permission
        if (cipAuthority.includes("plug-delete"))
          this.authDelete = true;
        //plug-update permission
        if (cipAuthority.includes("plug-update") || cipAuthority.includes("plug-addNewNode"))
          this.authUpdate = true;
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.auth?.currentValue)
      this.autheticate()
    if (changes?.data?.currentValue != changes?.data?.previousValue || changes?.createNew?.currentValue != changes?.createNew?.previousValue)
      this.ngOnInit()
  }

  onScripttChange($event, index) {
    let x = this.pluginForm.get('codeGeneration') as FormGroup
    // x.controls[index]["controls"]["Script"] = $event
    this.pluginForm.controls.codeGeneration["controls"]["script"].setValue($event)
  }

  // basic form for plugin
  createNewForm(): FormGroup {
    let newForm
    newForm = this._formBuilder.group({});
    this.formKeys.forEach(e => {
      if (e == 'codeGeneration') {
        newForm.addControl(e, new FormGroup({}))
        let i = 0
        for (let co in this.codeKeys) {
          if (this.codeKeys[i].constructor.name == 'Array') {
            this.codeKeys[i].forEach(g => {
              newForm = this.addNewField(i, g, newForm)
            })
            i++
            if (this.codeKeys[i]?.length > 0)
              newForm.controls[e].controls.push(this._formBuilder.group({}))
          }
          else
            newForm = this.addNewField(0, co, newForm)
        }
      }
      else if (e == 'attributes') {
        newForm.addControl(e, new FormArray([]))
      }
      else
        newForm = this.updateForm(newForm, this.formValueType[e], e)
    })
    return newForm
  }

  updateForm(form, type, key) {
    switch (type) {
      case 'String':
        form.addControl(key, new FormControl(''))
        break;
      case 'Number':
        form.addControl(key, new FormControl(''))
        break;
      case 'Array':
        form.addControl(key, new FormArray([]))
        break;
      case 'Object':
        form.addControl(key, new FormGroup({}))
        break;
      case 'Code':
        form.addControl(key, new FormControl(''))
        break;
    }
    return form
  }

  screenChange() {
    this.toJson = !this.toJson
    if (this.toJson && this.pluginForm.value) {
      let d = this.pluginForm.value
      delete d['id']
      this.strData = JSON.stringify(d)
    }
    if (!this.toJson && this.strData) {
      this.strData['id'] = this.id
      this.pluginForm.patchValue(this.strData)
    }
  }

  // structure plugData
  structPlugData(plugData) {

    let strPlug = plugData
    if (this.formKeys.includes('formats')) {
      let dataAttri = []
      let formats = plugData.formats
      let attributes = plugData.attributes
      for (let f in formats) {
        dataAttri.push({ name: f, type: formats[f], defaultvalue: '' })
      }
      for (let a in attributes) {
        let c = dataAttri.filter(x => x.name == a)
        if (c.length == 0) {
          dataAttri.push({ name: a, type: '', defaultvalue: attributes[a] })
        }
        else {
          dataAttri.forEach(x => {
            if (x.name == c[0]['name']) x.defaultvalue = attributes[a]
          })
        }
      }
      delete strPlug.formats
      delete this.formValueType['formats']
      this.formKeys.splice(this.formKeys.indexOf('formats'), 1)
      this.formValueType['attributes'] = 'Array'
      strPlug['attributes'] = dataAttri
      let dataAttriForm = []
      for (let da of dataAttri) {
        let s = { name: da.name, type: da.type, defaultvalue: da.defaultvalue }
        dataAttriForm.push(s)
      }
      strPlug['attributes'] = dataAttriForm
    }
    return strPlug
  }

  // to add data to form
  addDataToForm(plugData) {
    this.formKeys.forEach(e => {
      if (this.formValueType[e] == 'Array') {
        for (let l = 0; l < plugData[e]?.length; l++)
          this.add(e, this.pluginForm)
      }
    })
    this.codeKeys[0].forEach(e => {
      if (this.codeValueType[0][e] == 'Array') {
        for (let l = 0; l < plugData.codeGeneration[e]?.length; l++)
          this.add(e, this.pluginForm.get('codeGeneration'))
      }
    })
    return plugData
  }

  add(k, form) {
    let p = form.get(k) as FormArray
    if (k == 'attributes')
      p.push(this._formBuilder.group({ name: '', type: '', defaultvalue: '' }));
    // else if (k == 'codeGeneration') {
    //   p.push(this._formBuilder.group({}))
    //   this.codeKeys.push([])
    //   this.codeValueType.push({})
    // }
    else
      p.push(this._formBuilder.control(''));
  }

  addObj(k) {
    let p = this.pluginForm.get(k) as FormGroup
    if (k == 'codeGeneration') {
      p.addControl('w', this._formBuilder.group({}))
    }
  }

  addcode(k, l, c) {
    let v = this.pluginForm.controls[k]['controls'][c] as FormArray
    v.push(new FormControl(''))
  }

  addNewField(i, name, form) {
    let x = form ? form : this.pluginForm;
    let r = x.get('codeGeneration') as AbstractControl;
    r = this.updateForm(r, this.codeValueType[i][name], name)
    return x
  }

  remove(k, j) {
    let c = this.pluginForm.get(k) as FormArray
    c.removeAt(j)
    if (k == 'codeGeneration') {
      this.codeKeys.splice(j)
      this.codeValueType.splice(j)
    }
  }

  removeCode(k, m, c, j) {
    this.pluginForm.get(k)['controls'][c].removeAt(j)
  }

  removeadditional(k) {
    this.formKeys = this.formKeys.splice(k);
    this.pluginForm.removeControl(k);
    delete this.formValueType[k];
  }

  addNew(status, l?) {
    let data = status
    const dialogRef = this.dialog.open(PluginDialogComponent, {
      height: '45%',
      width: '50%',
      disableClose: false,
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (!status) {
          this.formKeys.push(result.key)
          this.formValueType[result.key] = result.type
          this.pluginForm = this.updateForm(this.pluginForm, result.type, result.key)
        }
        else {
          this.codeKeys[0].push(result.key)
          this.codeValueType[0][result.key] = result.type
          this.pluginForm.controls.codeGeneration = this.updateForm(this.pluginForm.controls.codeGeneration, result.type, result.key)
        }
      }
    })
  }

  deleteIndividualNode() {
    this.screentog = false
    this.pluginService.deleteIndividualNode(this.data.selectedPluginName[0]).subscribe(res => {
      this.service.message('Deleted Sucessfully', 'success');
      this.refresh()
    },
      error => {
        this.service.message('Could not delete the plugin', 'error');
      });
  }

  submit(val) {
    val = JSON.parse(val)
    // val['id'] = this.id
    this.OnSubmit(val)
  }

  OnSubmit(val) {
    this.screentog = false
    let att = {}
    let form = {}
    if (val.codeGeneration?.script)
      val.codeGeneration.script = val.codeGeneration?.script ? this.arrayToString(val.codeGeneration?.script) : ''
    val.attributes?.forEach(e => {
      att[e.name] = e.defaultvalue;
      form[e.name] = e.type
    })
    if (this.selectedModel.editortype == "jsplumb") {
      delete val.attributes
      val['attributes'] = att
      val['formats'] = form
    }
    val['alias'] = val.name
    let jsonVal = val;
    val = JSON.stringify(val)

    if (this.createNew) {
      let org = sessionStorage.getItem('organization');
      let newplug = {
        type: this.selectedModel.type,
        // pluginname: this.selectedModel.type + org + '-' + this.data.countId,
        plugindetails: val,
        org: org
      }
      let newAlias = this.aliasList?.filter(e => e == jsonVal.alias)
      if (newAlias.length > 0) {
        this.service.message('Node name already exists', 'error');
      } else {
        this.pluginService.createNewNode(newplug).subscribe(res => {
          this.service.message('Created Sucessfully', 'success');
          this.refresh()
          this.plug.emit(false)
        })
      }
    }
    else {
      this.pluginService.updateIndividualNode(this.data.selectedPluginName[0], JSON.parse(val)).subscribe(res => {
        this.service.message('Updated Sucessfully', 'success');
        this.refresh()
      },
        error => {
          this.service.message('Could not get the results', 'error');
        });
    }
  }

  arrayToString(code): string {
    let codeStr = '';
    for (let i = 0; i < code.length; i++) {
      codeStr += code[i] + '\n';
    }
    return codeStr;
  }

  refresh() {
    this.formKeys = [];
    this.formValueType = {};
    this.codeKeys = [[]];
    this.codeValueType = [];
    this.strData = '';
    // this.pluginForm.reset();
    this.pluginForm = new FormGroup({})
    this.plug.emit(true)
  }
}
