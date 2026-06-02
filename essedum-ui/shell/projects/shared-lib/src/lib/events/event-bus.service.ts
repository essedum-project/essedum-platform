import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppEvent } from './event-contracts';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly subject = new Subject<AppEvent>();

  emit(event: AppEvent): void {
    this.subject.next(event);
  }

  on<T extends AppEvent['type']>(
    type: T
  ): Observable<Extract<AppEvent, { type: T }>['payload']> {
    // The implementation uses `any` internally because TS can't narrow a generic
    // discriminated union through RxJS pipe operators. The public signature is
    // still strongly typed — callers get the correct payload type for `type`.
    return this.subject.asObservable().pipe(
      filter((e: AppEvent) => e.type === type),
      map((e: any) => e.payload)
    );
  }

  all(): Observable<AppEvent> {
    return this.subject.asObservable();
  }
}
