import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { Dataset } from '../datasets';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetServices } from '../dataset-service';
import { TabsFilterService } from '../../services/tabs-filter.service';
import { Location } from "@angular/common";
import { DashConstant } from '../../DTO/dash-constant';

@Component({
  selector: 'app-dataset-edit',
  templateUrl: './dataset-edit.component.html',
  styleUrls: ['./dataset-edit.component.scss']
})
export class DatasetEditComponent implements OnInit {


  @Input() inpGroup;
  inpDataset: any;
  @Input() method;
  norecordfound = false
  breadcrumbName: any[] = [];
  showBreadcrumb: any = false;
  editData: any;
  showDetails = false;
  selectedDataset: any = {}
  viewSelector: boolean = false;
  busy: Subscription;
  datasourceRedirect: boolean = false;
  datasourcePlugin: any;
  currentDatasourceName = "NA";
  currentEntity = "NA";
  currentdatasourcealias = "";
  activeTab: any = "view"
  @ViewChild("singleSelect", { static: false }) singleSelect: MatSelect;
  dataset: Dataset;


  @Input() exp: boolean = false;
  @Input() dids;
  @Input() expView: boolean = false;
  exp_datasetids;
  exp_datasettype;
  exp_selectedDatasetids;
  editPrivateProject;
  exp_type;
  chosenDataset: string[] = [];
  showBackButton: Boolean = false;
  isBackHovered: boolean=false;
  tableview;
  isSbx = false;
  dash: any;
  backToDashButt: boolean;
  directToDatasetFullscreenView: boolean = false;
  directToPivotFullscreenView: boolean = false;
  directToVisualizeFullscreenView: boolean = false;
  datasetDetails: any = [];
  dash1 = new DashConstant();
  dash3 = new DashConstant();
  tabList: string[] = ["View", "Configuration", "Tasks", "Logs"];

  selectedTab: string;
  selectedTabIndex
  breadcrumb
  breadcrumbs: any[] = [];
  uploaddata: any;
  itsm: boolean = false;

  isNavigateFromKg: boolean = false;
  nodeNameAtNavigate = ""
  card: any;
  busy1: Subscription;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private datasetService: DatasetServices,
    private filtersService: TabsFilterService,

  ) {
    this.checkExp();
  }
  params: any = {};

  ngOnInit() {

    if (this.router.routerState.snapshot.url.includes('uploadTicket')) {
      this.itsm = true;
      this.currentEntity = 'Tickets';
      this.datasetService.getDatasetByNameAndOrg('Tickets').subscribe((res) => {
        this.uploaddata = res;
        if (res) {
          this.card = res;
          this.inpDataset = this.card.name;
          this.params['dgroup'] = this.card.datasource.type;
          this.params['group'] = this.card.datasource.name;
          this.params['name'] = this.card.name;
        }

      });
    }

    if (history.state.selectedCard) {
      let cards = this.location.getState();

      this.card = cards['selectedCard'];


      this.inpDataset = this.card.name;
      this.params['dgroup'] = this.card.datasource.type;
      this.params['group'] = this.card.datasource.name;
      this.params['name'] = this.card.name;
    }

    try {
      this.breadcrumb = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
      this.breadcrumbs.push({ label: "Datasets", url: "../" },
        { label: this.itsm ? 'Tickets' : this.card?.alias, url: "" })
      //this.fetchDashConstants();
      this.filtersService.changeText('');
      this.selectedTab = this.tabList[0];
      this.selectedTabIndex = 0

      if (history.state.isNavigateFromKg == true) {
        this.isNavigateFromKg = true
        this.nodeNameAtNavigate = history.state.nodeNameAtNavigate
      }
      if (this.route.snapshot?.children[0]?.params?.["action"] == "upload") {
        this.selectedTab = "Tasks"
        this.selectedTabIndex = 2
      }
      if (this.router.url.includes('front') || this.router.url.includes('rawdata') || this.router.url.includes('pivot') || this.router.url.includes('grid')
        || this.router.url.includes('flex')) {
        this.isScene = true;
        this.activeTab = "visualize"
      }


      if (JSON.stringify(this.params) != JSON.stringify({})) {
        this.showDetails = true
        if (this.router.url.endsWith("/view")) {
          this.directToDatasetFullscreenView = true;
          return;
        }
        if (this.router.url.endsWith("/pivot")) {
          this.directToPivotFullscreenView = true;
          return;
        }
        if (this.router.url.endsWith("/visualize")) {
          this.directToVisualizeFullscreenView = true;
          return;
        }
        this.currentDatasourceName = this.params['group'] || this.inpGroup || "NA";
        this.currentEntity = this.params['name'] || this.inpDataset || "NA";


        this.datasourceRedirect = this.params['dgroup'] ? true : false;
        if (this.datasourceRedirect) {
          this.datasourcePlugin = this.params['dgroup'];

        }
      }
      this.checkTableViewSupport()
    }
    catch (Exception) {
      this.datasetService.message("Some error occured", "error")
    }

  }

  //needed
  checkTableViewSupport() {
    if (this.currentEntity && this.currentEntity != "NA") {
      this.datasetService.getDataset(this.currentEntity)
        .subscribe(res => {
          this.currentdatasourcealias = this.card.alias ? this.card.alias : this.card.name
          this.dataset = this.card;
          if (!this.card.schemajson) {
            this.card.schemajson = res.schemajson;
          }
          this.editData = this.card;

        },
          () => { },
          () => {
            this.busy = this.datasetService.checkVisualizeSupport(this.dataset.name)
              .subscribe(res => {
                if (res && res.filter(ele => ele["Visualization"]).length > 0) {
                  this.selectedTab == "Tasks" ? this.selectedTabIndex = 2 : this.selectedTabIndex = 0
                  this.tableview = 'yes'
                }
                else {
                  this.tableview = 'no'
                }
                this.showDatasetsView()
              },
                () => { this.tableview = 'no' })
          })
    }
  }

  onMlStudioClick() {
    let datasetUrl, datasourceUrl;

    datasetUrl = "../../../datasets";
    datasourceUrl = "../../../../../datasources";

    if (this.currentDatasourceName !== "NA") {
      if (this.datasourceRedirect) {
        this.router.navigate([datasourceUrl], { relativeTo: this.route });
      } else {
        this.router.navigate([datasetUrl], { relativeTo: this.route });
      }
    } else {
      this.breadcrumbName = [];
      this.showBreadcrumb = false;
      this.showDetails = false;
      this.viewSelector = false;
    }
  }

  showParent(item) {
    this.datasetService.popBreadCrumb(item)
    let datasetUrl, datasourceUrl;
    datasetUrl = "../datasets";
    datasourceUrl = "../../../../../datasources";
    if (item.parent) {
      if (this.datasourceRedirect) {
        if (item.dataset) {
          this.router.navigate(["../../../../", this.datasourcePlugin, "data", this.currentDatasourceName], {
            relativeTo: this.route,
          });
        } else {
          this.router.navigate([datasourceUrl, this.datasourcePlugin], { relativeTo: this.route });
        }
      } else {
        this.router.navigate(["../"], { relativeTo: this.route });
      }
    }
  }

  showDatasetsView() {
    let currentGroupAlias;
    currentGroupAlias = this.currentdatasourcealias;
    this.selectedDataset["name"] = this.currentEntity;
    if (this.datasourceRedirect)
      this.breadcrumbName = [
        { name: this.datasourcePlugin, parent: true },
        { name: currentGroupAlias, parent: true, dataset: true },
        { name: this.currentdatasourcealias, parent: false },
      ];
    else {
      this.breadcrumbName = [
        { name: this.currentDatasourceName, parent: true },
        { name: this.currentdatasourcealias, parent: false },
      ];
    }
    this.showBreadcrumb = true;
    this.showDetails = true;
  }

  isScene = false;
  //needed
  onTabChange(event: any) {
    this.selectedTab = event?.tab?.textLabel
    // if (this.selectedTab == "View") {
    this.checkTableViewSupport()
    // }
  }


  checkExp() {
    try {
      if (this.router.url.includes("sandbox")) {
        sessionStorage.setItem("isSbx", "true");
        this.isSbx = true
      }
      else {
        sessionStorage.setItem("isSbx", "false");
        this.isSbx = false
      }
      this.route.queryParams.subscribe(params => {
        if (params["fullpage"]) {
          this.exp = true;
          this.exp_datasettype = params["fullpage"].valueOf();
          this.exp_datasetids = undefined;
          this.exp_type = params["private"].valueOf();
        }
        else if (params["expSelectedDatasets"]) {
          this.exp = true;
          this.exp_selectedDatasetids = JSON.parse(params["expSelectedDatasets"])
          this.editPrivateProject = JSON.parse(params["private"]);
          this.chosenDataset = this.exp_selectedDatasetids;
          this.exp_datasetids = undefined;
          this.exp_datasettype = 4;
        }
      })

    }
    catch (Exception) {
      this.datasetService.message("Some error occured", "error")
    }

  }

  //needed
  routeBack() {
    this.showDetails = false;
  }

  navigateToKg() {
    this.router.navigateByUrl("/landing/iamp-graph/main", { state: { nodeName: this.nodeNameAtNavigate } })
  }
  backToDatasets() {
    this.location.back();
  }

}
