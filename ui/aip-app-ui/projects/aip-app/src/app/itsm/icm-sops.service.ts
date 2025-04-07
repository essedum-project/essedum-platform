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
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IcmSops } from './icm-sops';
import { PageRequestByExample, PageResponse } from '../../sharedModule/support/paging';
import { IcmSopsAlias } from './icm-sops-alias';
import { MessageService } from '../../sharedModule/service/message.service';
@Injectable()
export class IcmSopsService {

    // private jwt : any;
    // private options = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };

    constructor(
        private https: HttpClient,
        private messageService: MessageService,
        private httpService: HttpClient) {
        //added to support jwt, this as well public auth: AuthService
        // this.options.headers.append('Authorization',`Bearer ${this.auth.getToken()}`);
        // this.jwt = { headers : new HttpHeaders({'Authorization': `Bearer ${this.auth.getToken()}`})}
    }

    /**
     * Create a new  IcmSops.
    */
    create(icm_sops: IcmSops): Observable<IcmSops> {
        const copy = this.convert(icm_sops);
        return this.https.post('/api/aip/icm_sops', copy, { observe: 'response' })
            .pipe(map(response => {
                return new IcmSops(response.body);
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    private convert(icm_sops: IcmSops): IcmSops {
        const copy: IcmSops = Object.assign({}, icm_sops);
        return copy;
    }


    /**
     * Load a page (for paginated datatable) of IcmSops using the passed
     * icm_sops as an example for the search by example facility.
     */
    findAll(icm_sops: IcmSops, event: any): Observable<PageResponse<IcmSops>> {
        try {
            let req = new PageRequestByExample(icm_sops, event);
            let body = JSON.stringify(req.example);
            return this.https.get('/api/aip/icip_sops/page', {
                headers: new HttpHeaders().append("example", body),
                observe: 'response'
            })
                .pipe(map(response => {
                    let pr: any = response.body;
                    return new PageResponse<IcmSops>(pr.totalPages, pr.totalElements, IcmSops.toArray(pr.content));
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }
    }

    /**
     * Update the passed icm_sops.
     */
    update(icm_sops: IcmSops): Observable<IcmSops> {
        try {
            let body = JSON.stringify(icm_sops);

            return this.https.put('/api/aip/icm_sops', body, {
                headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
                observe: 'response'
            })
                .pipe(map(response => new IcmSops(response.body)))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    findAllAlias(icm_sops: IcmSopsAlias, event: any): Observable<PageResponse<IcmSopsAlias>> {
        try {
            let req = new PageRequestByExample(icm_sops, event);
            let body = JSON.stringify(req.example);
            //         const headerValue = Buffer.from(body, 'utf8').toString('base64');
            let headers = new HttpHeaders().append('example', body);
            return this.https.get('/api/aip/icip_sops/alias/page', {
                headers: headers,
                observe: 'response'
            })
                .pipe(map(response => {
                    let pr: any = response.body;
                    return new PageResponse<IcmSopsAlias>(pr.totalPages, pr.totalElements, IcmSopsAlias.toArray(pr.content));
                }))
                .pipe(catchError(err => { return this.handleError(err) }));
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }
    }

    download(id: any): Observable<any> {
        try {
            return this.httpService.get(JSON.parse(JSON.stringify(sessionStorage.getItem('iamp'))) + '/api/aip/getsopInExcel/' + id, { responseType: 'blob' as 'json' })
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }
    }

    /**
     * Delete an IcmSops by id.
     */
    delete(id: any) {
        return this.https.delete('/api/aip/icm_sops/' + id, { observe: 'response' }).pipe(catchError(err => {return this.handleError(err)}));
    }

    // Create SOP ALias
    createAlias(icmsopsalias: IcmSopsAlias):Observable<IcmSopsAlias>{
        const copy = this.convertalias(icmsopsalias);
        return this.https.post('/api/aip/icm_sops_alias', copy,{ observe: 'response' })
        .pipe(map(response =>  {
            return new IcmSopsAlias(response.body);
        }))
        .pipe(catchError(err=>{
            return this.handleError(err);
        }));
    }

    private convertalias(icm_sops_alias : IcmSopsAlias): IcmSopsAlias {
        const copy: IcmSopsAlias = Object.assign({}, icm_sops_alias);
        return copy;
    }



    // sample method from angular doc
    private handleError(error: any) {
        // TODO: seems we cannot use messageService from here...
        let errMsg = (error.message) ? error.message :
            error.status ? `Status: ${error.status} - Text: ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        // if (error.status === 401) {
        //     window.location.href = '/';
        // }
        return throwError(errMsg);
    }
}
