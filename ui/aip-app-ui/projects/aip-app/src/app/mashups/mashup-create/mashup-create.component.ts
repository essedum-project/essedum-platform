import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Mashup } from '../../DTO/mashup';
import { MashupsService } from '../../mashups/mashups.service';
import { take, takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Services } from '../../services/service';
import { AdapterServices } from '../../adapter/adapter-service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { FileUploader } from 'ng2-file-upload';

interface ActionElement {
  name: string;
  icon: string;
  viewtype: string;
  url: string;
  requestType: string,
  mashupname: string;
  componentView: string;
  children?: ActionElement[];
  index: string;
  params: any;
  onCard: boolean,
  schema: string,
  form: string
}

interface DatasetElement {
  name: string;
  alias: string;
  datasource_alias: string;
  action: any,
  onCard: any,
  children?: DatasetElement[];
  index: string;
}

@Component({
  selector: 'lib-mashup-create',
  templateUrl: './mashup-create.component.html',
  styleUrls: ['./mashup-create.component.scss']
})
export class MashupCreateComponent implements OnInit {

  layoutOptions: OptionsDTO[] = [];
  viewTypeOptions: OptionsDTO[] = [];
  public orderForm: FormGroup;
  layouts = ["tabs", "simple"]
  datasets;
  datasetsChild;
  datasources;
  templates = [];
  permission_list = [];
  viewType = ["form", "table", "customTable", "iFrame", "image", "video","chatbot"]
  showForm = false
  layout: any;
  mashupname
  mashup: Mashup
  preview = false
  searchTerm = new FormControl();
  searchTermChild = new FormControl();
  searchTermForDatasource = new FormControl();
  protected _onDestroy = new Subject<void>();
  filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredDatasetsForImage: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredDatasetsForVideo: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredDatasetsChild: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredDatasources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  addAction = false
  addDataset = false
  dataSource = new MatTreeNestedDataSource<ActionElement>();
  dsetdataSource = new MatTreeNestedDataSource<DatasetElement>();
  treeData: ActionElement[] = []
  datasettreeData: DatasetElement[] = []
  treeControl = new NestedTreeControl<ActionElement>(node => node.children);
  dsettreeControl = new NestedTreeControl<DatasetElement>(node => node.children);
  newElement = {
    name: null,
    icon: null,
    viewtype: null,
    componentView: null,
    url: null,
    requestType: null,
    mashupname: null,
    params: null,
    index: null,
    onCard: null,
    schema: null,
    form: null
  }
  actnEleArray: ActionElement[] = []
  newDataset = {
    name: null,
    alias: null,
    datasource_alias: null,
    action: this._formBuilder.array(this.actnEleArray),
    index: null
  }
  newDatasource = {
    name: null
  }
  viewTypes = ['navigateTo', 'table', 'api', 'preview', 'componentView', 'formView']
  index: any;
  editActionFlag: boolean = false;
  editDatasetFlag: boolean = false
  actionIndex = 0
  adaptersOptions: OptionsDTO[] = [];
  adapterInstances: any;
  adapterInstanceName: string;
  headerLogoImage: any;
  footerLogoImage: any;
  chatbotExtra: boolean = false;
  headerText: string = '';
  footerText: string = '';

  constructor(private _formBuilder: FormBuilder, private mashupService: MashupsService,
    private messageService: AdapterServices, private datasetService: Services,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.layoutOptions.push(new OptionsDTO('simple', 'simple'));
    this.layoutOptions.push(new OptionsDTO('tabs', 'tabs'));

    this.getMashup()
    this.getDatasets()
    this.getDatasources()
    this.findAllAdapters()
    this.searchTerm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteredDatasets.next(
          this.datasets.filter(col => col.alias.toLowerCase().indexOf(this.searchTerm.value) > -1)
        );
      });
    this.searchTermForDatasource.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteredDatasources.next(
          this.datasources.filter(col => col.alias.toLowerCase().indexOf(this.searchTermForDatasource.value) > -1)
        );
      });
    this.mashupService.getPermissionList().subscribe(resp => {
      resp.content.forEach((per) => {
        this.permission_list.push(per.permission);
      })
    });
    this.permission_list.push("no-permission")
  }

  getMashup() {
    this.route.params.subscribe((res) => {
      this.mashupname = res['name'];
    });
    this.mashupService.getMashupByName(this.mashupname).subscribe(resp => {
      this.mashup = resp
      if (this.mashup.template) {
        this.layout = JSON.parse(this.mashup.template).layout
        if (this.layout == "tabs") {
          this.orderForm = this._formBuilder.group({
            contents: this._formBuilder.array(this.addExistingItem())
          })
        }
        else if (this.layout == "simple") {
          this.orderForm = this._formBuilder.group({
            contents: this._formBuilder.array(this.addExistingContent(0, JSON.parse(this.mashup.template)))
          })
        }
        if(Object.keys(JSON.parse(this.mashup.template)).includes('chatExtras'))
          this.updateChatbotValues(JSON.parse(this.mashup.template).chatExtras);
        this.showForm = true
      }
    })
  }

  updateChatbotValues(chatExtras) {
    this.headerLogoImage = chatExtras["headerLogo"];
    this.footerLogoImage = chatExtras["footerLogo"];
    this.headerText = chatExtras["headerText"];
    this.footerText = chatExtras["footerText"];
  }

  onViewTypeSelection(event,selectedView) {
    if (selectedView == 'chatbot'){
      this.chatbotExtra = true;
    } else {
      this.chatbotExtra = false;
    }
  }

  onHeaderImageChange(event) {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      var src = e.target.result;
      this.headerLogoImage = src
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  header(evt) {
    this.headerText = evt.target.value;
  }

  footer(evt) {
    this.footerText = evt.target.value;
  }

  onFooterImageChange(event) {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      var src = e.target.result;
      this.footerLogoImage = src
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  createForm(layout) {
    this.layout = layout
    if (layout == "tabs") {
      this.orderForm = this._formBuilder.group({
        contents: this._formBuilder.array([this.createItem()])
      })
    }
    else if (layout == "simple") {
      this.orderForm = this._formBuilder.group({
        contents: this._formBuilder.array([this.createContent()])
      })
    }
    this.showForm = true
  }

  createItem(): FormGroup {
    return this._formBuilder.group({
      slug: '',
      label: '',
      type: 'simple',
      contents: this._formBuilder.array([this.createContent()])
    });
  }

  createContent(): FormGroup {
    return this._formBuilder.group({
      cols: '',
      rows: '',
      url: '',
      title: '',
      x: '', y: '',
      type: '',
      dataset: '',
      templatename: '',
      params: '["id"]',
      displayColumns: this._formBuilder.array([]),
      createDialog: '',
      permission: '',
      datasets: this._formBuilder.array([])
    })
  }

  get contents(): FormArray {
    return this.orderForm.get('contents') as FormArray;
  };

  removeStage(index) {
    this.contents.removeAt(index)
  }

  addStage(): void {
    this.contents.push(this.createItem());


  }

  addStageAtIndex(i) {
    this.contents.insert(i + 1, this.createItem());
  }

  addContentAtIndex(i, j) {
    if (this.layout == "tabs")
      this.contents.controls[i]["controls"].contents.insert(j + 1, this.createContent());
    else if (this.layout == "simple")
      this.contents.insert(j + 1, this.createContent());
  }

  removeContent(index) {
    this.contents.controls[0]["controls"].contents.removeAt(index)
  }

  replacerFunc = () => {
    const visited = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (visited.has(value)) {
          return;
        }
        visited.add(value);
      }
      return value;
    };
  };

  OnSubmit(mashvalues) {
    mashvalues["layout"] = this.layout
    if(this.chatbotExtra) 
      mashvalues["chatExtras"] = this.mapChatbotValues();
    this.mashup.template = JSON.stringify(mashvalues, this.replacerFunc());
    this.mashupService.createMashup(this.mashup).subscribe(async res => {
      await this.messageService.messageNotificaionService('success', "Saved Successfully");
    });
    this.cancel();
  }

  mapChatbotValues() {
    let chatExtras = {}
    chatExtras["headerLogo"] = this.headerLogoImage;
    chatExtras["footerLogo"] = this.footerLogoImage;
    chatExtras["headerText"] = this.headerText;
    chatExtras["footerText"] = this.footerText;
    return chatExtras;
  }

  addExistingItem() {
    let template = JSON.parse(this.mashup.template)
    let formarray = []
    let i = 0
    for (let val of template.contents) {
      formarray.push(this._formBuilder.group({
        slug: val.slug,
        label: val.label,
        type: val.type,
        contents: this._formBuilder.array(this.addExistingContent(i, val))
      }))
      i++
    }
    return formarray
  }

  addExistingContent(i, val) {
    let formarray = []
    let j = 0
    for (let cont of val.contents) {
      formarray.push(this._formBuilder.group({
        cols: cont.cols,
        rows: cont.rows,
        url: cont.url,
        title: cont.title,
        x: cont.x,
        y: cont.y,
        type: cont.type,
        dataset: cont.dataset,
        templatename: cont.templatename,
        createDialog: cont.createDialog,
        permission: cont.permission,
        params: cont.params,
        displayColumns: cont.displayColumns,
        datasets: cont.datasets ? this._formBuilder.array(cont.datasets) : []
      }))
      if (cont.dataset)
        this.getFormTemplates(i, j, cont.dataset)
      j++
      this.datasettreeData = cont.datasets
      this.refreshDatasetTree()


    }
    return formarray
  }

  getDatasets() {
    this.datasetService.getDatasets().subscribe(resp => {
      this.datasets = resp
      this.filteredDatasets.next(this.datasets.slice());
      let datasetsForImage = this.datasets.filter(dt => (dt.views == 'Image View'));
      this.filteredDatasetsForImage.next(datasetsForImage.slice());
      let datasetsForVideo = this.datasets.filter(dt => (dt.views == 'Video View'));
      this.filteredDatasetsForVideo.next(datasetsForVideo.slice());
    })
  }

  getFormTemplates(i, j, datasetname) {
    this.datasetService.getDatasetForm(datasetname).subscribe(res => {
      if (this.templates[i]) {
        if (this.templates[i][j])
          this.templates[i][j] = res
        else
          this.templates[i].push(res)
      }
      else {
        this.templates[i] = []
        this.templates[i].push(res)
      }
    })
  }

  cancel() {
    this.router.navigate(["../"], { relativeTo: this.route })
  }

  addNewAction() {
    this.editActionFlag = false
    this.newElement = {
      name: null,
      icon: null,
      viewtype: null,
      componentView: null,
      url: null,
      mashupname: null,
      requestType: null,
      params: null,
      index: this.actionIndex,
      onCard: null,
      schema: null,
      form: null
    }

    this.addAction = true
  }

  addNewDataset(i) {
    this.actionIndex = 0
    this.editDatasetFlag = false
    this.index = i;
    this.newDataset = {
      name: null,
      alias: null,
      datasource_alias: null,
      action: this._formBuilder.array(this.actnEleArray),
      index: i
    }
    this.newDatasource = {
      name: null
    }
    this.treeData = []
    this.refreshTree()
    this.addDataset = true
  }

  addDatasetInTree(element) {
    let datasourceName = "";
    let dsetName = ""
    for (let dataset of this.datasets) {
      if (dataset.name === element.name) {
        dsetName = dataset.alias;
        datasourceName = dataset.datasource.alias;
        break;
      }
    }
    var newNode: DatasetElement = {
      name: element.name,
      alias: dsetName,
      datasource_alias: datasourceName,
      action: element.action.value,
      onCard: element.onCard,
      index: "" + (this.datasettreeData.length > 0 ? this.datasettreeData.length + 1 : 1)
    }
    this.datasettreeData.push(newNode);
    (this.contents.at(this.index) as FormGroup).setControl('datasets', this._formBuilder.array(this.datasettreeData));
    this.refreshDatasetTree()
    this.addDataset = false
  }

  addElementInTree(element) {
    if (!this.treeData)
      this.treeData = []
    var newNode: ActionElement = {
      name: element.name,
      icon: element.icon,
      viewtype: element.viewtype,
      url: element.url,
      requestType: element.requestType,
      mashupname: element.mashupname,
      params: element.params,
      index: "" + (this.treeData.length > 0 ? this.treeData.length + 1 : 1),
      onCard: element.onCard,
      componentView: element.componentView,
      schema: element.schema,
      form: element.form
    }

    this.treeData.push(newNode);
    this.newDataset.action = this._formBuilder.array(this.treeData)
    this.refreshTree()
    this.addAction = false
  }

  editAction(element) {
    this.editActionFlag = true
    this.addAction = true
    this.newElement = {
      name: element.name,
      icon: element.icon,
      viewtype: element.viewtype,
      url: element.url,
      requestType: element.requestType,
      mashupname: element.mashupname,
      params: element.params,
      index: element.index,
      onCard: element.onCard,
      componentView: element.componentView,
      schema: element.schema,
      form: element.form
    }
  }

  editDataset(element) {
    let datasourceName = "";
    let datasourceAlias = "";
    let dsetAlias = "";
    for (let dataset of this.datasets) {
      if (dataset.name === element.name) {
        datasourceName = dataset.datasource.name;
        datasourceAlias = dataset.datasource.alias;
        dsetAlias = dataset.alias;
        break;
      }
    }
    this.OnDatasourceChange(datasourceName);
    this.editDatasetFlag = true
    this.addDataset = true
    this.newDataset = {
      name: element.name,
      alias: dsetAlias,
      datasource_alias: datasourceAlias,
      action: element.action,
      index: element.index
    }
    this.newDatasource = {
      name: datasourceName
    }
    this.treeData = element.action
    if (this.treeData instanceof FormArray)
      this.treeData = element.action.controls.map(control => control.value);
    this.refreshTree()
  }

  refreshTree() {
    this.dataSource.data = null;
    this.dataSource.data = this.treeData;
  }

  refreshDatasetTree() {
    this.dsetdataSource.data = null;
    this.dsetdataSource.data = this.datasettreeData;
  }

  modifyElementInTree(tree: ActionElement[], element, newelement) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree[i].name = newelement.name;
        tree[i].icon = newelement.icon;
        tree[i].viewtype = newelement.viewtype;
        tree[i].componentView = newelement.componentView;
        tree[i].url = newelement.url;
        tree[i].requestType = newelement.requestType,
          tree[i].mashupname = newelement.mashupname;
        tree[i].params = newelement.params;
        tree[i].onCard = newelement.onCard;
        tree[i].schema = newelement.schema;
        tree[i].form = newelement.form;
        break;
      }
    }
    return tree;
  }

  modifyDatasetInTree(tree: DatasetElement[], element, newelement) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree[i].name = newelement.name;
        tree[i].alias = newelement.alias;
        tree[i].datasource_alias = newelement.datasource_alias;
        if (newelement.action instanceof FormArray)
          tree[i].action = newelement.action.value
        else
          tree[i].action = newelement.action
        tree[i].onCard = newelement.onCard
        break;
      }
    }
    return tree;
  }

  returnTreeElement(tree: ActionElement[], index): ActionElement {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i].index == index) {
        return tree[i];
      }
    }
    return null;
  }

  returnDatasetElement(tree: DatasetElement[], index): DatasetElement {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i].index == index) {
        return tree[i];
      }
    }
    return null;
  }

  modifyNode(element) {
    this.treeData = this.modifyElementInTree(this.treeData, this.returnTreeElement(this.treeData, element.index), element);
    this.refreshTree();
    this.newDataset.action = this._formBuilder.array(this.treeData)
    this.addAction = false
  }

  modifyDataset(element) {
    this.addDataset = true
    this.datasettreeData = this.modifyDatasetInTree(this.datasettreeData, this.returnDatasetElement(this.datasettreeData, element.index), element);
    this.refreshDatasetTree();
    this.addDataset = false
  }

  deleteAction(index) {
    this.treeData = this.deleteNodeInTree(this.treeData, this.returnTreeElement(this.treeData, index));
    this.refreshTree();
    this.newDataset.action = this._formBuilder.array(this.treeData)
  }

  deleteNodeInTree(tree: ActionElement[], element: ActionElement) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree.splice(i, 1);
        break;
      }
    }
    return tree;
  }

  deleteDataset(index, j) {
    this.datasettreeData = this.deleteDatasetInTree(this.datasettreeData, this.returnDatasetElement(this.datasettreeData, index));
    this.refreshDatasetTree();
    (this.contents.at(j) as FormGroup).setControl('datasets', this._formBuilder.array(this.datasettreeData));
  }

  deleteDatasetInTree(tree: DatasetElement[], element: DatasetElement) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree.splice(i, 1);
        break;
      }
    }
    return tree;
  }

  getDatasources() {
    this.datasetService.getDatasources().subscribe(resp => {
      this.datasources = resp
      this.filteredDatasources.next(this.datasources.slice());
    })
  }

  OnDatasourceChange(datasourceName: string) {
    this.datasetService.getDatasetForDatasource(datasourceName).subscribe(resp => {
      this.datasetsChild = resp.body;
      this.filteredDatasetsChild.next(this.datasetsChild.slice());
    })
    this.searchTermChild.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteredDatasetsChild.next(
          this.datasetsChild.filter(col => col.alias.toLowerCase().indexOf(this.searchTermChild.value) > -1)
        );
      });
  }

  backToMashups() {
    this.router.navigate(["../../mashups"], { relativeTo: this.route });
  }

  findAllAdapters() {
    this.messageService.getMlInstanceNamesByOrganization()
      .subscribe(res => {
        this.adapterInstances = res;
        this.adapterInstances.forEach((insNamr) => {
          this.adaptersOptions.push(new OptionsDTO(insNamr, insNamr));
        });
      });
  }

  adapterNameChangesOccur(adpName: string) {
    this.adapterInstanceName = adpName;
  }
}