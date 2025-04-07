import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { StatisticsRequestObject, TransformObject } from '../../datasets';
import { CATALOG_URLS, COMMON_URLS, WRANGLING_URLS } from '../../staticfile/api-endpoints';
import { RecipeObject } from '../wrangling.ts/recipe-object';
import { catchError, map, switchMap } from 'rxjs/operators';
import  ACTIONS from '../../wrangling/wrangling-static-files/actions-column.json';
import  TABLEACTIONS from '../../wrangling/wrangling-static-files/actions-table.json';
@Injectable({
  providedIn: 'root'
})
export class WranglingService {
  private isEntityUpdated = new BehaviorSubject(null);
  getEntityUpdated = this.isEntityUpdated.asObservable()

  // private url ='http://localhost:2807/statistics_advisory_details'

  constructor(
    private https:HttpClient
  ) { }

  getActionsAvailable(): Observable<any> {
    return of(ACTIONS);
  }
  getColumnStatistics(pyjobUrl: any, statsReqObject: StatisticsRequestObject,datasetName:any):Observable<any>{
//    const  reqObject=
//    {
//     "object_id": 6,
//     "function_name": [],
//     "args": [],
//     "recipe_name": "None",
//     "recipe_id": 0,
//     "user_id": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.c0ae8mPqGvq3AARD0Awb95eOSOxd5fvqh3CI98DcGq8",
//     "actions_changed": "NO",
//     "dataset_type": "machine_learning",
//     "screen": "wrangling"
// }
    statsReqObject.dataset_name = datasetName;
    statsReqObject.org = localStorage.getItem('organization');
    statsReqObject.aip_login = 'True';
    const params = new HttpParams()
    .set('parms', JSON.stringify(statsReqObject))
    // .set('dataset_name',datasetName)
    return this.https
    .get(pyjobUrl + COMMON_URLS.ADVISORY_DETAILS, {observe: 'response', params:params });  
  }
  getObjectDetails(pyjobUrl: any, transformData: RecipeObject,datasetId: any): Observable<any> {
    transformData.dataset_name = datasetId;
    transformData.org = localStorage.getItem('organization');
    transformData.aip_login = 'True';
    const parms = new HttpParams().set('parms', JSON.stringify(transformData))
    const dataUrl = pyjobUrl + COMMON_URLS.DATA_PREVIEW;
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
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
  getExistingRecipes(object, pyjoburl, datasetName): Observable<any> {
    object.dataset_name = datasetName;
    const dataUrl = pyjoburl+'/recipes';
    const parms = new HttpParams().set('parms', JSON.stringify(object));
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
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
    // return this.https
    //   .get(pyjoburl+'/recipes', {
    //     params: parms,
    //   })
    //   .pipe(
    //     tap((res) => res['response']),
    //     catchError(this.handleError)
    //   );
    /*  return this.httpClient.get(CATALOG_URLS.GET_RECIPE` + object).pipe(
      tap((res) => res['response']),
      catchError(this.handleError)
    ); */
  }
  getTransformedObjectData(requestObject, pyjoburl, datasetId): Observable<any> {
    requestObject.dataset_name = datasetId;
    requestObject.aip_login = 'True';
    requestObject.org = localStorage.getItem('organization');
    const parms = new HttpParams().set('parms', JSON.stringify(requestObject));
    const dataUrl = pyjoburl + WRANGLING_URLS.TRANSFORMED_DATA;
    return this.https
    .get(dataUrl, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
      }),
      observe: 'response',
      params: parms,
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
  applyActions(pyjobUrl: any, transformData: TransformObject, datasetName: any): Observable<any> {
    transformData.dataset_name = datasetName;
    transformData.org = localStorage.getItem('organization');
    transformData.aip_login = 'True';
    const dataUrl = pyjobUrl + COMMON_URLS.APPLY_ACTION;;
    const parms = new HttpParams().set('parms', JSON.stringify(transformData));
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
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
  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Web services are down, please check`;
    }
    return throwError(errorMessage);
  }
  getTableActions(): Observable<any> {
    return of(TABLEACTIONS);
  }
  getFillMissingDates(pyjobUrl: any,
    statsReqObject: StatisticsRequestObject
  ): Observable<any> {
    const dataUrl = pyjobUrl + WRANGLING_URLS.FILL_MISSING_DATES;
    statsReqObject.dataset_name = localStorage.getItem('nameid');
    statsReqObject.org = localStorage.getItem('organization');
    statsReqObject.aip_login = 'True';
    const parms = new HttpParams().set('parms', JSON.stringify(statsReqObject));
    // return this.https.get(pyjobUrl + WRANGLING_URLS.FILL_MISSING_DATES, {
    //   params: parms,
    // });
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
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
  saveRecipe(pyjobUrl: any, recipeObject: RecipeObject, datasetId: any): Observable<any> {
    recipeObject.dataset_name = datasetId;
    recipeObject.org = localStorage.getItem('organization');
    recipeObject.aip_login = 'True';
    const dataUrl = pyjobUrl + WRANGLING_URLS.SAVE_TRANSFORM;
    // const parms = new HttpParams().set('parms', JSON.stringify(recipeObject));
    return this.https
      .post(dataUrl, recipeObject)
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
  updateRecipe(pyjobUrl: any, recipeObject: RecipeObject, datasetId: any): Observable<any> {
    recipeObject.dataset_name = datasetId;
    recipeObject.org = localStorage.getItem('organization');
    recipeObject.aip_login = 'True';
    const dataUrl = pyjobUrl + WRANGLING_URLS.EDIT_TRANSFORM;
    return this.https
      .post(dataUrl, recipeObject)
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
  executeTransformJob(transformData: TransformObject): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(transformData));
    return this.https.get(WRANGLING_URLS.EXECUTE_JOB, { params: parms });
  }
  entityHasUpdated(isUpdated: boolean) {
    this.isEntityUpdated.next(isUpdated);
  }
}
