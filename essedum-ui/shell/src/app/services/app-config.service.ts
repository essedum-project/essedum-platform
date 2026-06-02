import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Config, CustomManifest } from './Config.model';

@Injectable()
export class AppConfigService {
   readonly appConfiguration$: Observable<Config>;
   private appConfiguration: BehaviorSubject<Config>;
   readonly mfeappConfiguration$: Observable<CustomManifest>;  
   private mfeappConfiguration: BehaviorSubject<CustomManifest>;  

   constructor(private https: HttpClient) {
      this.appConfiguration = new BehaviorSubject({} as Config);
      this.appConfiguration$ = this.appConfiguration.asObservable();
      this.mfeappConfiguration = new BehaviorSubject({} as CustomManifest);
      this.mfeappConfiguration$ = this.mfeappConfiguration.asObservable();
   }

   public getAppConfig(): Observable<Config> {
      return Observable.create((observer) => {
         this.https.get<Config>(sessionStorage.getItem("contextPath") + 'assets/json/app-config.json').subscribe((response) => {
            this.appConfiguration.next(response);
            return observer.next(response);
         });
      });
   }

   public getMfeAppConfig(): Observable<CustomManifest> {  
      return Observable.create((observer) => {  
         this.https.get<CustomManifest>(sessionStorage.getItem("contextPath") + 'assets/json/mf.manifest.json').subscribe((response) => {  
            this.mfeappConfiguration.next(response);  
            return observer.next(response);  
         });  
      });  
    }  
} 