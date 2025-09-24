import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  ViewContainerRef,
  AfterViewInit,
  createComponent,
} from "@angular/core";
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  NavigationError,
  NavigationCancel,
  ActivationEnd,
} from "@angular/router";
import * as _ from "lodash-es";
import { ApisService } from "../services/apis.service";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { Subscription, interval } from "rxjs";
import { MenuService } from "../services/menu.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DomSanitizer } from "@angular/platform-browser";
import { AppOAuthService } from "../core/auth.service";
import { InactivityPopupComponent } from "../popups/inactivity-popup/inactivity-popup.component";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { AppConfigService } from "../services/app-config.service";
import { MyProfileComponent } from "./my-profile/my-profile.component";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild("menuTrigger", { static: false })
  menuTrigger!: MatMenuTrigger;
  @ViewChild("drawerLeft", { static: true }) drawerLeft: any;
  @ViewChild("drawerRight", { static: true }) drawerRight: any;
  @ViewChild("drawer", { static: false })
  drawer!: MatSidenav;
  @ViewChild("tabsBox") tabsBox: any;
  @ViewChild("microAppContainer", { read: ViewContainerRef })
  microAppContainer!: ViewContainerRef;
  currentrole: any;
  breadcrumbs: string = "";
  temp: string = "";
  rows: any;
  displayDialog = false;
  notificationtotal: any;
  firstlevel: any;
  declaration = true;
  hidesidebar: any;
  portfolioName: any;
  projectvalue: any;
  seclevelhighlighted: string = "";
  sidebarbgcolor: boolean = false;
  sidebartextcolor: boolean = false;
  sidebarhighlightcolor: boolean = false;
  sidebarhovercolor: boolean = false;
  sidebartexticonhovercolor: boolean = false;
  sidebariconcolor: boolean = false;
  rowObj: any;
  isCheckboxChecked: boolean = false;
  dataset: string;
  datasetname: any;
  declarationResponse: any[][] = [];
  headericoncolor: string = "#ffffff";
  headericoncolorbool: boolean = false;
  headercolor: string = sessionStorage.getItem("theme") || "";
  iconsidebarrole: any;
  clientlogo: boolean = false;
  title: string = "";
  isDemoProject: boolean = false;
  alertPopupMessage: string = "This is a Demo project, Please contact Admin.";
  tempproject: any = JSON.parse(sessionStorage.getItem("project"));
  showPanel: boolean = false;
  showNotification: boolean = false;
  show_notification_icon_roles = false;
  private static hasExecuted: boolean = false;
  private static idleTimer: any = null;
  Configurableinformation: boolean = false;
  // doroute: boolean = false;
  // busy: Subscription;
  // dashconstantbreach: any[];
  showInactivityPopup: boolean = true;
  inactivityTimer: number = 300;
  inactivityPopupTimer: number = 120;
  chatbotConstantsKey: string = "icip.aip.chatbot";
  chatbotPositionKey: string = "icip.aip.chatPosition";
  aip_chatbot: any;
  booltemp: boolean = true;
  private static userLoggedOut: boolean = false;
  zoomFlag: boolean = false;
  viewdata: boolean;
  showChatBot: boolean = false;
  clicked: boolean = false;
  showProfileInfo = false;
  showUploadElements = false;
  uploading = false;
  checkDeclaration: boolean = true;
  userId = JSON.parse(sessionStorage.getItem("user")).user_login;
  processName: any;
  organization = sessionStorage.getItem("organization");
  role21 = JSON.parse(sessionStorage.getItem("role")).name;
  declarationId: string;
  content1: any;
  name = "";
  email = "";
  profileImage = "";
  isPresent = sessionStorage.getItem("showProfileIcon");
  chat_title: any;
  selectedInstance: any;
  iconPosition = { right: "10vh", bottom: "15vh" };
  cortexwindow: any;
  suggestionBackendUrl: any;
  backendUrl: any;
  appNameInput: any;
  cortex_chatbot: boolean;
  sidebarmaxwidth: any = "7vw";
  sidebarMenuTextSize: any = "0.7vw";
  sideMenuIconSize: any = "1.6vw";
  iconsidebarpadding: any = "1vmin";
  sidebarMenuHeight: any = "4.6vmin";
  sidebarItemMarginTop: any = "0.85vmin";
  sidebarTextLineHeight: any = "0.9vw";
  sidebarWidth: any = "4.5vw";
  sidebarBorderWidth: any = "0.9vmin";
  iconSideBarMarginLeft: any = "1vmin";
  iconSideBarMarginRight: any = "2vmin";
  iconSideBarMarginLeftForFa: any = "1vmin";
  headerHeight: any = "3.6vw";
  headerTextSize: any = "1vw";
  projectDetailsDropdown: any = "180px";
  detailsPopupHeight: any = "3.5vw";
  matOptionHeight: any = "3vw";
  popupMaxHeight: any = "20vw";
  screenWidth: number;
  offsetX = 0;
  offsetY = 0;
  essedum_title:string="ESSEDUM";

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    setTimeout(() => {
      this.checkForZoom();
      this.saveResolutionSizes();
      this.screenWidth = screen.width;
    }, 10);
  }

  @HostListener("document:click", ["$event"])
  documentClick(event: any) {
    if (event.target.id == "refreshbutton" && this.openedLeft == true) {
      this.toggleLeft();
    }
    if (event.target.children.length > 0) {
      for (let i = 0; i < event.target.children.length; i++) {
        if (event.target.children[i].id == "clientimage") {
          this.homeToDash();
          break;
        }
      }
    }
  }

  @HostListener("document:keydown", ["$event"])
  handleEscapeEvent(event: KeyboardEvent) {
    if (event.key === "Escape") this.apisService.cancelPendingRequests();
  }

  @HostListener("document:mousemove", ["$event"])
  @HostListener("document:keypress", ["$event"])
  resetInactivityTimer() {
    if (LandingComponent.idleTimer) {
      clearInterval(LandingComponent.idleTimer);
      this.startInactivityTimer(this.inactivityTimer);
    }
  }

  startInactivityTimer(time: number) {
    if (!LandingComponent.userLoggedOut && this.showInactivityPopup) {
      LandingComponent.idleTimer = setInterval(() => {
        if (time > 0) {
          time = time - 5;
        } else if (this.showInactivityPopup) {
          this.showPopup();
          clearInterval(LandingComponent.idleTimer);
        }
      }, 5000);
    }
  }

  showPopup() {
    const dialogRef = this.dialog.open(InactivityPopupComponent, {
      disableClose: true,
      data: { countDownTime: this.inactivityPopupTimer },
    });
    dialogRef.componentInstance.countdownCompletedEvent.subscribe(() => {
      LandingComponent.userLoggedOut = true;
      clearInterval(LandingComponent.idleTimer);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "keepAlive") {
        this.resetInactivityTimer();
      } else if (result === "logout") {
        this.logout();
      }
    });
  }

  @HostListener("window:unload")
  invalidateToken() {
    console.log("invalidate tokenn called");
    sessionStorage.setItem("needRouting", "true");
    let activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles"));
    /* if (event instanceof NavigationStart) {
       console.log("Refresh event")
       return false;
     }*/

    this.apisService.revoke().subscribe(() => {
      console.log("jwtToken revoked from backend");
    });
    if (activeProfiles.indexOf("oauth2") != -1)
      this.appOAuthService.browserRefresh();
    else localStorage.removeItem("jwtToken");
    //localStorage.clear();
    //sessionStorage.clear();
    return false;
  }

  getInactivityConstants(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apisService
        .getStartupConstants(["inactivityTimer", "inactivityPopupTimer"])
        .subscribe(
          (response) => {
            if (
              parseInt(response["inactivityTimer"]) > 119 &&
              typeof parseInt(response["inactivityTimer"]) == "number"
            ) {
              this.inactivityTimer = parseInt(response["inactivityTimer"]);
            }
            if (
              response["inactivityPopupTimer"] > 29 &&
              typeof parseInt(response["inactivityPopupTimer"]) == "number" &&
              response["inactivityPopupTimer"] < 599
            ) {
              this.inactivityPopupTimer = parseInt(
                response["inactivityPopupTimer"]
              );
            }
            if (sessionStorage.getItem("user")) {
              let parsedUser = JSON.parse(sessionStorage.getItem("user"));
              this.showInactivityPopup =
                parsedUser.isUiInactivityTracked == null
                  ? true
                  : parsedUser.isUiInactivityTracked;
            } else {
              this.showInactivityPopup = true;
            }
            resolve();
          },
          (error) => {
            console.error(error);
            reject(error);
          }
        );
    });
  }

  roleName: string = "";
  BotFactoryNotiData: any = [];
  count: number = 0;
  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: null,
  };
  openedLeft: boolean = false;
  openedRight: boolean = false;
  cybernextProj: boolean = true;
  portfolio = 0;
  idDataObject: any;
  parentChildObject: any;
  highlightedLabel = "";
  fetchroleflag = 0;
  valuechangeprojectflg = 0;
  selectedportfolio: any;
  portfoliodata: any = [];
  tempdata: any;
  pagegroupdata: any;
  processdata: any;
  bccbreadcrumbs: any;
  enablebreadcrumb = false;
  count1: any;
  roleList: any[] = [];
  projectList: any[] = [];
  totalTicket: number = 0;
  userprojectrole = [];
  backgroundcolor: boolean = false;
  portfolioflag = 0;
  user: any = new Object();
  role: any = new Object();
  selectedrole: any = new Object();
  selectedproject: any = new Object();
  toggle: boolean = false;
  currentDashboard: string = "";
  uname: any;
  username: any;
  umargin: boolean = false;
  sidebar: boolean = true;
  userProject: any = new Object();
  navLinks: any[] = [];
  menugroup: any = [];
  menugroupname: any = [];
  menudata: any = [];
  navhide: boolean = true;
  profileimage: any;
  enableTotalTickets: boolean = false;
  userDetails: any;
  projectname: string = "";
  projectimg: any;
  isimg = null;
  loadingRouteConfig: boolean = false;
  load: any;
  logout_status: boolean = true;
  profileCheck: boolean = false;
  demouserFlag: boolean = true;
  defaultprojectroles = [];
  notificationslength: String = "0";
  notifications = [];
  isExpanded = false;
  element?: HTMLElement;
  icon: boolean = true;
  routecount = false;
  sidebarSectionIndex: number = 0;
  notification: boolean = false;
  calendar: boolean = false;
  chatBot: boolean = false;
  showHeaderChatbotIcon = true;
  show_sidebar_full_text = false;
  showSidebarMenuList: boolean = false;
  sidebarMenuToggle: boolean = false;
  sidebarMenuPopupWidth = "130px";

  sidebarMenu: any = [
    { label: "Dashboard", icon: "tachometer", url: "./" },
    {
      label: "Configuration",
      icon: "map-signs",
      url: "./iamp-usm/dashconstant",
    },
  ];
  location = "";
  clickeditem: any;
  res: any;
  displaybreadcrumbs = false;
  appVersion: any = "3.2.0";
  yammerList = [];
  yammerNotifications: String = "0";
  yammer: any;
  yammerSubList = [];

  showchildren: boolean = false;
  tabs: any = [];
  selectedIndex = 0;
  subscription: Subscription = new Subscription();
  showSubHeader = false;
  subHeaderItems = [];
  showSidebarMenu: boolean = true;
  showPortfolioHeader: boolean = false;
  dashConstantCheckResponse: any;
  headerType: string = "base";
  bgColorType: number = 1;
  filterData: any;
  mfeRouteTitle: any;
  isSidebarLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apisService: ApisService,
    private modalService: NgbModal,
    private menuService: MenuService,
    private http: HttpClient,
    private titleService: Title,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private appOAuthService: AppOAuthService,
    private mfeappConfigSvc: AppConfigService // private messageService: MessageService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        var title =
          this.getTitle(this.router.routerState, this.router.routerState.root) +
          "";
        this.mfeRouteTitle = title;
        // console.log('title', title);
        if (title != undefined && title != "") {
          this.titleService.setTitle(title);
          this.title = title;
        } else {
          this.title = sessionStorage.getItem("title");
        }
      }
    });

    this.title = sessionStorage.getItem("mfetitle");
  }

  setHeaderTitleForIVMByProject() {
    if (this.mfeRouteTitle == undefined || this.mfeRouteTitle == "") {
      if (this.filterData && this.filterData.length != 0) {
        this.titleService.setTitle(this.filterData[0].value);
        this.title = this.filterData[0].value;
      }
    }
  }

  disabledLeftPanelItems = ["API Testing", "Performance Testing"];

  getTitle(state, parent) {
    var data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }
    if (state && parent) {
      data.push(...this.getTitle(state, state.firstChild(parent)));
    }
    let newArray = data.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    return newArray;
  }

  ngOnInit() {
    this.showSidebarMenuList = JSON.parse(
      sessionStorage.getItem("showSidebarMenuList") || "false"
    );
    this.sidebarMenuPopupWidth = this.showSidebarMenuList ? "130px" : "0px";
    this.sidebarmaxwidth = this.showSidebarMenuList ? "260px" : "7vw";
    this.getNotificationsPermision();
    this.Configurableinformationicon();
    this.screenWidth = screen.width;
    this.checkForZoom();
    this.checkForScreenResolution();
    this.router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        this.apisService.cancelPendingRequests();
      }
    });
    this.hidesidebar = sessionStorage.getItem("hidesidebar") || "";
    if ((this.temp = sessionStorage.getItem("sidebarbreadcrumb") || "")) {
      this.breadcrumbs = this.temp =
        sessionStorage.getItem("sidebarbreadcrumb") || "";
    }

    if (
      sessionStorage.getItem("appVersion") != undefined ||
      sessionStorage.getItem("appVersion") != ""
    ) {
      this.appVersion = sessionStorage.getItem("appVersion");
    }

    if (sessionStorage.getItem("enablebreadcrumb"))
      this.enablebreadcrumb = true;

    if (sessionStorage.getItem("isExpanded") === "true") this.isExpanded = true;

    if (sessionStorage.getItem("notification")) {
      try {
        this.notification = JSON.parse(
          sessionStorage.getItem("notification") || ""
        );
      } catch (error) {}
    }
    if (sessionStorage.getItem("calendar")) {
      try {
        this.calendar = JSON.parse(sessionStorage.getItem("calendar"));
      } catch (error) {}
    }
    if (sessionStorage.getItem("chatBot")) {
      try {
        this.chatBot = JSON.parse(sessionStorage.getItem("chatBot"));
      } catch (error) {}
    }
    if (sessionStorage.getItem("selectedIndex")) {
      this.selectedIndex = Number(sessionStorage.getItem("selectedIndex"));
    }
    if (sessionStorage.getItem("cybernext") == "true")
      this.cybernextProj = true;
    else this.cybernextProj = false;
    this.highlightedLabel = sessionStorage.getItem("highlightedLabel") || "";
    this.seclevelhighlighted =
      sessionStorage.getItem("SeclevelhighlightedLabel") || "";
    if (
      JSON.parse(sessionStorage.getItem("role") || "").name ==
      sessionStorage.getItem("sidebarSectionIndexrole")
    )
      this.sidebarSectionIndex = Number(
        sessionStorage.getItem("sidebarSectionIndex")
      );
    this.sidebarSectionIndex = 0;
    if (JSON.parse(sessionStorage.getItem("project") || "").theme != null) {
      sessionStorage.setItem(
        "theme",
        JSON.parse(sessionStorage.getItem("project") || "").theme
      );
    }
    this.sidebariconcolor = false;
    this.newsidebar();
    this.openedLeft = false;
    let activeProfiles;
    try {
      activeProfiles = JSON.parse(
        sessionStorage.getItem("activeProfiles") || ""
      );
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (
      activeProfiles.indexOf("msal") != -1 ||
      activeProfiles.indexOf("oauth2") != -1
    ) {
      this.logout_status = false;
    }
    let user;
    try {
      user = JSON.parse(sessionStorage.getItem("user") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    document.documentElement.style.setProperty(
      "--app-version",
      this.appVersion.replaceAll(".", ",")
    );
    this.startTelemetry();
    this.getContentResponse();
    this.setTheme();
    this.showLoader();
    this.headericoncolorbool = false;
    this.setProjectTheme();
    // check if the user has logged in
    if (this.fetchCredentials()) {
      this.router.navigate(["../login"], { relativeTo: this.route });
    } else {
      this.setportfolio();
      this.setHeaders();
      this.setSidebarToHeaders();
    }
    this.checkDisplaySidebar();
    this.getNotifications();
    if (
      sessionStorage.getItem("showPortfolioHeader") &&
      sessionStorage.getItem("showPortfolioHeader") == "true"
    ) {
      this.showPortfolioHeader = true;
      this.portfolioName = JSON.parse(
        sessionStorage.getItem("portfoliodata") || ""
      );
      this.projectvalue = JSON.parse(sessionStorage.getItem("project") || "");
    }
    this.route.queryParams.subscribe((params: any) => {
      if (params.pfolio && params.prjct && params.prole) {
        this.directNavigation(
          params.pfolio.valueOf(),
          params.prjct.valueOf(),
          params.prole.valueOf()
        );
      }
    });

    // this.doroute = false;
    if (
      localStorage.getItem("returnUrl") &&
      localStorage.getItem("returnUrl") != "/landing" &&
      sessionStorage.getItem("needRouting") == "true"
    ) {
      this.router.navigate(
        ["." + localStorage.getItem("returnUrl").split("landing")[1]],
        { relativeTo: this.route }
      );
      sessionStorage.removeItem("needRouting");
      // this.doroute = true;
    }

    let profiles;
    profiles = JSON.parse(sessionStorage.getItem("activeProfiles") || "");
    if (profiles.indexOf("oauth2") != -1) {
      this.profileCheck = false;
    } else {
      this.profileCheck = true;
    }
    this.checkDashConstantResponseForKeys();

    if (
      this.selectedrole.name == "BCC Admin" &&
      !this.router.url.includes("cc") &&
      !this.router.url.includes("cc/OCC") &&
      !this.router.url.includes("iamp-cfm") &&
      !this.router.url.includes("mapbcc") &&
      !this.router.url.includes("dynamicDashboard") &&
      !this.router.url.includes("iamp-usm")
    ) {
      this.landingroute();
    }
    this.getInactivityConstants().then(() => {
      if (!LandingComponent.hasExecuted && this.showInactivityPopup) {
        this.startInactivityTimer(this.inactivityTimer);
        LandingComponent.hasExecuted = true;
      }
    });
    this.AipChatbot();
    if (user.user_email == "demouser@infosys.com") {
      this.demouserFlag = false;
    }

    if (sessionStorage.getItem("sidebarmaxwidth")) {
      this.sidebarMenuPopupWidth = "130px";
      this.sidebarMenuToggle = true;
      this.show_sidebar_full_text = true;
      this.sidebarmaxwidth = "260px";
    }
  }

  landingroute() {
    let landing;
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    let config = 0;
    this.apisService.getDashConsts().subscribe((res) => {
      res = res.filter(
        (item) =>
          item.project_id.id == project.id &&
          item.project_name == project.name &&
          item.keys == this.selectedrole.name + " Land"
      );
      if (res.length > 0) {
        config = 1;
        this.router.navigate([res[0].value.slice(4)], {
          relativeTo: this.route,
        });
      }
    });
    if (config == 0) {
      let dashboard: any = new Object();
      dashboard.project = project;
      dashboard.landingdash = true;
      if (dashboard.project && dashboard.project?.logo) {
        dashboard.project.logo = null;
      }
      this.apisService
        .findAllDashboardConfiguration(dashboard, this.lazyloadevent)
        .subscribe(
          (res) => {
            landing = res.content[0];
          },
          (error) => {},
          () => {
            if (landing) {
              var dashconstant: any = new Object();
              let value;
              try {
                value = JSON.parse(sessionStorage.getItem("project"));
              } catch (e: any) {
                console.error("JSON.parse error - ", e.message);
              }
              dashconstant.project_id = value;
              dashconstant.project_name = value.name;
              dashconstant.keys = "BCC Theme";
              let flag = 0;
              sessionStorage.setItem("landingDash", JSON.stringify(landing.id));
              this.apisService.getDashConsts().subscribe((res) => {
                res = res.filter(
                  (item) =>
                    item.project_id.id == dashconstant.project_id.id &&
                    item.project_name == dashconstant.project_name &&
                    item.keys == dashconstant.keys
                );
                if (res.length > 0 && res[0].value == "Black") {
                  flag = 1;
                  this.router.navigate(["./cc/BCC/" + landing.id], {
                    relativeTo: this.route,
                  });
                }
                if (flag == 0) {
                  this.router.navigate(["./cc/OCC/" + landing.id], {
                    relativeTo: this.route,
                  });
                }
              });
            } else {
              this.router.navigate(["./dynamicDashboard/mapbcc"], {
                relativeTo: this.route,
              });
            }
          }
        );
    }
  }

  getHighlightValue() {
    try {
      let manualHighlightTabArray = JSON.parse(sessionStorage.getItem("tabs"));
      let currentRouteUrl = "." + window.location.href.split("landing")[1];
      let routeUrlValues = manualHighlightTabArray.children.filter(
        (item) => item.url == currentRouteUrl
      );
      let urlValueAndLabel = manualHighlightTabArray.children.filter((item) => {
        if (item.url == currentRouteUrl) {
          return item.label;
        }
      });
      if (routeUrlValues.length == 1) {
        if (urlValueAndLabel[0].url == currentRouteUrl) {
          sessionStorage.setItem(
            "SeclevelhighlightedLabel",
            urlValueAndLabel[0].label
          );
          sessionStorage.setItem(
            "sidebarbreadcrumb",
            manualHighlightTabArray.label + " >> " + urlValueAndLabel[0].label
          );
        }
      } else if (routeUrlValues.length == 0) {
        if (currentRouteUrl.includes("./ivm/home/ams/survey")) {
          // console.log("in else part of route");
          sessionStorage.setItem(
            "SeclevelhighlightedLabel",
            "Maturity Assessment"
          );
          sessionStorage.setItem(
            "sidebarbreadcrumb",
            "AMS >> Maturity Assessment"
          );
        }
      }
    } catch (error) {}
  }

  startTelemetry() {
    // this.telemetryService.start();
  }

  cleanSVG(icon) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(icon as string);
  }

  setTheme() {
    // set the selected font family and color across the application
    document.documentElement.style.setProperty(
      "--base-color",
      sessionStorage.getItem("theme")
    );
    let theme = sessionStorage.getItem("theme");
    document.documentElement.style.setProperty("--mdc-theme-primary", theme);
    localStorage.setItem("themecolor", theme || "");
    document.documentElement.style.setProperty(
      "--font-type",
      sessionStorage.getItem("font")
    );
    document.documentElement.style.setProperty(
      "--header-color",
      sessionStorage.getItem("theme")
    );
    document.documentElement.style.setProperty("--contain-color", "#ffffff");
    document.documentElement.style.setProperty("--bg-color", "#ffffff");
    document.documentElement.style.setProperty("--bg-sidebar-color", "#EAF1F7");
    if (sessionStorage.getItem("bccbackgroundcolour") == null) {
      document.documentElement.style.setProperty(
        "--outline-colour",
        sessionStorage.getItem("theme")
      );
      if (sessionStorage.getItem("blackLayoutEnabled") == "true") {
        document.documentElement.style.setProperty(
          "--background-colour",
          "#000000"
        );
      } else {
        document.documentElement.style.setProperty(
          "--background-colour",
          "#ffffff"
        );
      }
    }
    document.documentElement.style.setProperty("--text-color", "#000000");
    document.documentElement.style.setProperty("--launch-color", "grey");
    // to set project logo
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
      this.isimg = project.logo;
      this.projectimg = "data:image/png;base64," + project.logo;
      this.projectname = project.name;
      this.backgroundcolor = true;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (sessionStorage.getItem("clientLogo") == "true") {
      this.clientlogo = true;
    }
  }

  setHeaders() {
    // set currently logged in user initial and organisation in header & session storage
    this.uname =
      this.user.user_f_name.charAt(0) +
      (this.user.user_l_name ? this.user.user_l_name.charAt(0) : "");
    let organization;
    try {
      organization = JSON.parse(sessionStorage.getItem("project") || "").name;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    localStorage.setItem("organization", organization);
    sessionStorage.setItem("organization", organization);

    // set user profile image
    if (this.user && this.user.profileImage)
      this.profileimage = "data:image/png;base64," + this.user.profileImage;
    else this.profileimage = null;

    // set margin of user profile image
    if (JSON.parse(sessionStorage.getItem("user") || "").user_l_name == null) {
      this.umargin = true;
    } else {
      this.umargin = false;
    }
  }

  showLoader() {
    // show loader for lazily loaded modules
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingRouteConfig = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationError ||
        event instanceof NavigationCancel
      ) {
        this.loadingRouteConfig = false;
      }
    });
    this.router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.loadingRouteConfig = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouteConfig = false;
      }
    });
  }

  // set active portfolio based on project and role
  setportfolio() {
    this.portfoliodata = [];
    this.apisService.getUserInfoData().subscribe((pageResponse) => {
      this.processdata = pageResponse["porfolios"];
      //sessionStorage.setItem("processdata", JSON.stringify(this.processdata))
      pageResponse["porfolios"].forEach((data: any) => {
        this.portfoliodata.push(data.porfolioId);
        if (this.portfoliodata.length > 0) {
          this.selectedportfolio = this.portfoliodata[0];
          let portfoliodata;
          try {
            portfoliodata = JSON.stringify(this.selectedportfolio);
          } catch (e: any) {
            console.error("JSON.stringify error - ", e.message);
          }
          sessionStorage.setItem("portfoliodata", portfoliodata || "");
          this.portfolio = this.portfoliodata[0].id;
          try {
            if (sessionStorage.getItem("tempdata")) {
              this.selectedportfolio = JSON.parse(
                sessionStorage.getItem("tempdata") || ""
              );
              sessionStorage.setItem(
                "portfoliodata",
                JSON.stringify(this.selectedportfolio)
              );
              this.portfolio = this.selectedportfolio.id;
              sessionStorage.setItem(
                "portfoliodata",
                JSON.stringify(this.selectedportfolio)
              );
            }
          } catch (error) {}
        }
      });
      this.portfoliodata = this.portfoliodata.sort((a: any, b: any) =>
        a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
      );
      this.fetchRolesforUser();
      if (this.portfoliodata.length > 0) {
        this.portfolio = this.portfoliodata[0].id;
      }
    });
  }

  clearonlanding() {
    sessionStorage.setItem("highlightedLabel", "");
    sessionStorage.removeItem("tabs");
  }
  homeToDash() {
    try {
      let dashconstant: any = new Object();
      let value;
      value = JSON.parse(sessionStorage.getItem("project") || "").id;
      dashconstant["project_id"] = new Object({ id: value });
      dashconstant["project_name"] = JSON.parse(
        sessionStorage.getItem("project") || ""
      ).name;
      let rolename = JSON.parse(sessionStorage.getItem("role") || "").name;
      dashconstant["keys"] = rolename + " Land";
      if (this.role.name == "Batch Job Manager") {
        this.apisService.getDashConsts().subscribe((res) => {
          let project: any;
          project = JSON.parse(sessionStorage.getItem("project") || "").id;
          res = res.filter(
            (item) =>
              item.project_id.id == project &&
              item.project_name ==
                JSON.parse(sessionStorage.getItem("project") || "").name &&
              item.keys ==
                JSON.parse(sessionStorage.getItem("role") || "").name + " Land"
          );
          this.router.navigate([res[0].value.slice(4)], {
            relativeTo: this.route,
          });
        });
      }
      this.apisService.getDashConsts().subscribe((res) => {
        this.router.navigate(["./"], { relativeTo: this.route });
      });
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
  }

  FirstLetterWord(str: any) {
    let result = "";
    let v = true;
    for (let i = 0; i < str.length; i++) {
      if (str[i] == " ") v = true;
      else if (str[i] != " " && v == true) {
        result = result + str[i];
        v = false;
      }
    }
    return result;
  }

  viewtabsonload() {
    sessionStorage.setItem("viewtabs", "true");
  }

  onSelection(data: any) {
    this.booltemp = false;
    this.apisService.fetchConst = false;
    if (sessionStorage.getItem("portfoliodata") || "") {
      let curportfolio = JSON.parse(
        sessionStorage.getItem("portfoliodata") || ""
      ).portfolioName;
      if (curportfolio == "Core" && this.selectedportfolio != "Core") {
        sessionStorage.setItem("FetchDashConstant", "true");
      } else sessionStorage.removeItem("FetchDashConstant");
    }
    sessionStorage.removeItem("hidesidebar");
    sessionStorage.removeItem("tabs");
    this.removeFilters();
    sessionStorage.removeItem("viewtabs");
    sessionStorage.removeItem("tabs");
    sessionStorage.removeItem("selectedIndex");
    sessionStorage.removeItem("sidebarbreadcrumb");    
    sessionStorage.removeItem("highlightedLabel");
    sessionStorage.removeItem("sidebarConfig");
    
    // Set portfolio change flag with timestamp to ensure it's recognized as a new change
    sessionStorage.setItem("selectionChange", "portfolio-" + new Date().getTime());
    this.portfolioflag = 1;
    try {
      this.tempdata = JSON.stringify(data);
      sessionStorage.setItem("tempdata", this.tempdata);
      this.selectedportfolio = data;
      sessionStorage.setItem(
        "portfoliodata",
        JSON.stringify(this.selectedportfolio)
      );
      this.fetchRolesforUser();
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    sessionStorage.removeItem("sidebarConfig");
  }

  fetchCredentials(): boolean {
    try {
      this.user = JSON.parse(sessionStorage.getItem("user") || "");
      this.role = JSON.parse(sessionStorage.getItem("role") || "");
      this.selectedrole = this.role;
      this.selectedproject = JSON.parse(
        sessionStorage.getItem("project") || ""
      );
      if (
        this.user == null ||
        this.role == null ||
        this.selectedproject == null
      ) {
        return true;
      } else {
        return false;
      }
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
      return false;
    }
  }

  logout() {
    let user;
    user = JSON.parse(sessionStorage.getItem("user") || "");
    if (sessionStorage.getItem("telemetry") == "true") {
      // this.telemetryService.audit(user, "LOG OUT");
    }
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("project");
    localStorage.removeItem("organization");
    sessionStorage.removeItem("tempdata");
    sessionStorage.removeItem("sidebarbreadcrumb");
    this.router.navigate(["../logout"]);
  }
  setHighlightedLabel(item: any) {
    // this.isExpanded = false;
    // if (item.horizontal) {
    this.highlightedLabel = item.label;
    sessionStorage.setItem("highlightedLabel", this.highlightedLabel);
    // }
  }

  click(event: any, item: any) {
    if (item == this.sidebarSectionIndex) {
      this.sidebarSectionIndex = 0;
    } else {
      this.sidebarSectionIndex = item;
    }
    sessionStorage.setItem(
      "sidebarSectionIndex",
      "" + this.sidebarSectionIndex
    );
    try {
      sessionStorage.setItem(
        "sidebarSectionIndexrole",
        JSON.parse(sessionStorage.getItem("role") || "").name
      );
    } catch (error) {}
    sessionStorage.removeItem("FromFailure");
  }

  resetPassword() {
    try {
      let useremail = window.btoa(
        JSON.parse(sessionStorage.getItem("user") || "").user_email
      );
      this.router.navigate(["../resetpassword/" + useremail], {
        relativeTo: this.route,
      });
    } catch (error) {}
  }

  toggleActive(event: any, label: any, parentLabel = undefined) {
    sessionStorage.removeItem("Scrollleft");
    if (parentLabel) this.breadcrumbs = parentLabel + " >> " + label;
    else this.breadcrumbs = label;
    sessionStorage.setItem("sidebarbreadcrumb", this.breadcrumbs);
    sessionStorage.removeItem("tabs");
    event.preventDefault();
    this.highlightedLabel = label;
    sessionStorage.setItem("highlightedLabel", this.highlightedLabel);
    // Set flag to indicate user is actively navigating to a route
    sessionStorage.setItem("navigatingToRoute", "true");
    if (this.element !== undefined) {
      this.element.style.backgroundColor = "white";
    }
    var target = event.currentTarget;
    this.element = target;
    sessionStorage.removeItem("selectedIndex");
    sessionStorage.setItem("CacheDashConstant", "true");
    this.removeFilters();
  }
  cleartabs() {
    sessionStorage.removeItem("bccbreadcrumbdashid");
    sessionStorage.removeItem("bccbreadcrumb");
    this.removeFilters();
    this.tabs = [];
  }

  checkAndOpenExtLink(url: any) {
    window.open(url, "_blank");
  }

  toggleLeft() {
    this.openedLeft = !this.openedLeft;
    if (this.openedRight) {
      this.drawerLeft.toggle();
      this.openedRight = !this.openedRight;
      this.drawerRight.toggle();
    } else this.drawerLeft.toggle();
  }

  fetchRolesforUser() {
    this.projectList = [];
    this.roleList = [];
    //this.processdata = JSON.parse(sessionStorage.getItem("processdata"))
    try {
      this.portfolio = JSON.parse(
        sessionStorage.getItem("portfoliodata") || ""
      ).id;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    let userprojectrole: any = new Object();
    userprojectrole.user_id = JSON.parse(sessionStorage.getItem("user") || "");
    this.checkDefaultProject();
  }

  valuechangerole(event: any) {
    this.portfolioflag = 0;
    /* remove session related params for dashboard*/
    sessionStorage.removeItem("drilldown");
    this.removeFilters();
    sessionStorage.removeItem("viewtabs");
    sessionStorage.removeItem("sidebarbreadcrumb");
    sessionStorage.removeItem("highlightedLabel");
    sessionStorage.removeItem("sidebarSectionIndexrole");
    sessionStorage.removeItem("UserDetails");
    sessionStorage.removeItem("tabs");
    sessionStorage.removeItem("selectedIndex");
    
    // Set flag to indicate role has been changed - this will be used to trigger appropriate navigation
    sessionStorage.setItem("roleChanged", "true");
    let events;
    try {
      events = JSON.stringify(event);
      sessionStorage.setItem("role", events);
      localStorage.setItem(
        "organization",
        JSON.parse(sessionStorage.getItem("project") || "").name
      );
      sessionStorage.setItem(
        "organization",
        JSON.parse(sessionStorage.getItem("project") || "").name
      );
      sessionStorage.setItem("rolechange", "true");
      this.selectedrole = JSON.parse(sessionStorage.getItem("role") || "");
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    this.apisService.getPermission("cip").subscribe(
      (resp) => {
        sessionStorage.setItem(
          "cipAuthority",
          JSON.parse(resp).map((p) => p.permission)
        );
      },
      (err) => {},
      () => {
        let nav = this.route.snapshot["_routerState"].url.toString();
        let navUrl = nav.slice(0, nav.indexOf("pfolio"));


        // Check if user is admin and direct to portfoliolist
        if (this.selectedrole.name === "admin" || this.selectedrole.name === "Admin") {
          this.router
            .navigate(["../"], { relativeTo: this.route })
            .then(() => this.router.navigate(["landing/iamp-usm/portfoliolist"]));
        } else if (nav.toString().indexOf("pfolio") != -1) {
          this.router
            .navigate(["../"], { relativeTo: this.route })
            .then(() => this.router.navigateByUrl(navUrl));
        } else {
          // Check if role is not admin and not IT portfolio manager
          if (this.selectedrole.name.toLowerCase() !== "admin" &&
              this.selectedrole.name.toLowerCase() !== "it portfolio manager") {
            if(this.sidebarMenu && this.sidebarMenu.length > 0 && this.sidebarMenu[0].url && 
               this.sidebarMenu[0].url.includes('./') && this.sidebarMenu[0].url.length > 2){
                let filterUrl = this.sidebarMenu[0].url.replace('./', '');
                this.router.navigate(["/landing/" + filterUrl]);            
            } else {
                this.router
                  .navigate(["../"], { relativeTo: this.route })
                  .then(() => this.router.navigate(["landing"]));
            }
         } else {
            this.router
              .navigate(["../"], { relativeTo: this.route })
              .then(() => this.router.navigate(["landing"]));
          }
        }
      }
    );
  }

  valuechangeproject(event: any) {
    this.selectedproject = new Object(event);
    let events;
    try {
      events = JSON.stringify(event);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    sessionStorage.setItem("project", events || "");
    // dynamic them update based on project
    let theme;

    try {
      theme = JSON.parse(sessionStorage.getItem("project") || "").theme;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (theme == null)
      sessionStorage.setItem(
        "theme",
        sessionStorage.getItem("defaultTheme") || ""
      );
    else sessionStorage.setItem("theme", theme);
    if (this.fetchroleflag == 0) {
      this.fetchRolesforUser();
    } else this.fetchroleflag = 1;
    this.checkDefaultRole();
  }

  valuechangeproject1(event: any) {
    this.apisService.fetchConst = false;
    sessionStorage.removeItem("hidesidebar");
    sessionStorage.removeItem("tabs");
    this.removeFilters();
    sessionStorage.removeItem("viewtabs");
    sessionStorage.removeItem("sidebarbreadcrumb");
    sessionStorage.removeItem("selectedIndex");
    sessionStorage.removeItem("highlightedLabel");
    sessionStorage.removeItem("sidebarSectionIndexrole");
    
    // Set project change flag with timestamp to ensure it's recognized as a new change
    sessionStorage.setItem("selectionChange", "project-" + new Date().getTime());
    this.valuechangeprojectflg = 1;
    this.selectedproject = new Object(event);
    let events;
    try {
      events = JSON.stringify(event);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    sessionStorage.setItem("project", events || "");

    // dynamic them update based on project
    let theme;

    try {
      theme = JSON.parse(sessionStorage.getItem("project") || "").theme;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (theme == null)
      sessionStorage.setItem(
        "theme",
        sessionStorage.getItem("defaultTheme") || ""
      );
    else sessionStorage.setItem("theme", theme);

    this.checkRole();
    this.apisService.getDashConsts().subscribe(() => this.fetchRolesforUser());
    // this.fetchRolesforUser();
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  checkDefaultRole() {
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    this.apisService.getDashConsts().subscribe((response) => {
      let name = this.selectedportfolio.portfolioName + "default";
      response = response.filter((item) => item.keys && item.keys == name);
      let value: any = this.defaultprojectroles.filter(
        (item: any) => item.project == project.id
      );
      let defaultroleindex = -1;
      if (value.length > 0) {
        let defaultrole = value[0].role;
        defaultroleindex = _.findIndex(this.roleList, (r) => {
          return r.id == defaultrole;
        });
      }
      let role: any;
      try {
        role = JSON.parse(sessionStorage.getItem("role") || "");
      } catch (e: any) {
        console.error("JSON.parse error - ", e.message);
      }
      let idx = _.findIndex(this.roleList, (r) => {
        return r.name == role.name;
      });
      if (defaultroleindex != -1) {
        this.valuechangerole(this.roleList[defaultroleindex]);
      } else {
        if (idx != -1) this.valuechangerole(this.roleList[idx]);
        else this.valuechangerole(this.roleList[0]);
      }
    });
  }
  chkdefrol() {
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    let value: any = this.defaultprojectroles.filter(
      (item: any) => item.project == project.id
    );
    let defaultroleindex = -1;
    if (value.length > 0) {
      let defaultrole = value[0].role;
      defaultroleindex = _.findIndex(this.roleList, (r) => {
        return r.id == defaultrole;
      });
    }
    let role: any;
    try {
      role = JSON.parse(sessionStorage.getItem("role") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    let idx = _.findIndex(this.roleList, (r) => {
      return r.name == role.name;
    });
    if (defaultroleindex != -1) {
      this.valuechangerole(this.roleList[defaultroleindex]);
    } else {
      if (idx != -1) this.valuechangerole(this.roleList[idx]);
      else this.valuechangerole(this.roleList[0]);
    }
  }
  checkDefaultRole1() {
    let project: any;
    let x = 0;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    let pname = project.name;
    this.apisService.getDashConsts().subscribe((response) => {
      response = response.filter(
        (item) => item.keys && item.keys == pname + "prodefaultrole"
      );
      if (response.length > 0) {
        let rolll = JSON.parse(response[0].value).defaultprojectroles.role;
        let value: any = this.defaultprojectroles.filter(
          (item: any) => item.project == project.id
        );
        let defaultroleindex = -1;
        if (value.length > 0) {
          let defaultrole = value[0].role;
          defaultroleindex = _.findIndex(this.roleList, (r) => {
            return r.id == defaultrole;
          });
        }
        let role: any;
        try {
          role = rolll;
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        let idx = _.findIndex(this.roleList, (r) => {
          if (r.id == rolll) {
            return r.name;
          }
        });
        if (defaultroleindex != -1)
          this.valuechangerole(this.roleList[defaultroleindex]);
        else {
          if (idx != -1) this.valuechangerole(this.roleList[idx]);
          else this.valuechangerole(this.roleList[0]);
        }
      } else {
        this.chkdefrol();
      }
    });
  }

  checkDefaultProject() {
    let dashconstant: any = new Object();
    dashconstant.keys = this.selectedportfolio.portfolioName + "default";
    let flag1 = 0;
    let projectindex = 0;
    this.defaultprojectroles = [];
    this.apisService
      .findAllDashConstant(dashconstant, this.lazyloadevent)
      .subscribe((res) => {
        let response = res.content;
        response = response.filter(
          (item) =>
            item.keys &&
            item.keys == this.selectedportfolio.portfolioName + "default"
        );
        if (response && response.length > 0) {
          let value;
          try {
            value = JSON.parse(response[0].value);
          } catch (e: any) {
            console.error("JSON.parse error - ", e.message);
          }
          this.defaultprojectroles = value["defaultprojectroles"];

          let defaultproject: any;
          if (sessionStorage.getItem("selectionChange") == "project")
            defaultproject = null;
          else defaultproject = value["defaultproject"];
          if (defaultproject) {
            this.processdata.forEach((element1: any) => {
              let porfolioId;
              try {
                porfolioId = JSON.parse(
                  sessionStorage.getItem("portfoliodata") || ""
                );
              } catch (e: any) {
                console.error("JSON.parse error - ", e.message);
              }
              if (element1.porfolioId.id == porfolioId.id) {
                element1.projectWithRoles.forEach(
                  (element: any, index: any) => {
                    if (element.projectId.id == defaultproject) {
                      flag1 = 1;
                      projectindex = index;
                      let project;
                      try {
                        project = JSON.stringify(
                          element1.projectWithRoles[projectindex].projectId
                        );
                      } catch (e: any) {
                        console.error("JSON.stringify error - ", e.message);
                      }
                      sessionStorage.setItem("project", project || "");
                      // dynamic them update based on project
                      let theme;

                      try {
                        theme = JSON.parse(
                          sessionStorage.getItem("project") || ""
                        ).theme;
                      } catch (e: any) {
                        console.error("JSON.parse error - ", e.message);
                      }
                      if (theme == null)
                        sessionStorage.setItem(
                          "theme",
                          sessionStorage.getItem("defaultTheme") || ""
                        );
                      else sessionStorage.setItem("theme", theme);
                    }
                  }
                );
              }
            });
          }
        }
        this.getRole();
      });
  }
  getRole() {
    let projectflag = 0;

    let count = 0;
    let dashconstant: any = new Object();
    dashconstant.keys = this.selectedportfolio.portfolioName + "default";
    this.processdata.forEach((element: any) => {
      let portfolio;
      try {
        portfolio = JSON.parse(
          sessionStorage.getItem("portfoliodata") || ""
        ).id;
      } catch (e: any) {
        console.error("JSON.parse error - ", e.message);
      }
      if (element.porfolioId.id == portfolio) {
        element.projectWithRoles.forEach((element1: any) => {
          this.projectList.push(element1.projectId);
          let value;
          try {
            value = JSON.parse(sessionStorage.getItem("project") || "");
          } catch (e: any) {
            console.error("JSON.parse error - ", e.message);
          }
          this.selectedproject = value;
          if (element1.projectId.name == this.selectedproject.name)
            projectflag = 1;
        });
        this.projectList = this.projectList.sort((a, b) =>
          a.projectdisplayname.toLowerCase() >
          b.projectdisplayname.toLowerCase()
            ? 1
            : -1
        );
      }
    });
    let selectedproject;
    this.projectList = this.projectList.filter(
      (arr, index, self) => index === self.findIndex((t) => t.name === arr.name)
    );
    if (this.booltemp == false) {
      this.apisService
        .findAllDashConstant(dashconstant, this.lazyloadevent)
        .subscribe((res) => {
          if (res.totalElements > 0) {
            for (let i = 0; i < this.projectList.length; i++) {
              if (this.projectList[i].name == res.content[0].project_name) {
                selectedproject = JSON.stringify(this.projectList[i]);
                sessionStorage.setItem("project", selectedproject || "");
              }
            }
            this.getrolepage();
          } else {
            if (this.projectList.length > 0 && projectflag == 0) {
              this.selectedproject = this.projectList[0];
            }
            try {
              selectedproject = JSON.stringify(this.selectedproject);
            } catch (e: any) {
              console.error("JSON.stringify error - ", e.message);
            }
            sessionStorage.setItem("project", selectedproject || "");
            this.getrolepage();
          }
        });
    } else {
      if (this.projectList.length > 0 && projectflag == 0) {
        this.selectedproject = this.projectList[0];
      }
      try {
        selectedproject = JSON.stringify(this.selectedproject);
      } catch (e: any) {
        console.error("JSON.stringify error - ", e.message);
      }
      sessionStorage.setItem("project", selectedproject || "");
      this.getrolepage();
    }
  }
  getrolepage() {
    let selectedproject1 = JSON.parse(sessionStorage.getItem("project"));
    let projectflag = 0;

    let count = 0;
    let theme;

    try {
      theme = JSON.parse(sessionStorage.getItem("project") || "").theme;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (theme == null)
      sessionStorage.setItem(
        "theme",
        sessionStorage.getItem("defaultTheme") || ""
      );
    else sessionStorage.setItem("theme", theme);
    this.setTheme();
    this.checkRole();
    this.apisService.getDashConsts().subscribe((response) => {
      //  this.getNotifications();
      response = response.filter(
        (item) =>
          item.keys &&
          item.keys == this.selectedportfolio.portfolioName + "default"
      );
      if (response && response.length > 0) {
        let value;
        try {
          value = JSON.parse(response[0].value);
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        this.defaultprojectroles = value["defaultprojectroles"];
      }

      this.processdata.forEach((element: any) => {
        let portfoliodata;
        try {
          portfoliodata = JSON.parse(
            sessionStorage.getItem("portfoliodata") || ""
          ).id;
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        if (element.porfolioId.id == portfoliodata) {
          element.projectWithRoles.forEach((element1: any) => {
            this.count1 = element1.length;
            count = count + 1;
            if (element1.projectId.id == selectedproject1.id) {
              element1.roleId.forEach((element2: any) => {
                if (element2.id == this.defaultprojectroles[0]?.role) {
                  this.roleList.unshift(element2);
                } else {
                  this.roleList.push(element2);
                  if (element2.name == this.selectedrole.name) projectflag = 1;
                }
              });
              let role;
              try {
                role = JSON.stringify(this.roleList[0]);
              } catch (e: any) {
                console.error("JSON.stringify error - ", e.message);
              }

              if (this.portfolioflag == 1) sessionStorage.setItem("role", role);
              this.selectedrole = JSON.parse(sessionStorage.getItem("role"));
              this.roleList = this.roleList.sort((a, b) =>
                a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
              );

              if (this.defaultprojectroles.length == 0) {
                this.roleList = this.roleList.sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
                );
                let role;
                try {
                  role = JSON.stringify(this.roleList[0]);
                } catch (e: any) {
                  console.error("JSON.stringify error - ", e.message);
                }
                if (this.portfolioflag == 1)
                  sessionStorage.setItem("role", role || "");
                this.selectedrole = JSON.parse(
                  sessionStorage.getItem("role") || ""
                );
              }
            }
          });
        }
      });
      if (this.portfolioflag == 1) {
        if (this.projectList.length > 0) {
          this.fetchroleflag = 1;
          this.valuechangeproject(selectedproject1);
          this.portfolioflag = 0;
        }
      }
      if (this.valuechangeprojectflg == 1) {
        this.valuechangeprojectflg = 0;
        this.checkDefaultRole1();
      }
    });
  }
  getSession() {
    console.log("getSession:", sessionStorage);
    if (sessionStorage.getItem("UpdatedUser")) {
      this.setportfolio();
      sessionStorage.removeItem("UpdatedUser");
    }
  }
  notifyLink(notify: any) {
    notify.readFlag = true;
    notify.userId = this.user.id;
    this.apisService.updateNotification(notify).subscribe((res: any) => {
      this.getNotifications();
    });
    if (notify.source.includes("http")) window.open(notify.source);
    else this.router.navigate([notify.source], { relativeTo: this.route });
  }
  getNotificationsMessage(notify: any) {
    if (this.notificationtotal && this.notificationtotal.value == "true") {
      return "(" + notify.count + ")" + notify.message;
    } else return notify.message;
  }
  getNotificationsDate(notify: any) {
    return notify.dateTime * 1000;
  }

  getNotifications() {
    this.destroySubscription();
    this.roleName = JSON.parse(sessionStorage.getItem("role") || "").name;
    let dashconstant: any = new Object();
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    dashconstant["project_id"] = new Object({ id: project.id });
    dashconstant["project_name"] = JSON.parse(
      sessionStorage.getItem("project") || ""
    ).name;
    dashconstant["keys"] = "notification timeout";
    this.apisService.getDashConsts().subscribe((response) => {
      let notificationtimeoutset = response.find(
        (item) => item.keys == "notification timeout"
      );
      this.notificationtotal = response.find(
        (item) => item.keys == "show duplicate notification count"
      );
      let roleId = JSON.parse(sessionStorage.getItem("role") || "").id;
      let username = JSON.parse(sessionStorage.getItem("user")).id;
      let notify: any = new Object();
      notify.readFlag = false;
      notify.userId = this.user.id;
      notify.roleId = roleId;
      this.apisService
        .findAllNotifications(notify, this.lazyloadevent)
        .subscribe((res: any) => {
          res.content = res.content.filter(
            (ele) => ele.userId == null || ele.userId.toLowerCase() == username
          );
          if (notificationtimeoutset && notificationtimeoutset.value) {
            let notificationRefresh = notificationtimeoutset.value;
            this.notifications = res.content;
            this.notificationslength = res.content.length.toString();
            this.setNotificationSeverity();
            this.subscription = interval(Number(notificationRefresh) * 1000)
              // .takeWhile(() => notificationRefresh)
              .subscribe((value) => {
                this.getNotifications();
              });
          } else {
            this.notificationslength = res.content.length.toString();
            this.notifications = res.content;
            this.setNotificationSeverity();
          }
          if (
            this.notificationtotal &&
            this.notificationtotal.value == "true"
          ) {
            let uniquepriorities = this.notifications
              .map((item) => item.severity)
              .filter((value, index, self) => self.indexOf(value) === index);
            let groupedarray = [];
            uniquepriorities.forEach((element1) => {
              let temp = this.notifications.filter(
                (item) => item.severity == element1
              );
              groupedarray.push(temp);
            });
            let uniquenotificationarray = [];
            groupedarray.forEach((tempdata) => {
              let notifications = tempdata
                .map((item) => item.message)
                .filter((value, index, self) => self.indexOf(value) === index);
              notifications.forEach((element1) => {
                let temp = tempdata.filter((item) => item.message == element1);
                if (temp && temp.length) temp[0]["count"] = temp.length;
                uniquenotificationarray.push(temp[0]);
              });
            });
            this.notifications = uniquenotificationarray;
            this.notificationslength = res.content.length.toString();
          }
        });
    });
  }

  setNotificationSeverity() {
    this.notifications.forEach((item: any) => {
      if (item.severity == "P1") item["color"] = "red";
      else if (item.severity == "P2") item["color"] = "orange";
      else if (item.severity == "P3") item["color"] = "yellow";
      else if (item.severity == "P4") item["color"] = "green";
      else item["color"] = "green";
    });
  }
  destroySubscription() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  openUrl(url: any) {
    window.open(url);
  }
  isexpaned() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      sessionStorage.setItem("isExpanded", "true");
    } else {
      sessionStorage.removeItem("isExpanded");
    }
  }

  showAlert() {
    alert(this.alertPopupMessage);
  }

  newsidebar() {
   this.isSidebarLoading = true;
    // this.removeFilters();
    this.apisService.getDashConsts().subscribe(
      (response) => {
        // this.setHeaderTitleForIVMByProject(response);
        let isDemoProject = response.filter(
          (item: any) => item.keys == "is_demo_project"
        );
        if (isDemoProject.length > 0) {
          if (isDemoProject[0].value == "true") {
            this.isDemoProject = true;
          }
        }
        let alertPopupMessage = response.filter(
          (item: any) => item.keys == "alert_demoproj_msg"
        );
        if (alertPopupMessage.length > 0) {
          this.alertPopupMessage = alertPopupMessage[0].value;
        }
        this.filterData = response.filter(
          (item) => item.keys == "IVM Header Title"
        );
        this.setHeaderTitleForIVMByProject();
        let iegpAdminDetails = response.filter(
          (item) => item.keys == "iegpAdmin"
        );
        if (iegpAdminDetails && iegpAdminDetails.length != 0) {
          sessionStorage.setItem("iegpAdmin", iegpAdminDetails[0].value);
        }
        document.documentElement.style.setProperty(
          "--childsidebartext-color",
          "false"
        );
        document.documentElement.style.setProperty(
          "--childsidebarbg-color",
          "false"
        );
        document.documentElement.style.setProperty(
          "--childsidebarhover-color",
          "false"
        );
        let tempSidebarbgcolor = response.filter(
          (item) => item.keys == "Sidebar_Background_Color"
        );
        if (tempSidebarbgcolor && tempSidebarbgcolor.length > 0) {
          if (tempSidebarbgcolor[0].value) {
            this.sidebarbgcolor = true;
            document.documentElement.style.setProperty(
              "--sidebarbg-color",
              tempSidebarbgcolor[0].value
            );
            document.documentElement.style.setProperty(
              "--childsidebarbg-color",
              JSON.stringify(this.sidebarbgcolor)
            );
          }
        }
        let tempSidebartextcolor = response.filter(
          (item) => item.keys == "Sidebar_Text_Color"
        );
        if (tempSidebartextcolor && tempSidebartextcolor.length > 0) {
          if (tempSidebartextcolor[0].value) {
            this.sidebartextcolor = true;
            this.sidebariconcolor = true;
            document.documentElement.style.setProperty(
              "--sidebartext-color",
              tempSidebartextcolor[0].value
            );
            document.documentElement.style.setProperty(
              "--sidebaricon-color",
              tempSidebartextcolor[0].value
            );
            document.documentElement.style.setProperty(
              "--childsidebartext-color",
              JSON.stringify(this.sidebartextcolor)
            );
          }
        }
        let tempSidebarhighlightcolor = response.filter(
          (item) => item.keys == "Sidebar_Highlight_Color"
        );
        if (tempSidebarhighlightcolor && tempSidebarhighlightcolor.length > 0) {
          if (tempSidebarhighlightcolor[0].value) {
            this.sidebarhighlightcolor = true;
            document.documentElement.style.setProperty(
              "--sidebarhighlight-color",
              tempSidebarhighlightcolor[0].value
            );
          }
        }

        let tempSidebarTextIconHover = response.filter(
          (item) => item.keys == "Sidebar_TextIconHover_Color"
        );
        if (tempSidebarTextIconHover && tempSidebarTextIconHover.length > 0) {
          if (tempSidebarTextIconHover[0].value) {
            this.sidebartexticonhovercolor = true;
            document.documentElement.style.setProperty(
              "--sidebartexticonhover-color",
              tempSidebarTextIconHover[0].value
            );
            document.documentElement.style.setProperty(
              "--childsidebartexticonhover-color",
              JSON.stringify(this.sidebartexticonhovercolor)
            );
          }
        }

        let tempSidebarhovercolor = response.filter(
          (item) => item.keys == "Sidebar_Hover_Color"
        );
        if (tempSidebarhovercolor && tempSidebarhovercolor.length > 0) {
          if (tempSidebarhovercolor[0].value) {
            this.sidebarhovercolor = true;
            document.documentElement.style.setProperty(
              "--sidebarhover-color",
              tempSidebarhovercolor[0].value
            );
            document.documentElement.style.setProperty(
              "--childsidebarhover-color",
              JSON.stringify(this.sidebarhovercolor)
            );
          }
        }
        let flag = false;
        let role;
        let project;
        let portfolio;
        try {
          role = JSON.parse(sessionStorage.getItem("role") || "");
          project = JSON.parse(sessionStorage.getItem("project") || "");
          portfolio = project.portfolioId;
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }

        if (role.projectadmin && role.projectAdminId == project.id) {
          this.sidebarMenu.splice(
            1,
            3,
            {
              label: "User Management",
              icon: "users",
              url: "./iamp-usm/manageUsers",
            },
            {
              label: "Export-import",
              icon: "exchange",
              url: "./iamp-usm/export-import",
            },
            {
              label: "Copy blueprint",
              icon: "copy",
              url: "./iamp-usm/copy-blueprint",
            },
            { label: "Theme", icon: "paint-brush", url: "./iamp-usm/theme" },
            {
              label: "Configuration",
              icon: "map-signs",
              url: "./iamp-usm/dashconstant",
            }
          );
        } else if (role.roleadmin && role.portfolioId == portfolio.id) {
          this.sidebarMenu.splice(
            1,
            3,
            {
              label: "Project Management",
              icon: "file-powerpoint-o",
              url: "./iamp-usm/projectlist",
            },
            {
              label: "Role Management",
              icon: "registered",
              url: "./iamp-usm/role/list",
            },
            {
              label: "User Management",
              icon: "users",
              url: "./iamp-usm/manageUsers",
            },
            {
              label: "Configuration",
              icon: "map-signs",
              url: "./iamp-usm/dashconstant",
            }
          );
        }
        response.forEach((item) => {
          if (item.keys == "sidebar") {
            let currentrolearray = [];
            let currentrole;
            try {
              currentrolearray = JSON.parse(item.value).Role.split(",");
            } catch (e: any) {
              console.error("JSON.parse error - ", e.message);
            }
            currentrolearray.forEach((ele: any) => {
              currentrole = ele;
              if (
                JSON.parse(sessionStorage.getItem("role") || "").name ==
                  currentrole &&
                flag == false
              ) {
                flag = true;
                this.currentrole = currentrole;
              }
            });
          }
        });
        response.forEach((item) => {
          if (item.keys == "Iconsidebar") {
            let currentrolearray = [];
            let currentrole;
            try {
              currentrolearray = JSON.parse(item.value).Role.split(",");
            } catch (e: any) {
              console.error("JSON.parse error - ", e.message);
            }
            currentrolearray.forEach((ele: any) => {
              currentrole = ele;
              if (
                JSON.parse(sessionStorage.getItem("role") || "").name ==
                  currentrole &&
                flag == false
              ) {
                flag = true;
                this.iconsidebarrole = currentrole;
              }
            });
          }
        });
        let rolename = JSON.parse(sessionStorage.getItem("role") || "").name;
        let currentprojectid = JSON.parse(
          sessionStorage.getItem("project") || ""
        ).id;
        let currentPortfolioId = JSON.parse(
          sessionStorage.getItem("project") || ""
        ).portfolioId.id;
        let sidebarMenutemp: any = [];
        let fetchdefaultmappings = true;
        let datafromcurrentproject = true;
        let datafromcoreproject = true;
        response.forEach((item) => {
          if (
            item.keys == rolename + " Side" &&
            item.project_id.id == currentprojectid
          ) {
            if (item.value) {
              fetchdefaultmappings = false;
              sidebarMenutemp.push(JSON.parse(item.value));
            }
          }
        });
        let SideConfigurationsmappings = response.filter(
          (item) => item.keys == rolename + " SideConfigurations"
        );

         

        if (sidebarMenutemp.length > 0) this.sidebarMenu = sidebarMenutemp;
        else if (SideConfigurationsmappings.length > 0) {
          SideConfigurationsmappings = SideConfigurationsmappings.filter(
            (value, index, self) =>
              self.map((x) => x.id).indexOf(value.id) == index
          );
          SideConfigurationsmappings.forEach((item) => {
            if (item.project_id.id == currentprojectid) {
              fetchdefaultmappings = false;
              let tempArray = JSON.parse(item.value);
              tempArray.forEach((ele) => sidebarMenutemp.push(ele));
            }
          });
          if (!(sidebarMenutemp && sidebarMenutemp.length)) {
            SideConfigurationsmappings.forEach((item) => {
              if (
                item.portfolio_id &&
                item.portfolio_id.id == currentPortfolioId
              ) {
                fetchdefaultmappings = false;
                let tempArray = JSON.parse(item.value);
                tempArray.forEach((ele) => sidebarMenutemp.push(ele));
              }
            });
          }
          if (!(sidebarMenutemp && sidebarMenutemp.length)) {
            SideConfigurationsmappings.forEach((item) => {
              if (item.project_name == "Core") {
                fetchdefaultmappings = false;
                let tempArray = JSON.parse(item.value);
                tempArray.forEach((ele) => sidebarMenutemp.push(ele));
              }
            });
          }
          this.sidebarMenu = sidebarMenutemp;
          
          // Only perform auto-navigation when all conditions are met
          const currentUrl = this.router.url;
          const isChangingSelection = sessionStorage.getItem("selectionChange") === "portfolio" || 
                                    sessionStorage.getItem("selectionChange") === "project";
          const isAdmin = this.role21.toLowerCase() === "admin" || 
                        this.role21.toLowerCase() === "it portfolio manager";
          const isAtMainLanding = currentUrl === "/landing" || currentUrl === "/landing/";
          
        
        
       
          
          // Only navigate if we're at the main landing page, not changing portfolios/projects, and not an admin
          if (isAtMainLanding && !isChangingSelection && !isAdmin) {
            console.log("Auto-navigating for regular user role");
            // Set flag to indicate navigation is in progress to prevent interference
            sessionStorage.setItem("navigatingInProgress", "true");
            
            // Special case for Dashboard and Configuration menu
            if(this.sidebarMenu.length===2 && this.sidebarMenu[0].label.toLowerCase()==="dashboard"
             && this.sidebarMenu[1].label.toLowerCase()==="configuration"){
                console.log("Menu has only Dashboard and Configuration, navigating to landing only");
                this.router.navigate(["/landing"]).then(() => {
                  // Clear the flag after navigation is complete
                  setTimeout(() => sessionStorage.removeItem("navigatingInProgress"), 500);
                });
                // Don't proceed with other navigation logic
                return;               
            }
            // Regular navigation logic
             else if(this.sidebarMenu && this.sidebarMenu.length > 0 && this.sidebarMenu[0].url && 
               this.sidebarMenu[0].url.includes('./') && this.sidebarMenu[0].url.length > 2) {
                let filterUrl = this.sidebarMenu[0].url.replace('./', '');
                this.router.navigate(["/landing/" + filterUrl]).then(() => {
                  // Clear the flag after navigation is complete
                  setTimeout(() => sessionStorage.removeItem("navigatingInProgress"), 500);
                });            
            } else {
                this.router
                  .navigate(["../"], { relativeTo: this.route })
                  .then(() => {
                    this.router.navigate(["landing"]).then(() => {
                      // Clear the flag after navigation is complete
                      setTimeout(() => sessionStorage.removeItem("navigatingInProgress"), 500);
                    });
                  });
            }
          }
        }
        if (!(SideConfigurationsmappings && SideConfigurationsmappings.length))
          datafromcurrentproject = false;
        if (fetchdefaultmappings == true) {
          response.forEach((item) => {
            if (item.keys == rolename + " Side") {
              if (item.value) {
                fetchdefaultmappings = false;
               // this.isSidebarLoading = false;
                sidebarMenutemp.push(JSON.parse(item.value));
              }
            }
          });
       
          if (sidebarMenutemp.length > 0) this.sidebarMenu = sidebarMenutemp;
          if (!(sidebarMenutemp && sidebarMenutemp.length))
            datafromcoreproject = false;
        }
        let temprole = JSON.parse(sessionStorage.getItem("role"));
        if (
          datafromcoreproject == false &&
          datafromcurrentproject == false &&
          temprole.projectadmin
        ) {
          let tempsidebar = [];
          response.forEach((item) => {
            if (item.keys == "Core Project Admin Side") {
              if (item.value) {
                tempsidebar.push(JSON.parse(item.value));
              }
            }
          });
          if (tempsidebar && tempsidebar.length) this.sidebarMenu = tempsidebar;
          let SideConfigurationsmappings = response.filter(
            (item) => item.keys == "Core Project Admin SideConfigurations"
          );
          if (SideConfigurationsmappings && SideConfigurationsmappings.length)
            this.sidebarMenu = JSON.parse(SideConfigurationsmappings[0].value);
        }
        if (
          datafromcoreproject == false &&
          datafromcurrentproject == false &&
          temprole.roleadmin
        ) {
          let tempsidebar = [];
          response.forEach((item) => {
            if (item.keys == "Core Portfolio Admin Side") {
              if (item.value) {
                tempsidebar.push(JSON.parse(item.value));
              }
            }
          });
          if (tempsidebar && tempsidebar.length) this.sidebarMenu = tempsidebar;
          let SideConfigurationsmappings = response.filter(
            (item) => item.keys == "Core Portfolio Admin SideConfigurations"
          );
          if (SideConfigurationsmappings && SideConfigurationsmappings.length)
            this.sidebarMenu = JSON.parse(SideConfigurationsmappings[0].value);
        }
        if (
          sessionStorage.getItem("viewtabs") == undefined ||
          sessionStorage.getItem("viewtabs") == null
        ) {
          if (
            this.sidebarMenu &&
            this.sidebarMenu.length > 0 &&
            this.sidebarMenu[0].children &&
            this.sidebarMenu[0].children.length > 0
          ) {
            let flag = true;
            this.apisService.getDashConsts().subscribe((res) => {
              res.forEach((item) => {
                let project;
                try {
                  project = JSON.parse(
                    sessionStorage.getItem("project") || ""
                  ).id;
                } catch (e: any) {
                  console.error("JSON.parse error - ", e.message);
                }
                let role;
                try {
                  role = JSON.parse(sessionStorage.getItem("role") || "").name;
                } catch (e: any) {
                  console.error("JSON.parse error - ", e.message);
                }
                if (
                  item &&
                  item.project_id &&
                  item.project_id.id == project &&
                  item.keys == role + " Land"
                ) {
                  flag = false;
                }
              });
              if (flag == true) this.showTabs(this.sidebarMenu[0]);
            });
          }
        }

// Add this code around line 2218, after all sidebar menu processing
// Check if user is admin and portfolio is Core
const isAdmin = this.role21.toLowerCase() === "admin";
const isCorePortfolio = JSON.parse(sessionStorage.getItem("portfoliodata") || "{}").portfolioName === "Core";
const currentUrl = this.router.url;
const isAtMainLanding = currentUrl === "/landing" || currentUrl === "/landing/";
const isNavigatingToSpecificRoute = sessionStorage.getItem("navigatingToRoute");

// Only navigate to portfoliolist if admin is on landing page and not actively navigating elsewhere
if (isAdmin && isAtMainLanding && !isNavigatingToSpecificRoute) {
  console.log("Auto-navigating admin to portfoliolist");
  // Set flag to indicate navigation is in progress to prevent interference
  sessionStorage.setItem("navigatingInProgress", "true");
  this.router.navigate(["/landing/iamp-usm/portfoliolist"]).then(() => {
    // Clear the flag after navigation is complete
    setTimeout(() => {
      sessionStorage.removeItem("navigatingInProgress");
    }, 500);
  });
}

// CONDITIONAL NAVIGATION: Only execute if role has been changed and we're not already navigating
// This handles both role changes within portfolio and across portfolios
const roleChanged = sessionStorage.getItem("roleChanged") === "true";
const portfolioChanged = sessionStorage.getItem("selectionChange") && 
                        sessionStorage.getItem("selectionChange").includes("portfolio-");
const projectChanged = sessionStorage.getItem("selectionChange") && 
                      sessionStorage.getItem("selectionChange").includes("project-");
const navigationInProgress = sessionStorage.getItem("navigatingInProgress") === "true";

// Check if we need to navigate based on role, portfolio, or project change
if ((roleChanged || portfolioChanged || projectChanged) && !navigationInProgress && !isAdmin) {
  console.log("Navigation triggered by role/portfolio/project change");
  
  // Special case for Dashboard and Configuration menu
  if(this.sidebarMenu && this.sidebarMenu.length === 2 && 
     this.sidebarMenu[0].label && this.sidebarMenu[0].label.toLowerCase() === "dashboard" && 
     this.sidebarMenu[1].label && this.sidebarMenu[1].label.toLowerCase() === "configuration") {
    console.log("Dashboard+Configuration menu detected, navigating to landing only");
    sessionStorage.setItem("navigatingInProgress", "true");
    this.router.navigate(["/landing"]).then(() => {
      setTimeout(() => sessionStorage.removeItem("navigatingInProgress"), 500);
      // Clear the change flags to prevent multiple navigations
      sessionStorage.removeItem("roleChanged");
      sessionStorage.removeItem("selectionChange");
    });
  }
  // Regular navigation to first menu item if available
  else if(this.sidebarMenu && this.sidebarMenu.length > 0 && this.sidebarMenu[0].url && 
     this.sidebarMenu[0].url.includes('./') && this.sidebarMenu[0].url.length > 2) {
    console.log("Navigating to first menu item");
    sessionStorage.setItem("navigatingInProgress", "true");
    let filterUrl = this.sidebarMenu[0].url.replace('./', '');
    this.router.navigate(["/landing/" + filterUrl]).then(() => {
      setTimeout(() => sessionStorage.removeItem("navigatingInProgress"), 500);
      // Clear the change flags to prevent multiple navigations
      sessionStorage.removeItem("roleChanged");
      sessionStorage.removeItem("selectionChange");
    });            
  }
}


        for (let i = 0; i < this.sidebarMenu.length; i++) {
          if (this.sidebarMenu[i].children) {
            this.sidebarMenu[i].children.forEach((child: any) => {
              if (this.location != "") {
                if (child.url) {
                  let temp = child.url.split("/").length;
                  let temp1 = this.location.split("/").length;
                  if (
                    child.url.split("/")[temp - 1] ==
                    this.location.split("/")[temp1 - 1]
                  ) {
                    this.sidebarSectionIndex = i;
                    // this.isExpanded = true
                  }
                }
              }
            });
          }
        }    
        this.location = window.location.pathname;
        for (let i = 0; i < this.sidebarMenu.length; i++) {
        if (this.sidebarMenu[i].children) {
            this.sidebarMenu[i].children.forEach((child: any) => {
              if (this.location != "") {
                if (child.url) {
                  let temp = child.url.split("/").length;
                  let temp1 = this.location.split("/").length;              
                  if (
                    child.url.split("/")[temp - 1] ==
                    this.location.split("/")[temp1 - 1]
                  ) {
                    this.sidebarSectionIndex = i;
                  }
                }
              }
            });
          }
        }     
      },
      (error) => {
        console.error('Error loading sidebar:', error);
        this.isSidebarLoading = false;
      },
      () => {
        if (
          JSON.parse(sessionStorage.getItem("role") || "").name ==
          sessionStorage.getItem("sidebarSectionIndexrole")
        )
          this.sidebarSectionIndex = Number(
            sessionStorage.getItem("sidebarSectionIndex")
          );
        
        // Add a small delay before removing the navigation flag to ensure any pending
        // navigations have completed
        setTimeout(() => {
          // Only remove if not set by another action
          if (sessionStorage.getItem("navigatingToRoute") && 
              !sessionStorage.getItem("navigatingInProgress")) {
            sessionStorage.removeItem("navigatingToRoute");
          }
        }, 1000);
        
        // Reset sidebar loading flag now that everything is complete
        this.isSidebarLoading = false;
      }
    ); 
      
  }
  getIdDataObject(secondLevelObj: any) {
    let resObj: any = {};
    this.entryInIdDataObject(resObj, secondLevelObj);
    delete resObj[secondLevelObj._id];
    return resObj;
  }

  private entryInIdDataObject(idDataObj: any, obj: any) {
    idDataObj[obj._id] = obj;
    if (obj.children && obj.children.length) {
      for (let ele of obj.children) {
        this.entryInIdDataObject(idDataObj, ele);
      }
    }

    return idDataObj;
  }

  getParentChildObject(secondLevelObj: any) {
    let resObj: any = {};
    this.entryParentChildObject(resObj, secondLevelObj);
    delete resObj[secondLevelObj._id];
    return resObj;
  }

  private entryParentChildObject(parentChildObject: any, obj: any) {
    if (obj.children && obj.children.length) {
      parentChildObject[obj._id] = [...obj.children];
      for (let ele of obj.children) {
        this.entryParentChildObject(parentChildObject, ele);
      }
    }

    return parentChildObject;
  }

  addIdsToDataForTree(obj: any) {
    let _lastUsedIdForTree = 0;
    this.addIds(obj, _lastUsedIdForTree);
    return obj;
  }

  private addIds(obj: any, _lastUsedIdForTree: any) {
    obj["_id"] = ++_lastUsedIdForTree;
    if (obj.children && obj.children.length) {
      for (let ele of obj.children) {
        this.addIds(ele, _lastUsedIdForTree);
      }
    }
  }

  get parentChildObjKeys() {
    let keys = Object.keys(this.parentChildObject);
    for (let parentId of keys) {
      for (let child of this.parentChildObject[Number(parentId)]) {
      }
    }
    return keys.map((id) => Number(id));
  }

  get hideTabLeftBtn() {
    let tabsBox = document.getElementById("tabsBox");
    if (!tabsBox) return true;
    else if (tabsBox.scrollLeft <= 5) return true;
    else return false;
  }

  get hideTabRightBtn() {
    let tabsBox = document.getElementById("tabsBox");
    if (!tabsBox) return true;
    else if (
      tabsBox.scrollLeft + tabsBox.clientWidth >=
      tabsBox.scrollWidth - 5
    )
      return true;
    else return false;
  }

  clickOnLeftBtn() {
    if (this.tabsBox) {
      this.tabsBox.nativeElement.scrollLeft -= 250;
      setTimeout(() => {
        sessionStorage.setItem(
          "Scrollleft",
          JSON.stringify(this.tabsBox.nativeElement.scrollLeft)
        );
      }, 200);
    }
  }

  clickOnRightBtn() {
    if (this.tabsBox) {
      this.tabsBox.nativeElement.scrollLeft += 250;
      setTimeout(() => {
        sessionStorage.setItem(
          "Scrollleft",
          JSON.stringify(this.tabsBox.nativeElement.scrollLeft)
        );
      }, 200);
    }
  }
  evaluateForLeftAndRightBtns() {
    let tabsBox = document.getElementById("tabsBox");
  }

  getURLofChild(tab: any): any {
    if (!tab.children || !tab.children.length) return tab.url;
    else return this.getURLofChild(tab.children[0]);
  }
  getParentOfChild(tab: any): any {
    if (!tab.children || !tab.children.length) {
      let temp = tab.parent;
      temp.push(tab.label);
      return temp;
    } else return this.getParentOfChild(tab.children[0]);
  }

  injectParentLabels(
    sideJSONArray: any,
    firstLevelLabel: any,
    secondLevelLabel: any
  ) {
    return this.injectParentLabelsHelper(sideJSONArray, [
      firstLevelLabel,
      secondLevelLabel,
    ]);
  }

  injectParentLabelsHelper(sideJSONArray: any, parent: any) {
    if (sideJSONArray.length) {
      for (let sideJSON of sideJSONArray) {
        sideJSON["parent"] = [...parent];
        if (sideJSON.children)
          this.injectParentLabelsHelper(sideJSON.children, [
            ...parent,
            sideJSON.label,
          ]);
      }
    }
    return sideJSONArray;
  }
  Highlight(child: any) {
    let temp = [[...child.parent]];
    temp[0].push(child.label);
    this.displayBreadCrumb(temp[0]);
    if (child.label)
      sessionStorage.setItem("SeclevelhighlightedLabel", child.label);
    sessionStorage.removeItem("bccbreadcrumbdashid");
    sessionStorage.removeItem("bccbreadcrumb");
    sessionStorage.setItem("seclevelroute", child.navigateUrl);
    this.removeFilters();
  }
  displayBreadCrumb(parentArr: any) {
    let outputstring = "";
    for (let item in parentArr) {
      if (parentArr[item]) {
        outputstring = outputstring + String(parentArr[item]);
        outputstring = outputstring + " >> ";
      }
    }
    this.breadcrumbs = outputstring.slice(0, -3);
    sessionStorage.setItem("sidebarbreadcrumb", this.breadcrumbs);
    this.menuService.sidebarbreadcrumb = this.breadcrumbs;
    this.menuService.displaybreadcrumbs = true;
  }
  get breadcrumbstring() {
    return this.breadcrumbs;
  }

  hideandshowdown() {
    this.hidesidebar = true;
    this.showSubHeader = false;
    sessionStorage.setItem("hidesidebar", "true");
  }
  hideandshowup() {
    this.hidesidebar = false;
    sessionStorage.removeItem("hidesidebar");
  }

  test() {
    this.showSubHeader = false;
  }

  // showVersionInfo(): void {
  //   const dialogRef = this.dialog.open(VersionInfoComponent, {
  //     maxHeight: "80vh",
  //     maxWidth: "80vw",
  //     minWidth: "80vw",
  //     minHeight: "80vh",
  //     data: {},
  //   });

  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

  // getSwaggerLink() {
  //   console.log("swagger link")
  //   let link = 'http://myzul02u:6001/docs';
  //   window.open(link, '_blank')
  // }

  showTabs(item: any, parent: any = undefined) {
    sessionStorage.setItem("viewtabs", "true");
    try {
      sessionStorage.setItem("tabs", JSON.stringify(item));
    } catch (error) {}
    this.tabs = [];
    this.showchildren = false;
    // if (item.horizontal) {
    this.showchildren = true;
    let firstLevelLabel = parent ? parent.label : undefined;
    let secondLevelLabel = item.label;
    this.menuService.firstLevelLabel = parent;
    let idAddedItem = { ...this.addIdsToDataForTree(item) };
    this.idDataObject = this.getIdDataObject(idAddedItem);
    this.parentChildObject = this.getParentChildObject(idAddedItem);
    this.tabs = this.injectParentLabels(
      [...idAddedItem.children],
      firstLevelLabel,
      secondLevelLabel
    );
    if (this.tabs.length) {
      if (!this.routecount) {
        this.selectedIndex = 0;
        if (this.tabs[0]["stateUrl"]) {
          // console.log("inside second level if")
          //sbx workbench route
          // Set flag to indicate user is actively navigating to a route
          sessionStorage.setItem("navigatingToRoute", "true");
          this.router.navigate([this.tabs[0].url], {
            relativeTo: this.route,
            queryParams: { stateUrl: this.tabs[0]["stateUrl"] },
          }).then(() => {
            // Clear the flag after navigation is complete (with a short delay to ensure processing)
            setTimeout(() => sessionStorage.removeItem("navigatingToRoute"), 500);
          });
          if (this.tabs[0] && this.tabs[0].label)
            sessionStorage.setItem(
              "SeclevelhighlightedLabel",
              this.tabs[0].label
            );
          this.seclevelhighlighted = this.tabs[0].label;
        } else {
          let parentdata = this.getParentOfChild(this.tabs[0]);
          this.displayBreadCrumb(parentdata);
          // console.log(this.route)
          // Set flag to indicate user is actively navigating to a route
          sessionStorage.setItem("navigatingToRoute", "true");
          this.router.navigate([this.getURLofChild(this.tabs[0])], {
            relativeTo: this.route,
            onSameUrlNavigation: "reload",
            skipLocationChange: false,
          }).then(() => {
            // Clear the flag after navigation is complete (with a short delay to ensure processing)
            setTimeout(() => sessionStorage.removeItem("navigatingToRoute"), 500);
          });
          if (this.tabs[0] && this.tabs[0].label) {
            // console.log("inside second level else")
            sessionStorage.setItem(
              "SeclevelhighlightedLabel",
              this.tabs[0].label
            );
            sessionStorage.setItem("seclevelroute", this.tabs[0].navigateUrl);
          }
          this.seclevelhighlighted = this.tabs[0].label;
        }
      }
    }
    // }
    sessionStorage.removeItem("selectedIndex");
    this.routecount = false;
    this.highlightedLabel = item.label;
    sessionStorage.setItem("highlightedLabel", this.highlightedLabel);
    this.getHighlightValue();
  }

  onTabChanged($event: any) {
    let clickedIndex = $event.index;
    this.selectedIndex = clickedIndex;
    sessionStorage.setItem("selectedIndex", this.selectedIndex.toString());
    
    // Prevent navigation if sidebar is still loading
    if (this.isSidebarLoading) {
      console.log('Navigation deferred while sidebar is loading');
      return;
    }
    
    // Set flag to indicate user is actively navigating to a route
    sessionStorage.setItem("navigatingToRoute", "true");
    
    // Use skipLocationChange to avoid browser history changes that cause refreshes
    this.router.navigate([this.tabs[clickedIndex].url], {
      relativeTo: this.route,
      skipLocationChange: false
    }).then(() => {
      // Clear the flag after navigation is complete (with a short delay to ensure processing)
      setTimeout(() => sessionStorage.removeItem("navigatingToRoute"), 500);
    });
  }

  removeFilters() {
    sessionStorage.removeItem("SelectedProcess");
    sessionStorage.removeItem("Filter");
    sessionStorage.removeItem("WidgetLevelDefault");
    sessionStorage.removeItem("TopFilter");
    sessionStorage.removeItem("DateFilter");
    sessionStorage.removeItem("ConfiguartionItemId");
    sessionStorage.removeItem("CIList");
    sessionStorage.removeItem("drilldown");
    sessionStorage.removeItem("QuickRangeName");
    sessionStorage.removeItem("ciId");
    sessionStorage.removeItem("configurationItem");
    sessionStorage.removeItem("isNavigatedFromCIS");
    sessionStorage.removeItem("isNavigatedToCIS");
    sessionStorage.removeItem("bccbreadcrumb");
    sessionStorage.removeItem("bccbreadcrumbdashid");
    let url = window.location.href;
    if (!url.includes("cc")) {
      sessionStorage.removeItem("level2sidebar");
    }
  }
  clearsession() {
    sessionStorage.setItem("CacheDashConstant", "true");
    sessionStorage.removeItem("FromFailure");
    sessionStorage.setItem("isSbx", "false");
  }

  createSubHeader(items: any) {
    if (items != null) {
      this.showSubHeader = true;
      this.subHeaderItems = items;
    } else {
      this.showSubHeader = false;
      this.subHeaderItems = items;
    }
  }

  openIframableLink(url, stateUrl, tabIndex) {
    this.router.navigate([url], {
      relativeTo: this.route,
      queryParams: { stateUrl: this.tabs[tabIndex]["stateUrl"] },
    });
  }

  checkDisplaySidebar() {
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    this.apisService.getDashConsts().subscribe((result) => {
      let tempDashConst = result.filter(
        (item) =>
          item.keys == "ShowSidebar_" + this.role.name ||
          item.keys == "ShowSidebar_" + this.role.name + "default"
      );

      if (tempDashConst.length > 0) {
        let projectValue = "not present";
        let projectValueSidebar = false;
        let coreValue = "not present";
        let coreValueSidebar = false;
        tempDashConst.forEach((mapping) => {
          // Checking if mapping is present in current project
          if (mapping.project_id && mapping.project_name == project.name) {
            projectValue = "present";
            if (mapping.value == "true") projectValueSidebar = true;
          }

          // checking if mapping is present for core project
          if (mapping.project_id && mapping.project_name == "Core") {
            coreValue = "present";
            if (mapping.value == "true") coreValueSidebar = true;
          }
        });

        if (projectValue == "present")
          this.showSidebarMenu = projectValueSidebar;
        else if (coreValue == "present")
          this.showSidebarMenu = coreValueSidebar;
      }
    });
  }
  setProjectTheme() {
    this.apisService.getDashConsts().subscribe((response) => {
      let projecttheme = response.filter(
        (item) => item.keys == "Project Theme"
      )[0];
      let projectthemevalues;
      if (projecttheme && projecttheme.value) {
        projectthemevalues = JSON.parse(projecttheme.value);
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.themecolor
      ) {
        document.documentElement.style.setProperty(
          "--header-color",
          projectthemevalues.apptheme.themecolor
        );
        this.headercolor = projectthemevalues.apptheme.themecolor;
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebarbackgroundcolor
      ) {
        this.sidebarbgcolor = true;
        document.documentElement.style.setProperty(
          "--sidebarbg-color",
          projectthemevalues.apptheme.sidebarbackgroundcolor
        );
        document.documentElement.style.setProperty(
          "--childsidebarbg-color",
          JSON.stringify(this.sidebarbgcolor)
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebartextcolor
      ) {
        this.sidebartextcolor = true;
        document.documentElement.style.setProperty(
          "--sidebartext-color",
          projectthemevalues.apptheme.sidebartextcolor
        );
        document.documentElement.style.setProperty(
          "--childsidebartext-color",
          JSON.stringify(this.sidebartextcolor)
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebaractivecolor
      ) {
        this.sidebarhighlightcolor = true;
        document.documentElement.style.setProperty(
          "--sidebarhighlight-color",
          projectthemevalues.apptheme.sidebaractivecolor
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebarhovercolor
      ) {
        this.sidebarhovercolor = true;
        document.documentElement.style.setProperty(
          "--sidebarhover-color",
          projectthemevalues.apptheme.sidebarhovercolor
        );
        document.documentElement.style.setProperty(
          "--childsidebarhover-color",
          JSON.stringify(this.sidebarhovercolor)
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebartexticonhovercolor
      ) {
        this.sidebartexticonhovercolor = true;
        document.documentElement.style.setProperty(
          "--sidebartexticonhover-color",
          projectthemevalues.apptheme.sidebartexticonhovercolor
        );
        document.documentElement.style.setProperty(
          "--childsidebartexticonhover-color",
          JSON.stringify(this.sidebartexticonhovercolor)
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.sidebariconcolor
      ) {
        this.sidebariconcolor = true;
        document.documentElement.style.setProperty(
          "--sidebaricon-color",
          projectthemevalues.apptheme.sidebariconcolor
        );
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.headercolor
      ) {
        this.headercolor = projectthemevalues.apptheme.headercolor;
      }
      if (
        projectthemevalues &&
        projectthemevalues.apptheme &&
        projectthemevalues.apptheme.headericoncolor
      ) {
        this.headericoncolorbool = true;
        this.headericoncolor = projectthemevalues.apptheme.headericoncolor;
      }
      if (
        projectthemevalues &&
        projectthemevalues.bcctheme &&
        projectthemevalues.bcctheme.bccsidebarhighlightcolor
      ) {
        document.documentElement.style.setProperty(
          "--outline-colour",
          projectthemevalues.bcctheme.bccsidebarhighlightcolor
        );
      }
    });
  }

  directNavigation(portfolio: any, project: any, role: any) {
    if (this.selectedportfolio.id != portfolio) {
      this.apisService.getUsmPortfolio(portfolio).subscribe((portfolio) => {
        this.onSelection(portfolio);
        this.apisService
          .getProject(project)
          .subscribe((project) => this.valuechangeproject1(project));
        this.apisService
          .getRole(role)
          .subscribe((role) => this.valuechangerole(role));
      });
    } else {
      if (this.selectedproject.id != project) {
        this.apisService
          .getProject(project)
          .subscribe((project) => this.valuechangeproject1(project));
        this.apisService
          .getRole(role)
          .subscribe((role) => this.valuechangerole(role));
      } else {
        if (this.selectedrole.id != role)
          this.apisService
            .getRole(role)
            .subscribe((role) => this.valuechangerole(role));
      }
    }
  }

  checkDashConstantResponseForKeys() {
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    let filteredRows: any;

    this.apisService.getDashConsts().subscribe((res) => {
      this.dashConstantCheckResponse = res;
      let filteredArray = [];
      filteredArray = this.dashConstantCheckResponse.filter(
        (item: any) => item.keys == "DisableTabs"
      );
      if (
        filteredArray.length > 0 &&
        filteredArray[0].value.trim().length > 0
      ) {
        if (sessionStorage.getItem("tabs")) {
          let filteredTab = JSON.parse(sessionStorage.getItem("tabs"));
          let tabsToDisable = filteredArray[0].value
            .split(",")
            .map((ele) => ele.trim());
          tabsToDisable.forEach((ele) => {
            filteredTab.children = filteredTab.children.filter(
              (item) => item.label !== ele
            );
          });
          sessionStorage.setItem("tabs", JSON.stringify(filteredTab));
        }
      }
      filteredRows = this.dashConstantCheckResponse.filter(
        (item: any) => item.keys == "HeaderBgColorType"
      );

      if (filteredRows && filteredRows.length > 0) {
        let projectValueData = "base";
        let coreValueData = "base";
        let projectValueFlag = "not present";
        let coreValueFlag = "not present";
        filteredRows.forEach((mapping: any) => {
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
        if (projectValueFlag == "present") this.headerType = projectValueData;
        else if (coreValueFlag == "present") this.headerType = coreValueData;
      } else {
        this.headerType = "base";
      }

      if (this.headerType == "base") this.bgColorType = 1;
      else if (this.headerType == "#0094ff") this.bgColorType = 2;
      if (sessionStorage.getItem("tabs")) {
        this.routecount = true;
        try {
          this.showTabs(
            JSON.parse(sessionStorage.getItem("tabs") || ""),
            this.menuService.firstLevelLabel
          );
        } catch (error) {}
      }
    });
  }

  ngAfterViewInit() {
    if (this.tabsBox) {
      setTimeout(() => {
        this.tabsBox.nativeElement.scrollLeft = sessionStorage.getItem(
          "Scrollleft"
        )
          ? parseInt(sessionStorage.getItem("Scrollleft") || "")
          : 0;
      }, 80);
    }
  }

  // setting the headers for aetna based on role
  setSidebarToHeaders() {
    // hide sidebar for aetna specific roles
    let rolename;
    try {
      rolename = JSON.parse(sessionStorage.getItem("role")).name;
    } catch (e) {
      console.error("JSON.parse error - ", e);
    }
    if (
      rolename.toUpperCase() == "IT ANALYST" ||
      rolename.toUpperCase() == "IT DOMAIN LEAD" ||
      rolename.toUpperCase() == "BUSINESS OPERATIONS LEAD" ||
      rolename.toUpperCase() == "BUSINESS OPERATIONS HEAD" ||
      rolename.toUpperCase() == "IT OPERATIONS HEAD" ||
      rolename.toUpperCase() == "IT OPERATIONS LEAD"
    ) {
      this.sidebar = false;
    }
    // aetna headers
    if (!this.sidebar) {
      this.userProject.role_id = JSON.parse(sessionStorage.getItem("role"));
      this.apisService.getDashConsts().subscribe((res) => {
        res.forEach((item) => {
          let project;
          try {
            project = JSON.parse(sessionStorage.getItem("project")).id;
          } catch (e) {
            console.error("JSON.parse error - ", e);
          }
          if (
            item &&
            item.project_id &&
            item.project_id.id == project &&
            item.keys == this.userProject.role_id.name + " Dash"
          ) {
            this.navLinks[0] = { labels: "My Dashboard", path: item.value };
          }
          if (
            item &&
            item.project_id &&
            item.project_id.id ==
              JSON.parse(sessionStorage.getItem("project")).id &&
            item.keys == this.userProject.role_id.name + " Report"
          ) {
            this.navLinks[1] = { labels: "Reports", path: item.value };
          }
          if (
            item &&
            item.project_id &&
            item.project_id.id ==
              JSON.parse(sessionStorage.getItem("project")).id &&
            item.keys == this.userProject.role_id.name + " Cust"
          ) {
            this.navLinks[2] = { labels: "Customer", path: item.value };
          }
          if (this.navLinks.length != 0) {
            this.navhide = false;
          }
        });
      });
    }
  }

  notificationToggler() {
    this.showPanel = !this.showPanel;
  }
  getNotificationsPermision() {
    let project = JSON.parse(sessionStorage.getItem("project") || "").id;
    let roleId = JSON.parse(sessionStorage.getItem("role") || "").id.toString();
    this.apisService
      .getDashConstantUsingKey("showNotification", project)
      .subscribe((res) => {
        this.showNotification = res === "true" ? true : false;
      });

    this.apisService
      .getDashConstantUsingKey("notification_roles", project)
      .subscribe((res) => {
        let roleArray = res.split(",");
        if (roleArray.includes(roleId)) {
          this.show_notification_icon_roles = true;
        }
      });

    this.apisService
      .getDashConstantUsingKey("show_chatbot_icon", project)
      .subscribe((res) => {
        if (res == "false") {
          this.showHeaderChatbotIcon = false;
        }
      });

    this.apisService
      .getDashConstantUsingKey("show_sidebar_full_text", project)
      .subscribe((res) => {
        if (res == "true") {
          this.show_sidebar_full_text = true;
        } else {
          this.show_sidebar_full_text = false;
        }
      });
  }
  checkRole() {
    let test = false;
    let roles;
    this.processdata.map((ele) => {
      if (ele.porfolioId.id == this.selectedportfolio.id) {
        ele.projectWithRoles.map((ele1) => {
          if (ele1["projectId"].id == this.selectedproject.id) {
            roles = ele1["roleId"];
            roles.map((value) => {
              if (value.name == this.selectedrole.name) {
                test = true;
              }
            });
          }
        });
      }
    });
    if (!test) {
      sessionStorage.setItem("role", JSON.stringify(roles[0]));
    }
  }
  showProfilePresent() {
    if (this.isPresent == "true") {
      return true;
    } else {
      return false;
    }
  }
  toggleProfileInfo() {
    this.showUploadElements = false;
    this.showProfileInfo = !this.showProfileInfo;
    const dialogRef = this.dialog.open(MyProfileComponent, {
      height: "450px",
      width: "1000px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      this.profilePicRefresh();
    });
  }

  profilePicRefresh() {
    const userString = sessionStorage.getItem("user");
    const userObject = JSON.parse(userString);
    if (userObject && userObject.hasOwnProperty("profileImage")) {
      this.profileimage = "data:image/png;base64," + userObject.profileImage;
    }
  }
  getContentResponse() {
    const timeoutMillis = 250;
    this.apisService
      .checkDeclaration(this.userId, this.role21, this.organization)
      .subscribe({
        next: (response: Array<Array<any>>) => {
          if (response.length > 0) {
            if (response.length > 1) {
              this.declarationResponse = response.slice(1);
            }
            this.content1 = response[0][1];
            this.datasetname = response[0][2];
            this.rowObj = {
              id: "uda:" + Math.random().toString(36).substring(2, 12),
              user: JSON.parse(sessionStorage.getItem("user")).user_login,
              acceptanceDate: new Date().toISOString().split("T")[0],
              declaration_id: response[0][0],
            };
            this.displayDialog = true;
            const timeoutFunction = () => {
              let samp = document.getElementById("sample");
              const elems = document.createElement("ng-template");
              elems.innerHTML = this.content1;
              samp.appendChild(elems);
            };
            setTimeout(timeoutFunction, timeoutMillis);
            this.isExpanded = true;
            let S1 = document.getElementById("sidebarexpand");
            S1.style.display = "none";
          } else {
            this.displayDialog = false;
          }
        },

        error: (_error) => {
          console.error("Error ", _error);
        },
      });
  }

  submitDeclaration() {
    this.apisService
      .saveEntry(JSON.stringify(this.rowObj), "insert", this.datasetname)
      .subscribe(() => {
        if (this.declarationResponse.length > 0) {
          this.declarationResponse.forEach((ele: Array<any>) => {
            setTimeout(() => {
              this.content1 = ele[1];
              this.datasetname = ele[2];
              this.rowObj = {
                id: "uda:" + Math.random().toString(36).substring(2, 12),
                user: JSON.parse(sessionStorage.getItem("user")).user_login,
                acceptanceDate: new Date().toISOString().split("T")[0],
                declaration_id: ele[0],
              };
              this.declarationResponse = this.declarationResponse.slice(1);
              let samp = document.getElementById("sample");
              Array.from(samp.children).forEach((ele) => ele.remove());
              const elems = document.createElement("ng-template");
              elems.innerHTML = this.content1;
              samp.appendChild(elems);
              this.isCheckboxChecked = false;
            }, 1000);
          });
        } else {
          this.displayDialog = false;
          this.isExpanded = false;
          let S1 = document.getElementById("sidebarexpand");
          S1.style.display = "block";
        }
      });
  }

  // AIP Chatbot
  AipChatbot() {
    this.checkAipChatbotConfiguration();
    if (sessionStorage.getItem("showChatBot") == "show") {
      this.showChatBot = true;
    } else {
      this.showChatBot = false;
    }
    if (sessionStorage.getItem("lastChat")) {
      let key = JSON.parse(sessionStorage.getItem("lastChat"));
      this.selectedInstance = Object.keys(key)[0];
      this.chat_title = key[this.selectedInstance];
    }
  }

  checkAipChatbotConfiguration() {
    this.apisService
      .getStartupConstants([this.chatbotConstantsKey, this.chatbotPositionKey])
      .subscribe((res) => {
        let cotexchatbot = res["icip.aip.chatbot"];
        // let chatbotDetails = JSON.parse(cotexchatbot);
        let chatbotDetails:any={};
        if(cotexchatbot && cotexchatbot.trim().length>0){
          try{
            chatbotDetails= JSON.parse(cotexchatbot);

          }catch(e){
            chatbotDetails= {};
          }
        }else{
          chatbotDetails={}
        }
        if (
          res[this.chatbotConstantsKey] &&
          chatbotDetails.chatbotType == "aip"
        ) {
          this.aip_chatbot = true;
          this.cortex_chatbot = false;
          if (res[this.chatbotPositionKey]) {
            let position = res[this.chatbotPositionKey].split(",");
            this.iconPosition.right = parseInt(position[0]) + "vh";
            this.iconPosition.bottom = parseInt(position[1]) + "vh";
          }
        } else if (
          res[this.chatbotConstantsKey] &&
          chatbotDetails.chatbotType == "cortex"
        ) {
          this.aip_chatbot = false;
          this.cortex_chatbot = true;
          this.cortexwindow = chatbotDetails;
          this.suggestionBackendUrl = this.cortexwindow.suggestionBackendUrl;
          this.backendUrl = this.cortexwindow.backendUrl;
          this.appNameInput = this.cortexwindow.appNameInput;
        } else {
          this.aip_chatbot = false;
          this.cortex_chatbot = false;
        }
      });
  }

  loadAipChatbot() {
    this.showChatBot = !this.showChatBot;
    this.updateChatbotStatus();
  }

  closeChatbot($event) {
    this.showChatBot = $event;
    this.updateChatbotStatus();
  }

  updateChatbotStatus() {
    if (this.showChatBot) {
      sessionStorage.setItem("showChatBot", "show");
    } else {
      sessionStorage.setItem("showChatBot", "hide");
    }
  }
  checkForZoom() {
    if (screen.width == window.outerWidth) {
      /* When browser is fullscreen */
      if (
        window.devicePixelRatio != 1 &&
        Math.abs(screen.width - window.innerWidth) > 5
      ) {
        //if devicepixelratio not 1 and browser zoom
        this.zoomFlag = true;
      } else if (
        window.devicePixelRatio == 1 &&
        Math.abs(screen.width - window.innerWidth) > 5
      ) {
        //if devicepixelratio 1 and browser zoom
        this.zoomFlag = true;
      } else {
        this.zoomFlag = false;
      }
    } else {
      /* When browser is not fullscreen */
      if (
        window.devicePixelRatio != 1 &&
        Math.abs(window.outerWidth - window.innerWidth) > 25
      ) {
        //if devicepixelratio not 1 and browser zoom
        this.zoomFlag = true;
      } else if (
        window.devicePixelRatio == 1 &&
        Math.abs(window.outerWidth - window.innerWidth) > 25
      ) {
        //if devicepixelratio 1 and browser zoom
        this.zoomFlag = true;
      } else {
        this.zoomFlag = false;
      }
    }
    this.setIconHeight();
  }

  setIconHeight() {
    if (this.zoomFlag) {
      if (this.screenWidth != screen.width) {
        sessionStorage.removeItem("SidebarResolution");
      }
    }
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    let screenChangeRatio = window.outerWidth / screen.width;
    let screenMultiple =
      window.outerWidth / window.document.documentElement.clientWidth;
    let minOfClientDimension = clientWidth * screenChangeRatio;

    //sidebar menu heading text
    this.sidebarMenuTextSize =
      ((minOfClientDimension * 0.7) / 100) * screenMultiple + "px";

    //sidebar menu icon size
    this.sideMenuIconSize =
      ((minOfClientDimension * 1.6) / 100) * screenMultiple + "px";

    //sidebar maximum width
    if (!sessionStorage.getItem("sidebarmaxwidth"))
      this.sidebarmaxwidth =
        ((minOfClientDimension * 7) / 100) * screenMultiple + "px";
    else this.sidebarmaxwidth = "260px";

    //icon sidebar spacing
    this.iconsidebarpadding =
      ((minOfClientDimension * 1) / 100) * screenMultiple + "px";

    //sidebar menu height
    this.sidebarMenuHeight =
      ((minOfClientDimension * 4.6) / 100) * screenMultiple + "px";

    //sidebar menu line height
    this.sidebarTextLineHeight =
      ((minOfClientDimension * 0.9) / 100) * screenMultiple + "px";

    //sidebar width
    this.sidebarWidth =
      ((minOfClientDimension * 4.5) / 100) * screenMultiple + "px";

    if (this.showSidebarMenuList) {
      this.sidebarMenuPopupWidth = "130px";
      this.sidebarmaxwidth =
        "calc(" + this.sidebarWidth + " + " + this.sidebarMenuPopupWidth + ")";
    } else {
      this.sidebarMenuPopupWidth = "0px";
      this.sidebarmaxwidth =
        ((minOfClientDimension * 7) / 100) * screenMultiple + "px";
    }

    //sidebar border width
    this.sidebarBorderWidth =
      ((minOfClientDimension * 0.9) / 100) * screenMultiple + "px";

    //sidebar menu item margin top
    this.sidebarItemMarginTop =
      ((minOfClientDimension * 0.85) / 100) * screenMultiple + "px";

    //iconsidebar margin left
    this.iconSideBarMarginLeft =
      ((minOfClientDimension * 1) / 100) * screenMultiple + "px";

    //iconsidebar margin right
    this.iconSideBarMarginRight =
      ((minOfClientDimension * 2) / 100) * screenMultiple + "px";

    //iconsidebar margin right for fontawesome icon
    this.iconSideBarMarginLeftForFa =
      ((minOfClientDimension * 3) / 100) * screenMultiple + "px";

    //leap header and text size
    this.headerHeight =
      ((minOfClientDimension * 3.6) / 100) * screenMultiple + "px";
    this.headerTextSize =
      ((minOfClientDimension * 1) / 100) * screenMultiple + "px";
    this.projectDetailsDropdown =
      minOfClientDimension > 2800 ? "350px" : "180px";

    document.documentElement.style.setProperty(
      "--headerTextSize",
      this.headerTextSize
    );
    document.documentElement.style.setProperty(
      "--projectDetailsDropdown",
      this.projectDetailsDropdown
    );

    this.detailsPopupHeight =
      ((minOfClientDimension * 3.5) / 100) * screenMultiple + "px";
    this.matOptionHeight =
      ((minOfClientDimension * 3) / 100) * screenMultiple + "px";
    this.popupMaxHeight =
      ((minOfClientDimension * 20) / 100) * screenMultiple + "px";
    document.documentElement.style.setProperty(
      "--popup-max-height",
      this.popupMaxHeight
    );
  }

  saveResolutionSizes() {
    let resolutionSizes = {
      sidebarMenuTextSize: this.sidebarMenuTextSize,
      iconsidebarpadding: this.iconsidebarpadding,
      sidebarmaxwidth: this.sidebarmaxwidth,
      sideMenuIconSize: this.sideMenuIconSize,
      sidebarMenuHeight: this.sidebarMenuHeight,
      sidebarTextLineHeight: this.sidebarTextLineHeight,
      sidebarWidth: this.sidebarWidth,
      sidebarBorderWidth: this.sidebarBorderWidth,
      iconSideBarMarginLeft: this.iconSideBarMarginLeft,
      sidebarItemMarginTop: this.sidebarItemMarginTop,
      iconSideBarMarginRight: this.iconSideBarMarginRight,
      iconSideBarMarginRightForFa: this.iconSideBarMarginLeftForFa,
      headerHeight: this.headerHeight,
      headerTextSize: this.headerTextSize,
      projectDetailsDropdown: this.projectDetailsDropdown,
      detailsPopupHeight: this.detailsPopupHeight,
      matOptionHeight: this.matOptionHeight,
      popupMaxHeight: this.popupMaxHeight,
    };
    if (this.screenWidth == screen.width)
      sessionStorage.setItem(
        "SidebarResolution",
        JSON.stringify(resolutionSizes)
      );
    else {
      sessionStorage.removeItem("SidebarResolution");
    }
  }

  checkForScreenResolution() {
    if (
      window.devicePixelRatio != 1 &&
      Math.abs(screen.width - window.innerWidth) > 5
    ) {
      let resolutionSizes = JSON.parse(
        sessionStorage.getItem("SidebarResolution")
      );
      // on first load if there is no key in session - load with default things
      if (resolutionSizes) {
        this.sidebarMenuTextSize = resolutionSizes.sidebarMenuTextSize;
        this.sidebarmaxwidth = resolutionSizes.sidebarmaxwidth;
        this.iconsidebarpadding = resolutionSizes.iconsidebarpadding;
        this.sideMenuIconSize = resolutionSizes.sideMenuIconSize;
        this.sidebarMenuHeight = resolutionSizes.sidebarMenuHeight;
        this.sidebarTextLineHeight = resolutionSizes.sidebarTextLineHeight;
        this.sidebarWidth = resolutionSizes.sidebarWidth;
        this.sidebarItemMarginTop = resolutionSizes.sidebarItemMarginTop;
        this.sidebarBorderWidth = resolutionSizes.sidebarBorderWidth;
        this.iconSideBarMarginLeft = resolutionSizes.iconSideBarMarginLeft;
        this.iconSideBarMarginRight = resolutionSizes.iconSideBarMarginRight;
        this.iconSideBarMarginLeftForFa =
          resolutionSizes.iconSideBarMarginLeftForFa;
        this.headerHeight = resolutionSizes.headerHeight;
        this.headerTextSize = resolutionSizes.headerTextSize;
        this.projectDetailsDropdown = resolutionSizes.projectDetailsDropdown;
        this.detailsPopupHeight = resolutionSizes.detailsPopupHeight;
        this.matOptionHeight = resolutionSizes.matOptionHeight;
        this.popupMaxHeight = resolutionSizes.popupMaxHeight;
      }
    } else if (
      window.devicePixelRatio == 1 &&
      Math.abs(screen.width - window.innerWidth) > 5
    ) {
      if (this.screenWidth == screen.width) {
        sessionStorage.removeItem("SidebarResolution");
      } else {
        let resolutionSizes = JSON.parse(
          sessionStorage.getItem("SidebarResolution")
        );
        // on first load if there is no key in session - load with default things
        if (resolutionSizes) {
          this.sidebarmaxwidth = resolutionSizes.sidebarmaxwidth;
          this.sidebarMenuTextSize = resolutionSizes.sidebarMenuTextSize;
          this.iconsidebarpadding = resolutionSizes.iconsidebarpadding;
          this.sideMenuIconSize = resolutionSizes.sideMenuIconSize;
          this.sidebarMenuHeight = resolutionSizes.sidebarMenuHeight;
          this.sidebarTextLineHeight = resolutionSizes.sidebarTextLineHeight;
          this.sidebarWidth = resolutionSizes.sidebarWidth;
          this.sidebarBorderWidth = resolutionSizes.sidebarBorderWidth;
          this.sidebarItemMarginTop = resolutionSizes.sidebarItemMarginTop;
          this.iconSideBarMarginLeft = resolutionSizes.iconSideBarMarginLeft;
          this.iconSideBarMarginRight = resolutionSizes.iconSideBarMarginRight;
          this.iconSideBarMarginLeftForFa =
            resolutionSizes.iconSideBarMarginLeftForFa;
          this.headerHeight = resolutionSizes.headerHeight;
          this.headerTextSize = resolutionSizes.headerTextSize;
          this.projectDetailsDropdown = resolutionSizes.projectDetailsDropdown;
          this.detailsPopupHeight = resolutionSizes.detailsPopupHeight;
          this.matOptionHeight = resolutionSizes.matOptionHeight;
          this.popupMaxHeight = resolutionSizes.popupMaxHeight;
        }
      }
    } else {
      sessionStorage.removeItem("SidebarResolution");
    }
  }

  onDragEndChat(event) {
    event.preventDefault();
  }

  onDragStartChat(event) {
    event.dataTransfer.setData("text/plain", "aipButton");
    const data = event.dataTransfer.getData("text/plain");
    const element = document.getElementById(data);
    if (element) {
      if (element.offsetLeft == 0 && element.offsetTop == 50) {
        this.offsetX = 160;
        this.offsetY = 10;
      } else {
        this.offsetX = event.clientX - element.offsetLeft;
        this.offsetY = event.clientY - element.offsetTop;
      }
    }
  }

  Configurableinformationicon() {
    let dashconstant: any = new Object();
    dashconstant.keys = "Disable Information";
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project") || "");
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    dashconstant.project_id = new Object({ id: project.id });
    this.apisService
      .findAllDashConstant(dashconstant, this.lazyloadevent)
      .subscribe((res) => {
        let response = res.content;
        if (response && response.length > 0) {
          try {
            this.Configurableinformation = JSON.parse(response[0].value);
          } catch (e: any) {
            console.error("JSON.parse error - ", e.message);
          }
        }
      });
  }

  @HostListener("body:dragover", ["$event"]) onBodyDragOver(event) {
    event.preventDefault(); // Necessary to allow drop
  }

  @HostListener("body:drop", ["$event"]) onBodyDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    if (!this.showChatBot) {
      const aipButton = document.getElementById("aipButton");
      if (aipButton) {
        aipButton.style.position = "relative";
      }

      const element = document.getElementById(data);
      if (element) {
        element.style.position = "absolute";
        element.style.left = event.clientX - this.offsetX + "px";
        element.style.top = event.clientY - this.offsetY + "px";
      }
    }
  }

  toggleSidebarMenu() {
    this.showSidebarMenuList = true;
    sessionStorage.setItem(
      "showSidebarMenuList",
      JSON.stringify(this.showSidebarMenuList)
    );
    this.sidebarMenuPopupWidth = "130px";
    this.sidebarMenuToggle = true;
    this.show_sidebar_full_text = true;
    this.sidebarmaxwidth = "260px";
    sessionStorage.setItem(
      "sidebarmaxwidth",
      JSON.stringify(this.sidebarmaxwidth)
    );
  }

  closeSidebarMenuPopup() {
    this.showSidebarMenuList = false;
    sessionStorage.removeItem("showSidebarMenuList");
    this.sidebarMenuPopupWidth = "0px";
    this.show_sidebar_full_text = false;
    sessionStorage.removeItem("sidebarmaxwidth");
    this.sidebarmaxwidth = "7vw";
  }

  onSidebarMenuItemClick(event: any, item: any) {
    this.showSidebarMenuList = true;
    sessionStorage.setItem(
      "showSidebarMenuList",
      JSON.stringify(this.showSidebarMenuList)
    );
    this.toggleActive(event, item.label);
    if (item.children && item.children.length) {
      this.showTabs(item);
    } else {
      this.viewtabsonload();
    }
    this.sidebarMenuPopupWidth = "130px";
    this.sidebarMenuToggle = true;
    this.show_sidebar_full_text = true;
    this.sidebarmaxwidth = "260px";
  }

  getContentMarginLeft(): string {
    if (this.showSidebarMenuList) {
      return "150px";
    } else {
      return "65px";
    }
  }
}
