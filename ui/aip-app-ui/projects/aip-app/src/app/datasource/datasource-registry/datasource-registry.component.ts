import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DashConstant, LeapTelemetryService, MessageService, DashConstantService, Project } from 'com-lib-util';
import { Subscription } from 'rxjs';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { GroupsService } from '../../services/groups.service';
import { IcipComService } from '../../services/icip-com.service';
import { TabsFilterService } from '../../services/tabs-filter.service';
import { AppGlobals } from '../../sharedModule/shared-variables/app.globals';
import { Datasource } from '../datasource';
import { DatasetServices } from '../../dataset/dataset-service';
import { DatasourceService } from '../datasource.service';
import { DatasourceConfigComponent } from '../datasource-config/datasource-config.component';

@Component({
  selector: 'app-datasource-registry',
  templateUrl: './datasource-registry.component.html',
  styleUrls: ['./datasource-registry.component.scss']
})
  export class DatasourceRegistryComponent implements OnInit, OnDestroy {
    busy: Subscription;
    searchText: string;
    tmpSearchText: string;
    searchEntity: string = "";
    isGridView: boolean;
    inactiveTime: any;
    schedulerLastRunTime: any;
    schedulerStatus: any;
    currentSearchList: any[] = [];
    breadcrumbName: any = [];
    showBreadcrumb: any = false;
    viewSelector: any = false;
    currentPage: any;
    groups: any[] = [];
    currentPlugin = "NA";
    currentEntity = "NA";
    displayDiv: boolean = true;
    showDatasourceDetails = false;
    activeTime: Boolean = false;
    isAuth: boolean = true;
    selectedModel: any = [];
    tableData: any = [];
    datasourceData: any = {};
    tempdatasourceData="Template";
    dta: any = {};
    private searchSubscription: Subscription;
    private viewSubscription: Subscription;
    dash1 = new DashConstant();
    dash3 = new DashConstant();
    showBackButton: Boolean = true;
    permissionList
    totalJobs = 0;
    page = 0;
    lastPage = 0;
    rows = 12;
    pluginsfetched = 0;
    datasourcesfetched = 0;
  
    breadcrumb
    flipView: boolean = false;
    docType;
    data: any;
    
  
    constructor(
     private telemetryService: LeapTelemetryService,
      private route: ActivatedRoute,
      private router: Router,
      private dialog: MatDialog,
      private datasourceService: DatasourceService,
      private datasetService: DatasetServices,
      private filtersService: TabsFilterService,
      public messageService: MessageService,
      public _globals: AppGlobals,
      private groupsService: GroupsService,
      private icipComService: IcipComService,
      private dashConstantService: DashConstantService,
      public dialogRef: MatDialogRef<DatasourceRegistryComponent>
    ) {
      this.router.onSameUrlNavigation = "reload";
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
    }
  
    ngOnInit() {
      try{
        this.breadcrumb = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
        this.filtersService.changeText('');
        this.telemetryImpression();
        this._globals.setAPIStatus(false);
        this.currentPlugin = "NA";
        this.currentEntity = "NA";
        this.fetchDashConstants();
        if (sessionStorage.getItem("cipAuthority") &&
          sessionStorage.getItem("cipAuthority").includes("dsr-edit")) this.isAuth = false;
        // if (sessionStorage.getItem("cipAuthority") == "edit") this.isAuth = false;
        this.searchSubscription = this.filtersService.getSearchText().subscribe((message) => {
          this.searchText = message;
          this.searching();
        });
        this.checkParams("search");
        this.viewSubscription = this.filtersService.getView().subscribe((view) => (this.isGridView = view));
          // if (this.router.url.includes("templateDatasources")) {
          //   let resp:any;
          //   this.busy = this.datasourceService.getDatasources().subscribe(
          //     (res) => {
          //      this.tempdatasourceData = res;
          //      this.messageService.info("Fetched", "Fetched Sucessfully");
          //      console.log("this is res",res);
          //      this.dta = this.tempdatasourceData.filter((data) =>data.interfacetype =="Template");
          //      console.log("this is filter",this.dta);   
          //     },
              
          //    );  
           
          // }
        if (this.route.children.length === 1) {
           this.currentPlugin = this.route.children[0].snapshot.paramMap.get("group") || "NA";
          this.currentEntity = this.route.children[0].snapshot.paramMap.get("name") || "NA";
         
          this.searchEntity = this.route.children[0].snapshot.queryParams["search"] || "";
          this._globals.setDataSourcePlugin(this.currentPlugin);
          if(this.datasourcesfetched===0){
            this.getDatasourcesCount();
          }
        } 
        if(this.data){
          this.currentPlugin = this.data?.wkJson?.input.inp1
          this.searchText = this.data?.wkJson?.input.inp2
         
          this._globals.setDataSourcePlugin(this.currentPlugin);
          if(this.datasourcesfetched===0){
            this.getDatasourcesCount();
          }
        }
        else {
          this._globals.setDataSourcePlugin(undefined);
          if(this.pluginsfetched===0){
            this.getPluginsLength();
          }
        }
        if(this.currentPlugin == "NA" && this.currentEntity == "NA")
         sessionStorage.setItem("icip.breadcrumb","[]")	
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    }
    
    flip: string = 'inactive';
    toggleFlip(type) {
      // this.flip = (this.flip == 'inactive') ? 'active' : 'inactive';
      this.flipView  = true
      this.docType = type
    }r
  
    telemetryImpression() {
      this.telemetryService.start();
      this.telemetryService.impression("icip-adp", "list", "DatasourceRegistryComponent");
    }
  
    fetchDashConstants() {
      try{
          // Datasource IncactiveTime
      this.dash1.keys = "icip.datasourcetest.inactivetime";
      let project = new Project();
      project = JSON.parse(sessionStorage.getItem("project"));
      this.dash1.project_name = project.name;
      this.dashConstantService
        .findAll(this.dash1, { first: 0, rows: 1, sortField: null, sortOrder: 1 })
        .subscribe((res) => {
          if (res.content.length != 0) this.inactiveTime = res.content[0].value;
          else {
            this.messageService.info("InActiveTime key is not found", "ICIP!");
          }
        }, error => { this.messageService.error("Error in getting icip.datasourcetest.inactivetime key ", "InActiveTime"); })
  
  
      // Scheduler Last Run Time 
      this.dash3.keys = "icip.datasourcetest.lasttime";
      this.dash3.project_name = project.name;
      this.dashConstantService
        .findAll(this.dash3, { first: 0, rows: 1, sortField: null, sortOrder: 1 })
        .subscribe((res) => {
          if (res.content.length != 0) this.schedulerLastRunTime = res.content[0].value;
          else {
            this.messageService.info("icip.datasourcetest.lasttime  key is not found", "ICIP!");
          }
        }, error => { this.messageService.error("Error in getting icip.datasourcetest.lasttime key ", "Scheduler Last Run Time "); })
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
  
    }
  
    getmilli(date) {
      let t = false;
      if (this.inactiveTime && this.schedulerLastRunTime) {
        let lastActiveDate = new Date(date);
        let presentDate = new Date();
        let inactiveTime = this.inactiveTime * 60 * 1000;
        let z = presentDate.valueOf() - inactiveTime;
        let schedulerLastruntime = new Date(this.schedulerLastRunTime);
        let schedulerTime = presentDate.valueOf() - schedulerLastruntime.valueOf();
        if (schedulerTime <= inactiveTime) {
          if (lastActiveDate.valueOf() >= z) {
            t = true;
          }
          else {
            t = false;
          }
        }
        else {
          t = true;
        }
      }
      else {
        t = true
      }
      return t
    }
  
    getCorrectResponseForJobLength() {
      this.busy = this.datasourceService.getDatasourceCountByPluginType(this.currentPlugin, this.tmpSearchText).subscribe(
        resp => {
          if (this.searchText != this.tmpSearchText) {
            this.tmpSearchText = this.searchText;
            this.getCorrectResponseForJobLength();
          } else {
            this.getDatasourcesPerPage(resp);
          }
        }
      )
    }
  
    getDatasourcesPerPage(response) {
      var n: Number = new Number(response);
      this.totalJobs = n.valueOf();
      var remainder = this.totalJobs % this.rows;
      var cof = (this.totalJobs - remainder) / this.rows;
      if (remainder != 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
      this.messageService.info("Fetched successfully", "ICIP!");
      if (this.totalJobs !== 0) {
        this.getInnerDatasource("First");
      } else {
        this.page = 0;
        this.lastPage = 0;
        this._globals.setAPIStatus(false);
        this.withParams(this.page, this.rows);
      }
    }
  
    getDatasourcesCount() {
      this.tmpSearchText = this.searchText;
      this.busy = this.datasourceService.getDatasourceCountByPluginType(this.currentPlugin, this.tmpSearchText).subscribe(
        (response) => {
          if (this.searchText != this.tmpSearchText) {
            this.tmpSearchText = this.searchText;
            response = this.getCorrectResponseForJobLength();
          } else {
            this.getDatasourcesPerPage(response);
          }
        },
        (error) => {
          this._globals.setAPIStatus(false);
          this.messageService.error("Could not fetch jobs!", error);
        }
      );
    }
  
    getInnerDatasource(choice: String) {
      switch (choice) {
        case "Next":
          this.page += 1;
          if (this.page == this.lastPage) {
            choice = "Last";
            this.getInnerDatasource("Last");
            return;
          }
          break;
        case "Prev":
          this.page -= 1;
          if (this.page == 0) {
            choice = "First";
            this.getInnerDatasource("First");
            return;
          }
          break;
        case "First":
          this.page = 0;
          break;
        case "Last":
          this.page = this.lastPage;
          break;
      }
      this.withParams(this.page, this.rows);
    }
  
    getPluginsLength() {
      this.busy = this.datasourceService.getPluginsLength().subscribe(
        (response) => {
          var n: Number = new Number(response);
          this.totalJobs = n.valueOf();
          // this.totalJobs = response
          var remainder = this.totalJobs % this.rows;
          var cof = (this.totalJobs - remainder) / this.rows;
          if (remainder != 0) {
            this.lastPage = cof;
          } else {
            this.lastPage = cof - 1;
          }
          this.messageService.info("Fetched successfully", "ICIP!");
          if (this.totalJobs !== 0) {
            this.getDatasource("First");
          } else {
            this.page = 0;
            this.lastPage = 0;
            this._globals.setAPIStatus(false);
            this.withParams(this.page, this.rows);
          }
        },
        (error) => {
          this._globals.setAPIStatus(false);
          this.messageService.error("Could not fetch jobs!", error);
        }
      );
    }
  
    fetchGroups() {
      this.showBackButton = true;
      this.busy = this.datasourceService.getDatasourceJson(this.page, this.rows).subscribe((res) => {
        this.groups = res;      
        this.currentSearchList = this.groups;
        if (this.router.url.includes("templateDatasources"))  {
          this.updateTempdatasourceData();
        } else {
          this.updateDatasourceData();
        }
      });
    }
  
    updateDatasourceData() {
      for (let i = 0, j = this.groups.length; i < j; i++) {
        this.busy = this.datasourceService
          .getDatasourceCountByPluginType(this.groups[i].type, this.searchText)
          .subscribe((res) => {
            this.datasourceData[this.groups[i].type] = res;
          });
        }
    }
    updateTempdatasourceData() {
      for (let i = 0, j = this.groups.length; i < j; i++) {
        this.busy = this.datasourceService
          .getDatasourceCountByPluginInterface(this.groups[i].type,this.tempdatasourceData, this.searchText)
          .subscribe((res) => {
            this.datasourceData[this.groups[i].type] = res;
          });
        }
    }
  
    checkParams(word) {
      var searchText2;
      this.route.queryParams.subscribe((params) => {
        searchText2 = params[word];
      });
      if (searchText2) {
        this.searchText = decodeURI(searchText2);
      }
    }
  
    getCorrectResponseFoSearching() {
      this.busy = this.datasourceService.getDatasourceJsonByDatasourceName(this.tmpSearchText).subscribe(
        resp => {
          if (this.searchText != this.tmpSearchText) {
            this.tmpSearchText = this.searchText;
            this.getCorrectResponseFoSearching();
          } else {
            this.subSearching(resp)
          }
        }
      )
    }
  
    subSearching(response) {
      this.displayDiv = true;
      this.currentSearchList = [];
      let tmpList = [];
      response.forEach((element) => {
        if (tmpList.indexOf(element.type) < 0) {
          tmpList.push(element.type);
          this.currentSearchList.push(element);
          this.datasourceData[element.type] = 0;
        }
        this.datasourceData[element.type] = this.datasourceData[element.type] + 1;
      });
      this.currentSearchList.slice(this.page * this.rows, this.page * this.rows + this.rows);
      var n = this.currentSearchList.length;
      this.totalJobs = n.valueOf();
      var remainder = this.totalJobs % this.rows;
      var cof = (this.totalJobs - remainder) / this.rows;
      if (remainder != 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
      this._globals.setAPIStatus(false);
    }
  
    searching() {
      if (this.route.children.length !== 1) {
        this._globals.setDataSourcePlugin(undefined);
        this.displayDiv = false;
        if (this.searchText != "") {
          if (!this._globals.getAPIStatus()) {
            this.page = 0;
            this.lastPage = 0;
            this._globals.setAPIStatus(true);
            this.tmpSearchText = this.searchText;
            this.busy = this.datasourceService.getDatasourceJsonByDatasourceName(this.tmpSearchText).subscribe(
              (pageResponse) => {
                if (this.searchText != this.tmpSearchText) {
                  this.tmpSearchText = this.searchText;
                  this.getCorrectResponseFoSearching();
                } else {
                  this.subSearching(pageResponse)
                }
              },
              (error) => {
                this._globals.setAPIStatus(false);
                this.displayDiv = true;
                this.currentSearchList = [];
                this.page = 0;
                this.lastPage = 0;
              }
            );
          }
        } else {
          this.displayDiv = true;
          this.tmpSearchText = "";
          this.getPluginsLength();
          this.pluginsfetched = 1;
        }
      } else {
        this._globals.setAPIStatus(false);
        if (!this._globals.getAPIStatus()) {
          this._globals.setAPIStatus(true);
          this.currentPlugin = this.route.children[0].snapshot.paramMap.get("group") || "NA";
          this.currentEntity = this.route.children[0].snapshot.paramMap.get("name") || "NA";
          this.searchEntity = this.route.children[0].snapshot.queryParams["search"] || "";
          this._globals.setDataSourcePlugin(this.currentPlugin);
          this.getDatasourcesCount();
          this.datasourcesfetched=1;
        }
      }
    }
  
    closeDialog() {
      this.dialogRef.close();
    }
  
    onSearch() {
      this.filtersService.changeText(this.searchText);
    }
  
    // loadSearchList() {
    //   this.groups.forEach(itemName => {
    //     this.datasourceService.getDatasourcesForGroup(itemName.name).subscribe((resp => {
    //       var newitem = {};
    //       newitem["group"] = itemName;
    //       newitem["items"] = resp;
    //       this.currentSearchList.push(newitem);
    //     }));
    //   });
    // }
    getDatasource(choice: String) {
      switch (choice) {
        case "Next":
          this.page += 1;
          if (this.page == this.lastPage) {
            choice = "Last";
            this.getDatasource("Last");
            break;
          }
          break;
        case "Prev":
          this.page -= 1;
          if (this.page == 0) {
            choice = "First";
            this.getDatasource("First");
            break;
          }
          break;
        case "First":
          this.page = 0;
          break;
        case "Last":
          this.page = this.lastPage;
          break;
      }
      this.fetchGroups();
    }
  
    fetchDatasources(group) {
      try{
        this.viewSelector = true;
        this.breadcrumbName = [{ name: group.type, parent: true }];
        this.showBreadcrumb = true;
        this._globals.setDataSourcePlugin(group.type);
        this.busy = this.datasourceService
          .getDatasourceByPluginType(group.type, this.searchText,null, this.page, this.rows)
          .subscribe((res) => {
            this.currentPage = res;
            this.currentPage.forEach((datasource) => {
              datasource.connectionDetails = JSON.parse(datasource.connectionDetails);
            });
            
          });
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
    }
  
    goBack() {
      this.router.navigate(["../"], { relativeTo: this.route });
    }
  
    refresh() {
      this.ngOnInit();
    }
  
    getDatasourceDetails(data) {
      // this.showDatasourceDetails = true;
      // this.selectedModel = data;
      // this.datasetService.getDatasetByDatasource(data.name).subscribe(res => this.tableData = res);
      if(!this.data){
      let bc = {item:data, parent:true, dataset:true}
      this.icipComService.pushBreadCrumb(bc)
      this._globals.setDataSourcePlugin(undefined);
     
      this.router.navigate(["../datasets/", this.currentPlugin, "data", data.name], { relativeTo: this.route });
      }
    }
  
    clearDatasets() {
      this.showDatasourceDetails = false;
    }
  
    addDatasource() {
      const dialogRef = this.dialog.open(DatasourceConfigComponent, {
        width: "60%",
        height: "92%",
        minWidth: "60vw",
        minHeight: "92vh",
        disableClose: true,
        data: {
          group: this.currentPlugin,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        //this.refresh();
      });
    }
  
    editDatasource(model) {
      try{
        const dialogRef = this.dialog.open(DatasourceConfigComponent, {
          width: "60%",
          height: "92%",
          minWidth: "60vw",
          minHeight: "92vh",
          disableClose: true,
          data: JSON.parse(JSON.stringify(model)),
        });
        dialogRef.afterClosed().subscribe((result) => {
          //this.refresh();
        });
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
     
    }
  
    deleteDatasource(model) {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === "delete") {
          this.busy = this.datasourceService.deleteDatasource(model.name).subscribe(
            (res) => {
              this.busy = this.datasourceService.deleteGroupModelEntity(model.name).subscribe();
              //this.refresh();
            },
            (error) =>console.log(error)
          );
        }
      });
    }
    onViewChange() {
      this.filtersService.changeView(this.isGridView);
    }
  
  
    onMlStudioClick() {
      if (this.currentPlugin !== "NA") {
        this._globals.setDataSourcePlugin(undefined);
        this.router.navigate(["../datasources"], { relativeTo: this.route });
      } else {
        this.breadcrumbName = [];
        this.showBreadcrumb = false;
        this.viewSelector = false;
      }
    }
  
    withParams(page, size) {
      this.showBackButton = false;
      this.breadcrumbName = [];
      if (this.currentPlugin !== "NA" && this.currentEntity === "NA") {
        this.breadcrumbName = [{ name: this.currentPlugin, parent: true }];
        this.showBreadcrumb = true;
        this.viewSelector = true;
        let interfacetype = null
        if (this.router.url.includes("templateDatasources")) 
          interfacetype = 'template'
        this.busy = this.datasourceService.getDatasourceByPluginType(this.currentPlugin, this.tmpSearchText,interfacetype, page, size).subscribe(
          (res) => {
            this.currentPage = res;
            this._globals.setAPIStatus(false);
            // if (this.router.url.includes("templateDatasources")) {
            //   this.currentPage = this.currentPage.filter((data) =>data.interfacetype && data.interfacetype.toLowerCase() =="template");
            //   this.tempdatasourceData=this.currentPage;
              
            // }
          },
          (error) => {
            this._globals.setAPIStatus(false);
          }
        );
      }
      if (this.currentEntity !== "NA") {
        this.viewSelector = true;
        this.breadcrumbName = [
          { name: this.currentPlugin, parent: true },
          { name: this.currentEntity, parent: false },
        ];
        this.showBreadcrumb = true;
      }
      this._globals.setAPIStatus(false);
    }
  
    withParamsParent(item, search_item) {
      if(!item.alias)
        item.alias =item.type
      let bc = {item:item, parent:true}
      this.icipComService.pushBreadCrumb(bc)
      let datasourceUrl;
      if (this.router.url.includes("mlstudio")) {
        datasourceUrl = "../../mlstudio/datasources";
      }
      else if(this.router.url.includes("templateDatasources")){
        datasourceUrl = "../templateDatasources";
  
      }
      else {
        datasourceUrl = "../datasources";
      }
      this.breadcrumbName = [];
      this.searchEntity = search_item;
      this._globals.setDataSourcePlugin(item.type);
      if (search_item && search_item !== "")
        this.router.navigate([datasourceUrl, item.type], {
          queryParams: { search: encodeURI(search_item) },
          relativeTo: this.route,
        });
      else this.router.navigate([datasourceUrl, item.type], { relativeTo: this.route });
    }
  
    showParent(item) {
      this.icipComService.popBreadCrumb(item)
      let datasourceUrl;
      if (this.router.url.includes("mlstudio")) {
        datasourceUrl = "../../mlstudio/datasources";
      }
      else {
        datasourceUrl = "../datasources";
      }
      if (item.parent) {
        this.router.navigate([datasourceUrl, this.currentPlugin], { relativeTo: this.route });
      }
    }
  
    showFrame(item: Datasource) {
      let datasourceUrl;
      if (this.router.url.includes("mlstudio")) {
        datasourceUrl = "../../mlstudio/datasources/";
      }
      else {
        datasourceUrl = "../datasources/";
      }
      this.router.navigate([datasourceUrl, this.currentPlugin, item.name], { relativeTo: this.route });
      let bc = {item:item, parent:true}
      this.icipComService.pushBreadCrumb(bc)
    }
  
    ngOnDestroy() {
      this.searchSubscription.unsubscribe();
      this.viewSubscription.unsubscribe();
      this.busy.unsubscribe();
    }
  
    showDatasetFrame(name) {
      let datasetUrl;
      if (this.router.url.includes("mlstudio")) {
        datasetUrl = "../../mlstudio/datasets/";
      }
      else {
        datasetUrl = "../datasets/";
      }
      this.busy = this.groupsService.getAllGroupsByOrgAndEntity("dataset", name, 0, 12).subscribe((res) => {
        this.router.navigate([datasetUrl, res[0].name, name], { relativeTo: this.route });
      });
    }
}
