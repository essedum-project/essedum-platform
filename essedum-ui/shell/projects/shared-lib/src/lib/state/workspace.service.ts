import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Workspace {
  id: string;
  name: string;
  tenantId: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly current = new BehaviorSubject<Workspace | null>(null);
  readonly current$: Observable<Workspace | null> = this.current.asObservable();

  set(workspace: Workspace | null): void {
    this.current.next(workspace);
  }

  get(): Workspace | null {
    return this.current.getValue();
  }
}
