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

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { encKey } from "com-lib-util";

import { Services } from '../services/service';
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Incidents } from "./incidents";

@Injectable()
export class IncidentsService {

    prevUrl: any;
    currentUrl: string;
    previousUrl: string;
    searchFilterExample: any;
    alreadyRunning: boolean = false;
    paginationValues: any;
    searchValues: any;
    impactArray = [];
    urgencyArray = [];
    priorityArray = [];
    datasetName: string = "";
    datasetList: any;
    schemaName: string = "";
    ticketType: string;
    callersArray = [];
    configurationItemArray = [];
    assignmentGroupArray = [];
    assigneeArray = [];
    categoryArray = [];
    stateArray = [];
    clusterArray = [];
    sopArray = [];
    problemTypeArray = [];

    constructor(private https: HttpClient,
        // private messageService: MessageService,
        private service: Services,
        private encKey: encKey) { }

    getUrl() {
        return this.prevUrl;
    }
    setUrl(prevUrl) {
        this.prevUrl = prevUrl;
    }

    getCurrentUrl() {
        return this.currentUrl;
    }
    setCurrentUrl(currentUrl) {
        this.currentUrl = currentUrl;
    }

    getPreviousUrl() {
        return this.previousUrl;
    }
    setPreviousUrl(previousUrl) {
        this.previousUrl = previousUrl;
    }

    getSearchFilterExample() {
        return this.searchFilterExample;
    }
    setSearchFilterExample(example) {
        this.searchFilterExample = example;
    }

    getDatasetName() {
        return this.datasetName;
    }
    setDatasetName(datasetName) {
        this.datasetName = datasetName;
    }

    getSchemaName() {
        return this.schemaName;
    }
    setSchemaName(schemaName) {
        this.schemaName = schemaName;
    }

    getTicketType() {
        return this.ticketType;
    }
    setTicketType(type: string) {
        this.ticketType = type;
    }

    getPaginationValues() {
        return this.paginationValues;
    }
    setPaginationValues(paginationValues) {
        this.paginationValues = paginationValues;
    }

    getCallers() {
        return this.callersArray;
    }

    getConfigurationItems() {
        return this.configurationItemArray;
    }

    getAssignmentGroups() {
        return this.assignmentGroupArray;
    }
    getAssigneeArray() {
        return this.assigneeArray;
    }

    getCategories() {
        return this.categoryArray;
    }

    getStates() {
        return this.stateArray;
    }

    getPriority() {
        return this.priorityArray;
    }

    getUrgency() {
        return this.urgencyArray;
    }
    getImpacts() {
        return this.impactArray;
    }

    getClusterArray() {
        return this.clusterArray;
    }

    getSopArray() {
        return this.sopArray;
    }

    getProblemTypeArray() {
        return this.problemTypeArray;
    }

    getSearchValues() {
        return this.searchValues;
    }

    getSearchCount(datasetName: string, projectName: string, searchValues): Observable<string> {
        try {
            let searchparams = searchValues;
            if (searchValues && searchValues.length > 0)
                searchparams = searchValues;
            else
                searchparams = JSON.stringify(searchValues);
            let apiParams = {
                searchParams: searchparams,
                datasetName: datasetName,
                projectName: projectName
            };
            return this.https.get('/api/aip/datasets/searchDataCount', {
                params: apiParams, responseType: 'text',
            })
                .pipe(map(response => {
                    if (response) {
                        return response.toString();
                    }
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
          
            this.service.message('Some error occured', 'error')
        }

    }

    searchTicketsUsingDataset(datasetName: string, projectName: string, pagination, searchValues, selectClauseParams?: string): Observable<any[] | string> {
        try {
            let searchParamsValue = null;
            let selectClauseParamsValue = null;
            this.setPaginationValues(pagination);
            this.setSearchValues(searchValues);
            if (searchValues && searchValues.length > 0)
                searchParamsValue = searchValues;
            else if (searchValues) {
                searchParamsValue = JSON.stringify(searchValues);
            }
            if (selectClauseParams)
                selectClauseParamsValue = selectClauseParams;
            let apiParams = (pagination.sortEvent) ? {
                page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent,
                sortOrder: pagination.sortOrder
            }
                : {
                    datasetName: datasetName, projectName: projectName,
                    page: pagination.page, size: pagination.size
                }

            if (selectClauseParams) {
                apiParams["searchParams"] = searchParamsValue;
                apiParams["selectClauseParams"] = selectClauseParamsValue;
                apiParams["datasetName"] = datasetName;
                apiParams["projectName"] = projectName;
            } else {
                apiParams["searchParams"] = searchParamsValue;
                apiParams["datasetName"] = datasetName;
                apiParams["projectName"] = projectName;
            }
            return this.https.get('/api/aip/datasets/searchData', {
                params: apiParams,
            })
                .pipe(map(response => {
                    if (response && response[0] && response[0].hasOwnProperty("Error: ")) {
                        let errorMsg: string = response[0]["Error: "];
                        return errorMsg;
                    }
                    else {
                        let responseArray: any[] = [];
                        responseArray = <any[]>(response);
                        return responseArray;
                    }
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }

    }

    setSearchValues(searchValues) {
        this.searchValues = searchValues;
    }

    mapImpactValues(incident: Incidents) {
        let tempImpact = [];
        let tempSeverity = [];
        let tempPriority = [];
        if (incident.impact != null && incident.impact != undefined && incident.impact != "" && this.impactArray.length != 0) {
            let tempImpact = incident.impact.match(/(\d+)/);
            if (tempImpact != null && tempImpact != undefined && this.impactArray != undefined && this.impactArray != null) {
                for (let i = 0; i < this.impactArray.length; i++) {
                    let tempVal = [];
                    tempVal = this.impactArray[i].toString().match(/(\d+)/);
                    if (tempVal != null && tempVal[0] == tempImpact[0]) {
                        incident.impact = this.impactArray[i][1];
                        break;
                    }
                }
            }
        }
        if (incident.severity != null && incident.severity != undefined && incident.severity != "" && this.urgencyArray.length != 0) {
            let tempSeverity = incident.severity.match(/(\d+)/);
            if (tempSeverity != null && tempSeverity != undefined && this.urgencyArray != undefined && this.urgencyArray != null) {
                for (let i = 0; i < this.urgencyArray.length; i++) {
                    let tempVal = [];
                    tempVal = this.urgencyArray[i].toString().match(/(\d+)/);
                    if (tempVal != null && tempVal[0] == tempSeverity[0]) {
                        incident.severity = this.urgencyArray[i][1];
                        break;
                    }
                }
            }
        }
        if (incident.priority != null && incident.priority != undefined && incident.priority != "" && this.priorityArray.length != 0) {
            let tempPriority = incident.priority.match(/(\d+)/);
            if (tempPriority != null && tempPriority != undefined && this.priorityArray != undefined && this.priorityArray != null) {
                for (let i = 0; i < this.priorityArray.length; i++) {
                    let tempVal = [];
                    tempVal = this.priorityArray[i].toString().match(/(\d+)/);
                    if (tempVal != null && tempVal[0] == tempPriority[0]) {
                        incident.priority = this.priorityArray[i][1];
                        break;
                    }
                }
            }
        }
        return incident;
    }

    getDownloadData(datasetName: string, projectName: string, searchValues, chunkSize: string, apiCount: string, sortEvent: string, sortOrder: string): Observable<string> {
        try {
            let body = searchValues
            let salt = this.encKey.getSalt()
            if (!salt)
                salt = sessionStorage.getItem("salt")
            if (searchValues && searchValues.length > 0)
                body = this.encrypt(searchValues, salt);
            else
                body = this.encrypt(JSON.stringify(searchValues), salt);
            let apiParams = sortEvent ? { datasetName: datasetName, projectName: projectName, chunkSize: chunkSize, apiCount: apiCount, sortEvent: sortEvent, sortOrder: sortOrder }
                : { datasetName: datasetName, projectName: projectName, chunkSize: chunkSize, apiCount: apiCount };
            return this.https.get('/api/aip/datasets/downloadCsvData', { params: apiParams, responseType: 'text/csv' as 'json', headers: new HttpHeaders().append("searchParams", body) })
                .pipe(map(response => {
                    if (response && response[0] && response[0].hasOwnProperty("Error: ")) {
                        let errorMsg: string = response[0]["Error: "];
                        return errorMsg;
                    }
                    else {
                        return response.toString();
                    }
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }

    }

    getTicketsForRange(datasetName: string, projectName: string, pagination, searchValues, dateFilter, columnName): Observable<Map<any, any> | string> {
        try {
            this.setPaginationValues(pagination);
            this.setSearchValues(searchValues);
            let body = searchValues
            let salt = this.encKey.getSalt()
            if (!salt)
                salt = sessionStorage.getItem("salt")
            if (searchValues && searchValues.length > 0)
                body = this.encrypt(searchValues, salt);
            else
                body = this.encrypt(JSON.stringify(searchValues), salt);
            let apiParams = (pagination.sortEvent) ? {
                datasetName: datasetName, projectName: projectName, dateFilter: dateFilter, columnName: columnName,
                page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent,
                sortOrder: pagination.sortOrder
            }
                : {
                    datasetName: datasetName, projectName: projectName, dateFilter: dateFilter, columnName: columnName,
                    page: pagination.page, size: pagination.size
                }
            return this.https.get('/api/aip/datasets/gettickets', {
                params: apiParams,
                headers: new HttpHeaders().append("searchParams", body)
            })
                .pipe(map(response => {
                    if (response && response[0] && response[0].hasOwnProperty("Error: ")) {
                        let errorMsg: string = response[0]["Error: "];
                        return errorMsg;
                    }
                    else {
                        let responseArray: Map<any, any> = new Map();
                        responseArray = <Map<any, any>>(response);
                        return responseArray;
                    }
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }

    }

    fetchIIAFlag(projName, purpose, tool): Observable<any> {
        // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
        return this.https.get('/api/aip/incidents/isPurposeAndToolEnabled?projectName=' + projName + '&purpose=' + purpose + '&tool=' + tool)
            .pipe(map(response => {
                return response;
            }))
            .pipe(catchError(err => { return this.handleError(err) }))

    }

    getProjectConf(): any {
        var org = sessionStorage.getItem("organization");
        return this.https.get('/api/aip/incidents/projectconf', { observe: 'response' })
            .pipe(map(response => {
                return response.body
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    fetchOpenRelatedIncidents(incidentId: string, projName: string, purpose: string, tool: string): Observable<any> {
        try {
            // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
            return this.https.get('/api/aip/incidents/getRelatedOpenIncidents?incidentId=' + incidentId + '&projectName=' + projName + '&purpose=' + purpose + '&tool=' + tool)
                .pipe(map(response => {
                    return Incidents.toArrayJSON(JSON.parse(JSON.stringify(response)));
                }))
                .pipe(catchError(err => { return this.handleError(err) }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }
    }

    fetchClosedRelatedIncidents(incidentId: string, projName: string, purpose: string, tool: string): Observable<any> {
        try {
            // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
            return this.https.get('/api/aip/incidents/getRelatedIncidents?incidentId=' + incidentId + '&projectName=' + projName + '&purpose=' + purpose + '&tool=' + tool, { observe: 'response' })
                .pipe(map(response => {
                    return Incidents.toArrayJSON(JSON.parse(JSON.stringify(response)));
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }
    }

    fetchWordCloudData(incidentId: string, projName: string, purpose: string, tool: string): Observable<any> {
        // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
        return this.https.get('/api/aip/incidents/getWordCloud?incidentId=' + incidentId + '&projectName=' + projName + '&purpose=' + purpose + '&tool=' + tool)
            .pipe(map(response => {
                return response;
            }))
            .pipe(catchError(err => {return this.handleError(err)}));
    }

    modifyRow(table, primaryColumn, data) {
        try {
            var url = JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl')))

            return this.https.post(url + '/api/aip/sql/update/' + table + '/' + primaryColumn, data, {
                headers: new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("jwtToken") }),
            })
                .pipe(map(response => {
                    return response
                }))
                .pipe(catchError(err =>{return this.handleError(err)}));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }
    }

    addNewRow(table, data) {
        try {
            // var url = JSON.parse(JSON.stringify(sessionStorage.getItem('icmUrl')))
            // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
            var url = JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl')))
            // }
            return this.https.post(url + '/api/aip/sql/insert/' + table, data)
                .pipe(map(response => {
                    return response
                }))
                .pipe(catchError(err => {return this.handleError(err)}));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }
    }

    /**
     * Update the passed incidents.
     */
    update(incidents: Incidents, projName: string): Observable<Incidents> {
        try {
            let body = JSON.stringify(incidents);
            // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
            return this.https.put('/api/aip/incidents/updatesnow/' + projName, body)
                .pipe(map((res) => { return new Incidents(res) }));

            // return this.https.put( '/api/aip/incidents/' + projName, body)
            //     .map(response => new Incidents(response))
            //     .catch(this.handleError);
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }
    }

    delete(number: any) {
        // if (sessionStorage.getItem('icmUrl') == null || sessionStorage.getItem('icmUrl') == undefined || sessionStorage.getItem('icmUrl') == "" || sessionStorage.getItem("icmUrl") == "undefined" || sessionStorage.getItem("icmUrl") == "null") {
        return this.https.delete('/api/aip/incidents/' + number).pipe(catchError(err =>{return this.handleError(err)}));

    }

    tagDetails(datasetName: string, projectName: string, taggingDetails, ticketIdList: string[], updateAction: string, searchParams, entryCount: string): Observable<string> {
        try {
            let taggingDtls: Object = taggingDetails;
            let taggingDetailsStr: string = JSON.stringify(taggingDtls);
            let bodyObj = Object.assign({ "ticketIdList": ticketIdList, "taggingDetails": taggingDetailsStr, "updateAction": updateAction });
            if (searchParams) {
                bodyObj["searchParams"] = JSON.stringify(searchParams)
                bodyObj["entryCount"] = entryCount
            }
            let body = JSON.stringify(bodyObj);
            let apiParams = { datasetName: datasetName, projectName: projectName };
            return this.https.post('/api/aip/datasets/tagDetails', body, { params: apiParams, responseType: 'text' })
                .pipe(map(response => {
                    if (response && response[0] && response[0].hasOwnProperty("Error: ")) {
                        let errorMsg: string = response[0]["Error: "];
                        return errorMsg;
                    }
                    else {
                        return response.toString();
                    }
                }))
                .pipe(catchError(err => {
                    return this.handleError(err);
                }));
        }
        catch (Exception) {
            this.service.message('Some error occured', 'error')
        }

    }

    async encrypt(plaintext, password) {
        // const encryptedData = await this.usersService.encryptgcm(plaintext, password);
        const encryptedData = await this.encryptgcm(plaintext, password);
        return JSON.stringify(encryptedData);
    }

    async decryptUsingAES256(cipherResponse, password) {
        let cipherJson = JSON.parse(cipherResponse);
        // const result = await this.usersService.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
        const result = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
        return result;
    }

    async encryptgcm(plaintext, password) {
        // Generate random 12-byte IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        // Prepare the encryption parameters
        const algorithm = {
            name: 'AES-GCM',
            iv: iv
        };
        // Import the key from password
        const importedKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            algorithm,
            false,
            ['encrypt']
        );
        // Encrypt the plaintext
        const encodedText = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt(algorithm, importedKey, encodedText);
        const ciphertextArray = Array.from(new Uint8Array(ciphertext));
        const encodedCiphertext = btoa(String.fromCharCode.apply(null, ciphertextArray));
        const encodedIV = btoa(Array.from(iv).map((byte) => String.fromCharCode(byte)).join(''));
        const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV }
        return encryptedJSON;
    }

    async decryptgcm(ciphertext, iv, password) {
        // Decode the ciphertext and IV from Base64 strings
        const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        // Prepare the decryption parameters
        const algorithm = {
            name: 'AES-GCM',
            iv: decodedIV
        };
        // Import the key from password
        const importedKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            algorithm,
            false,
            ['decrypt']
        )
        const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
        const decryptedText = new TextDecoder().decode(decryptedData);
        return decryptedText;
    }

    private handleError(error: any) {
        this.alreadyRunning = false;
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