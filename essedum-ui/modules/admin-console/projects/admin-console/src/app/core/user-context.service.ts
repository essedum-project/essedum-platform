import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable, of } from 'rxjs';

// Resolves the caller id from the shell's session (sessionStorage "user" —
// the same mechanism shell/src/app/services/apis.service.ts and
// sidebar.component.ts already use), since module federation shares the
// host origin's sessionStorage. Falls back to manual override (the "Acting
// as User ID" field) when running standalone / not logged in — there's
// still no server-side JWT verification of this id (§4's NFR-SEC2/SEC7
// gap), it's just no longer a guess when a real session exists.
// sessionStorage "project" holds the active project object (set by the shell)
// with id, name, and organisationId. sessionStorage "role" holds the active role.
//
// projectId$/orgId$/roleId$ are deliberately *not* BehaviorSubjects: the
// shell writes a new "project"/"role" object into sessionStorage in place
// (landing.component.ts valuechangeproject()) without reloading this
// module, and shell/src/app/services/common-app-interceptor.service.ts
// reads sessionStorage fresh on every HTTP request to build the "Project"
// header. A BehaviorSubject seeded once at construction would go stale the
// moment the user switches project/role, sending the old projectId/orgId in
// the query string while the "Project" header reflects the new one. Using
// `defer` re-reads sessionStorage on every subscription, keeping these in
// sync with the header on each request.
@Injectable({ providedIn: 'root' })
export class UserContextService {
  readonly userId$ = new BehaviorSubject<number>(this.resolveFromSession() ?? 1);
  readonly projectId$: Observable<number | null> = defer(() => of(this.resolveProjectIdFromSession()));
  readonly orgId$: Observable<number | null> = defer(() => of(this.resolveOrgIdFromSession()));
  readonly roleId$: Observable<number | null> = defer(() => of(this.resolveRoleIdFromSession()));

  setUserId(userId: number): void {
    this.userId$.next(userId);
  }

  private resolveFromSession(): number | null {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) {
        return null;
      }
      // sessionStorage "user" holds the full Users object (see
      // shell's apis.service.ts) — pull out .id, don't Number() the object.
      const obj = JSON.parse(raw);
      const parsed = obj && typeof obj === 'object' ? Number(obj.id) : Number(obj);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  }

  private resolveProjectIdFromSession(): number | null {
    try {
      const raw = sessionStorage.getItem('project');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      const id = Number(obj?.id);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }

  private resolveOrgIdFromSession(): number | null {
    try {
      const raw = sessionStorage.getItem('project');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      const id = Number(obj?.organisationId);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }

  private resolveRoleIdFromSession(): number | null {
    try {
      const raw = sessionStorage.getItem('role');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      const id = Number(obj?.id);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }
}
