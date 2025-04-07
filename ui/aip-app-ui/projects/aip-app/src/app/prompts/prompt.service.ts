import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, from, throwError, of as observableof } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StreamingServices } from '../streaming-services/streaming-service';
import { App } from '../apps/app';
import { DashConstant, encKey } from 'com-lib-util';
import { Datasource } from '../datasource/datasource';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Dataset } from '../dataset/datasets';
import { ANALYTICS_URLS, COMMON_URLS } from '../dataset/staticfile/api-endpoints';
import { CHARTAPI, CORR_CHART_ENDPOINTS, MULTI_VARIATE_ENDPOINTS, SCREEN_DOC } from '../dataset/staticfile/constant';
import { RecipeObject, StatisticsRequestObject, StoryBoardParameter, StoryObject } from '../dataset/staticfile/models';
import { BehaviorSubject } from 'rxjs';


import * as CHARTTYPES from '../dataset/staticfile/chart-list.json';
import { Manifest, RemoteConfig } from '@angular-architects/module-federation';
import { AIWorkerDTO } from '../prompt-agent/promptAgent';

@Injectable()
export class PromptServices {
  datasetsFetched: any;

  private jwt: any;
  searchValues: any;
  paginationValues: any;

  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey,
    private zone: NgZone,
    private snackBar: MatSnackBar
  ) { }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

getPromptProviders(org){
  return this.https.get(
    this.dataUrl + '/datasources/getpromptsprovider/' + org,
    {
      observe: 'response',
      responseType: 'json',
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

startGeneration(prompt){
  let org = sessionStorage.getItem('organization');
  return this.https.post(
    this.dataUrl +
      '/prompt/postPrompt',prompt,
    {
      observe: 'response',
      responseType: 'text',
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

getAllModelTypeofBedrock(){
    return this.https.get(
        this.dataUrl + '/prompt/getBedrockModels',
        {
        observe: 'response',
        responseType: 'json',
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

promptSave(prompt){
  return this.https.post(
    this.dataUrl +
      '/prompt/save',prompt,
    {
      observe: 'response',
      responseType: 'json',
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

getPromptCards(param: HttpParams){
  return this.https.get(
    this.dataUrl + '/prompt/getAllPrompts',
    {
      observe: 'response',
      params: param,
      responseType: 'json',
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

getCountPrompts(params){
  return this.https.get(
    this.dataUrl + '/prompt/getPromptsCount',
    {
      observe: 'response',
      params: params,
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

deletePrompt(id){
  return this.https.delete(
    this.dataUrl + '/prompt/delete/'+id,
    {
      observe: 'response',
      responseType: 'json',
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

promptUpdate(prompt, id){
  return this.https.post(
    this.dataUrl + '/prompt/update/'+ id,prompt,
    {
      observe: 'response',
      responseType: 'json',
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
saveAsExample(prompt, id){
  return this.https.post(
    this.dataUrl + '/prompt/saveAsExample/'+ id,prompt,
    {
      observe: 'response',
      responseType: 'json',
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

generateSOP(instance_name, org, payload){
  return this.https.post(
    this.dataUrl + '/adapters/'+instance_name+'/semanticsearch_infer/'+org+'?isInstance=true',payload,
    {
      observe: 'response',
      responseType: 'json',
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

message(msg: any, msgtype: any = 'success') {
  let message = {
    message: msg,
    button: false,
    type: msgtype,
    successButton: 'Ok',
    errorButton: 'Cancel',
  };
  this.matSnackbar.openFromComponent(MessageBarComponent, {
    data: message,
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: '',
  });
}

getPromptByNameAndOrg(name, org){
  return this.https.get(
    this.dataUrl + '/prompt/getPromptByNameAndOrg/'+name+'/'+org,
    {
      observe: 'response',
      responseType: 'json',
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

getAllPromptsList(org){
  return this.https.get(
    this.dataUrl + '/prompt/getPromptsList/'+org,
    {
      observe: 'response',
      responseType: 'json',
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

  getAllAgents(params) {
    return this.https.get(this.dataUrl + '/mlaiworker/config/getAll', {
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAgentsCount(params) {
    return this.https.get(this.dataUrl + '/mlaiworker/config/count', {
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response.body;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  saveAgent(body, params) {
    return this.https.post(this.dataUrl + '/mlaiworker/config/save', body,{
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  updateAgent(body, params) {
    let org = sessionStorage.getItem('organization');
    let name = body.name;
    return this.https.post(this.dataUrl + '/mlaiworker/config/update/' + name + '/' + org, body, {
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAgentByName(name, org) {
    return this.https.get(this.dataUrl + '/mlaiworker/config/' + name + '/' + org, {
      observe: 'response',
    }).pipe(map((response) => {
        return new AIWorkerDTO(response.body);
      })
    )
    .pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAiWorkerByNameAndOrg(name, org) {
    return this.https.get(this.dataUrl + '/mlaiworker/' + name + '/' + org , {
      observe: 'response',
    }).pipe(map((response) => {
        return response;
      })
    )
    .pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAiWorkerByNameAndOrgAndTask(name, org, task) {
    return this.https.get(this.dataUrl + '/mlaiworker/' + name + '/' + org + '/'+ task , {
      observe: 'response',
    }).pipe(map((response) => {
        return response;
      })
    )
    .pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  saveAiWorker(body, params){
    return this.https.post(this.dataUrl + '/mlaiworker/save', body,{
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  updateAiWorker(body, worker_name, organization){
    return this.https.post(this.dataUrl + '/mlaiworker/update/'+ worker_name +'/'+ organization, body,{
      observe: 'response',
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  deleteAIworker(id,org){
    return this.https.delete(this.dataUrl + '/mlaiworker/config/delete/'+id+'/'+org, {
      observe: 'response'
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAllBotCategory(): Observable<any> {
    return this.https.get('/api/btf/bots/categoryList', {
      observe: 'response'
    }).pipe(map((response) => {
      return response.body;
    })
    ).pipe(catchError((err) => {
      return this.handleError(err);
    })
    );
  }

  getBotByCategory(category): Observable<any> {
    return this.https.get('/api/btf/bots/categoryBotList/bycategory/MICRO_BOT/'+category, {
      observe: 'response'
    }).pipe(map((response) => {
      return response.body;
    })
    ).pipe(catchError((err) => {
      return this.handleError(err);
    })
    );
  }

  getBotSpecificationById(id): Observable<any> {
    return this.https.get('/api/btf/botSpecByBotSpecificationId/'+id, {
      observe: 'response'
    }).pipe(map((response) => {
      return response.body;
    })
    ).pipe(catchError((err) => {
      return this.handleError(err);
    })
    );
  }

  setTaskDefaultVersion(name,org,task,versionname){
    return this.https.get(this.dataUrl + '/mlaiworker/setTaskDefaultVersion/'+name+'/'+org+'/'+task+'/'+versionname, {
      observe: 'response'
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }
//delete aiworker version
  deleteVersion(id){
    return this.https.delete(this.dataUrl + '/mlaiworker/delete/'+id, {
      observe: 'response'
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAllWorkerTools(params) {
    return this.https.get(this.dataUrl + '/mltools/getAllTools', {
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAllWorkerToolsCount(params) {
    return this.https.get(this.dataUrl + '/mltools/list/count', {
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response.body;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getWorkerTool(name, org) {
    return this.https.get(this.dataUrl + '/mltools/' + name + '/' + org, {
      observe: 'response',
    }).pipe(map((response) => {
        return response.body;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getAllToolCategory(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(this.dataUrl + '/mltools/getAllToolCategory/' + org, {
      observe: 'response'
    }).pipe(map((response) => {
      return response.body;
    })
    ).pipe(catchError((err) => {
      return this.handleError(err);
    })
    );
  }

  createWorkerTool(body, org) {
    return this.https.post(this.dataUrl + '/mltools/save', body, {
      observe: 'response',
      params: new HttpParams().set('project', org),
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  updateWorkerTool(name, body) {
    const org = sessionStorage.getItem('organization');
    return this.https.post(this.dataUrl + '/mltools/update/' + name + '/' + org, body, {
      observe: 'response',
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  deleteWorkerTool(name, org) {
    return this.https.delete(this.dataUrl + '/mltools/delete/' + name, {
      params: new HttpParams().set('org', org),
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  updateAiWorkerLog(log, org) {
    return this.https.post(this.dataUrl + '/mlaiworkerlogs/save', log, {
      observe: 'response',
      params: new HttpParams().set('project', org),
    }).pipe(map((response) => {
        return response.body;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

}
