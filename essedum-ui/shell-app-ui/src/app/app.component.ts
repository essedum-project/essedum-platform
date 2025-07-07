import { Component, OnInit } from "@angular/core";
import { filter, pairwise } from "rxjs/operators";
import { Router, RoutesRecognized, NavigationEnd } from "@angular/router";
import { ApisService } from "./services/apis.service";
import { Observable } from 'rxjs';
import { AppOAuthService } from './core/auth.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated!: Observable<boolean>;
  isDoneLoading!: Observable<boolean>;
  returnUrl!: string
  constructor(
    private authService: AppOAuthService,
    private apisService: ApisService,
    private router: Router,
    private ccService: NgcCookieConsentService) {

    let activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles") || '');
    if (activeProfiles.indexOf("dbjwt") != -1) {
      if (!(window.location.href.includes("resetpassword"))) {
        this.returnUrl = window.location.href
        this.returnUrl = this.returnUrl.substring(this.returnUrl.indexOf("#") + 1)
        if (this.returnUrl.indexOf("landing") != -1)
          this.router.navigate(["login"], { queryParams: { returnUrl: this.returnUrl } });
        else
          this.router.navigate(["login"])
      }
      if ((window.location.href.includes("resetpassword"))) {
        let a = window.location.href.split('/#/')
        this.router.navigate([a[1]]);
      }

    } else {
      let href = window.location.href.substring(window.location.href.indexOf("#") + 1)
      if (href.indexOf("landing") != -1)
        localStorage.setItem("returnUrl", href)
      this.isAuthenticated = this.authService.isAuthenticated$;
      this.isDoneLoading = this.authService.isDoneLoading$;
      this.authService.runInitialLoginSequence()
    }
  }
  public showLoader = false;
  loadingText: String = '';
  previousRoute: string = '';
  currentRoute: string = '';

  ngOnInit() {
    this.apisService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousRoute = events[0].urlAfterRedirects;
        this.currentRoute = events[1].urlAfterRedirects;
        localStorage.setItem("currentRoute", this.currentRoute);
      });

    this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd)).subscribe((event) => {
      if (event.id === 1 && event.url === event.urlAfterRedirects) {
      }
    });
  }
}
