import { Injectable } from '@angular/core';
import { BehaviorSubject  } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class TabsFilterService {
    private messageSource = new BehaviorSubject('');
    private searchText = this.messageSource.asObservable();

    private viewSource = new BehaviorSubject(true);
     private isGridView = this.viewSource.asObservable();
    constructor() { }

    changeText(message: string) {
      this.messageSource.next(message);
    }

    changeView(view: boolean) {
        this.viewSource.next(view);
    }

    getSearchText(): any {
      return this.searchText;
    }

    getView(): any {
      return this.isGridView;
    }
}
