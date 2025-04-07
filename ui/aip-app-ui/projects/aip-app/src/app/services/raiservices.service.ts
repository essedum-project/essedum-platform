import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { encKey } from 'com-lib-util';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RaiservicesService {
 
  datasetsFetched: any;
  searchValues: any;
  paginationValues: any;
  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey,
    private zone: NgZone
  ) {}
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
  compeleteUserResponseRai(
    templateType,
    templateId,
    initiativeId,
    userId,
    user_response,
    checklistid
  ): Observable<any> {
    let regBody = {};
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('organization', session)
      .set('type', templateType)
      .set('templateId', templateId)
      .set('userResponse', user_response)
      .set('userId', userId)
      .set('checklistId', checklistid);
    return this.https
      .post('/api/aip/initiative/task/complete/' + initiativeId, regBody, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          console.log(response);

          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  saveUserResponseRai(
    templateType,
    templateId,
    initiativeId,
    user_response,
    checklistId
  ): Observable<any> {
    let regBody = {};
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('organization', session)
      .set('taskType', templateType)
      .set('templateId', templateId)
      .set('checklistId', checklistId)
      .set('userResponse', user_response);
    return this.https
      .post('/api/aip/initiative/task/save/' + initiativeId, regBody, {
        observe: 'response',
        params: param,
      })
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
  getInitiative(id): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', session);
    return this.https
      .get('/api/aip/initiative/detail/' + id, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getinitiatives(questionnaireId, page, size): Observable<any> {
    let param = new HttpParams()
      .set('questionnaireId', questionnaireId)
      .append('page', page)
      .append('size', size);
    console.warn(this.baseUrl + '/api/aip/ivm/initiatives');
    return this.https
      .get('/api/aip/ivm/initiatives', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getQuestionnaires(): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    return this.https
      .get('/api/aip/initiative/template/questionnaire/list/' + organization, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getTermsCondition(): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    return this.https
      .get('/api/aip/initiative/template/termnconditions/list/' + organization, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getCanvas(): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    return this.https
      .get('/api/aip/initiative/template/canvas/list/' + organization, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  checklistTemplate(checklistTCList, type): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', session).set('type', type);
    return this.https
      .post('/api/aip/initiative/checklistConfiguration/add', checklistTCList, {
        observe: 'response',
        params: param,
      })
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
  createInitiative(formData): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .post('/api/aip/initiative/create', formData, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  initiativeList(page?, size?): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param;
    if (size != 0) {
      param = new HttpParams()
        .set('organization', session)
        .set('page', page)
        .set('size', size);
    } else {
      param = new HttpParams().set('organization', session);
    }
    return this.https
      .get('/api/aip/initiative/list', { observe: 'response', params: param })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  ViewOnlyMyInitiativeList(page?, size?) {
    let user = JSON.parse(sessionStorage.getItem('user'));
    let session: any = sessionStorage.getItem('organization');
    let param;
    if (size != 0) {
      param = new HttpParams()
        .set('organization', session)
        .set('page', page)
        .set('size', size)
        .set('user',user.user_login)
        .set('userId',user.id);
    } else {
      param = new HttpParams().set('organization', session);
    }
    return this.https
      .get('/api/aip/initiative/myList', { observe: 'response', params: param })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  createWorkgroup(formData, initiativeId): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('InitiativeId', initiativeId);
    return this.https
      .post('/api/aip/initiative/add/workgroup', formData, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  workgroupList(initiativeId): Observable<any> {
    let param = new HttpParams().set('initiativeId', initiativeId);
    return this.https
      .get('/api/aip/initiative/list/workgroup', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  initiativeListCount(param: HttpParams): Observable<any> {
    return this.https
      .get('/api/aip/initiative/initiative/list/count', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  initiativeMyListCount(param: HttpParams): Observable<any> {
    let user = JSON.parse(sessionStorage.getItem('user'));
    let org: any = sessionStorage.getItem('organization');
    let param2;
      param = new HttpParams()
        .set('organization', org)
        .set('user',user.user_login)
        .set('userId',user.id);
    return this.https
      .get('/api/aip/initiative/initiative/list/count', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  saveCanvas(canvas): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    // let param = new HttpParams().set('organization', session).set('name',configName);
    return this.https
      .post('/api/aip/initiative/template/canvas/save', canvas, {
        observe: 'response',
        // params: param,
      })
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
  saveQuestionnaire(canvas): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    // let param = new HttpParams().set('organization', session).set('name',configName);
    return this.https
      .post('/api/aip/initiative/template/questionnaire/save', canvas, {
        observe: 'response',
        // params: param,
      })
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
  saveTermnconditions(aipTermsnconditionstemplate): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    // let param = new HttpParams().set('organization', session).set('name',configName);
    return this.https
      .post(
        '/api/aip/initiative/template/termnconditions/save',
        aipTermsnconditionstemplate,
        {
          observe: 'response',
          // params: param,
        }
      )
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
  getApprovalForm(param: any): Observable<any> {
    return this.https
      .get('/api/aip/initiative/task/details', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  approveUserTask(initaitiveId, checkListId, template): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('organization', session)
      .set('checkListId', checkListId);
    return this.https
      .post('/api/aip/initiative/task/approve/' + initaitiveId, template, {
        observe: 'response',
        params: param,
      })
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
  getArtifactTypes(): Observable<any> {
    return this.https
      .get('/api/aip/initiative/list/artifactTypes', {
        observe: 'response',
      })
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
  getExistingChecklist(params: any) {
    return this.https
      .get('/api/aip/initiative/checklistConfiguration/get', {
        observe: 'response',
        params: params,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getInitiativeCheckList(initiativeId: any): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', organization);
    return this.https
      .get('/api/aip/initiative/checklist/' + initiativeId, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getActivityList(): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', organization);
    return this.https
      .get('/api/aip/initiative/activities/get', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getQuestionnaireList(activityId: any): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', organization);
    return this.https
      .get(
        '/api/aip/initiative/template/questionnaire/list/' +
          organization +
          '/' +
          activityId,
        {
          observe: 'response',
          params: param,
        }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getCanvasList(activityId: any): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', organization);
    return this.https
      .get(
        '/api/aip/initiative/template/canvas/list/' +
          organization +
          '/' +
          activityId,
        {
          observe: 'response',
          params: param,
        }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getTermsAndConditionsList(activityId: any): Observable<any> {
    let organization = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', organization);
    return this.https
      .get(
        '/api/aip/initiative/template/termnconditions/list/' +
          organization +
          '/' +
          activityId,
        {
          observe: 'response',
          params: param,
        }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  private data = new BehaviorSubject<boolean>(null);
  currentData = this.data.asObservable();
  changeData(data: boolean) {
    this.data.next(data);
  }
  private modal = new BehaviorSubject<boolean>(null);
  currentModal = this.modal.asObservable();
  changeModalData(modal: boolean) {
    this.modal.next(modal);
  }
  private modeSwitch = new BehaviorSubject<boolean>(null);
  currentMode = this.modeSwitch.asObservable();
  changeMode(mode: boolean) {
    this.modeSwitch.next(mode);
  }
  deleteInitiative(id:any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', session);
    return this.https
      .delete('/api/aip/initiative/initiative/'+id, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
}
