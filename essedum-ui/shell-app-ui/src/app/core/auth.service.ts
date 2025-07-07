import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthConfig, OAuthErrorEvent, OAuthService } from "angular-oauth2-oidc";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
} from "rxjs";
import { filter, map } from "rxjs/operators";
import { ApisService } from "../services/apis.service";
import { BASE_OAUTH_CONFIG } from "./auth-config";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TokenExpiryPopupComponent } from "../popups/token-expiry-popup/token-expiry-popup.component";

@Injectable()
export class AppOAuthService {
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();
  private dialogRef: MatDialogRef<TokenExpiryPopupComponent>;
  private route: ActivatedRoute;

  /**
   * Publishes `true` if and only if (a) all the asynchronous initial
   * login calls have completed or errorred, and (b) the user ended up
   * being authenticated.
   *
   * In essence, it combines:
   *
   * - the latest known state of whether the user is authorized
   * - whether the ajax calls for initial log in have all been done
   */
  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$,
  ]).pipe(map((values) => values.every((b) => b)));
  showTokenExpiryPopup: boolean = true;
  tokenExpiryTimeout: number = 123;

  private navigateToLoginPage() {
    // TODO: Remember current URL
    //this.router.navigateByUrl("/should-login");
  }
  constructor(
    private oauthService: OAuthService,
    private apiService: ApisService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(BASE_OAUTH_CONFIG) public authConfig: AuthConfig
  ) {
    this.oauthService.configure(this.authConfig);
    // Useful for debugging:
    this.oauthService.events.subscribe((event) => {
      if (event instanceof OAuthErrorEvent) {
        console.error("OAuthErrorEvent Object:", event);
      } else {
        console.warn("OAuthEvent Object:", event);
      }
    });

    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
    window.addEventListener("storage", (event) => {
      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== "access_token" && event.key !== null) {
        return;
      }

      console.warn(
        "Noticed changes to access_token (most likely from another tab), updating isAuthenticated"
      );
      this.isAuthenticatedSubject$.next(
        this.oauthService.hasValidAccessToken()
      );

      if (!this.oauthService.hasValidAccessToken()) {
        this.navigateToLoginPage();
      }
    });

    this.oauthService.events.subscribe((_) => {
      this.isAuthenticatedSubject$.next(
        this.oauthService.hasValidAccessToken()
      );
    });

    this.oauthService.events
      .pipe(filter((e) => ["token_received"].includes(e.type)))
      .subscribe((e) => {
        if (sessionStorage.getItem("user") && sessionStorage.getItem("portfoliodata") && sessionStorage.getItem("project") && sessionStorage.getItem("role")) {
          localStorage.setItem("jwtToken", localStorage.getItem("access_token") || '');
          this.apiService.getDashConsts().subscribe(res => {
            // sessionStorage.setItem("needRouting", "true")
            if (localStorage.getItem("returnUrl") && localStorage.getItem("returnUrl") != "/landing" && sessionStorage.getItem("needRouting") == "true") {

              let sSplit = localStorage.getItem("returnUrl").split("?")
              if(sSplit.length >1){
                this.router.navigateByUrl(localStorage.getItem("returnUrl"))
              }
              else
              this.router.navigate(["." + localStorage.getItem("returnUrl")])
              sessionStorage.removeItem("needRouting")
            }
            // this.router.navigate(["landing"])
          })
        }
        else
          this.getUserInfo();
      });

    this.oauthService.events
      .pipe(
        filter((e) => ["session_terminated", "session_error"].includes(e.type))
      )
      .subscribe((e) => this.navigateToLoginPage());

    this.oauthService.setupAutomaticSilentRefresh();
  }

  private getUserInfo() {
    this.removeSession();
    let lazyloadevent = {
      first: 0,
      rows: 5000,
      sortField: null,
      sortOrder: 1,
    };
    this.apiService.getUserAtLogin(lazyloadevent);
  }

  public runInitialLoginSequence(): Promise<void> {
    if (location.hash) {
      console.log("Encountered hash fragment, plotting as table...");
      console.table(
        location.hash
          .substr(1)
          .split("&")
          .map((kvp) => kvp.split("="))
      );
    }
    // this.getMultipleConsts();
    // if (this.showTokenExpiryPopup) {
    //   this.tokenExpirationCheck();
    // }
    // 0. LOAD CONFIG:
    // First we have to check to see how the IdServer is
    // currently configured:
    return (
      this.oauthService
        .loadDiscoveryDocument()
        // 1. HASH LOGIN:
        // Try to log in via hash fragment after redirect back
        // from IdServer from initImplicitFlow:
        .then(() => this.oauthService.tryLogin())

        .then(() => {
          if (this.oauthService.hasValidAccessToken()) {
            this.getUserInfo();
            return Promise.resolve();
          }

          // 2. SILENT LOGIN:
          // Try to log in via a refresh because then we can prevent
          // needing to redirect the user:
          return this.oauthService
            .silentRefresh()
            .then(() => {
              //this.getUserInfo();
              Promise.resolve();
            })
            .catch((result) => {
              // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
              // Only the ones where it's reasonably sure that sending the
              // user to the IdServer will help.              
              const errorResponsesRequiringUserInteraction = [
                "interaction_required",
                "login_required",
                "account_selection_required",
                "consent_required",
              ];

              if (
                result &&
                result.reason &&
                result.reason.params &&
                errorResponsesRequiringUserInteraction.indexOf(
                  result.reason.params.error
                ) >= 0
              ) {
                // 3. ASK FOR LOGIN:
                // At this point we know for sure that we have to ask the
                // user to log in, so we redirect them to the IdServer to
                // enter credentials.
                //
                //Enable this to ALWAYS force a user to login.
                this.login();
                //
                // Instead, we'll now do this:
                console.warn(
                  "User interaction is needed to log in, we will wait for the user to manually log in."
                );
                return Promise.resolve();
              }

              // We can't handle the truth, just pass on the problem to the
              // next handler.
              return Promise.reject(result);
            });
        })

        .then(() => {
          this.isDoneLoadingSubject$.next(true);

          // Check for the strings 'undefined' and 'null' just to be sure. Our current
          // login(...) should never have this, but in case someone ever calls
          // initImplicitFlow(undefined | null) this could happen.
          if (
            this.oauthService.state &&
            this.oauthService.state !== "undefined" &&
            this.oauthService.state !== "null"
          ) {
            let stateUrl = this.oauthService.state;
            if (stateUrl.startsWith("/") === false) {
              stateUrl = decodeURIComponent(stateUrl);
            }
            console.log(
              `There was state of ${this.oauthService.state}, so we are sending you to: ${stateUrl}`
            );
            this.router.navigateByUrl(stateUrl);
          }
        })
        .catch(() => this.isDoneLoadingSubject$.next(true))
    );
  }
  public login(targetUrl?: string) {
    // Note: before version 9.1.0 of the library you needed to
    // call encodeURIComponent on the argument to the method.
    this.oauthService.initLoginFlow(targetUrl || this.router.url);
  }

  public logout() {
    return this.oauthService.logOut();
  }

  public logoutAndClearSession() {
    this.logout();
    this.apiService.revoke().subscribe((response) => {
      localStorage.clear();
      sessionStorage.clear();

    })
  }

  public refresh() {
    this.logout()
    return this.oauthService.silentRefresh().then(() => {
      this.hasValidToken();
    });
  }

  public revokeTokenAndLogout() {
    return this.oauthService.revokeTokenAndLogout();
  }

  public hasValidToken() {
    return this.oauthService.hasValidAccessToken();
  }

  public stopAutomaticRefresh() {
    return this.oauthService.stopAutomaticRefresh();
  }

  // These normally won't be exposed from a service like this, but
  // for debugging it makes sense.
  public get accessToken() {
    return this.oauthService.getAccessToken();
  }
  public get refreshToken() {
    return this.oauthService.getRefreshToken();
  }
  public get identityClaims() {
    return this.oauthService.getIdentityClaims();
  }
  public get idToken() {
    return this.oauthService.getIdToken();
  }
  public get logoutUrl() {
    return this.oauthService.logoutUrl;
  }
  removeSession() {
    sessionStorage.removeItem("disablebreadcrumb");
    sessionStorage.removeItem("hidesidebar");
    sessionStorage.removeItem("viewtabs");
    sessionStorage.removeItem("highlightedLabel");
    sessionStorage.removeItem("TabTableLastTab");
    let url = window.location.href;
    sessionStorage.removeItem("tabs");
    sessionStorage.removeItem("sidebarbreadcrumb");
    sessionStorage.removeItem("selectedIndex");
    sessionStorage.removeItem("sidebarSectionIndex");
    sessionStorage.removeItem("sidebarSectionIndexrole");
    sessionStorage.removeItem("isExpaned")
  }

  // tokenExpirationCheck() {
  //   this.getMultipleConsts();
  //   let countdownInterval = setInterval(() => {
  //     let tokenExpirationTime = this.oauthService.getAccessTokenExpiration();
  //     let currentTime = Date.now();
  //     let timeLeft = Math.floor((tokenExpirationTime - currentTime) / 1000);
  //     if (this.tokenExpiryTimeout == undefined || this.tokenExpiryTimeout == null || this.tokenExpiryTimeout == 0 || this.tokenExpiryTimeout < 63) this.tokenExpiryTimeout = 123;
  //     if (timeLeft < this.tokenExpiryTimeout) {
  //       if (!this.dialogRef || !this.dialogRef.componentInstance) {
  //         this.dialogRef = this.dialog.open(TokenExpiryPopupComponent, { data: { tokenStatus: 'Expiring', timeLeft: timeLeft }, disableClose: true });
  //       }
  //     }
  //     if (timeLeft <= 0) {
  //       if (!this.dialogRef || !this.dialogRef.componentInstance) {
  //         this.dialogRef = this.dialog.open(TokenExpiryPopupComponent, { data: { tokenStatus: 'Expired' }, disableClose: true });
  //       } else {
  //         this.dialogRef.componentInstance.updateTokenStatus('Expired');
  //       }
  //       clearInterval(countdownInterval);
  //     }
  //   }, 60000)//checking for every minute
  // }
  public browserRefresh() {
    this.refresh().then(() => {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
    });
  }

  // getMultipleConsts() {
  //   this.apiService.getStartupConstants(['tokenExpiryTimeout', 'showTokenExpiryPopup'])
  //     .subscribe(response => {
  //       if (response['showTokenExpiryPopup'] == false || response['showTokenExpiryPopup'] == true) {
  //         this.showTokenExpiryPopup = response['showTokenExpiryPopup']
  //       }
  //       this.tokenExpiryTimeout = parseInt(response['tokenExpiryTimeout']);
  //     }, error => {
  //       console.error(error);
  //     });
  // }
}
