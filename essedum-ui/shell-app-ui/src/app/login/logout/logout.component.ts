import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "../../services/message.service";
import { ApisService } from "../../services/apis.service";
import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { AppOAuthService } from "../../core/auth.service";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  display: string = "";
  hide1: boolean = true;
  hide2: boolean = true;
  hide3: boolean = true;
  newPassword: any;
  confirmPsd: any;
  oldPassword: any;
  user: any;
  securityKey: any;
  showlogoutinfo: boolean = false;
  isLogoutInProgress = true;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private apisService: ApisService,
    private authService: AppOAuthService,
    private location: Location,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    if (sessionStorage.getItem("user")) {
      this.user = true;
    }
    else { this.user = false }
    this.setTheme();
    if (this.router.url.indexOf("logout") != -1) {
      this.display = "logout";
      this.logout();

    } else if (this.router.url.includes("resetpassword")) this.display = "resetpassword";
    else if (this.router.url.includes("autoUserPermission"))
      this.display = "User doesn't have sufficient permission, Please contact administrator";
    else this.display = "error";
  }

  setTheme() {
    if (this.router.url.indexOf("logout") != -1) {
      document.documentElement.style.setProperty("--base-color", sessionStorage.getItem("defaultTheme"));
      document.documentElement.style.setProperty("--font-type", sessionStorage.getItem("font"));
    }
    else {
      document.documentElement.style.setProperty("--base-color", sessionStorage.getItem("theme"));
      document.documentElement.style.setProperty("--font-type", sessionStorage.getItem("font"));
    }
  }

  login() {
    this.router.navigate(["./"]);
  }

  logout() {
    let activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles"));
    if (activeProfiles.indexOf("oauth2") != -1)
      this.authService.logout();

    this.apisService.revoke().subscribe((response) => {
      console.log("logout compoenet after revoke", response)
      this.isLogoutInProgress = false;
      localStorage.clear();
      console.log("cleared the sessions", response)
      sessionStorage.clear();
    })


  }

  changePassword() {
    if (this.oldPassword == undefined || this.oldPassword == null || this.oldPassword.trim().length == 0)
      return this.messageService.error("Old Password cannot be empty", "Error");

    if (this.newPassword == undefined || this.newPassword == null || this.newPassword.trim().length == 0)
      return this.messageService.error("Password cannot be empty", "Error");

    if (this.confirmPsd == undefined || this.confirmPsd == null || this.confirmPsd.trim().length == 0)
      return this.messageService.error("Confirm Password cannot be empty", "Error");

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\[\]-{}|';:,+=|`~<\\\/>?])[A-Za-z\d!@#$%^&*_\[\]-{}|';:,+=|`~<\\\/>?].{7,19}$/.test(this.newPassword))
      return this.messageService.error("Password should contain atleast 1 number, 1 uppercase and lowercase character and 1 special character", "Error");

    if (
      this.newPassword != undefined &&
      this.confirmPsd != undefined &&
      this.newPassword == this.confirmPsd
    ) {
      let email;
      this.route.params.subscribe((res: any) => {
        email = res.email;
        email = window.atob(email)
      })
      let user = {
        user_email: email,
        password: this.newPassword,
        old_password: this.oldPassword
      }
      this.apisService.resetPassword(user).subscribe((res) => {
        if (res.id) {
          this.newPassword = undefined;
          this.confirmPsd = undefined;
          let value;
          try {
            value = JSON.stringify(res);
          } catch (e: any) {
            console.error("JSON.stringify error - ", e.message);
          }
          this.messageService.info("Password Changed Successfully", "IAMP");
          this.backToLogin();
          //  this.showlogoutinfo =true;
        } else {
          this.messageService.error("Some error occurred", "IAMP");
        }
      },
      (error) => {
        this.messageService.error(error,"IAMP");
      }
      );
    } else this.messageService.error("Passwords do not match", "IAMP");
  }
  back() {
    this.location.back();
  }
  backToLogin() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['']).then(() => window.location.reload());
    // this.router.navigate(['../../login'],{relativeTo:this.route});
  }
  backToLoginPage() {
    this.router.navigate(['']).then(() => window.location.reload());
  }
}