import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Organization, Project, Environment, AuditEvent } from './models';

// In-memory mock store for the screens not yet wired to a real backend:
// Tenancy (needs the existing Organisation/Project JHipster APIs) and Audit
// (no backend endpoint exists). Access/Publishing/Approvals/Menu
// Configuration now call sv/usm-service via ApiService — see api.service.ts.
@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly organizations$ = new BehaviorSubject<Organization[]>([
    { id: 1, name: 'Acme Corp', status: 'active' },
    { id: 2, name: 'Globex', status: 'active' },
  ]);

  readonly projects$ = new BehaviorSubject<Project[]>([
    { id: 1, organizationId: 1, name: 'Claims Automation', status: 'active' },
    { id: 2, organizationId: 1, name: 'Fraud Detection', status: 'active' },
    { id: 3, organizationId: 2, name: 'Supply Chain Copilot', status: 'archived' },
  ]);

  readonly environments$ = new BehaviorSubject<Environment[]>([
    { id: 1, projectId: 1, name: 'dev', configRef: 'vault:claims/dev' },
    { id: 2, projectId: 1, name: 'staging', configRef: 'vault:claims/staging' },
    { id: 3, projectId: 1, name: 'prod', configRef: 'vault:claims/prod' },
    { id: 4, projectId: 2, name: 'dev', configRef: 'vault:fraud/dev' },
  ]);

  readonly auditEvents$ = new BehaviorSubject<AuditEvent[]>([
    { id: 1, correlationId: 'c-9001', entity: 'role_assignment', action: 'granted', actorName: 'Carlos Ruiz', occurredAt: '2026-08-01T09:00:00Z', details: 'project_admin on Claims Automation granted to Priya Shah' },
    { id: 2, correlationId: 'c-9002', entity: 'promotion_event', action: 'approved', actorName: 'Mei Lin', occurredAt: '2026-09-20T09:00:00Z', details: 'document-extraction v2 approved at org_admin gate' },
    { id: 3, correlationId: 'c-9003', entity: 'promotion_event', action: 'submitted', actorName: 'Daniel Osei', occurredAt: '2026-10-11T15:00:00Z', details: 'document-extraction v3 submitted for org_admin review' },
  ]);
}

