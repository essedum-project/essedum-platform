
//
import { Injectable, SkipSelf } from "@angular/core";
import { PageResponse } from "../DTO/paging";
import { PageRequestByExample } from "../DTO/page-request";

import { of, throwError,Observable } from "rxjs";
import { DashConstant } from "../DTO/dash-constant";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { Project } from "../DTO/project";
declare const Buffer
@Injectable()
export class DashConstantService {

  private dashconstants: any[];
  private fetchConst: boolean = false;
  private rowCount: number = 5000;

  constructor(@SkipSelf() private https: HttpClient) { }

  getDashConstsCheck(): Observable<any[]> {
    try {
      let project = new Project({ id: JSON.parse(sessionStorage.getItem("project")).id });
      let projectname = JSON.parse(sessionStorage.getItem("project")).name
      let cached = sessionStorage.getItem("CacheDashConstant");
      if (cached && cached == "true") return this.getDashConsts(project);
      else {
        if (this.dashconstants && this.dashconstants.length) {
          let tempDashConst = this.dashconstants.filter((item) => !item.keys.toLowerCase().endsWith("default"));
          if (tempDashConst && tempDashConst.length && tempDashConst[0].project_id.id == project.id)
            return of(this.dashconstants);
          //if project has no mapping then first key after filtering out default keys will be core so 
          //so we need to fetch mapping from db only once remaining time return from cache.fetchConst will let us
          //know whether it was fetched once or not.
          else if (this.fetchConst && projectname != "Core" && tempDashConst[0].project_id.name == "Core")
            return of(this.dashconstants);
          else {
            //if we are switching the projects then dashconstant will be available for the old projects
            //so we need to call the api again to fetch for the new project and only once its needed to be called
            this.fetchConst = false;
            let result = this.getDashConsts(project);
            this.fetchConst = true;
            return result
          }
        } else //if leap is loaded for first time dashconstant is undefined so call api
          return this.getDashConsts(project);
      }
    } catch (error) { }
  }

  getDashConsts(project: Project): Observable<DashConstant[]> {
    return this.https
      .get("/api/get-dash-constants?projectId=" + project.id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          // let dashconsts: DashConstant[] = pr;
          this.dashconstants = pr;
          sessionStorage.removeItem("CacheDashConstant");
          // return dashconsts;
          this.setrowCount(); 
          return this.dashconstants;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }



  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg);
  }


  setrowCount(){
    let proj = sessionStorage.getItem('project');
    let project;
    if (proj) {
      project = JSON.parse(proj);
    }
    this.dashconstants.forEach((dc)=>{
      if(dc.keys==="LazyLoad_RowCount" && dc.value!=null && dc.value!=""){
        if(dc.project_name===project){
          this.rowCount = Number.parseInt(dc.value);
          return;
        }
        else if(dc.project_name=='Core'){
          this.rowCount = Number.parseInt(dc.value);
        }
        else{
          this.rowCount = Number.parseInt(dc.value);
        }
      }
    })
  }
}
