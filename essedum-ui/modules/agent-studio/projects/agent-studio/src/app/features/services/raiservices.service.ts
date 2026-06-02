import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';


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

  ) {}
 

  private modal = new BehaviorSubject<boolean>(null);
  currentModal = this.modal.asObservable();
  changeModalData(modal: boolean) {
    this.modal.next(modal);
  }
 
 
}