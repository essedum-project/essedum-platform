import { Injectable, Inject, SkipSelf } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
import { CountryTimezone } from "../models/countryTimezone";
// import { throwError } from "rxjs";
// import { map, catchError } from "rxjs/operators";

@Injectable()
export class CountryTimezoneService {
    constructor(
        private https: HttpClient,
        private messageService: MessageService,
        private customErrorHandlerService: CustomErrorHandlerService
    ) {}

    findAll(countryTimezone: CountryTimezone, event: any): Observable<PageResponse<CountryTimezone>> {
        let req = new PageRequestByExample(countryTimezone, event);
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
        .get("/api/countryTimeZones/page", {
          observe: "response", headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<CountryTimezone>(pr.totalPages, pr.totalElements, CountryTimezone.toArray(pr.content));
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
        
    }

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