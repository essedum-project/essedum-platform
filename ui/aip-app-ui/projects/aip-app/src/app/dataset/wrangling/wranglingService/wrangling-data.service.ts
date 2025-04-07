import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WranglingDataService {
  private messageSource = new BehaviorSubject(null);
  currentMessage = this.messageSource.asObservable();

  private feRecipe = new BehaviorSubject(null);
  getFERecipe = this.feRecipe.asObservable();

  private messageSourceTransform = new BehaviorSubject(null);
  currentMessageTransform = this.messageSourceTransform.asObservable();

  private advisoryActions = new BehaviorSubject(null);
  currentadvisoryActions = this.advisoryActions.asObservable();

  constructor() { }
  changeMessage(message: Object) {
    this.messageSource.next(message);
  }

  updateFERecipe(message: Object) {
    this.feRecipe.next(message);
  }

  changeTransformationActionMessage(message: any) {
    this.messageSourceTransform.next(message);
  }

  setAdvisoryActions(advisoryActions: any) {
    this.advisoryActions.next(advisoryActions);
  }
  
}
