import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { DashConstant } from "../../models/dash-constant";
import { PageResponse } from "../../support/paging";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { DeleteComponent } from '../../shared-modules/confirm-delete/delete.component';
import { Subscription } from 'rxjs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FormBuilder } from '@angular/forms';
import { MessageService } from "../../services/message.service";
import { DashConstantService } from "../../services/dash-constant.service";
import { Role } from "../../models/role";
import { Project } from "../../models/project";
import { ProjectService } from "../../services/project.service";
import { RoleService } from "../../services/role.service";
import { UsersService } from "../../services/users.service";
import { UsmPortfolio } from "../../models/usm-portfolio";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Users } from "../../models/users";
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';

interface FileNode {
  label: string;
  icon: string;
  children: FileNode[];
  url: string;
  _id: number;
}

/** Flat node with expandable and level information */
interface FileFlatNode {
  expandable: boolean
  level: number
  label: string
  icon: string
  url: string
  _id: number
}

@Component({
  selector: 'lib-dash-constant',
  templateUrl: './dash-constant.component.html',
  styleUrls: ['./dash-constant.component.css']
})
export class DashConstantComponent implements OnInit {
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  //  lazyload = { first: 0, rows: 1000, sortField: null, sortOrder: null, filters: null, multiSortMeta: null };
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  showCreate: boolean = false;
  dashConstantPage: PageResponse<DashConstant> = new PageResponse<DashConstant>(0, 0, []);
  dashConstant: DashConstant = new DashConstant();
  dashConstants = new Array<DashConstant>();
  dashConstantsPageList = new Array<DashConstant>();
  dashConstantList: MatTableDataSource<any> = new MatTableDataSource();
  dashConstantLength: number = 1;
  showList: boolean = true;
  buttonFlag: boolean = false;
  edit: boolean = false;
  view: boolean = false;
  heading: boolean = false;
  view_dashConstant: boolean = false;
  isSavedUpdated: boolean = false;
  displayedColumns: string[] = ["id", "keys", "role", "actions"];
  defaultsidebarrole: any = [];
  iconsidebarrole: any = [];
  rearrangesidebarrole: any;
  defaultsidebar;
  configureUserLand;
  rearrangesidebar;
  addsiblings = true;
  _lastUsedIdForTree = 0;
  rearrangedatas = [
  ];
  TREE_DATA = [];
  readonly TOOLTIP_POSITION = 'above';
  isBackHovered: boolean = false;
  isEditHovered: boolean[] = [];
  isDeleteHovered: boolean[] = [];
  isInfoHovered: boolean[] = [];

  private paginator: MatPaginator;
  // Pagination
  hoverStates: boolean[] = [];
  pageSize: number = 6;
  pageNumber: number = 1;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number;
  prevRowsPerPageValue: number = 6;
  itemsPerPage: number[] = [];
  noOfItems: number;
  startIndex: number;
  endIndex: number;
  pageNumberChanged: boolean = true;


  rolesLength: number = 0;
  private sort: MatSort;
  expansionModel = new SelectionModel<string>(true);
  //users = new Array<Users>();
  user: Users = new Users();
  exampleUser: Users;
  userList: Users[];

  dashconstantid: Number;
  dashconstantview: String;
  p: number;

  sideCheck: boolean = false;
  childrenCheck: boolean = false;
  horizontal: boolean = true;
  loading: boolean = true;
  defaultCheck: boolean = false;
  projectRoleMap: boolean = false;
  roles = new Array<Role>();
  allRoles = new Array<Role>();
  projects = new Array<Project>();
  sideRole: string = "";
  sideJson: any = { label: "", icon: "", url: "" };
  sideChildrenArray = [{ label: "", icon: "", url: "", _id: "" }];
  defaultArray = [{ project: null, role: null }];
  defaultproject: number = null;
  mandatoryFileValidationCheck: boolean = false;

  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showKeyLengthErrorMessage: Boolean = false;

  busy: Subscription;
  configureuserlandrole: any;
  configureuserlandusers: any;

  dataForm
  // dataSource = new MatTreeNestedDataSource<any>()
  // treeControl = new NestedTreeControl<any>(node => node.children)
  displayAddChildFormFlag = false;
  displayEditDataFormFlag = false;
  trackedClickedNode;
  hideURL: boolean = false;
  showTitleLengthErrorMessage: boolean;
  TitleLengthErrorMessage: string = "Maximum Character Limit Reached";
  finalrearrangedvalue = [];
  finalrearrangedvalueseclevel: any = [];
  seclevelname: any = "";
  thirdlevelname: any = "";
  finalrearrangedvaluethirdlevel: any = [];


  configureTheme: boolean = false;
  iconsidebar: boolean;
  configureFileUpload: boolean;
  fetchChildrendata: any;
  configtype: any;
  filterDash: DashConstant[];
  imagenameDetails: any;
  imageDataDetails: any;
  uploadImage: boolean;
  allowedFileExtensionValue: string = "";
  allowedFileTypeValue: string = "";
  allowedDepthValue: number = 0;
  allowedMandatoryFileExtensionValue: string = "";
  logoText: string;
  uploadUsing: string = "project";
  showAltTextLengthErrorMessage: boolean;
  index: number;
  lastRefreshedTime: Date | null = null;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public messageService: MessageService,
    public dashConstantService: DashConstantService,
    public projectService: ProjectService,
    public roleService: RoleService,
    public usersService: UsersService,
    private confirmDialog: MatDialog,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.treeFlattener = new MatTreeFlattener(this.nestedTreeToFlatTreeTransformer, (node) => node.level,
      (node) => node.expandable, (node) => node.children);
    this.treeControl = new FlatTreeControl<FileFlatNode>((node) => node.level, (node) => node.expandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }
  hasChild = (_: number, node: FileFlatNode) => node.expandable;

  ngOnInit() {
    this.lastRefreshedTime = new Date();
    this.fetchUsers();
    this.dataForm = this.fb.group({
      label: [""],
      logo: [""],
      url: [""]
    })


    this.dataSource.data = [];
    this.dataSource.data = this.TREE_DATA;
    this.isSavedUpdated = false;
    this.route.params.subscribe((params) => {
      this.dashconstantid = params["dashconstantid"];
      this.dashconstantview = params["dashconstantview"];
      this.configtype = params["configtype"];
    });
    if (window.location.href.includes("dashconstant") && this.dashconstantview == "true") {
      this.showCreate = true;
      this.edit = true;
      this.view = true;
      this.view_dashConstant = true;
      this.buttonFlag = true;
      this.getDashConstant();
    } else if (window.location.href.includes("dashconstant") && this.dashconstantview == "false") {
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      this.getDashConstant();
      this.fetchDashConstant();
    } else this.fetchDashConstant();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.isSavedUpdated = false;
  }

  // hasChild = (_: number, node) => !!node.children && node.children.length > 0;

  editDataToTree() {
    if (this.dataForm.value.label == "") {
      this.messageService.messageNotification("All * marked fields are mandatory", "error");
      return;
    }
    this.isSavedUpdated = true;
    let node = this.trackedClickedNode;
    let id = node._id;
    this.displayEditDataFormFlag = false;
    this.trackedClickedNode = undefined;
    let treeData = this.dataSource.data;
    let children = this.fetchChildren(treeData, node)
    let newData = { label: this.dataForm.value.label, altText: this.dataForm.value.altText, icon: this.dataForm.value.logo, url: this.dataForm.value.url, children: this.fetchChildrendata, _id: node._id }
    this.editDataAtId(treeData, id, newData)
    this.dataSource.data = [];
    this.dataSource.data = treeData;
    this.expansionModel.selected.forEach((_id) => {
      const node = this.treeControl.dataNodes.find((n) => Number(n._id) == Number(_id));
      this.treeControl.expand(node);
    });
    this.messageService.messageNotification("Please click on Update button to save the changes", "success");
  }

  private fetchChildren(treeData, node) {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i]._id == node._id) {
        this.fetchChildrendata = treeData[i].children;
        return true

      } else {
        if (treeData[i].children && treeData[i].children.length > 0) {
          let res = this.fetchChildren(treeData[i].children, node)
          if (res) return true

        }
      }
    }

  }

  private editDataAtId(treeData, id, newData) {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i]._id == id) {
        treeData[i] = newData;
        return true

      } else {
        if (treeData[i].children && treeData[i].children.length > 0) {
          let res = this.editDataAtId(treeData[i].children, id, newData)
          if (res) return true

        }
      }
    }

  }



  displayAddSiblingForm() {
    this.displayEditDataFormFlag = false;
    this.hideURL = false;
    this.dataForm = this.fb.group({
      label: [""],
      logo: [""],
      url: [""],
      altText: [""]
    })
    this.imageDataDetails = "";
    this.logoText = "";
    this.uploadImage = false;
    this.displayAddChildFormFlag = true;
    this.isSavedUpdated = false;
  }

  findparent(level) {
    this.index -= 1
    if (this.treeControl.dataNodes[this.index].level == level) {
      this.treeControl.dataNodes.find(data => data._id == this.treeControl.dataNodes[this.index]._id)['highlight'] = true
    }
    else this.findparent(level)
  }

  resethighlightvalue() {
    this.treeControl.dataNodes.forEach(value => {
      value['highlight'] = false
    })
  }


  displayAddChildForm(node) {
    let tempnode = node
    this.resethighlightvalue()
    if (tempnode.level >= 0) {
      this.treeControl.dataNodes.find(data => data._id == tempnode._id)['highlight'] = true
      this.index = this.treeControl.dataNodes.findIndex(data => data._id == tempnode._id)
      for (let i = tempnode.level - 1; i >= 0; i--) {
        this.findparent(i)
      }
    }

    this.displayEditDataFormFlag = false;
    this.hideURL = false;
    this.dataForm = this.fb.group({
      label: [""],
      logo: [""],
      url: [""],
      altText: [""]
    })
    this.imageDataDetails = "";
    this.logoText = "";
    this.uploadImage = false;
    this.displayAddChildFormFlag = true;
    this.trackedClickedNode = node;
    this.isSavedUpdated = false;
  }

  displayEditForm(node) {

    this.resethighlightvalue()
    this.displayAddChildFormFlag = false;
    this.trackedClickedNode = node;
    this.displayEditDataFormFlag = true;
    this.hideURL = false;

    if (node.children && node.children.length) {
      this.hideURL = true;
    }
    this.dataForm = this.fb.group({
      label: [node.label],
      logo: [node.icon],
      url: [node.url],
      altText: [node.altText]
    })
    if (node.icon) {
      if (node.icon.includes("data:image")) {
        this.uploadImage = true;
        this.logoText = "";
        if (node.icon.includes("data:image/svg+xml")) {
          this.imageDataDetails = this.sanitizer.bypassSecurityTrustResourceUrl(node.icon)
        } else {
          this.imageDataDetails = node.icon;
        }
      }
      else {
        this.uploadImage = false;
        this.imageDataDetails = "";
        this.logoText = node.icon
      }
    }
  }

  addChildToTree() {
    if (this.dataForm.value.label == "") {
      this.messageService.messageNotification("All * marked fields are mandatory", "error");
      return;
    }
    let treeData = this.dataSource.data;
    let childTemplate = { label: this.dataForm.value.label, altText: this.dataForm.value.altText, icon: this.dataForm.value.logo, url: this.dataForm.value.url, children: [], _id: ++this._lastUsedIdForTree }
    this.displayAddChildFormFlag = false;
    if (treeData.length == 0) {
      treeData = [childTemplate]
    } else {
      if (!this.trackedClickedNode) {
        treeData.push(childTemplate)
      }
      else {
        let node = this.trackedClickedNode;
        this.trackedClickedNode = undefined;
        let parentId = node._id;
        this.addChildToId(treeData, parentId, childTemplate)
      }
    }
    this.dataSource.data = [];
    this.dataSource.data = treeData;
    this.expansionModel.selected.forEach((_id) => {
      const node = this.treeControl.dataNodes.find((n) => Number(n._id) == Number(_id));
      this.treeControl.expand(node);
    });
    this.isSavedUpdated = true;
    if (this.edit) {
      this.messageService.messageNotification("Please click on Update button to save the changes", "success");
    } else {
      this.messageService.messageNotification("Please click on Save button to save the changes", "success");
    }
  }

  deleteChildFromTree(node) {
    let id = node._id;
    let childTemplate = { label: "addChildToTree", altText: "", icon: "", url: "", children: [], _id: ++this._lastUsedIdForTree }
    let treeData = this.dataSource.data;
    this.deleteChildAtId(treeData, id);
    this.dataSource.data = [];
    this.dataSource.data = treeData;
    this.displayAddChildFormFlag = false;
    this.displayEditDataFormFlag = false;
    this.expansionModel.selected.forEach((_id) => {
      const node = this.treeControl.dataNodes.find((n) => Number(n._id) == Number(_id));
      this.treeControl.expand(node);
    });
  }


  private deleteChildAtId(treeData, id) {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i]._id == id) {
        treeData.splice(i, 1)
        return true

      } else {
        if (treeData[i].children && treeData[i].children.length > 0) {
          let res = this.deleteChildAtId(treeData[i].children, id)
          if (res) return true

        }
      }
    }

  }

  private nestedTreeToFlatTreeTransformer(node, level) {
    let res = {
      expandable: !!(node.children && node.children.length),
      level,
      ...node
    }
    delete res.children;
    return res

  }

  private addChildToId(treeData, id, childTemplate) {
    for (let ele of treeData) {
      if (ele._id == id) {
        if (ele.children)
          ele.children.push(childTemplate);
        else
          ele.children = [childTemplate]
        return true;
      } else {
        if (ele.children && ele.children.length > 0) {
          let res = this.addChildToId(ele.children, id, childTemplate)
          if (res) return true;
        }
      }
    }
  }

  onSubmit() {
    console.log(this.dataForm.value)

  }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dashConstantList.paginator = this.paginator;
    this.dashConstantList.sort = this.sort;
  }

  addIdsToDataForTree(obj) {
    this._lastUsedIdForTree = 0;
    if (!obj.label) {
      obj.forEach((element, index) => {
        this.addIds(obj[index])
      });
    }
    else this.addIds(obj)
    return obj;
  }

  private addIds(obj) {
    obj["_id"] = ++this._lastUsedIdForTree;
    if (obj.children && obj.children.length) {
      for (let ele of obj.children) {
        this.addIds(ele);
      }
    }
  }
  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getDashConstant() {
    this.dashConstantService.getDashConstant(this.dashconstantid).subscribe((obj) => {
      if (obj.keys.endsWith("USLand")) {
        this.fetchUsers();
        let b = "";
        this.configureUserLand = true;
        this.getRoles();
        let a = obj.keys.split(' ')
        for (let i = 0; i < a.length; i++) {
          if (!(i == 0 || i == a.length - 1))
            b += a[i] + " "
        }
        b = b.trim();
        this.configureuserlandrole = b;
        this.configureuserlandusers = a[0];

      }
      if (obj.keys == "sidebar") {
        this.getRoles();
        this.defaultsidebar = true
        this.defaultsidebarrole = JSON.parse(obj.value).Role.split(',')
      }
      if (obj.keys == "Iconsidebar") {
        this.getRoles();
        this.iconsidebar = true
        this.iconsidebarrole = JSON.parse(obj.value).Role.split(',')
      }

      if (obj.keys.startsWith("FileUpload.AllowedExtension")) {
        this.configureFileUpload = true;

        if (!this.isJson(obj.value)) {
          let customFileObj = ({
            allowedFileExtension: obj.value,
            allowedFileTypes: "",
            allowedDepth: 0,
            allowedMandatoryFileExtension: ""
          })
          obj.value = JSON.stringify(customFileObj)
        }

        if (JSON.parse(obj.value)['allowedFileExtension'])
          this.allowedFileExtensionValue = JSON.parse(obj.value)['allowedFileExtension']
        if (JSON.parse(obj.value)['allowedFileTypes'])
          this.allowedFileTypeValue = JSON.parse(obj.value)['allowedFileTypes']
        if (JSON.parse(obj.value)['allowedDepth'])
          this.allowedDepthValue = JSON.parse(obj.value)['allowedDepth']
        if (JSON.parse(obj.value)['allowedMandatoryFileExtension'])
          this.allowedMandatoryFileExtensionValue = JSON.parse(obj.value)['allowedMandatoryFileExtension']
      }
      this.dashConstant = obj;
      if (this.dashConstant.keys.endsWith("Side") || this.dashConstant.keys.endsWith("SideConfigurations")) {
        let formValue: any = obj.value;
        this.dataSource.data = [];
        if (this.dashConstant.keys.endsWith("Side")) {
          formValue = { ...JSON.parse(formValue) }
          formValue = this.addIdsToDataForTree(formValue);
          this.addsiblings = false
          this.dataSource.data = [{ ...formValue }]
        }
        else {
          formValue = [...JSON.parse(formValue)]
          formValue = this.addIdsToDataForTree(formValue);
          this.dataSource.data = formValue
          this.addsiblings = true
        }
        this.sideCheck = true;
        this.getRoles();
        this.fetchUsers();
        if (obj.portfolio_id.id != null) this.uploadUsing = "portfolio";
      }
      if (this.dashConstant.keys.endsWith("prodefaultrole")) {
        this.projectRoleMap = true;
        try {
          this.defaultArray[0].role = JSON.parse(this.dashConstant.value).defaultprojectroles.role;
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        this.getRoles();
        this.fetchUsers();
      }
      if (
        this.dashConstant.keys.endsWith("default")
      ) {
        this.defaultCheck = true;

        try {
          this.defaultproject = JSON.parse(this.dashConstant.value).defaultproject;
          this.defaultArray = JSON.parse(this.dashConstant.value).defaultprojectroles;
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }

        this.getRoles();
        this.getProjects();
        this.fetchUsers();
      }
      if (obj.keys == "Project Theme") {
        this.configureTheme = true
      }
    });
  }

  fetchUsers() {
    this.exampleUser = new Users();
    this.usersService.findAll(this.exampleUser, this.lazyload).subscribe((res) => {
      this.userList = res.content;
      if (this.userList && this.userList.length)
        this.userList = this.userList.sort((a, b) => (a.user_login.toLowerCase() > b.user_login.toLowerCase() ? 1 : -1));
    });
  }


  currentRole: string;
  currentSCRole: string;
  onSelectionChange(opened: boolean): void {
    if (!opened && this.currentRole) {
      this.currentSCRole = this.currentRole
      console.log('Selected role ################## :', this.currentRole);
    }
  }
  getRoles() {
    let project: Project;
    let rolename;
    this.onSelectionChange(true);
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    let role = new Role();
    role.projectId = null;
    this.roleService.findAll(role, this.lazyload).subscribe((obj) => {
      this.allRoles = obj.content;
      this.roles = obj.content.filter(
        (item) => (project.defaultrole || item.projectId == null) || item.projectId == project.id
      );
      this.roles = this.roles.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
      if (this.dashConstant && this.dashConstant.keys) {
        this.roles.forEach((element) => {
          if (this.dashConstant.keys.endsWith("SideConfigurations")) {
            const requiredLength = this.dashConstant.keys.length - 19;
            rolename = this.dashConstant.keys.slice(0, requiredLength);
          }
          else {
            rolename = this.dashConstant.keys.slice(0, -5);
          }
          if (rolename === element.name) {
            this.sideRole = element.name;
            return;
          }
        });

        try {
          this.sideJson = JSON.parse(this.dashConstant.value);
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }

        if (this.dashConstant.value.includes("children")) {
          this.childrenCheck = true;
          this.sideChildrenArray = this.sideJson.children;
        }
      }
    });
  }

  fetchDashConstant() {
    this.loading = true;
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    let dashconstant = new DashConstant({ project_id: project });
    dashconstant.project_id = new Project({ id: project.id });
    this.dashConstantService.getDashConsts(project).subscribe(
      (res) => {
        res = res.filter((item) => item.project_id.id == project.id && item.id != null);
        res = res.map(obj => ({ ...obj, val_alias: obj.keys.split("Side")[0] }))
        let response = res;
        this.dashConstants = response;
        this.dashConstants = this.dashConstants.filter(

          (arr, index, self) => index === self.findIndex((t) => t.id === arr.id)

        );
        this.sortingAlphabetically();
        this.dashConstantLength = this.dashConstants.length;
        // this.dashConstantList = new MatTableDataSource(this.dashConstants);
        this.filterDash = this.dashConstants;
        this.dashConstantList = new MatTableDataSource();
        this.dashConstants.forEach((dashConstant) => {
          if (this.configtype == "side") {
            //filter all the constants which has side/sideconfigurations as the key
            if (dashConstant.keys.endsWith("Side") || dashConstant.keys.endsWith("SideConfigurations") || dashConstant.keys.endsWith("sidebar")) {
              this.dashConstantList.data.push(dashConstant);
            }
          }
          else {
            //set all the dash constants in the list other then side/sideconfigurations
            if (!(dashConstant.keys.endsWith("Side") || dashConstant.keys.endsWith("SideConfigurations") || dashConstant.keys.endsWith("sidebar"))) {
              this.dashConstantList.data.push(dashConstant);
            }
          }
        })
        this.noOfItems = this.dashConstantList.data.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
        this.hoverStates = new Array(this.pageArr.length).fill(false);
        this.initializePagination()
        this.dashConstantsPageList = this.dashConstantList.data;
        this.dashConstantList.sort = this.sort;
        this.dashConstantList.paginator = this.paginator;
        this.loading = false;
      },
      (error) => { this.loading = false; },
      () => { }
    );
  }

  assignCopy() {
    this.dashConstants = Object.assign([], this.filterDash);
    this.sortingAlphabetically();
  }

  filterItem(value) {
    if (!value) {
      this.assignCopy();
    }
    this.dashConstants = Object.assign([], this.filterDash).filter(
      (item1) =>
        item1.keys?.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
        item1.value?.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.sortingAlphabetically();
    this.dashConstantList = new MatTableDataSource();
    // this.dashConstantList = new MatTableDataSource();
    this.dashConstants.forEach((dashConstant) => {
      if (this.configtype == "side") {
        //filter all the constants which has side/sideconfigurations as the key
        if (dashConstant.keys.endsWith("Side") || dashConstant.keys.endsWith("SideConfigurations") || dashConstant.keys.includes("sidebar") || dashConstant.keys.includes("Sidebar")) {
          this.dashConstantList.data.push(dashConstant);
        }
      }
      else {
        //set all the dash constants in the list other then side/sideconfigurations
        if (!(dashConstant.keys.endsWith("Side") || dashConstant.keys.endsWith("SideConfigurations") || dashConstant.keys.includes("sidebar") || dashConstant.keys.includes("Sidebar"))) {
          this.dashConstantList.data.push(dashConstant);
        }
      }
    })
    this.noOfItems = this.dashConstantList.data.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    this.initializePagination()
    this.dashConstantsPageList = this.dashConstantList.data;
    this.dashConstantList.sort = this.sort;
    this.dashConstantList.paginator = this.paginator;
    this.dashConstantLength = this.dashConstants.length;
  }

  validateURL(sideJSON, invalidEle = []) {
    if (sideJSON && sideJSON.length > 0) {
      sideJSON.forEach(element => {
        if (!element.children || element.children.length == 0) {
          if (!element.url || element.url.trim() == "") invalidEle.push(element.label);
        } else {
          for (let ele of element.children) this.validateURL(ele, invalidEle);
        }

      });
    }
    else {
      if (!sideJSON.children || sideJSON.children.length == 0) {
        if (!sideJSON.url || sideJSON.url.trim() == "") invalidEle.push(sideJSON.label);
      } else {
        for (let ele of sideJSON.children) this.validateURL(ele, invalidEle);
      }
    }
    return invalidEle;
  }
  async showPopup() {
    this.messageService.messageNotification("Sidebar Mapping already exists for " + this.currentRole, "error")
  }
  flag: boolean = false;
  isAlreadyPresent: boolean = false;

  onSave() {
    // this.dashConstants.forEach(element => {
    //   console.log(element);
    //   return;
    // })
    // if(this.dashConstant && this.dashConstant.keys && this.dashConstant.keys.endsWith("SideConfigurations") && this.sideJson && this.sideJson.length==0){
    //   this.messageService.error("Create mapping before saving", "IAMP");      
    //   return;
    // }
    // this.getRoles();
    // console.log(this.dashConstant.keys+" ######################")

    if (this.dashConstant.keys) {
      if (!this.currentRole) this.currentSCRole = this.dashConstant.keys.slice(0, -17);
    }
    console.log(this.currentSCRole + " ####################### ");
    this.dashConstants.forEach(element => {
      if (this.currentSCRole + " SideConfigurations" == element.keys) {
        this.isAlreadyPresent = true;
        // this.messageService.error("Sidebar Mapping already exists for " + this.currentRole, "IAMP")
        this.flag = true;
        return;
      }
      // if (element.keys == role + " SideConfigurations" && element.id != this.dashConstant.id) {
      //   this.messageService.error("Sidebar Mapping already exists for " + role, "IAMP")
      //   return;
      // }
    });
    if (this.currentSCRole + " SideConfigurations" != this.dashConstant.keys) {
      this.isAlreadyPresent = true;
    }
    if (this.flag) {
      this.messageService.messageNotification("Sidebar Mapping already exists for " + this.currentSCRole, "error")
      this.flag = false;
      return;
    }

    if (!this.isSavedUpdated && this.sideCheck && !this.isAlreadyPresent) {
      this.messageService.messageNotification("Please Submit/Update configurations first ", "error");
      return;
    }
    this.isSavedUpdated = false;
    if (this.defaultsidebar) {
      this.defaultsidebarsave()
    }
    else if (this.iconsidebar) {
      this.iconsidebarsave()
    }
    else if (this.configureUserLand) {
      this.configureUserLandSave();
    }
    else if (this.projectRoleMap) {
      if (this.defaultArray[0].role == null || this.defaultArray[0].role == "") {
        this.messageService.messageNotification("Enter Role field", "error");
        return;
      }
      else {
        this.projectRoleMapsave();
      }
    }
    else {
      let f = 0;
      this.assignObject();
      let invalidURLLabels = this.validateURL(this.sideJson);
      if (this.dashConstant && this.dashConstant.keys && this.dashConstant.keys.endsWith("SideConfigurations") && this.sideJson && this.sideJson.length == 0) {
        this.messageService.messageNotification("Create mapping before saving", "error");
        f = 1
        return;
      }
      if (this.dashConstant.keys.endsWith("Side") || this.dashConstant.keys.endsWith("SideConfigurations")) {
        if (this.dashConstant.keys.endsWith("SideConfigurations")) {
          this.dashConstant.keys = this.sideRole + " SideConfigurations";
        }
        if (this.uploadUsing == "project") {
          this.dashConstant.portfolio_id = null;
        }
        if (invalidURLLabels.length > 0) {
          if (invalidURLLabels[0]) {
            let str = ""
            for (let item in invalidURLLabels) {
              str = str + invalidURLLabels[item]
              str = str + ","
            }
            this.messageService.messageNotification("Url is mandatory for " + str.slice(0, -1), "error");
            f = 1;
            return;
          }
        }
        if (this.dashConstants && this.dashConstants.length > 0 && this.dashConstant.keys.endsWith("SideConfigurations")) {
          let temp = this.dashConstant.keys.split("SideConfigurations")
          let role = ""
          if (temp.length > 0)
            role = temp[0]
          this.dashConstants.forEach(element => {
            if (element.keys == role + "SideConfigurations" && element.id != this.dashConstant.id) {
              this.messageService.messageNotification("Sidebar Mapping already exists for " + role, "error");
              f = 1;
              return;
            }
          });
        }
      }
      if (this.defaultCheck) {
        this.defaultArray.forEach((element) => {
          if (!element.project || !element.role) {
            this.messageService.messageNotification("Enter values for all added default project role", "error");
            f = 1;
            return;
          }
        });
      }

      //If it's not for sidebar
      if (this.sideCheck == false) {
        this.childrenCheck = false;
        if (
          this.dashConstant.keys == undefined ||
          this.dashConstant.value == undefined ||
          this.dashConstant.keys.trim().length == 0 ||
          this.dashConstant.value.trim().length == 0
        ) {
          this.messageService.messageNotification("All fields are mandatory", "error");
          f = 1;
          return;
        }
      }

      //If it is for sidebar, check relevant cases
      else {
        //Role and Title should have values
        if (
          this.sideRole.trim().length == 0 ||
          !this.sideJson
        ) {
          this.messageService.messageNotification("All * marked fields are mandatory", "error");
          f = 1;
          return;
        }
      }
      if (f == 1) {
        return;
      }
      this.getSideJSONFromTreeData()
      if (this.checkConstant()) {
        if (this.edit) {
          this.updateDashConstant();
        } else {
          if (this.defaultCheck) {
            let dashconstant = new DashConstant();
            dashconstant.keys = this.dashConstant.keys;
            this.dashConstantService.findAll(dashconstant, this.lazyload).subscribe((res) => {

              if (res.content.length) {
                this.messageService.messageNotification("Default Configuration for landing already exists for this portfolio in Project: " + res.content[0].project_name, "success");
                return;
              }
              this.createMapping();
            });
          } else {
            let duplicateCheck;
            this.dashConstants.forEach(element => {
              if (element.keys == this.dashConstant.keys && this.configtype != "side")
                duplicateCheck = true;
            });
            if (duplicateCheck) {
              this.messageService.messageNotification("Duplicate entry cannot be created", "success");
              return;
            }
            else
              this.createMapping();
          }
        }
      }
    }


  }
  projectRoleMapsave() {
    let f = 0;
    this.assignObject();
    this.getSideJSONFromTreeData();
    if (this.checkConstant()) {
      if (this.edit) {
        this.updateDashConstant();
      }
      else {
        let dashconstant = new DashConstant();
        dashconstant.keys = this.dashConstant.keys;
        this.dashConstantService.findAll(dashconstant, this.lazyload).subscribe((obj) => {
          if (obj.content.length) {
            this.messageService.messageNotification("Role already mapped for this project", "success");
            return;
          }
          this.keyvaluemapping();
        });
      }
    }
  }

  keyvaluemapping() {
    let dashconstant1 = new DashConstant();
    let defp = JSON.parse(this.dashConstant.value).defaultprojectroles.project;
    dashconstant1.keys = JSON.parse(sessionStorage.getItem("portfoliodata")).portfolioName + "default";
    this.dashConstantService.findAll(dashconstant1, this.lazyload).subscribe((obj1) => {
      if (obj1.content.length > 0) {
        let defp1 = JSON.parse(obj1.content[0].value).defaultproject;
        if (defp == defp1) {
          this.messageService.messageNotification("Already Default landing mapped for this project", "success");
          return;
        }
      }
      this.busy = this.dashConstantService.create(this.dashConstant, this.projectRoleMap).subscribe(
        (response) => {
          this.messageService.messageNotification("Configuration for Project Role Map Saved Successfully", "success");
          this.fetchDashConstant();
          this.clear();
          this.listView();
        },
        (error) => this.messageService.messageNotification("Could not save", "error"),
        () => {
          this.dashConstantService.refresh().subscribe(res => { });
        }
      );
    });
  }
  currentProjectName() {
    let project = JSON.parse(sessionStorage.getItem("project"));
    let projectname = project.name;
    return projectname;
  }

  selectedProject(child, idx) {
    this.defaultproject = child.project;
    let temp = this.defaultArray.filter((item) => item.project == child.project);
    if (temp && temp.length > 1) {
      child.project = null;
      this.messageService.messageNotification("Default role already mapped for this project", "error");
    }
  }

  updateDashConstant() {
    let user = JSON.parse(sessionStorage.getItem("user"));
    let role = JSON.parse(sessionStorage.getItem("role"));
    let project: Project;
    let portfolio: UsmPortfolio;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    if (this.defaultsidebar) {
      this.dashConstant.project_id = new Project({ id: project.id });
      this.dashConstant.project_name = project.name
      this.dashConstant.keys = "sidebar";
      let tempdata: any = new Object();
      let temp = "";
      tempdata = {
        "Role": ""
      }
      for (let i = 0; i < this.defaultsidebarrole.length; i++) {
        if (i == this.defaultsidebarrole.length - 1)
          temp = temp + this.defaultsidebarrole[i]
        else {
          temp = temp + this.defaultsidebarrole[i]
          temp = temp + ","
        }
      }
      tempdata["Role"] = temp
      this.dashConstant.value = JSON.stringify(tempdata)
    }
    else if (this.iconsidebar) {
      this.dashConstant.project_id = new Project({ id: project.id });
      this.dashConstant.project_name = project.name
      this.dashConstant.keys = "Iconsidebar";
      let tempdata: any = new Object();
      let temp = "";
      tempdata = {
        "Role": ""
      }
      for (let i = 0; i < this.iconsidebarrole.length; i++) {
        if (i == this.iconsidebarrole.length - 1)
          temp = temp + this.iconsidebarrole[i]
        else {
          temp = temp + this.iconsidebarrole[i]
          temp = temp + ","
        }
      }
      tempdata["Role"] = temp
      this.dashConstant.value = JSON.stringify(tempdata)
    }
    else if (this.configureUserLand) {
      this.dashConstant.project_id = new Project({ id: project.id });
      //this.dashConstant.keys = user.user_login + " " + this.configureuserlandrole + " " + "USLand";
      this.dashConstant.keys = this.configureuserlandusers + " " + this.configureuserlandrole + " " + "USLand";
    }
    else if (this.projectRoleMap) {
      let dashconstant1 = new DashConstant();
      let defp = JSON.parse(this.dashConstant.value).defaultprojectroles.project;
      dashconstant1.keys = JSON.parse(sessionStorage.getItem("portfoliodata")).portfolioName + "default";
      this.dashConstantService.findAll(dashconstant1, this.lazyload).subscribe((obj1) => {
        if (obj1.content.length > 0) {
          let defp1 = JSON.parse(obj1.content[0].value).defaultproject;
          if (defp == defp1) {
            this.messageService.messageNotification("Already Default landing mapped for this project, Delete this", "success");
            return;
          }
        }
        this.busy = this.dashConstantService.update(this.dashConstant, this.projectRoleMap).subscribe(
          (rs) => {
            this.messageService.messageNotification("Configuration  updated successfully", "success");
            this.listView();
          },
          (error) => this.messageService.messageNotification("Could not update", "error"),
          () => {
            this.dashConstantService.refresh().subscribe(res => { });
          }
        );
      });
    }

    else {
      if (this.sideCheck == true) {
        if (this.dashConstant.keys.includes("SideConfigurations")) {
          let objectvalues = this.sideJson
          this.dashConstant.value = JSON.stringify(objectvalues);
        }
        else {
          if (this.sideJson.length > 0)
            this.dashConstant.value = JSON.stringify(this.sideJson[0]);
          else
            this.dashConstant.value = JSON.stringify(this.sideJson);
        }
      }
      this.dashConstant.project_id = new Project({ id: project.id });
      if (this.uploadUsing == "portfolio") {
        this.dashConstant.portfolio_id = new UsmPortfolio({ id: portfolio.id })
      }
      this.dashConstant.keys = this.dashConstant.keys.trim();
      if (this.dashConstant.keys.endsWith("Side"))
        this.dashConstant.keys = this.currentRole != null ? this.currentRole + " Side" : this.dashConstant.keys.trim()
      //if any other role is selected then currentRole will be assigned to dashconstant.key.
      if (!this.currentRole) this.currentSCRole = this.dashConstant.keys.slice(0, -17);
      console.log(this.currentSCRole + " ####################### ");
      this.dashConstants.forEach(element => {
        if (this.currentSCRole + " SideConfigurations" == element.keys) {
          this.isAlreadyPresent = true;
          // this.messageService.error("Sidebar Mapping already exists for " + this.currentRole, "IAMP")
          this.flag = true;
          return;
        }
      })
      if (this.flag) {
        this.messageService.messageNotification("Sidebar Mapping already exists for " + this.currentSCRole, "error")
        this.flag = false;
        return;
      }
    }
    if (this.defaultCheck) {
      this.dashConstant;
      let defaultpro = JSON.parse(this.dashConstant.value).defaultproject;
      let dashconstant1 = new DashConstant();
      this.dashConstantService.findAll(dashconstant1, this.lazyload).subscribe((res) => {
        let item1 = res.content.filter((item) => item.keys.endsWith("prodefaultrole"));
        for (let i = 0; i < item1.length; i++) {
          let arr = JSON.parse(item1[i].value).defaultprojectroles.project;
          if (defaultpro == arr) {
            this.messageService.messageNotification("Configuration already mapped for project role mapping, Delete First", "error");
            return;
          }
        }
        this.busy = this.dashConstantService.update(this.dashConstant, this.defaultCheck).subscribe(
          (rs) => {
            this.messageService.messageNotification("Configuration  updated successfully", "success");
            this.listView();
          },
          (error) => this.messageService.messageNotification("Could not update", "error"),
          () => {
            this.dashConstantService.refresh().subscribe(res => { });
          }
        );
      });
    }
    else {
      let duplicateCheck;
      this.dashConstants.forEach(element => {
        if (element.keys == this.dashConstant.keys) {
          if (element.id != this.dashConstant.id && this.configtype != "side")
            duplicateCheck = true;
          else duplicateCheck = false;
        }
      });
      if (duplicateCheck) {
        this.messageService.messageNotification(
          "Duplicate entry cannot be created", "success"
        );
        return;
      }
      else {
        this.busy = this.dashConstantService.update(this.dashConstant, this.defaultCheck).subscribe(
          (rs) => {
            this.messageService.messageNotification("Configuration  updated successfully", "success");
            this.listView();
          },
          (error) => this.messageService.messageNotification("Could not update", "error"),
          () => {
            this.dashConstantService.refresh().subscribe(res => { });
          }
        );
      }
    }
  }

  checkConstant(): boolean {
    if (
      this.dashConstant.keys == undefined ||
      this.dashConstant.keys == "" ||
      this.dashConstant.keys == null ||
      this.dashConstant.keys.trim().length == 0
    ) {
      this.messageService.messageNotification("Key cannot be empty", "error");
      return false;
    } else if (
      !/^[a-zA-Z0-9 ][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(this.dashConstant.keys)
    ) {
      this.messageService.messageNotification("Key format is incorrect", "error");
      return false;
    }
    return true;
  }

  listView() {
    if (this.edit || this.view) {
      this.router.navigate(["../../"], { relativeTo: this.route });
    }
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.dataSource.data = [];
    this.view_dashConstant = false;
    this.showKeyLengthErrorMessage = false;
    this.clear();
  }

  createView() {
    this.sideCheck = false;
    this.showCreate = true;
    this.edit = false;
    this.rearrangedatas = [];
    this.rearrangesidebar = false;
    this.rearrangesidebarrole = null;
    this.dashConstant = new DashConstant();
    this.changeView.emit(false);
    this.buttonFlag = false;
    this.displayAddChildFormFlag = true;
    this.dataForm = this.fb.group({
      label: [""],
      logo: [""],
      url: [""],
      altText: [""]
    })
  }

  editDashConstants(dashConstant: DashConstant) {
    this.router.navigate([dashConstant.id + "/" + false], { relativeTo: this.route });
  }

  ViewDashConstants(dashConstant: DashConstant) {
    this.router.navigate([dashConstant.id + "/" + true], { relativeTo: this.route });
  }
  checkMaxlengthForTitle() {
    if (this.dataForm.value.label != null) {
      if (this.dataForm.value.label.length >= 50) this.showTitleLengthErrorMessage = true;
      else this.showTitleLengthErrorMessage = false;
    }
  }
  checkMaxlengthForAltText() {
    if (this.dataForm.value.altText != null) {
      if (this.dataForm.value.altText.length >= 50) this.showAltTextLengthErrorMessage = true;
      else this.showAltTextLengthErrorMessage = false;
    }
  }

  clear() {
    this.dashConstant = this.dashconstantid
      ? new DashConstant({ id: this.dashconstantid })
      : new DashConstant();
    this.sideRole = "";
    this.dataForm.get("logo").reset();
    this.dataForm.get("label").reset()
    this.dataForm.get("url").reset();
    this.childrenCheck = false;
    this.sideJson = {};
    this.defaultsidebar = false
    this.sideCheck = false;
    this.rearrangesidebar = false;
    this.configureTheme = false;
    this.iconsidebar = false;
    this.configureFileUpload = false;
    this.configureUserLand = false
    this.configureuserlandrole = false
    this.configureuserlandusers = false
    this.defaultsidebarrole = []
    this.iconsidebarrole = []
    this.sideChildrenArray = [{ label: "", icon: "", url: "", _id: "" }];
    this.defaultArray = [{ project: null, role: null }];
    this.defaultproject = null;
    this.projectRoleMap = false;
    this.showTitleLengthErrorMessage = false
    this.showAltTextLengthErrorMessage = false
    this.defaultCheck = false;
    this.dataForm = this.fb.group({ //Add label, icon and url if needed
      altText: [""]
    })
    if (this.myInputReference)
      this.myInputReference.nativeElement.value = null;
  }

  deleteDashConstants(dashConstant: DashConstant) {
    let dialogRef = this.confirmDialog.open(DeleteComponent, {
      disableClose: true,
      data: { title: "Delete Configuration", message: "Are you sure you want to delete?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.dashConstantService.delete(dashConstant.id).subscribe(
          (Response) => {
            this.messageService.messageNotification("Configuration Deleted successfully", "success");
            this.fetchDashConstant();
            this.clear();
          },
          (error) => this.messageService.messageNotification("Could not delete", "error"),
          () => {
            this.dashConstantService.refresh().subscribe(res => { });
          }
        );
      }
    });
  }
  defaultsidebarroles(event) {
    if (event.checked) {
      if (!this.roles || !this.roles.length) this.getRoles();
    }
    else {
      this.defaultsidebarrole = []
    }
  }
  iconsidebarroles(event) {
    if (event.checked) {
      if (!this.roles || !this.roles.length) this.getRoles();
    }
    else {
      this.iconsidebarrole = null;
    }
  }

  configureFileUploadChanges(event) {
    if (event.checked) {
      if (!this.roles || !this.roles.length) this.getRoles();
    }
    else {
      this.allowedMandatoryFileExtensionValue = null;
      this.allowedFileExtensionValue = null;
      this.dashConstant = this.dashconstantid
        ? new DashConstant({ id: this.dashconstantid })
        : new DashConstant();
      this.allowedDepthValue = 0;
    }
  }

  configureUserLandRole(event) {
    if (event.checked) {
      this.fetchUsers();
      if (!this.roles || !this.roles.length) this.getRoles();
    }
    else {
      this.configureUserLand = false
      this.configureuserlandrole = false
      this.configureuserlandusers = false
      if (this.dashConstant && this.dashConstant.value) {
        this.dashConstant.value = null;
      }
    }

  }

  getSideJSONFromTreeData() {
    let treeData = this.dataSource.data;
    let sideJSON = treeData
    sideJSON = this.modifyTreeDataElementToSideJSON(sideJSON);
    this.sideJson = sideJSON;
  }

  private modifyTreeDataElementToSideJSON(sideJSON) {
    if (sideJSON && sideJSON.length > 0) {
      sideJSON.forEach(element => {
        delete element._id;
        element.icon = (element.icon == undefined) || (element.icon.trim().length == 0) ? "folder" : element.icon;

        if (element.children && element.children.length > 0) {
          for (let ele of element.children) {
            ele = this.modifyTreeDataElementToSideJSON({ ...ele });
          }
        }
      });
    }
    return sideJSON;
  }


  assignObject() {
    if (this.sideCheck == true) {
      if (!this.dashConstant.keys)
        this.dashConstant.keys = this.sideRole + " SideConfigurations";

      try {
        if (this.dashConstant.keys.includes("SideConfigurations")) {
          let objectvalues = this.sideJson
          this.dashConstant.value = JSON.stringify(objectvalues);
        }
        else {
          if (this.sideJson.length > 0)
            this.dashConstant.value = JSON.stringify(this.sideJson[0]);
          else
            this.dashConstant.value = JSON.stringify(this.sideJson);
        }
      } catch (e: any) {
        console.error("JSON.stringify error - ", e.message);
      }
    }
    if (this.defaultCheck) {
      let portfolio: UsmPortfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e: any) {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.dashConstant.keys = portfolio.portfolioName + "default";
      let mapping = {};
      if (this.defaultproject) mapping["defaultproject"] = this.defaultproject;
      mapping["defaultprojectroles"] = this.defaultArray;

      try {
        this.dashConstant.value = JSON.stringify(mapping);
      } catch (e: any) {
        console.error("JSON.stringify error - ", e.message);
      }
    }
    if (this.projectRoleMap) {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e: any) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.dashConstant.keys = project.name + "prodefaultrole";

      let prj = JSON.parse(sessionStorage.getItem("project"));
      let mapping = {};
      let rol = this.defaultArray[0].role;
      this.defaultArray[0].project = prj.id;
      mapping["defaultproject"] = "";
      mapping["defaultprojectroles"] = this.defaultArray[0];
      try {
        this.dashConstant.value = JSON.stringify(mapping);
      } catch (e: any) {
        console.error("JSON.stringify error - ", e.message);
      }
    }


    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }

    this.dashConstant.project_id = project;
    this.dashConstant.project_name = project.name;
    this.sideJson = this.dataSource.data;
  }

  sideRoleChange(event) {
    this.sideRole = event;
  }

  deleteChild(index: any) {
    if (this.sideChildrenArray.length > 1) this.sideChildrenArray.splice(index, 1);
  }

  addChild(child: any) {
    if (
      child.label == undefined ||
      child.url == undefined ||
      child.label.trim().length < 1 ||
      child.url.trim().length < 1
    )
      this.messageService.messageNotification("Enter all mandatory fields", "error");
    else this.sideChildrenArray.push({ label: "", icon: "", url: "", _id: "" });
  }
  FirstLetterWord(str) {
    let result = "";
    // Traverse the string.
    let v = true;
    for (let i = 0; i < str.length; i++) {
      // If it is space, set v as true.
      if (str[i] == " ") v = true;
      // Else check if v is true or not.
      // If true, copy character in output
      // string and set v as false.
      else if (str[i] != " " && v == true) {
        result = result + str[i].toUpperCase();
        v = false;
      }
    }

    return result;
  }

  checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
    }
  }
  deleteMapping(index: any) {
    if (this.defaultArray.length > 1) this.defaultArray.splice(index, 1);
  }

  addMapping(child: any) {
    if (child.project == undefined || child.role == undefined || child.project == null || child.role == null)
      this.messageService.messageNotification("Enter project-role fields", "error");
    else this.defaultArray.push({ project: "", role: "" });
  }

  sortingAlphabetically() {
    this.dashConstants = this.dashConstants.sort((a, b) =>
      a.keys.toLowerCase() > b.keys.toLowerCase() ? 1 : -1
    );
  }

  checkMaxlengthForKey() {
    if (this.dashConstant.keys && this.dashConstant.keys.length >= 250) this.showKeyLengthErrorMessage = true;
    else this.showKeyLengthErrorMessage = false;
  }

  sideCheckChange(event) {
    this.dataSource.data = [];
    this.dataSource.data = this.TREE_DATA
    if (event.checked)
      this.displayAddChildFormFlag = true
    if (event.checked) if (!this.roles || !this.roles.length) this.getRoles();
    else {
      this.sideRole = null;
      this.uploadImage = false;
      this.dataForm.get("logo").reset();
      this.dataForm.get("label").reset()
      this.dataForm.get("url").reset();
      this.removeImage();
      this.removeImageText();
      this.uploadUsing = "project"

    }
  }
  defaultCheckChange(event) {
    if (event.checked) {
      if (!this.roles || !this.roles.length) this.getRoles();
      if (!this.projects || !this.projects.length) this.getProjects();
    }
    else {
      this.defaultArray = [{ project: null, role: null }]
    }
  }
  projectRoleMapChange(event) {
    if (event.checked) {
      if (!this.roles || !this.roles.length) this.getRoles();
    }
  }
  getProjects() {
    let project = new Project();
    let portfolio: UsmPortfolio;
    try {
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      portfolio = null;
      console.error("JSON.parse error - ", e.message);
    }
    project.portfolioId = new UsmPortfolio({ id: portfolio.id });
    this.projectService.findAll(project, this.lazyload).subscribe((res) => {
      this.projects = res.content;
      this.projects = this.projects.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    });
  }
  hideform() {
    this.displayAddChildFormFlag = false;
    this.displayEditDataFormFlag = false;
    this.resethighlightvalue()
  }
  createMapping() {
    let user = JSON.parse(sessionStorage.getItem("user"));
    let role = JSON.parse(sessionStorage.getItem("role"));
    let project: Project;
    let portfolio: UsmPortfolio;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    if (this.defaultsidebar) {
      this.dashConstant.project_id = new Project({ id: project.id });
      this.dashConstant.project_name = project.name
      this.dashConstant.keys = "sidebar";
      let tempdata: any = new Object();
      let temp = "";
      tempdata = {
        "Role": ""
      }
      for (let i = 0; i < this.defaultsidebarrole.length; i++) {
        if (i == this.defaultsidebarrole.length - 1)
          temp = temp + this.defaultsidebarrole[i]
        else {
          temp = temp + this.defaultsidebarrole[i]
          temp = temp + ","
        }
      }
      tempdata["Role"] = temp
      this.dashConstant.value = JSON.stringify(tempdata)
    }
    else if (this.iconsidebar) {
      this.dashConstant.project_id = new Project({ id: project.id });
      this.dashConstant.project_name = project.name
      this.dashConstant.keys = "Iconsidebar";
      let tempdata: any = new Object();
      let temp = "";
      tempdata = {
        "Role": ""
      }
      for (let i = 0; i < this.iconsidebarrole.length; i++) {
        if (i == this.iconsidebarrole.length - 1)
          temp = temp + this.iconsidebarrole[i]
        else {
          temp = temp + this.iconsidebarrole[i]
          temp = temp + ","
        }
      }
      tempdata["Role"] = temp
      this.dashConstant.value = JSON.stringify(tempdata)
    }
    else if (this.configureUserLand) {
      this.dashConstant.project_id = new Project({ id: project.id });
      //this.dashConstant.keys = user.user_login + " " + this.configureuserlandrole + " " + "USLand";
      this.dashConstant.keys = this.configureuserlandusers + " " + this.configureuserlandrole + " " + "USLand";
    }
    // else if(this.rearrangesidebar){
    //   this.dashConstant.project_id = new Project({ id: project.id });
    //   if(project.name=="Core")
    //   this.dashConstant.keys=this.rearrangesidebarrole+" Rearrangedefault"
    //   else
    //   this.dashConstant.keys=this.rearrangesidebarrole+" Rearrange"
    //   this.dashConstant.value=JSON.stringify(this.finalrearrangedvalue)
    //   this.dashConstant.project_name=project.name
    // }
    else {
      if (this.sideCheck == true) {
        if (this.dashConstant.keys.includes("SideConfigurations")) {
          let objectvalues = this.sideJson
          this.dashConstant.value = JSON.stringify(objectvalues);
        }
        else {
          if (this.sideJson.length > 0)
            this.dashConstant.value = JSON.stringify(this.sideJson[0]);
          else
            this.dashConstant.value = JSON.stringify(this.sideJson);
        }
      }
      this.dashConstant.project_id = new Project({ id: project.id });
      if (this.uploadUsing == "portfolio") {
        this.dashConstant.portfolio_id = new UsmPortfolio({ id: portfolio.id })
      }
      this.dashConstant.keys = this.dashConstant.keys.trim();
    }
    if (this.defaultCheck) {
      this.dashConstant;
      let defaultpro = JSON.parse(this.dashConstant.value).defaultproject;
      this.dashConstantService.findAll(this.dashConstant, this.lazyload).subscribe((res) => {
        let item1 = res.content.filter((item) => item.keys.endsWith("prodefaultrole"));
        for (let i = 0; i < item1.length; i++) {
          let arr = JSON.parse(item1[i].value).defaultprojectroles.project;
          if (defaultpro == arr) {
            this.messageService.messageNotification("Configuration already mapped for project role mapping, Delete First", "error");
            return;
          }
        }
        this.busy = this.dashConstantService.create(this.dashConstant, this.defaultCheck).subscribe(
          (response) => {
            this.messageService.messageNotification("Configuration Saved Successfully", "success");
            this.fetchDashConstant();
            this.clear();
            this.listView();


          },
          (error) => this.messageService.messageNotification("Could not save", "error"),
          () => {
            this.dashConstantService.refresh().subscribe(res => { });
          }

        );
      });
    }
    else {
      this.busy = this.dashConstantService.create(this.dashConstant, this.defaultCheck).subscribe(
        (response) => {
          this.messageService.messageNotification("Configuration Saved Successfully", "success");
          this.fetchDashConstant();
          this.clear();
          this.listView();


        },
        (error) => this.messageService.messageNotification("Could not save", "error"),
        () => {
          this.dashConstantService.refresh().subscribe(res => { });
        }

      );
    }
  }
  trackByMethod(index, item) { }
  defaultsidebarsave() {
    if (this.defaultsidebarrole.length > 0) {
      if (this.edit)
        this.updateDashConstant()
      else
        this.createMapping()
    }
    else {
      this.messageService.messageNotification("All fields are mandatory", "error");
      return;
    }
  }
  iconsidebarsave() {
    if (this.iconsidebarrole.length > 0) {
      if (this.edit)
        this.updateDashConstant()
      else {
        let flag = true
        if (this.dashConstants && this.dashConstants.length > 0) {
          this.dashConstants.forEach(element => {
            if (element.keys == "Iconsidebar") {
              flag = false
              this.messageService.messageNotification("Iconsidebar Mapping already exists", "error");
              return;
            }
          });
        }
        if (flag == true)
          this.createMapping()
      }
    }
    else {
      this.messageService.messageNotification("All fields are mandatory", "error");
      return;
    }
  }
  configureUserLandSave() {
    if (this.configureuserlandrole && this.configureuserlandusers && this.dashConstant.value) {
      if (this.edit)
        this.updateDashConstant()
      else {
        let flag = true
        if (this.dashConstants && this.dashConstants.length > 0) {
          this.dashConstants.forEach(element => {
            if (element.keys == this.configureuserlandusers + " " + this.configureuserlandrole + " " + "USLand") {
              flag = false
              this.messageService.messageNotification("User Landing Configuration Already Exists", "error");
              return;
            }
          });
        }
        if (flag == true)
          this.createMapping()
      }
    }
    else {
      this.messageService.messageNotification("All fields are mandatory", "error");
      return;
    }
  }


  drop(event: CdkDragDrop<string[]>) {

    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // recursive find function to find siblings of node
    function findNodeSiblings(arr: Array<any>, _id: string): Array<any> {
      let result, subResult;
      arr.forEach((item, i) => {
        if (item._id === _id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, _id);
          if (subResult) result = subResult;
        }
      });
      return result;

    }

    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    const siblings = findNodeSiblings(changedData, nodeAtDest._id);
    if (!siblings) return;
    const insertIndex = siblings.findIndex(s => s._id === nodeAtDest._id);

    // remove the node from its old place
    const node = event.item.data;
    let isValidDrop = Boolean(siblings.filter((item) => item._id == node._id).length)
    if (!isValidDrop) {
      this.messageService.messageNotification("Items can only be moved within the same level", "success");
      return;
    }
    const siblingIndex = siblings.findIndex(n => n._id === node._id);
    const nodeToInsert: FileNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest._id === nodeToInsert._id) return;

    // ensure validity of drop - must be same level
    // const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest._id === n._id);
    // if ( nodeAtDestFlatNode.level !== node.level) {
    //   alert('Items can only be moved within the same level.');
    //   return;
    // }

    // insert node 
    siblings.splice(insertIndex, 0, nodeToInsert);

    // rebuild tree with mutated data
    this.dataSource.data = changedData;
    this.expansionModel.selected.forEach((_id) => {
      const node = this.treeControl.dataNodes.find((n) => Number(n._id) == Number(_id));
      this.treeControl.expand(node);
    });


  }
  visibleNodes() {
    const result = [];

    function addExpandedChildren(node, expanded: string[]) {
      result.push(node);
      if (expanded.includes(node._id)) {
        node.children.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

  convertmappings() {
    if (this.rearrangesidebarrole) {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e: any) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.dashConstantService.getDashConsts(project).subscribe(
        (res) => {
          let oldmappings = res.filter((item) => (item.keys == this.rearrangesidebarrole + " Side" && item.project_name == project.name));
          if (!oldmappings || (oldmappings && oldmappings.length < 1))
            this.messageService.messageNotification("No mappings available to convert", "error");
          else {
            let dashConstant = new DashConstant();
            let newmapping = []
            oldmappings.forEach(element => {
              newmapping.push(JSON.parse(element.value))
            });
            dashConstant["keys"] = this.rearrangesidebarrole + " SideConfigurations"
            dashConstant["value"] = JSON.stringify(newmapping)
            dashConstant["project_id"] = project
            dashConstant["project_name"] = project.name
            this.busy = this.dashConstantService.create(dashConstant, false).subscribe(
              (response) => {
                oldmappings.forEach(element => {
                  this.dashConstantService.delete(element.id).subscribe(
                    (Response) => {
                      this.messageService.messageNotification("Configurations Converted successfully", "success");
                      this.fetchDashConstant();
                      this.clear();
                    },
                    (error) => this.messageService.messageNotification("Could not delete", "error")
                  );
                });
                this.fetchDashConstant();
                this.clear();
                this.listView();
              },
              (error) => this.messageService.messageNotification("Could not save", "error")
            );
          }
        })
    }
  }

  rearrangesidebarfun(event) {
    if (event.checked) {
      this.getRoles();
    }
    else {
      this.rearrangesidebarrole = null;
    }
  }

  setFileImage(event, field, isImage) {
    this.imagenameDetails = event.target.files[0].name;

    let reader = new FileReader();

    if (event.target.files && event.target.files.length > 0) {
      if (!/^image\/png/.test(event.target.files[0].type) &&
        !/^image\/jpg/.test(event.target.files[0].type) &&
        !/^image\/jpeg/.test(event.target.files[0].type) &&
        !/^image\/svg/.test(event.target.files[0].type)) {
        this.messageService.messageNotification("Image must be SVG,JPEG, JPG or PNG type", "error");
        return;
      }
      if (event.target.files[0].size > 500000) {
        this.messageService.messageNotification("Image file size exceeds 500 KB", "error");
        return;
      } else {

        let fileReader = new FileReader();
        fileReader.readAsDataURL(event.target.files[0]);

        fileReader.onload = () => {
          let value = this.sanitizer.bypassSecurityTrustResourceUrl(fileReader.result as string);

          if (/^image\/svg/.test(event.target.files[0].type)) {
            this.imageDataDetails = (value as string);

          } else {
            this.imageDataDetails = fileReader.result;
          }
          this.dataForm.value.logo = fileReader.result;
          this.imagenameDetails = this.imageDataDetails;
        }
      }
    }
  }

  removeImage() {
    this.imageDataDetails = null;
    this.dataForm.value.logo = null;
  }

  removeImageText() {
    this.dataForm.get("logo").reset();
    this.logoText = "";
  }

  setLogoText() {
    this.logoText = this.dataForm.value.logo;
  }

  imageCheck() {
    if (!this.uploadImage) {
      this.dataForm.get("logo").setValue(this.logoText);
    } else {
      this.dataForm.value.logo = this.imageDataDetails;
    }
  }

  setFileExtension(event, value) {

    let json
    if (!this.dashConstant.value) json = {}
    else
      json = JSON.parse(this.dashConstant.value)

    json["allowedFileExtension"] = value;
    this.dashConstant.value = JSON.stringify(json);

  }
  setFileMimeTypes(event, value) {
    let json
    if (!this.dashConstant.value) json = {}
    else
      json = JSON.parse(this.dashConstant.value)

    json["allowedFileTypes"] = value;
    this.dashConstant.value = JSON.stringify(json);
  }
  setDepth(event, value) {
    let json
    if (!this.dashConstant.value) json = {}
    else
      json = JSON.parse(this.dashConstant.value)

    json["allowedDepth"] = value;
    this.dashConstant.value = JSON.stringify(json);
  }
  setMandatoryExtension(event, value) {
    let json

    if (!this.dashConstant.value) json = {}
    else
      json = JSON.parse(this.dashConstant.value)
    if (value != null || value != "") {
      json["allowedMandatoryFileExtension"] = value;
      this.dashConstant.value = JSON.stringify(json);
    }
  }
  checkMandatoryFileNameValidation(rule) {
    let spclChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|.<>\/?]+/;
    let space = /\s/g;
    if ((spclChar.test(rule)) || (space.test(rule))) {
      this.mandatoryFileValidationCheck = true
      return true;
    }
    else {
      this.mandatoryFileValidationCheck = false
      return false;
    }
  }



  get pagedDashConstantList(): any[] {
    if (!this.dashConstantList.data || !this.pageSize) {
      return [];
    }

    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.dashConstantList.data.length);
    return this.dashConstantList.data.slice(startIndex, endIndex);
  }



  get shouldShowPagination(): boolean {
    return this.dashConstantList.data && this.dashConstantList.data.length > 0 && this.noOfPages > 1;
  }

  private initializePagination(): void {
    // Define how many page numbers to show
    const visiblePages = 5;
    const halfVisible = Math.floor(visiblePages / 2);

    if (!this.noOfPages) {
      this.startIndex = 0;
      this.endIndex = visiblePages;
    } else if (this.noOfPages <= visiblePages) {
      // If we have fewer pages than the visible count, show all
      this.startIndex = 0;
      this.endIndex = this.noOfPages;
    } else if (this.pageNumber <= halfVisible + 1) {
      // Near the beginning
      this.startIndex = 0;
      this.endIndex = visiblePages;
    } else if (this.pageNumber >= this.noOfPages - halfVisible) {
      // Near the end
      this.startIndex = this.noOfPages - visiblePages;
      this.endIndex = this.noOfPages;
    } else {
      // In the middle - center the current page
      this.startIndex = this.pageNumber - halfVisible - 1;
      this.endIndex = this.pageNumber + halfVisible;
    }

    // Ensure indexes are within valid bounds
    this.startIndex = Math.max(0, this.startIndex);
    this.endIndex = Math.min(this.noOfPages, this.endIndex);
  }

  onNextPage(): void {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.onChangePage();
    }
  }

  onPrevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onChangePage();
    }
  }

  onChangePage(page?: number): void {
    if (page !== undefined) {
      this.pageNumber = Math.max(1, Math.min(page, this.noOfPages));
    }

    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.initializePagination();
    }
  }

  // Helper methods for improved template readability and maintainability

  /**
   * Get header title based on config type
   */
  getHeaderTitle(): string {
    return this.configtype === 'side' ? 'Menu List' : 'Configuration';
  }

  /**
   * Get add button tooltip based on config type
   */
  getAddTooltip(): string {
    return this.configtype === 'side' ? 'Create Menu' : 'Create Configuration';
  }

  /**
   * Get form header title based on current state
   */
  getFormHeaderTitle(): string {
    if (!this.edit) {
      return this.configtype === 'side' ? 'Create Menu' : 'Create Configuration';
    }
    if (this.view) {
      return this.configtype === 'side' ? 'View Menu' : 'View Configuration';
    }
    return this.configtype === 'side' ? 'Edit Menu' : 'Edit Configuration';
  }

  /**
   * Get form action based on current state
   */
  getFormAction(): string {
    if (!this.edit) return 'add-constants';
    if (this.view) return 'view-constants';
    return 'edit-constants';
  }

  /**
   * Get back tooltip based on config type
   */
  getBackTooltip(): string {
    return this.configtype === 'side' ? 'Back to Menu' : 'Back to Configurations';
  }

  /**
   * Get view tooltip based on config type
   */
  getViewTooltip(): string {
    return this.configtype === 'side' ? 'View Menu' : 'View Configuration';
  }

  /**
   * Get edit tooltip based on config type
   */
  getEditTooltip(): string {
    return this.configtype === 'side' ? 'Edit Menu' : 'Edit Configuration';
  }

  /**
   * Get delete tooltip based on config type
   */
  getDeleteTooltip(): string {
    return this.configtype === 'side' ? 'Delete Menu' : 'Delete Configuration';
  }

  /**
   * Get actions aria label
   */
  getActionsAriaLabel(): string {
    return this.configtype === 'side' ? 'Menu actions' : 'Configuration actions';
  }

  /**
   * Toggle view mode
   */
  toggleViewMode(): void {
    this.view = true;
    this.buttonFlag = true;
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.view = false;
    this.buttonFlag = false;
  }

  /**
   * Get busy configuration for loading state
   */
  getBusyConfig(): any {
    return {
      busy: this.busy,
      message: this.configtype === 'side' ? 'Saving Menu...' : 'Saving Configuration...',
      backdrop: true
    };
  }

  /**
   * Check if basic fields should be shown
   */
  shouldShowBasicFields(): boolean {
    return (this.sideCheck === false || this.sideCheck === undefined) &&
      !this.defaultCheck && !this.defaultsidebar && !this.rearrangesidebar &&
      !this.iconsidebar && !this.configureFileUpload && !this.projectRoleMap;
  }

  /**
   * Get basic fields label
   */
  getBasicFieldsLabel(): string {
    return this.configtype === 'side' ? 'Menu Details' : 'Configuration Details';
  }

  /**
   * Check if config option should be shown
   */
  shouldShowConfigOption(option: string): boolean {
    const baseConditions = !this.defaultCheck && !this.defaultsidebar && !this.configureUserLand &&
      !this.rearrangesidebar && !this.iconsidebar && !this.configureFileUpload &&
      !this.projectRoleMap;

    switch (option) {
      case 'sidebar':
        return this.configtype && baseConditions;
      case 'defaultProjectRole':
        return !this.configtype && !this.sideCheck && baseConditions;
      case 'defaultSidebar':
        return this.configtype && !this.sideCheck && baseConditions;
      case 'userLanding':
        return !this.configtype && !this.sideCheck && baseConditions;
      case 'rearrangeSidebar':
        return this.configtype && !this.sideCheck && baseConditions;
      case 'theme':
        return !this.configtype && !this.sideCheck && baseConditions;
      case 'iconSidebar':
        return this.configtype && !this.sideCheck && !this.defaultsidebar && baseConditions;
      case 'fileUpload':
        return !this.configtype && !this.sideCheck && !this.defaultsidebar && !this.iconsidebar && baseConditions;
      case 'projectRoleMap':
        return !this.configtype && !this.sideCheck && !this.defaultsidebar && !this.iconsidebar &&
          !this.configureFileUpload && !this.defaultCheck;
      default:
        return false;
    }
  }

  /**
   * Check if save button should be shown
   */
  shouldShowSaveButton(): boolean {
    return (!this.edit && !this.buttonFlag && !this.rearrangesidebar) ||
      (this.edit && !this.buttonFlag && !this.rearrangesidebar);
  }

  /**
   * Check if convert button should be shown
   */
  shouldShowConvertButton(): boolean {
    return this.rearrangesidebar;
  }

  /**
   * Check if clear button should be shown
   */
  shouldShowClearButton(): boolean {
    return !this.buttonFlag && !this.view;
  }

  /**
   * Get save button text
   */
  getSaveButtonText(): string {
    return this.edit ? 'Update' : 'Save';
  }

  /**
   * Get save button label
   */
  getSaveButtonLabel(): string {
    const action = this.edit ? 'Update' : 'Save';
    const type = this.configtype === 'side' ? 'menu' : 'configuration';
    return `${action} ${type}`;
  }

  /**
   * Track by function for constants list
   */
  trackByConstantId(index: number, item: any): any {
    return item?.id || index;
  }
}