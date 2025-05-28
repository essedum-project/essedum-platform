import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute, UrlTree } from "@angular/router";
import { ApisService } from "../../services/apis.service";
//import { LeapTelemetryService } from "../../services/telemetry-util/telemetry.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  @Input() alerts: number;
  dashboardId: number;
  backgroundcolor = false;
  lazyloadevent = { first: 0, rows: 1000, sortField: null, sortOrder: 1 };
  role: any;
  sidebarMenu = [
    { label: "Dashboard", icon: "tachometer", url: "./" },
    { label: "Mapping", icon: "map-signs", url: "./iamp-usm/dashconstant" },
    { label: "Documents", icon: "book", url: "./iamp-ccl/documents" },
    {
      label: "Tools",
      icon: "wrench",
      children: [
        { label: "Create", icon: "", url: "./iamp-ccl/mytools/create", children: [] },
        { label: "Search", icon: "", url: "./iamp-ccl/mytools", children: [] },
        { label: "", icon: "", children: [] },
      ],
    },
    { label: "Knowledge Graph", icon: "bar-chart", url: "./iamp-graph/main" },
  ];

  user: any = new Object();
  selectedrole = new Object();
  selectedproject = new Object();
  visible: boolean = true;
  ready: boolean = false;
  capError: string;
  capRole: string;
  themecolor: any;
  // CIOAsset: string = "";
  // CIOTicket: string = "";
  // CIOSLA: string = "";
  dashConstantCheckResponse: any;
  sidebarType: string = "base";
  bgColorType: number = 1;
  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private apisService: ApisService,
   // private telemetryService: LeapTelemetryService
  ) {
    this.route.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
  ngOnInit() {
    try {
      this.role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e) {
      console.error("JSON.parse error - ", e);
    }
    this.themecolor = sessionStorage.getItem("theme");
    document.documentElement.style.setProperty("--header-color", this.themecolor);
    sessionStorage.removeItem("Filter");
    sessionStorage.removeItem("WidgetLevelDefault");
    sessionStorage.removeItem("TopFilter");
    sessionStorage.removeItem("DateFilter");
    sessionStorage.removeItem("QuickRangeName");
    sessionStorage.removeItem("ConfiguartionItemId");
    sessionStorage.removeItem("CIList");
    sessionStorage.removeItem("drilldown");
    sessionStorage.removeItem("FromFailure");
    sessionStorage.removeItem("ciId");
    let url = window.location.href;
    if (!url.includes("cc")) {
      sessionStorage.removeItem("level2sidebar");
    }
    this.checkDashConstantResponseForKeys();
    if (this.fetchCredentials()) {
      this.route.navigate(["../login"], { relativeTo: this.router });
    } else {
      if (this.role.roleadmin) {
        this.sidebarMenu.splice(
          1,
          3,
          { label: "Project Management", icon: "file-powerpoint-o", url: "./iamp-usm/projectlist" },
          { label: "Role Management", icon: "registered", url: "./iamp-usm/role/list" },
          { label: "User Management", icon: "users", url: "./iamp-usm/manageUsers" }
        );
      }
      let dashconstant: any = new Object();
      let value;
      try {
        value = JSON.parse(sessionStorage.getItem("project"));
        dashconstant.project_id = new Object({ id: value.id });
        dashconstant.project_name = JSON.parse(sessionStorage.getItem("project")).name;
        let rolename = JSON.parse(sessionStorage.getItem("role")).name;
        dashconstant.keys = rolename + " Side";
      } catch (e) {
        console.error("JSON.parse error - ", e);
      }
      this.apisService.getDashConsts().subscribe((res) => {
        let response=res;
        let project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          console.error("JSON.parse error - ", e);
        }
        res = res.filter(
          (item) =>
            item.project_id.id == project.id &&
            item.project_name == project.name &&
            item.keys == JSON.parse(sessionStorage.getItem("role")).name + " Side"
        );
        if(res.length<1){
          res = response.filter(
            (item) =>
              item.project_name == "Core" &&
              item.keys == JSON.parse(sessionStorage.getItem("role")).name + " Side"
          );
        }
        if(res.length<1){
          res=response.filter(
            (item) =>
              item.project_id.id == project.id &&
              item.project_name == project.name &&
              item.keys == JSON.parse(sessionStorage.getItem("role")).name + " SideConfigurations"
          );
          if(res && res.length>0)
            this.sidebarMenu=JSON.parse(res[0].value)
        }
        if (res.length > 0) {
          this.sidebarMenu = [];
          res.forEach((item) => {
            try {
              let temp: any = item.value;
              if (JSON.parse(temp).children != null) {
                let temp2 = JSON.parse(temp).children;
                for (let j = 0; j < temp2.length; j++) {
                  if (temp2[j].children == null) {
                    let temp3 = temp2[j];
                    temp3.children = [];
                    temp2[j] = temp3;
                  }
                }
                let jsonTemp = JSON.parse(temp);
                jsonTemp.children = [];
                jsonTemp.children = temp2;
                item.value = JSON.stringify(jsonTemp);
              }
              if(item.keys == JSON.parse(sessionStorage.getItem("role")).name + " SideConfigurations"){
                this.sidebarMenu=JSON.parse(item.value)
              }
              else
              this.sidebarMenu.push(JSON.parse(item.value));
              this.ready = true;
            } catch (e) {
              this.ready = true;
            }
          });
          if (this.role.name == "Admin") {
            let f = 0;
            this.sidebarMenu.forEach((item) => {
              if (item.label == "Mapping" || item.url == "./iamp-usm/dashconstant") {
                f = 1;
              }
            });
            if (f == 0) this.sidebarMenu.push({ label: "Mapping", icon: "map-signs", url: "./iamp-usm/dashconstant" });
          }
          if (this.role.name == "BCC Admin" || this.role.name == "Client Manager") {
            for (let i = 0; i < this.sidebarMenu.length; i++) {
              if (this.sidebarMenu[i].label == "Dashboard") {
                let landingDash;
                try {
                  landingDash = JSON.parse(sessionStorage.getItem("landingDash"));
                } catch (e) {
                  console.error("JSON.parse error - ", e);
                }
                this.sidebarMenu[i].url = this.sidebarMenu[i].url + landingDash;
                break;
              }
            }
          }
        } else {
          this.ready = true;
          this.populateDefaultSidebarMenu();
        }
      });
    }
  }

  fetchCredentials(): boolean {
    try {
      this.user = JSON.parse(sessionStorage.getItem("user"));
    } catch (e) {
      console.error("JSON.parse error - ", e);
    }
    this.selectedrole = this.role;
    try {
      this.selectedproject = JSON.parse(sessionStorage.getItem("project"));
    } catch (error) { }
    if (this.bgColorType==2) document.documentElement.style.setProperty("--color", "#EDCFFF");
    else document.documentElement.style.setProperty("--color", "#46D599");
    if (this.user == null || this.role == null || this.selectedproject == null) {
      return true;
    } else {
      return false;
    }
  }

  populateDefaultSidebarMenu() {
    // portfolio manager / support engineer
    if (this.role.name == "IT Portfolio Manager" || this.role.name == "Support Engineer") {
      this.sidebarMenu.splice(
        1,
        3,
        { label: "My Tools", icon: "book", url: "./iamp-ccl/mytools"},
        {
          label: "Tickets App",
          icon: "desktop",
          children: [
            { label: "Alerts", icon: "", url: "./tickets/alerts", children: [] },
            { label: "Service Requests", icon: "", url: "./tickets/servicerequests", children: [] },
            { label: "Change Requests", icon: "", url: "./tickets/changerequests", children: [] },
            { label: "Tasks", icon: "", url: "./tickets/tasks", children: [] }
          ],
        },
        {
          label: "Upload Tickets",
          icon: "ticket",
          children: [
            { label: "Upload", icon: "", url: "./tickets/uploadTicket", children: [] },
            { label: "Mapping", icon: "", url: "./iamp-usm/dashconstant", children: [] }
          ],
        },
        { label: "Documents", icon: "book", url: "./iamp-ccl/documents" },
        {
          label: "AI Brain", icon: "ils",
          children: [
            { label: "Datasources", icon: "database", url: "./aibrain/datasources", children: [] },
            { label: "Analytics Pipelines", icon: "wpexplorer", url: "./aibrain/pipelines", children: [] },
            { label: "Agents", icon: "gg", url: "./aibrain/agents", children: [] },
            { label: "Data Marketplace", icon: "table", url: "./aibrain/datasets", children: [] },
            { label: "Model Marketplace", icon: "superpowers", url: "./aibrain/models", children: [] },
            { label: "Schemas", icon: "puzzle-piece", url: "./aibrain/schemas", children: [] },
            { label: "Events", icon: "calendar", url: "./aibrain/events", children: [] },
            { label: "Chain Jobs", icon: "link", url: "./aibrain/jobs/chain", children: [] },
            { label: "Scheduled Jobs", icon: "clock-o", url: "./aibrain/jobs/scheduled", children: [] },
            { label: "Logs", icon: "file-text-o", url: "./aibrain/jobs/logs", children: [] }

          ]
        },
        {
          label: "Incidents",
          icon: "ticket",
          children: [
            { label: "SOP", icon: "", url: "./tickets/Sops-list", children: [] },
            { label: "Problem-Type", icon: "", url: "./tickets/ProblemType-list", children: [] },
            { label: "Cluster", icon: "", url: "./tickets/Clusters-list", children: [] },
            { label: "RCA", icon: "", url: "./tickets/Rca-list", children: [] },
          ],
        },
        { label: "Process Mining", icon: "product-hunt", url: "./dynamicDashboard/process-mining" }
      );
    
    } else if (this.role.name == "Automation Engineer") {
      this.sidebarMenu.splice(
        0,
        4,

        {
          label: "Dashboard",
          icon: "tachometer",
          url: "./icapdashboard",
        },
        {
          label: "Bots",
          icon: "cog",
          children: [
            {
              label: "Create Node",
              icon: "",
              url: "./creatnode",
              children: [],
            },
            {
              label: "Create Bot",
              icon: "",
              url: "./createagent",
              children: [],
            },
            {
              label: "View Bots",
              icon: "",
              url: "./monitoragent",
              children: [],
            },
            {
              label: "Bot Node Mapping",
              icon: "",
              url: "./agentnodemapping",
              children: [],
            },
            {
              label: "View Mappings",
              icon: "",
              url: "./monitormapping",
              children: [],
            },
            {
              label: "View Statistics",
              icon: "",
              url: "./viewstatistics",
              children: [],
            },
          ],
        },
        {
          label: "Workflows",
          icon: "list-ul",
          children: [
            {
              label: "Define Workflow",
              icon: "",
              url: "./createworkflow",
              children: [],
            },
            {
              label: "Process Workflow",
              icon: "",
              url: "./processworkflow",
              children: [],
            },
            {
              label: "Monitor Workflow",
              icon: "",
              url: "./monitorworkflow",
              children: [],
            },
            {
              label: "View Workflows",
              icon: "",
              url: "./viewworkflow",
              children: [],
            },
            {
              label: "Incident Dashboard",
              icon: "",
              url: "./inputdetails",
              children: [],
            },
            {
              label: "Add Schedule",
              icon: "",
              url: "./createschedule",
              children: [],
            },
            {
              label: "View Schedules",
              icon: "",
              url: "./monitorschedule",
              children: [],
            },
          ],
        },
        {
          label: "Administration",
          icon: "user",
          children: [
            {
              label: "Add User",
              icon: "",
              url: "./adduser",
              children: [],
            },
            {
              label: "View Users",
              icon: "",
              url: "./monitoruser",
              children: [],
            },
            {
              label: "Create Portfolio",
              icon: "",
              url: "./createportfolio",
              children: [],
            },
            {
              label: "View Portfolios",
              icon: "",
              url: "./monitorportfolio",
              children: [],
            },
            {
              label: "Add Application",
              icon: "",
              url: "./addapplication",
              children: [],
            },
            {
              label: "View Applications",
              icon: "",
              url: "./monitorapplication",
              children: [],
            },
            {
              label: "Add Category",
              icon: "",
              url: "./createcategory",
              children: [],
            },
            {
              label: "View Categories",
              icon: "",
              url: "./monitorcategory",
              children: [],
            },
            {
              label: "Incident Metadata Mapping",
              icon: "",
              url: "./incidentmetadatamapping",
              children: [],
            },
          ],
        },
        {
          label: "Scripts",
          icon: "file-text",
          children: [
            {
              label: "Add Script",
              icon: "",
              url: "./createscript",
              children: [],
            },
            {
              label: "View Scripts",
              icon: "",
              url: "./monitorscript",
              children: [],
            },
            {
              label: "Execute Scripts",
              icon: "",
              url: "./executescript",
              children: [],
            },
            {
              label: "View Execution Status",
              icon: "",
              url: "./monitorscriptstatus",
              children: [],
            },
          ],
        },
        {
          label: "Repository",
          icon: "database",
          children: [
            {
              label: "Home",
              icon: "",
              url: "./external/AssetStore",
              children: [],
            },
            {
              label: "Search",
              icon: "",
              url: "./external/AssetStoreSearch",
              children: [],
            },
          ],
        },
        {
          label: "Cognitive Services",
          icon: "lightbulb-o",
          children: [
            {
              label: "Services",
              icon: "",
              url: "./external/CognitiveServices",
              children: [],
            },
            {
              label: "Use Cases",
              icon: "",
              url: "./external/CognitiveUseCases",
              children: [],
            },
          ],
        },
        {
          label: "Reports",
          icon: "pencil-square",
          children: [
            {
              label: "Logs",
              icon: "",
              url: "./downloadreport",
              children: [],
            },
            {
              label: "Other Reports",
              icon: "",
              url: "./otherlogs",
              children: [],
            },
          ],
        },
        {
          label: "Analytics",
          icon: "bar-chart",
          url: "./incidentinsights",
        },
        {
          label: "Downloads",
          icon: "download",
          children: [
            {
              label: "Packages",
              icon: "",
              url: "./downloadpackages",
              children: [],
            },
          ],
        },
        {
          label: "Help",
          icon: "question",
          children: [
            {
              label: "Training videos",
              icon: "",
              url: "./demovideos",
              children: [],
            },
            {
              label: "Documents",
              icon: "",
              url: "./trainingdocuments",
              children: [],
            },
          ],
        }
      );
    }

    //Bot Factory User
    else if (this.role.name == "Bot Developer") {
      this.sidebarMenu.splice(
        0,
        4,
        {
          label: "Dashboard",
          icon: "tachometer",
          url: "./dynamicDashboard/grid/OCC/3893",
        },
        {
          label: "My Workspace",
          icon: "briefcase",
          url: "./iamp-btf/entity/automation-work-flow",
        },
        {
          label: "SOP Store",
          icon: "tachometer",
          url: "./iamp-btf/SOP",
        },
        {
          label: "App Model Store",
          icon: "tachometer",
          url: "./iamp-btf/app-model",
        },
        {
          label: "Bot Store",
          icon: "cog",
          url: "./iamp-btf/entity/bot",
        },
        {
          label: "Build a Bot",
          icon: "cogs",
          url: "./iamp-btf/entity/automation-work-flow/BPMNnew",
        },
        {
          label: "Test a Bot",
          icon: "flask",
          url: "./iamp-btf/Testing",
        },
        {
          label: "Monitoring Dashboard",
          icon: "",
          url: "./iamp-btf/entity/monitoring-dashboard",
        }
      );
    }

    //Bot Factory Admin
    else if (this.role.name == "Bot Admin") {
      this.sidebarMenu.splice(
        0,
        4,
        {
          label: "Dashboard",
          icon: "tachometer",
          url: "./dynamicDashboard/grid/OCC/3893",
        },
        {
          label: "My Workspace",
          icon: "briefcase",
          url: "./iamp-btf/entity/automation-work-flow",
        },
        {
          label: "SOP Store",
          icon: "tachometer",
          url: "./iamp-btf/SOP",
        },
        {
          label: "App Model Store",
          icon: "tachometer",
          url: "./iamp-btf/app-model",
        },
        {
          label: "Bot Store",
          icon: "cog",
          url: "./iamp-btf/entity/bot",
        },
        {
          label: "Build a Bot",
          icon: "cogs",
          url: "./iamp-btf/entity/automation-work-flow/BPMNnew",
        },
        {
          label: "Test a Bot",
          icon: "flask",
          url: "./iamp-btf/Testing",
        },
        {
          label: "Monitoring Dashboard",
          icon: "",
          url: "./iamp-btf/entity/monitoring-dashboard",
        },
        {
          label: "Manage",
          icon: "tasks",
          children: [
            {
              label: "Configuration Dashboard",
              icon: "",
              url: "./iamp-btf/entity/config-screen",
              children: [],
            },
            {
              label: "Configuration Entry",
              icon: "",
              url: "./iamp-btf/entity/configuration-entry",
              children: [],
            },
            {
              label: "Event",
              icon: "",
              url: "./iamp-btf/entity/event",
              children: [],
            },
            {
              label: "Key Words",
              icon: "",
              url: "./iamp-btf/entity/key-words",
              children: [],
            },
            {
              label: "Schedule",
              icon: "",
              url: "./iamp-btf/entity/schedule",
              children: [],
            },
            {
              label: "Server",
              icon: "",
              url: "./iamp-btf/entity/server",
              children: [],
            },
            {
              label: "Technology",
              icon: "",
              url: "./iamp-btf/entity/technology",
              children: [
              ],
            },
            {
              label: "Workflow Params",
              icon: "",
              url: "./iamp-btf/entity/workflow-params",
              children: [
              ],
            },
          ],
        },
        {
          label: "Admin",
          icon: "users-cog",
          children: [
            {
              label: "API",
              icon: "",
              url: "./iamp-btf/admin/docs",
              children: [],
            },
            {
              label: "Monitor",
              icon: "",
              url: "./iamp-btf/Cockpit",
              children: [],
            },
            {
              label: "Bot Execution Audit Trails",
              icon: "",
              url: "./iamp-btf/entity/bot-execution-audit-trails",
              children: [],
            },
            {
              label: "Schedule Background Process",
              icon: "",
              url: "./iamp-btf/entity/bot-factory-scheduler",
              children: [],
            },
          ],
        }
      );
    }
    // transition manager
    else if (this.role.name == "Transition Manager") {
      this.sidebarMenu.splice(
        1,
        4,
        { label: "Due Diligience", icon: "file", url: "./iamp-twb/due-diligence" },
        {
          label: "Apps",
          icon: "desktop",
          children: [
            { label: "Wave", icon: "", url: "./iamp-twb/wave", children: [] },
            { label: "Cluster", icon: "", url: "./iamp-twb/cluster", children: [] },
            { label: "Application", icon: "", url: "./iamp-twb/application", children: [] },
          ],
        },
        { label: "KT Session", icon: "tasks", url: "./iamp-twb/create-transition-plan" },
        { label: "KT Calendar", icon: "calendar", url: "./iamp-twb/my-schedule" },
        { label: "Questionnaire", icon: "quora", url: "./iamp-twb/questionnaireList" },
        { label: "Documents", icon: "book", url: "./iamp-ccl/documents" },
        { label: "Switch Transition", icon: "exchange", url: "./iamp-twb/switch-transition" }
      );
    }

    // transtion engineer
    else if (this.role.name == "Transition Engineer") {
      this.sidebarMenu.splice(
        1,
        4,
        { label: "My Inbox", icon: "tasks", url: "./iamp-twb/my-inbox" },
        { label: "My Calendar", icon: "calendar", url: "./iamp-twb/my-schedule" },
        { label: "Switch Transition", icon: "exchange", url: "./iamp-twb/switch-transition" }
      );
    }

    // admin
    else if (this.role.name == "Admin") {
      this.sidebarMenu.splice(
        1,
        3,
        { label: "Project Management", icon: "file-powerpoint-o", url: "./iamp-usm/projectlist" },
        { label: "Role Management", icon: "registered", url: "./iamp-usm/role/list" },
        { label: "User Management", icon: "users", url: "./iamp-usm/manageUsers" },
        { label: "Portfolio Management", icon: "file-powerpoint-o", url: "./iamp-usm/portfoliolist" },
        { label: "Dashboard Mapping", icon: "desktop", url: "./dynamicDashboard/dashboardMapping" },
        { label: "Permission Management", icon: "shield", url: "./iamp-usm/permissionlist" },
        { label: "ICM Management", icon: "ticket", url: "./tickets/icmMapping" },
        {
          label: "CIP Management",
          icon: "tasks",
          children: [
            { label: "Core Datasource", icon: "", url: "./aibrain/coreDatasources", children: [] },
            { label: "Copy Datasets", icon: "", url: "./aibrain/copyDatasets", children: [] },
            { label: "Copy Pipelines", icon: "", url: "./aibrain/copyPipelines", children: [] },
            { label: "Groupings", icon: "files-tasks", url: "./aibrain/groupings", children: [] },
          ],
        },
        { label: "Mapping", icon: "map-signs", url: "./iamp-usm/dashconstant" }
      );
    }

    //Transition Lead
    else if (this.role.name == "Transition Lead") {
      this.sidebarMenu.splice(
        1,
        4,
        { label: "Mapping", icon: "map-signs", url: "./iamp-usm/dashconstant" },
        { label: "Documents", icon: "book", url: "./iamp-ccl/documents" },
        {
          label: "Tools",
          icon: "wrench",
          children: [
            { label: "Create", icon: "", url: "./iamp-ccl/mytools/create", children: [] },
            { label: "Search", icon: "", url: "./iamp-ccl/mytools", children: [] },
            { label: "", icon: "", children: [] },
          ],
        },
        { label: "Switch Transition", icon: "exchange", url: "./iamp-twb/switch-transition" }
      );
    }

    //Client Manager
    else if (this.role.name == "Client Manager") {
      let landingDash;
      try {
        landingDash = JSON.parse(sessionStorage.getItem("landingDash"));
      } catch (e) {
        console.error("JSON.parse error - ", e);
      }
      this.sidebarMenu.splice(0, 4, {
        label: "Dashboard",
        icon: "tachometer",
        url: "./cc/OCC/" + landingDash,
      });
    }

    // transition admin
    else if (this.role.name == "Transition Admin") {
      this.sidebarMenu.splice(1, 4, { label: "Transition", icon: "spinner", url: "./iamp-twb/transition" });
    }

    //BCC Admin
    else if (this.role.name == "BCC Admin") {
      this.sidebarMenu.splice(
        0,
        4,
        {
          label: "Dashboard",
          icon: "tachometer",
          url: "./cc/OCC/" + JSON.parse(sessionStorage.getItem("landingDash")),
        },
        {
          label: "AI Brain", icon: "ils",
          children: [
            { label: "Datasources", icon: "database", url: "./aibrain/datasources", children: [] },
            { label: "Analytics Pipelines", icon: "wpexplorer", url: "./aibrain/pipelines", children: [] },
            { label: "Agents", icon: "gg", url: "./aibrain/agents", children: [] },
            { label: "Data Marketplace", icon: "table", url: "./aibrain/datasets", children: [] },
            { label: "Model Marketplace", icon: "superpowers", url: "./aibrain/models", children: [] },
            { label: "Schemas", icon: "puzzle-piece", url: "./aibrain/schemas", children: [] },
            { label: "Events", icon: "calendar", url: "./aibrain/events", children: [] },
            { label: "Chain Jobs", icon: "link", url: "./aibrain/jobs/chain", children: [] },
            { label: "Scheduled Jobs", icon: "clock-o", url: "./aibrain/jobs/scheduled", children: [] },
            { label: "Logs", icon: "file-text-o", url: "./aibrain/jobs/logs", children: [] }
          ]
        },
        {
          label: "CI Management",
          icon: "desktop",
          children: [
            { label: "Configuration Item Type", icon: "", url: "./iamp-cfm/cType", children: [] },
            { label: "Configuration Item", icon: "", url: "./iamp-cfm/ci", children: [] },
            { label: "CI Mapping", icon: "", url: "./iamp-cfm/xwciMapping", children: [] },
            { label: "Metrics Master", icon: "", url: "./cc/metricsMaster", children: [] },
            { label: "CI Metrics Mapping", icon: "", url: "./cc/ciMetricsMapping", children: [] },
            { label: "CI Dashboard Mapping", icon: "", url: "./cc/ciDashMapping", children: [] },
          ],
        },
        {
          label: "SVG Management",
          icon: "picture-o",
          children: [
            { label: "SVG Upload", icon: "cloud-upload", url: "./iamp-cfm/upload-svg", children: [] },
            { label: "SVG Mapping", icon: "sitemap", url: "./iamp-cfm/svg-mapping", children: [] },
          ],
        }
      );
    }
    // bjm
    else if (this.role.name == "Batch Job Manager") {
      this.sidebarMenu.splice(
        0,
        5,
        {
          label: "Dashboard",
          icon: "tachometer",
          url: "./cc/OCC/" + JSON.parse(sessionStorage.getItem("landingDash")),
        },
        {
          label: "View Job Status",
          icon: "tasks",
          children: [
            { label: "Search Jobs", icon: "", url: "./iamp-bjm/job-list", children: [] },
            { label: "Search Job Groups", icon: "", url: "./iamp-bjm/jobInstanceGroup-list", children: [] },
            { label: "Search Job Instances", icon: "", url: "./iamp-bjm/jobInstance-list", children: [] },
          ],
        },
        {
          label: "Job Configuration",
          icon: "folder",
          children: [
            { label: "Config Group Dependency", icon: "", url: "./iamp-bjm/jiJigMapping-list", children: [] },
            { label: "Config Job Dependency", icon: "", url: "./iamp-bjm/jiJiMapping-list", children: [] },
          ],
        },
        {
          label: "DataSync",
          icon: "tasks",
          children: [
            { label: "Upload", icon: "", url: "./iamp-bjm/lib-upload-data", children: [] },
            { label: "Tivoli", icon: "", url: "./iamp-bjm/app-data-sync", children: [] },
          ],
        },
        {
          label: "AI Brain", icon: "ils",
          children: [
            { label: "Datasources", icon: "database", url: "./aibrain/datasources", children: [] },
            { label: "Analytics Pipelines", icon: "wpexplorer", url: "./aibrain/pipelines", children: [] },
            { label: "Agents", icon: "gg", url: "./aibrain/agents", children: [] },
            { label: "Data Marketplace", icon: "table", url: "./aibrain/datasets", children: [] },
            { label: "Model Marketplace", icon: "superpowers", url: "./aibrain/models", children: [] },
            { label: "Schemas", icon: "puzzle-piece", url: "./aibrain/schemas", children: [] },
            { label: "Events", icon: "calendar", url: "./aibrain/events", children: [] },
            { label: "Chain Jobs", icon: "link", url: "./aibrain/jobs/chain", children: [] },
            { label: "Scheduled Jobs", icon: "clock-o", url: "./aibrain/jobs/scheduled", children: [] },
            { label: "Logs", icon: "file-text-o", url: "./aibrain/jobs/logs", children: [] }
          ]
        }
      );
    } else if (this.role.roleadmin) {
      this.sidebarMenu.splice(
        1,
        3,
        { label: "Project Management", icon: "file-powerpoint-o", url: "./iamp-usm/projectlist" },
        { label: "Role Management", icon: "registered", url: "./iamp-usm/role/list" },
        { label: "User Management", icon: "users", url: "./iamp-usm/manageUsers" },
        { label: "Mapping", icon: "map-signs", url: "./iamp-usm/dashconstant" }
      );
    }
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
        result = result + str[i];
        v = false;
      }
    }

    return result;
  }

  homeToDash() {
    let dashconstant = new Object();
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      console.error("JSON.parse error - ", e);
    }
    dashconstant["project_id"] = new Object({ id: project.id });
    dashconstant["project_name"] = JSON.parse(sessionStorage.getItem("project")).name;
    let rolename = JSON.parse(sessionStorage.getItem("role")).name;
    dashconstant["keys"] = rolename + " Land";
    if (this.role.name == "Batch Job Manager") {
      this.apisService.findAllDashConstant(dashconstant, this.lazyloadevent).subscribe((res) => {
        this.route.navigate([res.content[0].value.slice(4)], { relativeTo: this.router });
      });
    }
  }

  routeToMlStudio() {
    this.route.navigate(["./home"]);
  }
  navigate(url) {
    this.route.navigate(["landing"]).then(() => {
      this.route.navigate([url], { relativeTo: this.router });
    });
  }

  goTo(module: string) {
    sessionStorage.removeItem("bccbreadcrumb");
    sessionStorage.removeItem("bccbreadcrumbdashid");
    sessionStorage.removeItem("Filter");
    sessionStorage.removeItem("WidgetLevelDefault");
    sessionStorage.removeItem("TopFilter");
    sessionStorage.removeItem("DateFilter");
    sessionStorage.removeItem("ConfiguartionItemId");
    sessionStorage.removeItem("CIList");
    sessionStorage.removeItem("drilldown");
    sessionStorage.removeItem("QuickRangeName");
    sessionStorage.removeItem("ciId");
    let url = window.location.href;
    if (!url.includes("cc")) {
      sessionStorage.removeItem("level2sidebar");
    }
    if (module == "./home") {
      module = "./home/icip";
    }
    // this.telemetryService.interact("click", module.split("/")[1], "sidebar navigation", module.split("/")[2]);
  }

  goToWb(url) {
    console.log("url", url);
    // this.route.navigate([url])
  }

  trackByMethod(index, item) { }
  checkDashConstantResponseForKeys(){
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      console.error("JSON.parse error - ", e);
    }

    let filteredRows: any;
    
    this.apisService.getDashConsts().subscribe((res) => {
      this.dashConstantCheckResponse = res;
    
    filteredRows = this.dashConstantCheckResponse
      .filter((item) => (item.keys == "SidebarBgColorType"));

    if (filteredRows && filteredRows.length > 0) {
        let projectValueData = "base";
        let coreValueData = "base";
        let projectValueFlag = "not present";
        let coreValueFlag = "not present";
        filteredRows.forEach((mapping) => {
          // Checking if mapping is present in current project
          if (mapping.project_id && mapping.project_id.name == project.name) {
            projectValueFlag = "present";
            projectValueData = mapping.value;
          }
          // checking if mapping is present for core project
          if (mapping.project_id && mapping.project_id.name == "Core") {
            coreValueFlag = "present";
            coreValueData = mapping.value;
          }
        });
        if (projectValueFlag == "present")
          this.sidebarType = projectValueData;
        else if (coreValueFlag == "present")
          this.sidebarType = coreValueData;
    } else {
      this.sidebarType = 'base';
    }

    if (this.sidebarType == 'base')
      this.bgColorType = 1;
    else if (this.sidebarType == "#8626C3")
      this.bgColorType = 2;
  });
  }

}
