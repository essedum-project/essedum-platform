import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Services } from '../services/service';
import { PluginService } from '../services/plugin.service';
import { LedsLibService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { TreeComponent } from '@ali-hm/angular-tree-component';
import { Events } from '../sharedModule/events/events';
import { StreamingServices } from '../streaming-services/streaming-service';
import { EventsService } from '../services/event.service';
import { DashConstant, Project } from 'com-lib-util';
// import { TreeComponent } from 'leds-lib';

@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html',
  styleUrls: ['./plugin.component.scss']
})
export class PluginComponent {
  pluginData: any = "";
  plugins: any = [];
  showView
  isRawData = true
  editorOptions = new JsonEditorOptions();
  @ViewChild('formJsonEditor', { static: false }) formJsonEditor: JsonEditorComponent;
  @ViewChild(TreeComponent, { static: false }) private tree: TreeComponent;
  breadcrumb: any;
  type: any;
  finalJsonList: any = [];
  categoryList: any = [];
  nodes: any[];
  createFlag: boolean = false;
  editplug: boolean = false;
  view: boolean = false;
  plugin: any = {
    name: "", config: { commands: [""], environment: {} }, type: "", org: "", editortype: ""
  }
  langList = ["powershell"]
  langEnable = true
  lang = "powershell"
  paramsDynamic: any
  dynamicParamsArray: Array<DynamicParamsGrid> = [];
  script = []
  configData: any;
  optionsNewView = {
    actionMapping: {
      mouse: {
        dblClick: (tree, node, $event) => this.nodePreview(node),
        click: (tree, node, $event) => this.nodePreview(node)
      }
    },
  };
  pluginName: any;
  selectedPluginName: any;
  selectedPluginData: any;
  selectedModel: any;
  passData = {}
  newNode: boolean = false;
  // editorlist = [{ viewValue: "jsplumb", value: "jsplumb" }, { viewValue: "drawflow", value: "drawflow" }];
  editorlist = [{ viewValue: "jsplumb", value: "jsplumb" }];
  editors = ["jsplumb", "drawflow"]
  filter: any;
  basicReqTab: any = "nodesTab";
  tooltipPoition: string = 'above';
  // countId: number = 0;

  // pagination variable
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 12, 18, 24, 30]
  noOfItems: number;
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();

  authDelete: boolean = false;
  authCreate: boolean = false;
  authAddNew: boolean = false;
  authUpdate: boolean = false;
  auth: boolean = false;
  filteredPlugin: any;
  dataNotPresent: boolean = false;
  pluginAlias: any = [];
  pluginConstantsKey: string = "icip.aip.pluginView";
  fetchOrg: string;
  orgToggle: boolean = true;
  isKeyPresent: boolean;

  constructor(
    private pluginService: PluginService,
    public dialogRef: MatDialogRef<PluginComponent>,
    private ledsLibService: LedsLibService,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private eventsService: EventsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.authenticate();
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.selectedModel = history?.state.model
    this.auth = history?.state.auth ? history.state.auth : false
    this.route.params.subscribe((res) => {
      if (res.name) {
        this.getPlugin(res.name)
        this.view = true
        this.createFlag = true
      }
      else
        this.getAllPlugins()
    })
  }

  authenticate() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // plug-add permission
        if (cipAuthority.includes("plug-add"))
          this.authCreate = true;
        // plug-delete/update permission
        if (cipAuthority.includes("plug-delete"))
          this.authDelete = true;
        // plug-addNewNode permission
        if (cipAuthority.includes("plug-addNewNode"))
          this.authAddNew = true;
        //plug-update permission
        if (cipAuthority.includes("plug-update"))
          this.authUpdate = true;
      }
    );
  }

  // get list of plugin
  getAllPlugins() {
    this.service.getConstantByKey(this.pluginConstantsKey).subscribe((response) => {
      if (response.body == null || response.body == undefined || response.body == '') {
        this.isKeyPresent = false;
        return;
      } else {
        this.fetchOrg = response.body;
        this.orgToggle = this.fetchOrg == 'only' ? true : false;
        this.pageSize = this.itemsPerPage[0];
        this.pageNumber = 1;
        if (this.pageNumberChanged) {
          this.pageNumber = 1;
          this.startIndex = 0;
          this.endIndex = 5;
        }
        try {
          if (this.fetchOrg == 'all') {
            this.pluginService.getAllPlugins(sessionStorage.getItem('organization')).subscribe(res => {
              this.plugins = res;
              this.filteredPlugin = this.plugins;
              this.noOfItems = this.filteredPlugin.length
              this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
              this.pageArr = [...Array(this.noOfPages).keys()];
            })
          }
          else {
            this.pluginService.getAllPluginsByOrg(sessionStorage.getItem('organization')).subscribe(res => {
              this.plugins = res;
              this.filteredPlugin = this.plugins;
              this.noOfItems = this.filteredPlugin.length
              this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
              this.pageArr = [...Array(this.noOfPages).keys()];
            })
          }
        }
        catch {
          this.service.message('Could not get the results', 'error');
        };
      }
    });

  }

  // plugin details page
  async getPlugin(type) {
    this.type = type
    try {
      const org = sessionStorage.getItem('organization');
      this.pluginService.getPlugin(type, org).subscribe(res => {
        let commands = []
        this.showView = true
        let response = JSON.parse(res.body)
        this.pluginData = []
        this.pluginName = []
        response.forEach(ele => {
          this.pluginData.push(JSON.parse(ele.plugindetails))
          this.pluginAlias = this.pluginData.map(p => p.alias)
          this.pluginName.push(ele.pluginname)
        })
        // this.pluginName.sort((a, b) => a.substring(a.indexOf('-') + 1) - b.substring(b.indexOf('-') + 1));
        if (this.selectedModel.config && this.selectedModel.config != '') {
          this.configData = JSON.parse(this.selectedModel.config);
          this.dynamicParamsArray = []
          Object.keys(this.configData?.environment).forEach(key => {
            this.dynamicParamsArray.push({ "name": name, "value": this.configData?.environment[key] })
          })
        }
        this.script = this.configData?.commands

        this.preview()
        // this.service.message('Fetched Sucessfully', 'success');
      },
        error => {
          this.service.message('Could not get the results', error);
        }
      );
    }
    catch (Exception) {
      this.service.message("Some error occured", "Error")
    }
    // this.pluginService.getPluginCount(this.type).subscribe(res => {
    //   this.countId = res + 1;
    // })
    this.breadcrumb = []
    if (this.selectedModel) {
      var name = this.selectedModel.name
      this.breadcrumb.push({ name: name })
    }
  }

  preview() {
    this.nodes = [];
    var data = this.pluginData,
      tree = function (data, root) {
        var t = {};
        data.forEach(({ id, category, parentCategory, alias, name }) => {
          Object.assign(t[id] = t[id] || {}, { label: id, name: name, alias: alias, category: category });
          t[parentCategory] = t[parentCategory] || {};
          t[parentCategory].children = t[parentCategory].children || [];
          t[parentCategory].children.push(t[id]);
        });
        return t[root]?.children;
      }(data, "");
    this.nodes = tree;
    this.tree?.treeModel.update();
    this.tree?.sizeChanged();
  }

  // create new plugin
  createPlugin() {
    this.createFlag = true
    this.view = false
    this.editplug = false
    this.plugin = { name: "", config: { commands: [""], environment: {} }, type: "", org: "", editortype: "" }
  }

  editPlugin(model) {
    this.createFlag = true
    this.editplug = true
    this.plugin = model
  }

  updatePlugin() {
    const org = sessionStorage.getItem('organization');
    this.plugin.type = this.plugin.name;
    if (org == this.plugin.org) {
      this.pluginService.updatePlugin(this.plugin).subscribe(res => {
        this.service.message('Updated Sucessfully', 'success');
        this.backTolist()
        this.ngOnInit()
      },
        error => {
          this.service.message('Could not update', 'error');
        });
    }
    else {
      this.service.message('Could not update: Organisation mismatch', 'error');
    }
  }

  savePlugin() {
    this.plugin.org = sessionStorage.getItem("organization");
    this.plugin.config = JSON.stringify(this.plugin.config);
    this.plugin.type = this.plugin.name;
    if (this.plugin.name && this.plugin.type) {
      this.plugin.editortype = this.plugin.editortype ? this.plugin.editortype : 'jsplumb'
      this.pluginService.createPlugin(this.plugin).subscribe(res => {
        this.service.message("Created Successfully", 'success');
        this.createPipelineEvent();
        this.createFlag = false
        this.plugin = { name: "", config: { commands: [""], environment: {} }, type: "", org: "", editortype: "" }
        this.backTolist()
        this.ngOnInit()
      },
        error => {
          this.service.message(JSON.stringify(error), 'error');
        });
    }
    else {
      this.service.message('Please enter required details', 'error')
    }
  }

  createPipelineEvent() {
    const pipelineCanvas = new StreamingServices();
    const eventCanvas = new Events();
    pipelineCanvas.alias = 'CodeGeneration_' + this.plugin.name;
    pipelineCanvas.type = 'NativeScript';
    pipelineCanvas.interfacetype = 'pipeline';
    eventCanvas.eventname = 'generateScript_' + this.plugin.name;
    eventCanvas.body = "{}";
    this.service.create(pipelineCanvas).subscribe((data) => {
      eventCanvas.jobdetails = JSON.stringify([{ "name": data.name, "type": "pipeline" }]);
      this.eventsService.createEvent(eventCanvas).subscribe((response) => { })
    });
  }

  // update config of plugin
  onConfigDataChange($event) {
    this.dynamicParamsArray = $event;
    this.dynamicParamsArray.forEach((param, index) => {
      this.configData.environment[this.dynamicParamsArray[index].name] = this.dynamicParamsArray[index].value
    })
  }

  onScriptChange($event) {
    this.script = $event;
  }

  updateConfig() {
    this.updateEnviroment()
    this.updateCommands()
    if (this.selectedModel.org == sessionStorage.getItem("organization")) {
      this.pluginService.updateConfig(this.configData, this.type).subscribe(res => {
        this.service.message('Config Updated Sucessfully', 'success');
      },
        error => {
          this.service.message('Could not update', 'error');
        });
    }
    else {
      this.service.message('Could not update: Organisation mismatch', 'error');
    }
  }

  updateEnviroment() {
    this.configData["environment"] = {}
    this.dynamicParamsArray.forEach((param, index) => {
      this.configData.environment[this.dynamicParamsArray[index].name] = this.dynamicParamsArray[index].value
    })
  }

  updateCommands() {
    this.configData["commands"] = this.script
  }

  navigateToPipeline() {
    let pipelinename = 'CodeGeneration_' + this.selectedModel.name
    this.service.getStreamingServicesByAlias(pipelinename).subscribe(resp => {

      this.service.getStreamingServicesByName(resp).subscribe((res) => {
        let alias = res.alias
        const navigationExtras: NavigationExtras = {
          state: {
            cardTitle: 'Pipeline',
            pipelineAlias: alias,
            streamItem: res,
            card: res,
          },
          relativeTo: this.route,
        }
        this.router.navigate(['../../pipelines/view/' + resp], navigationExtras);
      });
    })
  }

  // delete plugin
  delete(model) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.pluginService.deletePlugin(model.name).subscribe(res => {
          this.service.message('Deleted Sucessfully', 'success');
          this.ngOnInit();
        }, error => {
          this.service.message(JSON.stringify(error), 'error');
        });
      }
      else
        this.service.message('Could not delete the plugin', 'error');
    })
  }


  openPlugin(model, editpermission) {
    let data = {}
    data['model'] = model
    if (editpermission) {
      this.auth = editpermission
      data['auth'] = this.auth
    }
    this.router.navigate(["../plugins/" + model.type], {
      relativeTo: this.route,
      state: data
    });
  }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  backTolist() {
    this.createFlag = false
    this.view = false
    this.router.navigate(["../../plugins"], {
      relativeTo: this.route,
    });
  }

  showTabContent(eventObj: any) {
    this.ledsLibService.showTabContent(eventObj);
  }

  nodePreview(nodeData) {
    this.newNode = false
    this.selectedPluginData = this.pluginData.filter(p => p.alias == nodeData.data.alias && p.id == nodeData.data.label)[0]
    let name = this.pluginName.filter(n => n == nodeData.data.label)
    this.selectedPluginName = name.length > 0 ? name : this.pluginName.filter(n => n.substring(n.indexOf('-') + 1) == this.selectedPluginData.id)
    let cid = 0
    if (this.pluginName.length == 0)
      cid = 1
    else
      cid = parseInt(this.pluginName.slice(-1)[0].substring(this.pluginName.slice(-1)[0].indexOf('-') + 1)) + 1
    this.passData = {
      'selectedPluginName': this.selectedPluginName,
      'selectedPluginData': this.selectedPluginData,
      'alias': this.pluginAlias,
      // 'countId': cid
    }
  }

  addNewNode() {
    this.newNode = !this.newNode
    this.passData = {}
    this.passData['aliasList'] = this.pluginAlias
    // if (this.pluginName == undefined || this.pluginName.length == 0)
    //   this.passData['countId'] = 1
    // else
    //   this.passData['countId'] = this.countId
    // this.passData['countId'] = parseInt(this.pluginName.slice(-1)[0].substring(this.pluginName.slice(-1)[0].indexOf('-') + 1)) + 1
  }

  onPluginView($event) {
    this.getPlugin(this.type)
    if (!$event)
      this.newNode = false
  }

  closeModal() {
    this.dialogRef.close();
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = "nodesTab";
        break;
      case 1:
        this.basicReqTab = "executionTab";
        break;
      case 2:
        this.basicReqTab = "environmentTab";
        break;
    }
  }

  // for pagination
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
  }

  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.ngOnInit()
  }

  onChange($event) {
    let data: DashConstant = new DashConstant();
    if(!this.isKeyPresent) {
      let dashData = new DashConstant();
      let project = new Project();
      project.id = JSON.parse(String(sessionStorage.getItem('project'))).id;
      dashData.keys = this.pluginConstantsKey;
      dashData.value = 'all';
      dashData.project_id = project
      dashData.project_name = sessionStorage.getItem('organization');
      this.service.createDashConstant(dashData).subscribe((response) => {
        this.fetchOrg = 'all';
        this.isKeyPresent = true;
        this.ngOnInit();
      });
    } else {
      this.service.getDashConstantByKey(this.pluginConstantsKey).subscribe((response) => {
        data = JSON.parse(response);
        this.fetchOrg = $event.checked ? 'only' : 'all';
        data.value = this.fetchOrg;
        this.service.updateDashConstant(data).subscribe((response) => {
          this.ngOnInit()
        });
      });
    }
  }

  selectedButton(i) {
    if (i == this.pageNumber) {
      return { "color": "white", "background": "#7b39b1" }
    }
    else
      return { "color": "black" }
  }

  filterz() {
    let data: any = [];
    if (this.filter) {
      data = this.plugins.filter(element =>
        element.name.toLowerCase().includes(this.filter.toLowerCase())
      );
      this.filteredPlugin = data;
      this.noOfItems = this.filteredPlugin.length
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    }
    else {
      this.ngOnInit();
    }
  }
}

export class DynamicParamsGrid {
  name: string;
  value: string;
}
