
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class SchemaRegistryService {
  messageService: any;

  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {}

  getSchema(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas', {
        params: { org: sessionStorage.getItem('organization') },
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

  getAllSchemas(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas/all', {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  getSchemaByName(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas/' + name + '/' + org, {
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

  getSchemaByAlias(alias: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/schemaRegistry/alias/' + alias + '/' + org, {
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

  getSchemaFormTemplateByName(schemaname: any, templatename): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.baseUrl +
          '/schemaRegistry/schemaFormTemplate/' +
          templatename +
          '/' +
          schemaname +
          '/' +
          org,
        { observe: 'response' }
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

  getSchemaFormsByName(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemaForms/' + name + '/' + org, {
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

  updateSchema(
    name: any,
    alias: any,
    value: any,
    description?: string,
    formTemplate?: any
  ): Observable<any> {
    try {
      if (name?.length == 0) name = 'new';
      const body = {
        alias: alias,
        description: description,
        schemavalue: JSON.stringify(value),
        formtemplate: JSON.stringify(formTemplate),
      };
      return this.https
        .post(
          this.baseUrl +
            '/schemaRegistry/add/' +
            name +
            '/' +
            sessionStorage.getItem('organization'),
          body,
          { observe: 'response' }
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
    } catch (Exception) {
      this.messageService.error('Some error occured', 'Error');
    }
  }

  deleteSchema(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.baseUrl + '/schemaRegistry/delete/' + name + '/' + org, {
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

  deleteFormTemplate(id: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.baseUrl + '/schemaRegistry/deleteFormtemplate/' + id, {
        observe: 'response',
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

  getSchemaGroups(page, size): Observable<any> {
    return this.https
      .get(this.baseUrl + '/groups/all', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: {
          page: page,
          size: size,
          org: sessionStorage.getItem('organization'),
        },
      })
      .pipe(
        map((response) => {
          console.warn(response);

          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getSchemaLenForGroup(group: any, search): Observable<any> {
    return this.https
      .get(
        this.baseUrl +
          '/schemaRegistry/all/len/' +
          group +
          '/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
          params: { search: search },
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

  getSchemasForGroup(group: string, search, page, size): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas/all/' + group, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: {
          page: page,
          size: size,
          search: search,
          org: sessionStorage.getItem('organization'),
        },
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

  getGroupsForEntity(name: string): Observable<any> {
    return this.https
      .get(this.baseUrl + '/groups/all/schema/' + name, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  searchSchemasByName(name: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/search/' + name, {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  addGroupModelEntity(
    name: String,
    groups: any[],
    org: String
  ): Observable<any> {
    return this.https
      .post(this.baseUrl + '/entities/add/schema/' + org + '/' + name, groups)
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

  deleteGroupModelEntity(name: String): Observable<any> {
    return this.https
      .post(
        this.baseUrl + '/entities/delete/schema/' + name,
        sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
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

  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.message
      ? error.message
      : error.status
      ? `Status: ${error.status} - Text: ${error.statusText}`
      : 'Server error';
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //     window.location.href = '/';
    // }
    return throwError(errMsg);
  }
}
