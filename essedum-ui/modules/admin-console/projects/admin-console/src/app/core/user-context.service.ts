import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Resolves the caller id from the shell's session (sessionStorage "user" —
// the same mechanism shell/src/app/services/apis.service.ts and
// sidebar.component.ts already use), since module federation shares the
// host origin's sessionStorage. Falls back to manual override (the "Acting
// as User ID" field) when running standalone / not logged in — there's
// still no server-side JWT verification of this id (§4's NFR-SEC2/SEC7
// gap), it's just no longer a guess when a real session exists.
@Injectable({ providedIn: 'root' })
export class UserContextService {
  readonly userId$ = new BehaviorSubject<number>(this.resolveFromSession() ?? 1);

  setUserId(userId: number): void {
    this.userId$.next(userId);
  }

  private resolveFromSession(): number | null {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) {
        return null;
      }
      const parsed = Number(JSON.parse(raw));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  }
}
