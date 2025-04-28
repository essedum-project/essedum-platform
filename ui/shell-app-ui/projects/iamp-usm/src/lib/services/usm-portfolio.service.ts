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
import { Injectable, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from "rxjs/Observable";
import { MessageService } from "../services/message.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { UsmPortfolio } from "../models/usm-portfolio";
import { AuthService } from "../services/auth.service";

// import { throwError, pipe } from "rxjs";
// import { map, catchError } from "rxjs/operators";
@Injectable()
export class UsmPortfolioService {


  constructor(private https: HttpClient, private messageService: MessageService, public auth: AuthService) {

  }

  /**
   * Create a new  UsmPortfolio.
   */

  create(usm_portfolio: UsmPortfolio): Observable<UsmPortfolio> {
    const copy = this.convert(usm_portfolio);
    return this.https
      .post("/api/usm-portfolios", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPortfolio(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UsmPortfolio by id.
   */
  getUsmPortfolio(id: any): Observable<UsmPortfolio> {
    return this.https
      .get("/api/usm-portfolios/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPortfolio(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed usm_portfolio.
   */
  update(usm_portfolio: UsmPortfolio): Observable<UsmPortfolio> {
    let body;
    try {
      body = JSON.stringify(usm_portfolio);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-portfolios", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {

          return new UsmPortfolio(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UsmPortfolio using the passed
   * usm_portfolio as an example for the search by example facility.
   */
  findAll(usm_portfolio: UsmPortfolio, event: any): Observable<PageResponse<UsmPortfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-portfolios/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmPortfolio>(pr.totalPages, pr.totalElements, UsmPortfolio.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  FindAll(usm_portfolio: UsmPortfolio, event: any): Observable<PageResponse<UsmPortfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get(`/api/usm-portfolioss/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmPortfolio>(pr.totalPages, pr.totalElements, UsmPortfolio.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  search(usm_portfolio: UsmPortfolio, event: any): Observable<PageResponse<UsmPortfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/search/usm-portfolios/page?page=${event.page}&size=${event.size}`, body,
        {
          observe: "response"
        })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmPortfolio>(pr.totalPages, pr.totalElements, UsmPortfolio.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by UsmPortfolioCompleteComponent.
   */
  complete(query: string): Observable<UsmPortfolio[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/usm-portfolios/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UsmPortfolio.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an UsmPortfolio by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/usm-portfolios/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.message
      ? error.message
      : error.status
        ? `Status: ${error.status} - Text: ${error.statusText}`
        : "Server error";
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg)
  }

  private convert(usm_portfolio: UsmPortfolio): UsmPortfolio {
    const copy: UsmPortfolio = Object.assign({}, usm_portfolio);
    return copy;
  }
}
