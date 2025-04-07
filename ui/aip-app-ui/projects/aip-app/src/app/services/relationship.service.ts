import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChainJob } from '../DTO/chainJob';
import { Relationship } from '../schema/relationship';

@Injectable()
export class RelationshipService {
    constructor(
        private https: HttpClient,
        @Inject('dataSets') private dataUrl: string,
        private matSnackbar: MatSnackBar
    ) { }

    getAllRelationships(org): Observable<any> {
        return this.https
            .get(this.dataUrl + '/relationship/' + org)
            .pipe(map(response => {
                return response;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    getSchema(): Observable<any> {
        return this.https
            .get(this.dataUrl + '/schemaRegistry/schemas', { params: { org: sessionStorage.getItem("organization") }, observe: 'response' })
            .pipe(map(response => {
                return response.body;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    getSchemaByAlias(alias: any): Observable<any> {
        const org = sessionStorage.getItem("organization");
        return this.https.get(this.dataUrl + '/schemaRegistry/alias/' + alias + '/' + org, { observe: 'response' })
            .pipe(map(response => {
                return response.body;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    getRelationshipById(rid: any): Observable<any> {
        return this.https
            .get(this.dataUrl + '/relationship/id/' + rid, { observe: 'response' })
            .pipe(map(response => {
                return new Relationship(response.body);
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    create(rel: any): Observable<Relationship> {
        const copy = this.convert(rel);
        return this.https
            .post(this.dataUrl + '/relationship/add', copy, { observe: 'response' })
            .pipe(map(res => {
                return new Relationship(res.body);
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    update(rel: any): Observable<any> {
        const copy = this.convert(rel);
        return this.https
            .put(this.dataUrl + '/relationship/update', rel, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    deleteRelation(id): Observable<any> {
        const org = sessionStorage.getItem('organization');
        return this.https
            .delete(this.dataUrl + '/relationship/delete/' + id)
            .pipe(map(response => {
                return response;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    private convert(rel: Relationship): Relationship {
        const copy: Relationship = Object.assign({}, rel, { 'organization': sessionStorage.getItem("organization") });
        return copy;
    }

    private handleError(error: any) {
        // TODO: seems we cannot use messageService from here...
        const errMsg = error.error;
        console.error(errMsg); // log to console instead
        if (error.status === 401) {
            window.location.href = '/';
        }
        return throwError(errMsg);
    }
}