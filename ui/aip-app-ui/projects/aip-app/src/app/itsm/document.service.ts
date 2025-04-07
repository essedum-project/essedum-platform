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
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map, throwError } from "rxjs";
import { Document } from '../itsm/document';
import { PageRequestByExample, PageResponse } from "../../sharedModule/support/paging";
declare const Buffer;

@Injectable()
export class DocumentService {
    constructor(@SkipSelf() private https: HttpClient) { }

    /**
     * Create a new  Document.
     */

    create(document: Document): Observable<Document> {
        const copy = this.convert(document);
        return this.https
            .post("/api/aip/documents/", copy, { observe: "response" })
            .pipe(
                map((response) => {
                    return new Document(response.body);
                })
            )
            .pipe(
                catchError((err) => {
                    return this.handleError(err);
                })
            );
    }

    /**
     * Get a Document by id.
     */
    getDocument(id: any): Observable<Document> {
        return this.https
            .get("/api/aip/documents/" + id, { observe: "response" })
            .pipe(
                map((response) => {
                    return new Document(response.body);
                })
            )
            .pipe(
                catchError((err) => {
                    return this.handleError(err);
                })
            );
    }
    /**
     * Get a Document by id.
     */
    downloaddocument(id: any): Observable<any> {
        return this.https
            .get("/api/aip/documents/" + id, { observe: "response" })
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
     * Update the passed document.
     */
    update(document: Document): Observable<Document> {
        const body = this.convert(document);
        return this.https
            .put("/api/aip/documents/", body, { observe: "response" })
            .pipe(
                map((response) => {
                    return new Document(response.body);
                })
            )
            .pipe(
                catchError((err) => {
                    return this.handleError(err);
                })
            );
    }

    /**
     * Load a page (for paginated datatable) of Document using the passed
     * document as an example for the search by example facility.
     */
    findAll(document: Document, event: any): Observable<PageResponse<Document>> {
        let req = new PageRequestByExample(document, event);
        let body;
        try {
            body = JSON.stringify(req);
        } catch (e) {
            console.error("JSON.stringify error - ", e);
        }
        const headerValue = Buffer.from(body, 'utf8').toString('base64');
        let headers = new HttpHeaders().append('example', headerValue);
        return this.https
            .get("/api/aip/documents/page", {
                observe: "response", headers: headers
            })
            .pipe(
                map((response) => {
                    let pr: any = response.body;
                    return new PageResponse<Document>(pr.totalPages, pr.totalElements, Document.toArray(pr.content));
                })
            )
            .pipe(
                catchError((err) => {
                    return this.handleError(err);
                })
            );
    }

    /**
     * Delete an Document by id.
     */
    delete(id: any) {
        return this.https.delete("/api/aip/documents/" + id, { observe: "response" }).pipe(
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
        //     window.location.href = "/";
        // }
        return throwError(errMsg)
    }

    private convert(document: Document): Document {
        const copy: Document = Object.assign({}, document);
        return copy;
    }
}
