import { Injectable, SkipSelf, Inject, Optional } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Portfolio } from "../models/portfolio";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(
    private https: HttpClient, 
    private messageService: MessageService, 
    @Optional() public auth: AuthService) {
    // If AuthService is not provided, create a minimal implementation
    if (!auth) {
      this.auth = {
        getToken: () => sessionStorage.getItem("jwtToken") || ""
      } as AuthService;
    }
  }

  /**
   * Create a new  UsmPortfolio.
   */

  create(usm_portfolio: Portfolio): Observable<Portfolio> {
    const copy = this.convert(usm_portfolio);
    return this.https
      .post("/api/usm-portfolios", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Portfolio(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Portfolio by id.
   */
  getUsmPortfolio(id: any): Observable<Portfolio> {
    return this.https
      .get("/api/usm-portfolios/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Portfolio(response.body);
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
  update(usm_portfolio: Portfolio): Observable<Portfolio> {
    let body;
    try {
      body = JSON.stringify(usm_portfolio);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-portfolios", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {

          return new Portfolio(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Portfolio using the passed
   * usm_portfolio as an example for the search by example facility.
   */
  findAll(usm_portfolio: Portfolio, event: any): Observable<PageResponse<Portfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
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
      .get("/api/usm-portfolios/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Portfolio>(pr.totalPages, pr.totalElements, Portfolio.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  FindAll(usm_portfolio: Portfolio, event: any): Observable<PageResponse<Portfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
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
      .get(`/api/usm-portfolioss/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Portfolio>(pr.totalPages, pr.totalElements, Portfolio.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  search(usm_portfolio: Portfolio, event: any): Observable<PageResponse<Portfolio>> {
    let req = new PageRequestByExample(usm_portfolio, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e: any) {
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
          return new PageResponse<Portfolio>(pr.totalPages, pr.totalElements, Portfolio.toArray(pr.content));
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
  complete(query: string): Observable<Portfolio[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/usm-portfolios/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Portfolio.toArray(a);
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

  private convert(usm_portfolio: Portfolio): Portfolio {
    const copy: Portfolio = Object.assign({}, usm_portfolio);
    return copy;
  }
}
