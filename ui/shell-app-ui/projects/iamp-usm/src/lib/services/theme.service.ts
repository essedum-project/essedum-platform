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
// Template pack-angular:web/src/app/entities/entity.service.ts.e.vm
//
import { Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from "rxjs/Observable";
// import { throwError } from "rxjs";
import { MessageService } from "./message.service";
import { Theme } from "../models/theme";
import { HttpClient } from "@angular/common/http";
// import { map, catchError } from "rxjs/operators";
@Injectable()
export class ThemeService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  Theme.
   */

  create(theme: Theme): Observable<Theme> {
    let copy: any = Object.assign({}, theme);
    copy.apptheme = JSON.stringify(theme.apptheme);
    copy.dashboardtheme = JSON.stringify(theme.dashboardtheme);
    copy.widgettheme = JSON.stringify(theme.widgettheme)
    return this.https
      .post("/api/themes/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          return new Theme(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Theme by id.
   */
  getTheme(id: any): Observable<Theme> {
    return this.https
      .get("/api/themes/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          let theme:any = new Theme(response.body);
          theme.apptheme = JSON.parse(theme.apptheme);
          theme.dashboardtheme = JSON.parse(theme.dashboardtheme);
          theme.widgettheme = JSON.parse(theme.widgettheme);
          return theme
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed theme.
   */
  update(theme: Theme): Observable<Theme> {
    let body;
    try {
      body = JSON.stringify(theme);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/themes/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Theme(response.body);
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
}
