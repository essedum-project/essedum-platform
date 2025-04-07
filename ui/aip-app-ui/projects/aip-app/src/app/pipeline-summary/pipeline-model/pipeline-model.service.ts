import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { PipelineModel } from '../../sharedModule/pipeline-model/canvas';
// import { PipelineModel } from '../../sharedModule/models/canvas';

@Injectable()
export class PipelineModelService {

    constructor(private https: HttpClient, @Inject('envi') private dataUrl: string) { }

    public fetchAllModels(search, page, size): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/all/' + sessionStorage.getItem("organization"), {
            observe: 'response',
            params: {
                search: search,
                page: page,
                size: size
            }
        })
            .pipe(map(res => {
                return res.body;
            }));
    }
    public fetchAllModel(): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/allmodels/' + sessionStorage.getItem("organization"), {
            observe: 'response',
        })
            .pipe(map(res => {
                return res.body;
            }));
    }
    addModel(model: PipelineModel): Observable<any> {
        model.org = sessionStorage.getItem('organization')
        return this.https
            .post(this.dataUrl + '/pipelinemodels/save/model', model, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public fetchModelServers(): Observable<any> {
        return this.https.get(this.dataUrl + '/modelserver/all', {
            observe: 'response'
        })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public generateFileId(org): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/generate/fileid?org=' + org, {
            observe: 'response', responseType: 'text'
        })
            .pipe(map(res => {
                return res.body;
            }))
            .pipe(catchError(err => {

                return this.handleError(err);
            }));
    }

    public isLocalActive(): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/isLocalActive', {
            observe: 'response'
        })
            .pipe(map(res => {
                return res.body;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    public isKubeflowActive(): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/isKubeflowActive', {
            observe: 'response'
        })
            .pipe(map(res => {
                return res.body;
            }))
            .pipe(catchError(err => {
                return this.handleError(err);
            }));
    }

    public fetchModelsLen(search): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/all/len/' + sessionStorage.getItem("organization"), {
            observe: 'response', params: {
                search: search
            }
        })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public deleteModel(name: string): Observable<any> {
        return this.https.delete(this.dataUrl + '/pipelinemodels/' + name, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }
    private handleError(error: any) {
        // TODO: seems we cannot use messageService from here...
        const errMsg = error.error;
        console.error(errMsg); // log to console instead
        // if (error.status === 401) {
        //     window.location.href = '/';
        // }
        return throwError(errMsg);
    }
    public getModel(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/' + id, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public getEndpoint(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/endpoints/' + id, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public getLoadScript(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/loadscript/' + id, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public getExecutionScript(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/executionscript/' + id, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public deployModel(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/deploy/' + id, { observe: 'response', responseType: 'text' })
            .pipe(map(res => {
                return res.body;
            }))
    }

    public checkStatus(id: any): Observable<any> {
        return this.https.get(this.dataUrl + '/pipelinemodels/deploy/status/' + id, { observe: 'response' })
            .pipe(map(res => {
                return res.body;
            }))
    }

    public modelUpload(pipelineModel, isOverwrite, body): Observable<any> {
        let org = sessionStorage.getItem('organization')
        return this.https.post(this.dataUrl + "/pipelinemodels/upload/" + pipelineModel.fileid + "/" + isOverwrite + "/" + org, body, {
            observe: 'response'
        })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public modelUploadFolder(folder, pipelineModel, isOverwrite, body): Observable<any> {
        let org = sessionStorage.getItem('organization')
        return this.https.post(this.dataUrl + "/pipelinemodels/upload/" + pipelineModel.fileid + "/" + isOverwrite + "/" + org, body, {
            observe: 'response'
        })
            .pipe(map(res => {
                return res.body;
            }));
    }

    public modelActivateDeactivate(mode): Observable<any> {
        return this.https.get(this.dataUrl + "/modelserver/executor/" + mode, {
            observe: 'response'})
            .pipe(map(res => {
                return res.body;
            }));
    }
}
