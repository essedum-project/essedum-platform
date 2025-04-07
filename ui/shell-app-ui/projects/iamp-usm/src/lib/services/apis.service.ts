    //
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/service/message.service.ts.p.vm
//
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import "rxjs/add/observable/of";
import { catchError } from "rxjs/operators";
import { throwError, Subject } from "rxjs";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import * as CryptoJS from 'crypto-js';
import { DashConstant } from "../models/dash-constant";
import { PageRequestByExample, PageResponse } from "../shared-modules/services/paging";
@Injectable()
export class ApisService {
  private messageSource = new BehaviorSubject("Please Wait...");
  public status: Subject<boolean> = new Subject<boolean>();
  private dashconstants: any[];
  private userinfodata: any;
  private salt:string =sessionStorage.getItem('encDefault')

  private cancelPendingRequests$ = new Subject<void>()

  constructor(
    private https: HttpClient,
    private spinnerService: Ng4LoadingSpinnerService,
    private router: Router
  ) {}

  initUserAccess(userInfo: any, event: any): any {
    let dashconstant1: any = new Object();
    dashconstant1.keys = userInfo.porfolios[0].porfolioId.portfolioName + "default";
    let flag1 = 0;
    let projectindex = 0;

    return this.findAllDashConstant(new Object(), event).subscribe((response) => {
      this.dashconstants = response.content;
      let res = response.content;
      res = res.filter((item) => item.keys == userInfo.porfolios[0].porfolioId.portfolioName + "default");
      if (res && res.length > 0) {
        let temp;
        try {
          temp = JSON.parse(res[0].value)
        } catch (e) {
          console.error("JSON.parse error - ", e.message);
        }
        let value = temp;
        let defaultproject = value.defaultproject;
        if (defaultproject) {
          userInfo.porfolios[0].projectWithRoles.forEach((element, index) => {
            if (element.projectId.id == defaultproject) {
              projectindex = index;
              flag1 = 1;
              let porfolios;
              try {
                porfolios = JSON.stringify(userInfo.porfolios[0].projectWithRoles[projectindex].projectId)
              } catch (e) {
                console.error("JSON.parse error - ", e.message);
              }
              sessionStorage.setItem(
                "project", porfolios

              );
            }
          });
        }
      }
      let index = 0;
      if (flag1 == 1) index = projectindex;
      if (flag1 == 0) {
        sessionStorage.setItem("project", JSON.stringify(userInfo.porfolios[0].projectWithRoles[index].projectId));
      }
      let flag = 0;
      if (res && res.length > 0) {
        let project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          console.error("JSON.parse error - ", e.message);
        }
        let value = JSON.parse(res[0].value).defaultprojectroles.filter(
          (item) => item.project == project.id
        );
        if (value.length > 0) {
          let defaultrole = value[0].role;
          if (defaultrole) {
            let index = 0;
            if (flag1 == 1) index = projectindex;
            userInfo.porfolios[0].projectWithRoles[index].roleId.forEach((element) => {
              if (element.id == defaultrole) {
                let value;
                try {
                  value = JSON.stringify(element);
                } catch (e) {
                  console.error("JSON.stringify error - ", e.message);
                }
                sessionStorage.setItem("role", value);
                flag = 1;
              }
            });
          }
        }
      }
      sessionStorage.setItem("user", JSON.stringify(userInfo.userId));
      sessionStorage.setItem("organization", userInfo.porfolios[0].projectWithRoles[index].projectId.name);
      localStorage.setItem("organization", userInfo.porfolios[0].projectWithRoles[index].projectId.name);
      if (flag == 0)
        sessionStorage.setItem("role", JSON.stringify(userInfo.porfolios[0].projectWithRoles[index].roleId[0]));
      let project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        console.error("JSON.parse error - ", e.message);
      }
      this.dashconstants = this.dashconstants.filter(
        (item) =>
          item.project_id.id == project.id ||
          item.keys.includes('default')
      );
    });
  }

  findAllDashConstant(dash_constant: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(dash_constant, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders().append('example', headerValue);
    return this.https
      .get("/api/dash-constants/page", {
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

  getDashConsts(): Observable<any[]> {
    let project = JSON.parse(sessionStorage.getItem('project')).id;
    return this.callDashConstantApi(project);
  }
  getDashConstsForProject(proj): Observable<any[]> {
    let project = proj.id
    let cached = sessionStorage.getItem('CacheDashConstant')
    if (cached && cached == 'true')
      return this.callDashConstantApi(project);
    else {
      if (this.dashconstants && this.dashconstants.length) {
        let tempDashConst = this.dashconstants.filter(item => !item.keys.endsWith('default'))
        if (tempDashConst && tempDashConst.length && tempDashConst[0].project_id.id == project)
          return Observable.of(this.dashconstants);
        else
          return this.callDashConstantApi(project);
      } else
        return this.callDashConstantApi(project);
    }
  }
  deleteDashConstants(id) {
    return this.https
      .delete("/api/dash-constants/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          //  if(!isDefault)
          // sessionStorage.setItem("CacheDashConstant", "true");
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  createDashConstant(dash_constant: DashConstant, isDefault?: boolean): Observable<DashConstant> {
    const copy = this.convert(dash_constant);
    return this.https
      .post("/api/dash-constants/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          if (!isDefault)
            sessionStorage.setItem("CacheDashConstant", "true");
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          console.log(err);

          return this.handleError(err);
        })
      )
  }

  updateDashConstant(dash_constant: DashConstant, isDefault?: boolean): Observable<DashConstant> {
    const copy = this.convert(dash_constant);
    return this.https
      .put("/api/dash-constants/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          if (!isDefault)
            sessionStorage.setItem("CacheDashConstant", "true");
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  private convert(dash_constant: DashConstant): DashConstant {
    const copy: DashConstant = Object.assign({}, dash_constant);
    return copy;
  }



  callDashConstantApi(project) {
    return this.https
      .get("/api/get-dash-constants?projectId=" + project, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          this.dashconstants = pr;
          sessionStorage.removeItem("CacheDashConstant");
          return this.dashconstants;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getDatasetData(dataset: string, filters): Observable<any> {
    let body;
    try {
      body = JSON.stringify(filters);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders().append('example', headerValue);
    return this.https
      .get("/api/get-widget-result-data/" + dataset + "/" + sessionStorage.getItem("organization"), {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  findAllDashboardConfiguration(dashboardConfiguration: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(dashboardConfiguration, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders().append('example', headerValue);
    return this.https
      .get("/api/dashboard-configurations/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  authenticate(formdata: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(formdata);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    body = Buffer.from(body, 'utf8').toString('base64');
    return this.https
      .post("/preLogin/dbLogin", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            localStorage.setItem("jwtToken", response.body["id_token"]);
            return new Object(response.body);
          }
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleAPIError(err);
        })
      );
  }


  getUserInfo(): Observable<any> {
    let result;
    this.salt=sessionStorage.getItem('encDefault')
    return this.https
      .get("/api/userInfo", {
        observe: "response", 
        headers: new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("jwtToken") }),
        responseType: "text",
      })
      .pipe(
        map((response) => {
          result=JSON.parse(this.decryptUsingAES256(response.body,this.salt))
          this.userinfodata = result;
          sessionStorage.removeItem("UpdatedUser");
          return this.userinfodata;
        })
      )
      .pipe(
        catchError((err) => {
          console.log(err);
          return this.handleAPIError(err);
        })
      );
  }

  getPingUserInfo(url,authToken){
    return this.https.get(url, {
      headers: new HttpHeaders({ Authorization: "Bearer " + authToken }),
    }).pipe(
      map(response=>{
        this.userinfodata = response;
        return this.userinfodata;
      })
    )
  }
  getUserInfoData(): Observable<any> {
    // let cached = sessionStorage.getItem("UpdatedUser");
    let cached = "true"
    if (cached && cached == "true") return this.getUserInfo();
    else {
      if (this.userinfodata) {
        return Observable.of(this.userinfodata);
      } else return this.getUserInfo();
    }
  }

  update(users: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e) {
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
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/userss/page", {
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

  testConnection(datasource: any): Observable<any> {
    return this.https.post('/api/datasources/test', datasource, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDataset(query: string): Observable<any> {
    return this.https
      .get("/api/datasets/" + query + "/" + localStorage.getItem("organization"), {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }
  fetchModulePermisions(module: String) {
    let id = JSON.parse(sessionStorage.getItem('role')).id
    return this.https.get("/api/usm-role-permissionss/formodule/" + id + "?module=" + module, {
      observe: "response",
    }).pipe(
      map((response) => {
        console.log(response.body);

        return response.body;
      })
    )
      .pipe(catchError((err) => this.handleError(err)))
  }

  getDatasetDetails(dataset): Observable<any> {
    if (dataset)
      return this.https
        .get(
          "/api/datasets/getData/" +
          dataset.name +
          "/" +
          localStorage.getItem("organization") +
          "?limit=" +
          sessionStorage.getItem("Limit"),
          {
            observe: "response",
            headers: new HttpHeaders().append("attributes", dataset.attributes)
          }
        )
        .pipe(
          map((response) => {
            return response.body;
          })
        )
        .pipe(catchError((err) => this.handleError(err)));
  }

  resetPassword(users): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .put("/api/userss/updatePassword", body, {
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
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-portfolios/page", {
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


  findAllUserProjectRole(user_project_role: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/user-project-roles/page", {
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

  logout():Observable<any>{
    return this.https
    .get("/api/logout", {
      headers: new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("jwtToken") }),
    })
    .pipe(
      map((response) => {
        return response
      })
    )
    
  }



  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...

    let errMsg = error.message
      ? error.message
      : error.status
        ? `Status: ${error.status} - Text: ${error.statusText}`
        : "Server error";
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = "/";
    }
    return Observable.throw(errMsg);
  }

  handleAPIError(error: any) {
    let errObj = null;

    let tempStr = error.statusText ? error.statusText : error.title ? error.title : "Error message not available";
    let msg = error.error ? error.error : error.message ? error.message : `${error.status}: ${tempStr}`;

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
      errObj = {};
      errObj["code"] = error.status;
      errObj["message"] = msg;
      errObj["detailedMessage"] = error.detail ? error.detail : msg;
    }
    error["_body"] = errObj;

    console.log(errObj);
    
    if (error.status === 401) window.location.href = "/";
    return throwError(errObj.message);
  }
  changeMessage(message: string) {
    this.messageSource.next(message);
  }
  spinnerHide() {
    this.spinnerService.hide();
  }
  spinnerShow() {
    this.spinnerService.show();
  }
 getPermission(mod: any): Observable<any> {
    let role = JSON.parse(sessionStorage.getItem('role')).id
    return this.https.get( 'api/usm-role-permissionss/formodule/'+role, 
    { observe: 'response', responseType: 'text' ,params: {module: mod}})
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  findAllTask(task: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(task, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/tasks/page", body, {
        observe: "response",
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

  findAllTransition(transition: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(transition, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/transitions/page", body, {
        observe: "response",
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

  userAllTasks(params: any = {}, event: any): Observable<PageResponse<any>> {
    // /tasks/all/{projectId}/{transitionId}/{userId}/page[‎7/‎22/‎2020 12:50 PM]  Sachin Saddar:
    // http://localhost:8081/api/tasks/all/1/36/1/page?page=0&size=5
    // tasks/all/{projectId}/{transitionId}/{userId}/page

    let url = `/api/tasks/all/${params.project}/${params.transition}/${params.user}/page?page=${event.page}&size=${event.size}`;
    console.log("url is :", url);

    return this.https
      .get(url, {
        headers: new HttpHeaders({ "Content-Type": "application/json; charset=utf-8" }),
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          console.log("returned response :", pr);
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  userAllTasksReverseKT(params: any = {}, event: any): Observable<PageResponse<any>> {
    // /tasks/all/{projectId}/{transitionId}/{userId}/page[‎7/‎22/‎2020 12:50 PM]  Sachin Saddar:
    // http://localhost:8081/api/tasks/all/1/36/1/page?page=0&size=5
    // tasks/all/{projectId}/{transitionId}/{userId}/page

    let url = `/api/tasks/allKTflag/${params.project}/${params.transition}/${params.user}/page?page=${event.page}&size=${event.size}`;
    console.log("url is :", url);

    return this.https
      .get(url, {
        headers: new HttpHeaders({ "Content-Type": "application/json; charset=utf-8" }),
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          console.log("returned response :", pr);
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
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



  setYmlConfigs(res) {
    res = res.filter(item => item.keys == 'YMLdefault')
    if(res && res.length) {
      try {
        let configs = JSON.parse(res[0].value);
        Object.keys(configs).forEach(config => {
          sessionStorage.setItem(config, JSON.stringify(configs[config]))
        })
      } catch(e) {
        console.error('JSON.parse error')
      }
    }
  }

  findAllIncidents(incidents: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(incidents, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/incidents/page", body, { observe: "response" })
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

  findAllTools(usersId: number, projectsId: number, rolesId: number): Observable<Array<any>> {
    return this.https
      .get("/api/tool-userprojects/tools" + "?toolu=" + usersId + "&projectId=" + projectsId + "&roleId=" + rolesId, {
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

  findAllCclGamification(ccl_gamification: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(ccl_gamification, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, "utf8").toString("base64");
    let headers = new HttpHeaders().append("example", headerValue);
    return this.https
      .get("/api/ccl-gamifications/page", {
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

   findAllProcesses(process: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(process, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, "utf8").toString("base64");
    let headers = new HttpHeaders().append("example", headerValue);
    return this.https
      .get("/api/processs/page", {
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

  findAllDocuments(document: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(document, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, "utf8").toString("base64");
    let headers = new HttpHeaders().append("example", headerValue);
    return this.https
      .get("/api/documents/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Document>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  findAllTickets(tickets: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(tickets, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
    return this.https
      .post("/api/incidents/page", body, { observe: "response" })
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

  getTools(id: any): Observable<any> {
    return this.https
      .get("/api/toolss/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new Object(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findtransitionofuser(params): Observable<any> {
    return this.https
      .get(`api/transitions/${params.project}/${params.user}/${params.role}`, {
        headers: new HttpHeaders({ "Content-Type": "application/json; charset=utf-8" }),
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

  downloaddocument(id: any): Observable<any> {
    return this.https
      .get("/api/tools/download/" + id, { observe: "response" })
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

  
  getBotFactoryNotification(): Observable<any> {
    return this.https.get<any>("api/notifications");
  }
  deleteBotFactoryNotification(notification: any): Observable<any> {
    let abc = this.https.put<any>("api/notifications", notification, { observe: "response" });
    //console.log("abc : ",abc);
    return abc;
  }
  findAllNotifications(notify: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(notify, event);
    let headerValue;
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
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
  }
  updateNotification(users: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-notificationss/", body, {
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

  registerNewUser(userDetails: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(userDetails);
    } catch (e) {
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

  checkEmail(email): Observable<any> {
    this.salt = sessionStorage.getItem('encDefault');
    
    let emailencrypt=this.encrypt(email,this.salt);
    let headers = new HttpHeaders();
    headers = headers.append("email", emailencrypt);
    return this.https
      .get("/api/userss/checkemail",  {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(catchError((err) => this.handleError(err)));
  }
  getaicloudUser():Observable<any>{
    return this.https.get("/api/authenticate",{
      observe: "response"
    })
    .pipe(
      map((response) => {
        if (response.status == 200) {
          localStorage.setItem("jwtToken", response.body["id_token"]);
          return new Object(response.body);
        }
      })
    )
    .pipe(catchError((err) => this.handleError(err)));
   }
   getUserAtLogin(event:any) {
    localStorage.setItem("jwtToken", localStorage.getItem("id_token"));
    this.getUserInfoData().subscribe(
     (userInfo) => {
      if (userInfo.porfolios.length == 0) {
       let activeProfiles;
        try{
          activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles"));
        } catch (e) {
        console.error("JSON.parse error - ", e.message);
        }
       if (
        activeProfiles.indexOf("keycloak") != -1 ||
        activeProfiles.indexOf("msal") != -1 ||
        activeProfiles.indexOf("aicloud") != -1 
       )
        this.router.navigate(["autoUserPermission"]);
      } else {
       this.initUserAccess(userInfo,event).add(() => {
        this.getDashConsts().subscribe(res => {
          this.router.navigate(["landing"]);
        })
       });
      }
     },
     () => {
      console.log("error getting userInfo");
      let activeProfiles;
        try{
          activeProfiles = JSON.parse(sessionStorage.getItem("activeProfiles"));
        } catch (e) {
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
   
  /** Cancels all pending Http requests. */
  public cancelPendingRequests() {
    this.cancelPendingRequests$.next()
  }

  public onCancelPendingRequests() {
    return this.cancelPendingRequests$.asObservable()
  }
  encrypt(dashFilter,key){
    key= window.btoa(key);
    var parsedBase64Key = CryptoJS.enc.Base64.parse(key);
    let iv =  CryptoJS.enc.Base64.parse(key);
    var encrypted = CryptoJS.AES.encrypt(dashFilter, parsedBase64Key, {
      blockSize: 128,
      keySize: 128,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();

  }
  decryptUsingAES256(decString,key) {
    key= window.btoa(key);
    var parsedBase64Key = CryptoJS.enc.Base64.parse(key);
    let iv =  CryptoJS.enc.Base64.parse(key);
    var decrypted = CryptoJS.AES.decrypt(decString, parsedBase64Key, {
      blockSize: 128,
      keySize: 128,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    // console.log('Decrypted : ' + decrypted);
    // console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));
    return decrypted.toString(CryptoJS.enc.Utf8);
}
}