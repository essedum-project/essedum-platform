import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UsmPermissions } from '../../models/usm-permissions';
import { MessageService } from '../../services/message.service';
import { UsmPermissionsService } from '../../services/usm-permission.service';
import { PageResponse } from '../../support/paging';
import { Project } from "../../models/project";
import { PermissionApiService } from '../../services/permission-api.service';
import { UsmPermissionsApi } from '../../models/usm-permission-api';
@Component({
  selector: 'lib-usm-permission',
  templateUrl: './usm-permission.component.html',
  styleUrls: ['./usm-permission.component.css']
})
export class UsmPermissionComponent implements OnInit {


  showList: boolean = true;
  createFlag: boolean = true;

  searchedPermission: string = "All";
  permissionFilter = new Array<UsmPermissions>();
  selectedDesc: string = "All";

  permissionLength: number = 0;
  permissionList: MatTableDataSource<any> = new MatTableDataSource();
  permission = new Array<UsmPermissions>();
  permissionCopy = new Array<UsmPermissions>();
  permissionArraySorted = new Array<UsmPermissions>();
  displayedColumns: string[] = ["id", "module", "permission", "actions"];
  methodType: string[] = ["ALL", "GET", "PUT", "POST", "DELETE"]
  isDisabled: boolean = true;
  p: number;

  usm_modules: String[] = [];
  filterModule: string = "All";
  filterPermission: string = "";
  filterApi: string = "";
  filterType: string = "";
  private paginator: MatPaginator;
  private sort: MatSort;
  permissionarrayFilter: any[] = [];
  array: any[] = [];
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };



  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort= ms;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes(){
    if (this.permissionList) {
      this.permissionList.paginator = this.paginator
      this.permissionList.sort = this.sort
    }
  }

  currentPage: PageResponse<UsmPermissions> = new PageResponse<UsmPermissions >(0, 0, []);

  example: UsmPermissions = new UsmPermissions();
  examplepermission: UsmPermissions = new UsmPermissions();

  constructor(
    private usmPermissionsService:UsmPermissionsService,
    private router: Router,
    private route: ActivatedRoute,
    public messageService: MessageService,
    public usmPermissionService: UsmPermissionsService,
    public permissionApiService: PermissionApiService,

  ) { }




  ngOnInit() {
    this.loadPage({ first: 0, rows: 4000, sortField: null, sortOrder: null });
    this.fetchmodule();
  }

  getPermissionApiIdsByNameAndType(UsmPermissionsApi: UsmPermissionsApi) {
    let promise = new Promise((resolve, reject) => {
      this.permissionApiService.findByApiAndType(UsmPermissionsApi).toPromise()
        .then(
          res => {
            let ids: number[] = []
            res.forEach((ele) => {
              ids.push(ele.permissionId)
            })
            resolve(ids);
          }
        );
    });
    return promise;
  }

  search() {
    let ids: number[] = []
    if (this.filterApi == "" && this.filterType == "") {
      this.permissionList.data = [...this.filterUsmPermission(this.filterPermission, this.filterModule, ids)]
    } else {
      let usmPermissionsApi = new UsmPermissionsApi()
      usmPermissionsApi.api = this.filterApi
      usmPermissionsApi.type = this.filterType
      this.getPermissionApiIdsByNameAndType(usmPermissionsApi).then((ele) => {
        ids = ele as Array<number>
        if (ids.length == 0) {
          this.permissionList.data = [...new Array<UsmPermissions>()]
        } else {
          this.permissionList.data = [...this.filterUsmPermission(this.filterPermission, this.filterModule, ids)]
        }
      })
    }
  }

  filterUsmPermission(value: string, filterModule: string, ids: number[]) {
    if (ids.length != 0) {
      if (filterModule != "All") {
        return this.permissionCopy.filter((option: UsmPermissions) =>
          ((option.permission).toLowerCase().includes(value.toLowerCase()) && (option.module).toLowerCase().includes(filterModule.toLowerCase())) && (ids.includes(option.id)))
      }
      else {
        return this.permissionCopy.filter((option: UsmPermissions) =>
          ((option.permission).toLowerCase().includes(value.toLowerCase())) && (ids.includes(option.id)))
      }

    } else {
      if (filterModule != "All") {
        return this.permissionCopy.filter((option: UsmPermissions) =>
          ((option.permission).toLowerCase().includes(value.toLowerCase()) && (option.module).toLowerCase().includes(filterModule.toLowerCase())))
      }
      else {
        return this.permissionCopy.filter((option: UsmPermissions) =>
          ((option.permission).toLowerCase().includes(value.toLowerCase())))
      }
    }
  }

  fetchmodule() {
    this.permission = [];
    this.array = [];
    this.usmPermissionService.findAll(this.examplepermission, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        // console.error("JSON.parse error - ", e.message);
      }
      this.permission = response.content;
      this.permission = this.permission.filter(
        (arr, index, self) =>
          index === self.findIndex((t) => t.module === arr.module && t.permission === arr.permission)
      );
      this.permission = this.permission.sort((a, b) =>
        a.module.toLowerCase() > b.module.toLowerCase() ? 1 : -1
      );
      this.usm_modules = [...new Set(this.permission.map((item) => item.module))];
      this.permissionarrayFilter = this.permission
    });
  }

  loadPage(event) {
    this.usmPermissionsService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        pageResponse.content = pageResponse.content.sort((a, b) =>
          a.permission.toLowerCase() > b.permission.toLowerCase() ? 1 : -1
        );
        (this.currentPage = pageResponse), (this.permission = this.currentPage.content);
        this.permissionCopy = this.permission;
        this.permissionList = new MatTableDataSource(this.currentPage.content);
        this.permissionLength=this.permission.length
        this.permissionList.paginator = this.paginator
        this.permissionList.sort = this.sort
      },
      (error) => {
        this.messageService.error("Could not get the results", "LEAP");
      }
    );

  }
  createView() {
    this.router.navigate(["../create"], { relativeTo: this.route });
  }

  checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
    }
  }

  filterItem(value) {
    if (!value) {
      this.assignCopy();
    }
    this.permission = Object.assign([], this.permissionCopy).filter(
      (item1) => item1.module.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.permissionList.data = [...this.permission]
  }

  assignCopy() {
    this.permission = Object.assign([], this.permissionCopy);
  }

  viewPermission(permission) {
    let permissionId:string=permission.id
    this.router.navigate(["../view/"+ window.btoa(permissionId)+"/false"], { relativeTo: this.route })
  }

  deletePermission(permission) {
    this.usmPermissionsService.delete(permission.id).subscribe(
      ()=>{
        this.loadPage({ first: 0, rows: 4000, sortField: null, sortOrder: null });
        this.messageService.info(" Deleted the successfully", "LEAP")
      },
      (error) => {
      this.messageService.error("Could not Delete the results","");
      }
    )

  }

  editPermission(permission) {
    let permissionId:string=permission.id
    this.router.navigate(["../edit/"+ window.btoa(permissionId)+"/true"], { relativeTo: this.route })
  }
  trackByMethod(index, item) { }

  Clear() {
    this.filterPermission = "";
    this.filterModule = "All";
    this.filterApi=""
    this.filterType=""
    this.permissionList.data = this.permissionCopy;
    this.isEmpty()

  }
  isEmpty() {
    if(this.filterApi==""&&this.filterType==""&&this.filterModule=="All"&&this.filterPermission=="")
      this.isDisabled=true
    else
      this.isDisabled=false
    
  }
}
