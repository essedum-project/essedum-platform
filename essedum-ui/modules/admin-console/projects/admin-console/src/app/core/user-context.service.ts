import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Stand-in for real auth until the shell passes a JWT-derived caller through
// (§4 — no JWT wiring yet, per the backend README gap list). Lets a demo
// user declare "I am user #N" so the access/publishing/menu endpoints, which
// all take a caller id, have someone to act as.
@Injectable({ providedIn: 'root' })
export class UserContextService {
  readonly userId$ = new BehaviorSubject<number>(1);

  setUserId(userId: number): void {
    this.userId$.next(userId);
  }
}
