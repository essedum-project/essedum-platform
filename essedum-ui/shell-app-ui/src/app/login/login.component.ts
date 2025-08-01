import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, Subscription } from 'rxjs';
import { ApisService } from '../services/apis.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: any;
  psd: any;
  errorAlert: boolean = false;
  alertMsg: any = "";
  example: any = new Object();
  showLogin: boolean = false;
  reset: boolean = false;
  access: boolean = false;
  user = new Object();
  message: any = "";
  lazyloadevent = { first: 0, rows: 5000, sortField: null, sortOrder: 1 };
  fetchingDashConst: boolean = false;
  returnUrl: string = "";
  autoportfolio: any;
  autoproject: any;
  autorole: any;
  subscription: Subscription = new Subscription;
  checkUserProjectRolePortfolio: boolean = false;
  title: string = '';
  private readonly _destroying$ = new Subject<void>();
  userUnauthorizedMsg: string;
  userUnauthorizedAlert: boolean = false;

  messageService: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

  }
  constructor(
    private router: Router,
    private apisService: ApisService,
    private route: ActivatedRoute,
    private resetPopup: MatDialog,
    private titleService: Title
  ) {
    this.title = this.titleService.getTitle();
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || undefined;
    sessionStorage.removeItem("hidesidebar");
    sessionStorage.removeItem("viewtabs");
    sessionStorage.removeItem("highlightedLabel");
    sessionStorage.removeItem("TabTableLastTab");
    sessionStorage.removeItem('SelectedProcess')
    if (sessionStorage.getItem("headerFlag"))
      sessionStorage.removeItem("headerFlag");
    sessionStorage.removeItem("tabs");
    sessionStorage.removeItem("selectedIndex");
    sessionStorage.removeItem("sidebarSectionIndex");
    sessionStorage.removeItem("sidebarSectionIndexrole");
    document.documentElement.style.setProperty("--base-color", sessionStorage.getItem("theme"));
    document.documentElement.style.setProperty("--font-type", sessionStorage.getItem("font"));
    sessionStorage.removeItem("isExpaned")

    let activeProfiles: any;
    try {
      activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles")!);
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    if (sessionStorage.getItem("user") && sessionStorage.getItem("portfoliodata") && sessionStorage.getItem("project") && sessionStorage.getItem("role")) {
      this.checkUserProjectRolePortfolio = true
      this.showLogin = false;
      this.fetchingDashConst = true; 
      this.apisService.getDashConsts().subscribe(res => {
        this.fetchingDashConst = false;
      })
    }
    if (JSON.parse(sessionStorage.getItem("activeProfiles")!).indexOf("dbjwt") != -1) {
      if (!this.fetchingDashConst)
        this.showLogin = true;
    }
    if (sessionStorage.getItem("userUnauthorized")) {
      this.userUnauthorizedAlert = true;
      this.userUnauthorizedMsg = "Session expired, Please login again"
    }
  }

  ngOnChange() {
    this.errorAlert = false;
  }

  // db authentication
  dbAuthenticate(username?: string, psd?: string) {
    sessionStorage.setItem("UpdatedUser", "true");
    this.userUnauthorizedAlert = false;
    this.errorAlert = false;
    var formData = {
      username: username ? username : this.username,
      password: psd ? psd : this.psd,
    };
    this.apisService.authenticate(formData).subscribe(
      (res) => {
        if (res.status == 403) {
          this.errorAlert = true;
          this.alertMsg = "Bad Credentials";
        } else {
          this.getUserInfo();
          sessionStorage.removeItem("userUnauthorized")
        }
      },
      (error) => {
        this.errorAlert = true;
        this.alertMsg = "Bad Credentials";
      }
    );
  }
  getUserInfo() {
    
    this.apisService.getUserInfoData().subscribe(
      (userInfo) => {
        if (userInfo.porfolios.length == 0) {
          this.errorAlert = true;
          this.alertMsg = "User isn't Mapped to any Project/Role";
          let activeProfiles;
          try {
            activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles")!);
          } catch (e: any) {
            console.error("JSON.parse error - ", e.message);
          }
          if (
            activeProfiles.indexOf("keycloak") != -1 ||
            activeProfiles.indexOf("msal") != -1 ||
            activeProfiles.indexOf("aicloud") != -1
          )
            this.router.navigate(["autoUserPermission"]);
        } else {
          if (JSON.parse(sessionStorage.getItem("activeProfiles")!).indexOf("dbjwt") != -1 ||
            JSON.parse(sessionStorage.getItem("activeProfiles")!).indexOf("aicloud") != -1)
            this.apisService.initUserAccess(userInfo, this.lazyloadevent).add(() => {
              this.apisService.getDashConsts().subscribe(res => {
         
                if (this.returnUrl && sessionStorage.getItem("needRouting") == "true") {
                  let sSplit = this.returnUrl.split("?")
                  if (sSplit.length > 1) {
                    this.router.navigateByUrl(this.returnUrl)
                  }
                  else
                    this.router.navigate(["." + this.returnUrl])
                  sessionStorage.removeItem("needRouting")
                }
                else
                  this.router.navigate(["landing"])
              })
            });
        }
      },
      () => {
        console.log("error getting userInfo");
        let activeProfiles;
        try {
          activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles")!!);
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        if (
          activeProfiles.indexOf("keycloak") != -1 ||
          activeProfiles.indexOf("msal") != -1
        ) {
          if (sessionStorage.getItem("autoUserCreation") == "false") this.router.navigate(["autoUserPermission"]);
        }
      }
    );
  }
  loginAsGuest() {
    this.dbAuthenticate("demouser", "");
   }
  ngOnDestroy() {
    this._destroying$.next();
    this._destroying$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  showResetPopup() {
 
  }
  goToRegUser() {
    this.router.navigate(['./registerNewUser'])
  }
  trackByMethod(index: any, item: any) {
    console.log("")
  }

  createUserProjectRole(userId: number) {
    let userProjectRole = [{
      user_id: userId,
      project_id: this.autoproject,
      role_id: this.autorole,
      portfolio_id: this.autoportfolio
    }]
    this.apisService.createAll(userProjectRole).subscribe(res => {
      this.apisService.getUserInfo().subscribe()
    })
  }
}
