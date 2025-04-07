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
import { Injectable, Inject } from '@angular/core';
import { Observable, catchError, map, throwError } from "rxjs";
// import { AuthService } from 'com-lib-util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from '../../sharedModule/service/message.service';


@Injectable()
export class UploadXLSService {

    private jwt: any;
    private options = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };

    constructor(
        private http: HttpClient,
        private https: HttpClient,
        private messageService: MessageService,
        // @Inject('iamp') private baseUrl: string
        @Inject('envi') private baseUrl: string,
    ) {    
        //added to support jwt, this as well public auth: AuthService
        this.jwt = JSON.parse(String(sessionStorage.getItem('authenticationToken')));
        this.options.headers.append('Authorization', `Bearer ${this.jwt}`);
        // this.options.headers.append('Authorization', `Bearer ${this.auth.getToken()}`);
        // this.jwt = { headers : new HttpHeaders({'Authorization': `Bearer ${this.auth.getToken()}`})}

    }

    // uploadxls(file : FormData,projectName:number): Observable<any> {
    //     let body={file:file,projectName:projectName};
    //     return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('iamp'))) + '/api/aip/uploadExcelIncidents?projectId='+projectName+"&lastUpdtBy="+JSON.parse(sessionStorage.getItem("user")).id,file,this.jwt).map((res) => {
    //         return res;
    //     });
    // }

    uploadxls(file: FormData, projectName: string): Observable<any> {
        try {
            // let body={file:file,projectName:projectName};
            // if(sessionStorage.getItem('icmUrl')==null || sessionStorage.getItem('icmUrl')==undefined || sessionStorage.getItem('icmUrl')=="" || sessionStorage.getItem("icmUrl")=="undefined" || sessionStorage.getItem("icmUrl")=="null"){
            return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl'))) + '/api/aip/incidents/uploadExcelIncidents?projectName=' + projectName + "&lastUpdtBy=" + JSON.parse(sessionStorage.getItem("user")).id, file).pipe(map((res) => {
                return res;
            }));
            // }
            // else{
            //     return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('icmUrl'))) + '/api/aip/incidents/uploadExcelIncidents?projectName='+projectName+"&lastUpdtBy="+JSON.parse(sessionStorage.getItem("user")).id,file).map((res) => {
            //         return res;
            //     });
            // }
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    scanxls(file: FormData): Observable<any> {
        try {
            // let body={file:file,projectName:projectName};
            // if(sessionStorage.getItem('icmUrl')==null || sessionStorage.getItem('icmUrl')==undefined || sessionStorage.getItem('icmUrl')=="" || sessionStorage.getItem("icmUrl")=="undefined" || sessionStorage.getItem("icmUrl")=="null"){
            return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl'))) + '/api/aip/incidents/getStateAndPriority', file).pipe(map((res) => {
                return res;
            }));
            // }
            // else{
            //     return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('icmUrl'))) + '/api/aip/incidents/getStateAndPriority',file).map((res) => {
            //         return res;
            //     });
            // }
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }
    getColumns(file: FormData): Observable<any> {
        try {
            // let body={file:file,projectName:projectName};
            if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
                return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl'))) + '/api/aip/upload/data/true', file).pipe(map((res) => {
                    return res;
                }));
            }
            else {
                return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('icmUrl'))) + '/api/aip/upload/data/true', file).pipe(map((res) => {
                    return res;
                }));
            }
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    uploadsopxls(excelfile: FormData): Observable<any> {
        try {
            return this.http.post(JSON.parse(JSON.stringify(sessionStorage.getItem('iamp'))) + '/api/aip/icmSops/uploadIcmSopExcel?id=' + JSON.parse(sessionStorage.getItem("project")).id, excelfile)
                .pipe(map(response => {
                    return response;
                }))
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    uploadclusterxls(excelfile: FormData): Observable<any> {
        try {
            return this.https.post(JSON.parse(JSON.stringify(sessionStorage.getItem('iamp'))) + '/api/aip/uploadClusterExcel/' + JSON.parse(sessionStorage.getItem("project")).id, excelfile, { observe: 'response' })
                .pipe(map(response => {
                    return response.body;
                }));
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    uploadproblemtypexls(excelfile: FormData): Observable<any> {
        try {
            return this.https.post(JSON.parse(JSON.stringify(sessionStorage.getItem('iamp'))) + '/api/aip/uploadProblemExcel/' + JSON.parse(sessionStorage.getItem("project")).id, excelfile, { observe: 'response' })
                .pipe(map(response => {
                    return response.body;
                }))
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    getGroupsForEntity(name: string): Observable<any> {
        return this.https.get('/api/aip/groups/all/dataset/' + name, { params: { org: localStorage.getItem('organization') } })
            .pipe(map(response => {
                return response;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `Status: ${error.status} - Text: ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        // if (error.status === 401) {
        //     window.location.href = '/';
        // }
        return throwError(errMsg);
    }

}
