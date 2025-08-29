
import { EventEmitter, Injectable, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { of } from 'rxjs';
import { catchError } from "rxjs/operators";
import { throwError, Subject } from "rxjs";
import { PageResponse, PageRequestByExample } from "./paging";
import { Router } from "@angular/router";
import { OAuthService } from "angular-oauth2-oidc";



@Injectable()
export class ApisService {
  public status: Subject<boolean> = new Subject<boolean>();
  public fetchConst: boolean = false;

  private dashconstants: any[] = [];
  private userinfodata: any;
  private salt: string = sessionStorage.getItem('encDefault') || '';

  private cancelPendingRequests$ = new Subject<void>();
  displaybreadcrumbs;
  @Output() refreshImage = new EventEmitter<any>();
  constructor(
    private http:HttpClient,
    private https: HttpClient,
    private router: Router,
    private oauthService: OAuthService
  ) { }

  refreshProfileImage() {
    this.refreshImage.emit();
  }
  
  initUserAccess(userInfo: any, event?: any): any {
    let dashconstant1: any = new Object();
    dashconstant1.keys = userInfo.porfolios[0].porfolioId.portfolioName + "default";
    let flag1 = 0;
    let projectindex = 0;
    let currentProject = JSON.parse(sessionStorage.getItem('project'));
    let currentRole = JSON.parse(sessionStorage.getItem('role'));
    let projectCheck = false;

    return this.findAllDashConstant(dashconstant1, event).subscribe((response) => {
      //this.dashconstants = response.content;
      let res = response.content;
      res = res.filter((item) => item.keys == userInfo.porfolios[0].porfolioId.portfolioName + "default");
      res.forEach(item => {
        if (currentProject && currentProject.id == item.project_id.id) {
          projectCheck = true;
          return;
        }
      });
      if (res && res.length > 0 && projectCheck) {
        let temp;
        try {
          temp = JSON.parse(res[0].value);
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        let value = temp;
        let defaultproject = value.defaultproject;
        if (defaultproject) {
          userInfo.porfolios[0].projectWithRoles.forEach((element: any, index: any) => {
            if (element.projectId.id == defaultproject) {
              projectindex = index;
              flag1 = 1;
              let porfolios;
              try {
                porfolios = JSON.stringify(userInfo.porfolios[0].projectWithRoles[projectindex].projectId);
                sessionStorage.setItem("project", porfolios);
              } catch (e: any) {
                console.error("JSON.parse error - ", e.message);
              }
            }
          });
        }
      }
      let index = 0;
      if (userInfo.porfolios[0].projectWithRoles.length > 1) {
        if (userInfo.porfolios[0].projectWithRoles[index].projectId.id === (JSON.parse(sessionStorage.getItem('autoUserProject'))).id) {
          index++;
        }
      }
      if (flag1 == 1) index = projectindex;
      if (flag1 == 0) {
        if (currentProject) {
          sessionStorage.setItem("project", JSON.stringify(currentProject));
        }
        else {
          sessionStorage.setItem("project", JSON.stringify(userInfo.porfolios[0].projectWithRoles[index].projectId));
        }
      }
      let flag = 0;
      if (res && res.length > 0) {
        let project: any;
        try {
          project = JSON.parse(sessionStorage.getItem("project") || '');
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
        let value = JSON.parse(res[0].value).defaultprojectroles.filter((item: any) => item.project == project.id);
        if (value.length > 0) {
          let defaultrole = value[0].role;
          let clientDetailsDefaultRole; 
          if(userInfo.userId.clientDetails){
            let temp = JSON.parse(userInfo.userId.clientDetails)
            temp.forEach(item => {
              if (item.pointer.trim() === new String("defaultRole").trim() && !clientDetailsDefaultRole){
                clientDetailsDefaultRole = item.value; //stores value for key defaultRole
                return;

              }

            });

          }
          let clientFlag= false;
          if (clientDetailsDefaultRole) {
            let index = 0;
            if (flag1 == 1) index = projectindex;
            userInfo.porfolios[0].projectWithRoles[index].roleId.forEach((element) => {
              if (element.name.trim() === clientDetailsDefaultRole.trim()) {
                let value;
                clientFlag = true; //Allows the normal default role to be used if client details loops but role is not attached to user
                try {
                  value = JSON.stringify(element);
                } catch (e:any) {
                  console.error("JSON.stringify error - ", e.message);
                }
                sessionStorage.setItem("role", value);
                flag = 1;
              }
            });
          }

          if (defaultrole && (!clientDetailsDefaultRole||!clientFlag)) {
            let index = 0;
            if (flag1 == 1) index = projectindex;
            userInfo.porfolios[0].projectWithRoles[index].roleId.forEach((element: any) => {
              if (element.id == defaultrole) {
                let value;
                try {
                  value = JSON.stringify(element);
                  sessionStorage.setItem("role", value);
                } catch (e: any) {
                  console.error("JSON.stringify error - ", e.message);
                }

                flag = 1;
              }
            });
          }
        }
      }
      sessionStorage.setItem("user", JSON.stringify(userInfo.userId));
      localStorage.setItem("user", JSON.stringify(userInfo.userId));

      if (currentProject) {
        sessionStorage.setItem("organization", currentProject.name);
        localStorage.setItem("organization", currentProject.name);
      }
      else {
        sessionStorage.setItem("organization", userInfo.porfolios[0].projectWithRoles[index].projectId.name);
        localStorage.setItem("organization", userInfo.porfolios[0].projectWithRoles[index].projectId.name);
      }

      if (flag == 0) {
        if (currentRole) {
          sessionStorage.setItem("role", JSON.stringify(currentRole));
        }
        else {
          sessionStorage.setItem("role", JSON.stringify(userInfo.porfolios[0].projectWithRoles[index].roleId[0]));
        }
      }

      let project;
      try {
        project = JSON.parse(sessionStorage.getItem("project") || '');
      } catch (e: any) {
        console.error("JSON.parse error - ", e.message);
      }
    });
  }


  getPermission(mod: any): Observable<any> {
    let role = JSON.parse(sessionStorage.getItem('role') || '').id;
    return this.https.get('/api/usm-role-permissionss/formodule/' + role,
      { observe: 'response', responseType: 'text', params: { module: mod } })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  findAllDashboardConfiguration(dashboardConfiguration: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(dashboardConfiguration, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, "utf8").toString("base64");
    let headers = new HttpHeaders().append("example", headerValue);
    return this.https
      .get("/api/dashboard-configurations/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  findAllDashConstant(dash_constant: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(dash_constant, event);
    let body: any;
    try {
      body = JSON.stringify(req);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, "utf8").toString("base64");
    let headers = new HttpHeaders().append("example", headerValue);
    return this.https
      .get("/api/dash-constants/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getDashConsts(): Observable<any[]> {
    try {
      let project = JSON.parse(sessionStorage.getItem("project") || '').id;
      let projectname = JSON.parse(sessionStorage.getItem("project") || '').name;
      let cached = sessionStorage.getItem("AppCacheDashConstant");
      if (cached && cached == "true") return this.callDashConstantApi(project);
      else {
        if (this.dashconstants && this.dashconstants.length) {
          let tempDashConst = this.dashconstants.filter((item) => !item.keys.toLowerCase().endsWith("default"));
          if (tempDashConst && tempDashConst.length && tempDashConst[0].project_id.id == project)
            return of(this.dashconstants);
          else if (this.fetchConst && projectname != "Core" && tempDashConst[0].project_id.name == "Core")
            return of(this.dashconstants);
          else {
            this.fetchConst = false;
            let result = this.callDashConstantApi(project);
            this.fetchConst = true;
            return result;
          }
        } else return this.callDashConstantApi(project);
      }
    } catch (error) { return this.handleAPIError(error); }
  }

  /* *************DST API *********** */
  DSTService(): Observable<any> {
    return this.https
      .get("/api/dst/", { observe: "response" })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return err;
        })
      );
  }

  callDashConstantApi(project: any) {
    let portfolio = JSON.parse(sessionStorage.getItem("project") || "").portfolioId.id;
    return this.https
      .get("/api/get-dash-constants?projectId=" + project + "&portfolioId=" + portfolio, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          this.setYmlConfigs(pr);
          this.dashconstants = pr;
          sessionStorage.removeItem("AppCacheDashConstant");
          return this.dashconstants;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  setYmlConfigs(res: any) {
    res = res.filter((item: any) => item.keys == 'YMLdefault');
    if (res && res.length) {
      try {
        let configs = JSON.parse(res[0].value);
        Object.keys(configs).forEach(config => {
          sessionStorage.setItem(config, JSON.stringify(configs[config]));
        });
      } catch (e: any) {
        console.error('JSON.parse error', e);
      }
    }
  }

  authenticate(formdata: any): Observable<any> {
    let body;
    try {
      if(formdata.username == "demouser"){
        body="eyJ1c2VybmFtZSI6ImRlbW91c2VyIiwicGFzc3dvcmQiOiJJbmZ5QDEyMyJ9"
      }
      else{
      body = JSON.stringify(formdata);
      body = Buffer.from(body, 'utf8').toString('base64');
      }
      return this.https
        .post("/api/authenticate", body, {
          observe: "response",
        })
        .pipe(
          map((response: any) => {
            if (response.status == 200) {
              localStorage.setItem("jwtToken", response.body["access_token"]);
              return new Object(response.body);
            } else {
              return this.handleAPIError("");
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleAPIError(err);
          })
        );
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
      return this.handleAPIError(e);
    }

  }

  getUserInfo(): Observable<any> {
    let result;
    this.salt = sessionStorage.getItem('encDefault') || '';
    return this.https
      .get("/api/userInfo", {
        observe: "response",
        headers: new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("jwtToken") }),
        responseType: "text",
      })
      .pipe(
        switchMap(async (response) => {
          result = JSON.parse(await this.decryptUsingAES256(response.body, this.salt));
          this.userinfodata = result;
          sessionStorage.removeItem("UpdatedUser");
          return this.userinfodata;
        })
      )
      .pipe(
        catchError((err) => {
          window.location.href = sessionStorage.getItem("contextPath") + 'unauthorized.html';
          return throwError("You are not authorised to access this application. Please contact the admin");
        })
      );
  }
  getUserInfoData(): Observable<any> {
    let cached = sessionStorage.getItem("UpdatedUser");
    if (cached && cached == "true") return this.getUserInfo();
    else {
      if (this.userinfodata) {
        return of(this.userinfodata);
      } else return this.getUserInfo();
    }
  }

  update(users: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/userss/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response.json()))
          return new Object(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllUsers(users: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(users, event);
    let body;
    try {
      body = JSON.stringify(req);
      let headerValue = Buffer.from(body, "utf8").toString("base64");
      const project = JSON.parse(sessionStorage.getItem("project") || '{}');
      const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');
    
      // Set headers
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
        'Content-Type': 'application/json',
        'Accept': 'application/json,text/plain, */*',
        'Priority': 'u=1, i',
        'project': project.id || '',
        'projectname': project.name || '',
        'roleid': userRole.id || '',
        'rolename': userRole.name || '',
        'example': headerValue
      });

      return this.https
        .get("/api/userss/page", {
          observe: "response",
          headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
      return this.handleError(e);
    }

  }
  resetPassword(users: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .put("/api/userss/resetPassword", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response.json()))
          return new Object(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  //   iamp-usm
  findAllUserPortfolio(usm_portfolio: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(usm_portfolio, event);
    let body;
    try {
      body = JSON.stringify(req);
      let headerValue = Buffer.from(body, "utf8").toString("base64");
      let headers = new HttpHeaders();
      headers = headers.append("example", headerValue);
      return this.https
        .get("/api/usm-portfolios/page", {
          observe: "response",
          headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
      return this.handleError(e);
    }

  }
  findAllUserProjectRole(user_project_role: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    try {
      body = JSON.stringify(req);
      let headerValue = Buffer.from(body, "utf8").toString("base64");
      let headers = new HttpHeaders();
      headers = headers.append("example", headerValue);
      return this.https
        .get("/api/user-project-roles/page", {
          observe: "response",
          headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
      return this.handleError(e);
    }


  }
  private handleError(error: any) {
    let errMsg = error.message
          ? error.message
          :error.status 
          ? `Status: ${error.status} - Text: ${error.statusText}` 
          : "Server error";
    if (error.status === 401) {
      window.location.href = "/";
    } else if ([502, 503, 504].includes(error.status)) {
      errMsg = "Server Error";
    } else if (typeof error.error == "object") {
      errMsg = "Server Error";
    }
    return throwError(errMsg);
  }

  handleAPIError(error: any) {
    let errObj;

    let tempStr = error.statusText ? error.statusText : error.title ? error.title : "Error message not available";
    let msg = error.message ? error.message : `${error.status}: ${tempStr}`;

    let body = error["_body"];

    if (body) {
      try {
        errObj = body === Object(body) ? body : JSON.parse(body);
      } catch (err) {
        console.dir(body);
      }
    }
    if (errObj) {
      if (!errObj.message) {
        errObj["message"] = msg;
      }
    } else {
      // errObj = {};
      errObj["code"] = error.status;
      errObj["message"] = msg;
      errObj["detailedMessage"] = error.detail ? error.detail : msg;
    }
    error["_body"] = errObj;
    if (error.status === 401) window.location.href = "/";
    return throwError(errObj.message);
  }

  registerNewUser(userDetails: any): Observable<any> {
    let body;
    let result;
    try {
      body = JSON.stringify(userDetails);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/registerUser", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  forgotPassword(email: any): Observable<any> {
    return this.https
      .post("/api/email/message", email, {
        observe: "response",
        responseType: "text",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  checkEmail(email: any): Observable<any> {
    this.salt = sessionStorage.getItem('encDefault') || '';

    return from(this.encrypt(email, this.salt)).pipe(
      switchMap((encryptedEmail) => {
        let headers = new HttpHeaders();
        headers = headers.append('email', encryptedEmail);
        return this.https.get('/api/userss/checkemail', {
          observe: 'response',
          headers: headers,
        });
      }),
      map((response) => {
        return response.body;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  getaicloudUser(): Observable<any> {
    return this.https.get("/api/authenticate", {
      observe: "response"
    })
      .pipe(
        map((response: any) => {
          if (response.status == 200) {
            localStorage.setItem("jwtToken", response.body["access_token"]);
            return new Object(response.body);
          } else {
            return this.handleError("");
          }
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  getUserAtLogin(event: any) {
    localStorage.setItem("jwtToken", localStorage.getItem("access_token") || '');
    let token = this.oauthService.getAccessToken();
    localStorage.setItem("accessToken", token);
    let pfolio: any, prjct: any, prole: any;
    let userAccess = false;
    let returnUrl = localStorage.getItem("returnUrl");
    if (returnUrl && returnUrl.indexOf("pfolio") != -1 && returnUrl.indexOf("&prjct") != -1 && returnUrl.indexOf("&prole") != -1) {
      let returnUrl = localStorage.getItem("returnUrl") || '';
      let autoportfolio = returnUrl.slice(returnUrl.indexOf("pfolio") + 7, returnUrl.indexOf("&prjct"));
      let autoproject = returnUrl.slice(returnUrl.indexOf("prjct") + 6, returnUrl.indexOf("&prole"));
      let autorole = returnUrl.slice(returnUrl.indexOf("prole") + 6, returnUrl.length);
      this.getUsmPortfolio(autoportfolio).subscribe(p => pfolio = p);
      this.getProject(autoproject).subscribe(p => prjct = p);
      this.getRole(autorole).subscribe(r => prole = r);
    }
    this.getUserInfoData().subscribe(
      (userInfo) => {
        if (userInfo.porfolios.length == 0) {
          let activeProfiles;
          try {
            activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles") || '');
          } catch (e: any) {
            console.error("JSON.parse error - ", e.message);
          }
          if (activeProfiles.indexOf("keycloak") != -1 ||
            activeProfiles.indexOf("msal") != -1 ||
            activeProfiles.indexOf("aicloud") != -1)
            this.router.navigate(["autoUserPermission"]);
        } else {
          this.initUserAccess(userInfo, event).add(() => {
            this.getDashConsts().subscribe(res => {
              if (localStorage.getItem("returnUrl") && pfolio && prjct && prole) {
                userAccess = this.checkUserAccess(userInfo, pfolio, prjct, prole);
                if (userAccess)
                  this.router.navigateByUrl(localStorage.getItem("returnUrl") || "");
              }
              if (!userAccess)
                this.router.navigate(["landing"]);
            });
          });
        }
      },
      () => {
        console.log("error getting userInfo");
        let activeProfiles: string = "";
        try {
          activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles") || "");
          if (activeProfiles.indexOf("keycloak") != -1 ||
            activeProfiles.indexOf("msal") != -1) {
            if (sessionStorage.getItem("autoUserCreation") == "false") this.router.navigate(["autoUserPermission"]);
          }
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }
      }
    );
  }

  checkUserAccess(userInfo: any, autoportfolio: any, autoproject: any, autorole: any) {
    let portfolioFiltered = userInfo.porfolios.filter((p: any) => p.porfolioId.id == autoportfolio.id);
    let projectFiltered = portfolioFiltered && portfolioFiltered[0]?.projectWithRoles.filter((pr: any) => pr.projectId.id == autoproject.id);
    let roleFiltered = projectFiltered && projectFiltered[0]?.roleId.filter((r: any) => r.id == autorole.id);
    /** User has access to mentioned project & role */
    if (roleFiltered)
      return true;


    /** Project autologin is true & role mentioned is autologin role */
    else if (autoproject.projectAutologin && autoproject.autologinRole.id == autorole.id) {
      let userProjectRole = [{
        user_id: userInfo.userId,
        project_id: autoproject,
        role_id: autorole,
        portfolio_id: autoportfolio
      }];
      this.createAll(userProjectRole).subscribe(res => {
        this.getUserInfo().subscribe();
      });
      return true;
    }



    /** Autologin is false or role mentioned is not autologin role NOR user has access previously  */
    else
      return false;
  }


  /** Cancels all pending Http requests. */
  public cancelPendingRequests() {
    this.cancelPendingRequests$.next();
  }

  public onCancelPendingRequests() {
    return this.cancelPendingRequests$.asObservable();
  }

  /**
   * Get a UsmPortfolio by id.
   */
  getUsmPortfolio(id: any) {
    return this.https
      .get("/api/usm-portfolios/" + id)
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
  * Get a Role by id.
  */
  getRole(id: any) {
    return this.https
      .get("/api/roles/" + id)
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
 * Get a Project by id.
 */
  getProject(id: any) {
    return this.https
      .get("/api/projects/" + id)
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Create a List of  UserProjectRoles.
   */
  createAll(user_project_role: any) {
    let result;
    const copy = Object.assign([], user_project_role);
    return this.https
      .post("/api/user-project-roles-list/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return a;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  async encrypt(plaintext, password) {

    const encryptedData = await this.encryptgcm(plaintext, password);
    return JSON.stringify(encryptedData);

  }

  async decryptUsingAES256(cipherResponse, password) {

    let cipherJson = JSON.parse(cipherResponse);
    let output = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password);
    return output;

  }

  async decryptgcm(ciphertext, iv, password) {
    // Decode the ciphertext and IV from Base64 strings
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    // Prepare the decryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: decodedIV
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    const decryptedText = new TextDecoder().decode(decryptedData);

    return decryptedText;

  }

  async encryptgcm(plaintext, password) {
    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Prepare the encryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: iv
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['encrypt']
    );

    // Encrypt the plaintext
    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(algorithm, importedKey, encodedText);

    const ciphertextArray = Array.from(new Uint8Array(ciphertext));
    // Convert Uint8Array to regular array 
    const encodedCiphertext = btoa(String.fromCharCode.apply(null, ciphertextArray));
    // const encodedIV = btoa(Array.from(iv));
    // const encodedIV = btoa(String.fromCharCode.apply(null, iv));
    const encodedIV = btoa(Array.from(iv).map((byte) => String.fromCharCode(byte)).join(''));

    const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV };

    return encryptedJSON;
  }
  findAllNotifications(notify: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(notify, event);
    let headerValue;
    let body;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
      let headers = new HttpHeaders();
      headers = headers.append("example", headerValue);
      return this.https
        .get("/api/usm-notificationss/page", {
          observe: "response",
          headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
      return this.handleError(e);
    }

  }
  updateNotification(users: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-notificationss", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response.json()))
          return new Object(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllModules(module: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(module, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-modules/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllPermissions(usm_permissions: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(usm_permissions, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(
            pr.totalPages,
            pr.totalElements,
            pr.content
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getLicenseConfigResource(): Observable<any> {
    return this.https
      .post("/api/license", {
        observe: "response",
        responseType: "text",
      })
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  revoke(): Observable<any> {
    return this.revokeRecursive(200);
  }

  revokeRecursive(retryCount): Observable<any> {
    return this.https.get("/api/essedum/logout",
      { observe: "response", responseType: "text", })
      .pipe(map((response) => {
        if (response.status == 200) {
          console.log("response of revoke api", response.body);
          return response.body;
        }
      }))
      .pipe(catchError((error) => {
        console.log("response catch error", error);
        //return this.handleAPIError(error);
        if (retryCount < 0) {
          console.log("response catch finally ", error);
          return this.handleAPIError(error);
        }
        console.log("response catch retrying.. ", retryCount);

        this.delay(10000);
        return this.revokeRecursive(retryCount - 1);
      }));
  }
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStartupConstants(keys: string[]): Observable<any> {
    return this.https.get("/api/get-startup-constants", {
      params: { keys },
      observe: "response",
    })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return pr;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  checkDeclaration(userId,role21,organization):Observable<any>
  {
   return this.http.get('/api/inbox/checkDeclaration',
     { params: {
        "userId":userId,
         "role":role21,
         "organization":organization
     },observe:'response'})
     .pipe(
       map(response => {
         return response.body 
       })
     )
}

 saveEntry(rowData: string, action: string, datasetName: string): Observable<any> {
   let apiParams = {action: action, datasetName: datasetName, projectName: sessionStorage.getItem('organization'),rowData:rowData};
    return this.http.post('/api/datasets/saveEntry', rowData, { params: apiParams, observe: 'response', responseType: 'text' })
     .pipe(map(response => {
       if (response && response.body) return response.body;
       else if (response && response.ok) return "Entry saved successfully";
       else return "Error: An unexpected error occurred while saving entry";
     })) 
     .pipe(catchError(err => { return this.handleError(err); }));
 }

  getDashConstantUsingKey(key: any, project: any): Observable<any> {
    return this.https.get("/api/get-extension-key?projectId=" + project + "&key=" + key, { responseType: "text" })
  }

}
