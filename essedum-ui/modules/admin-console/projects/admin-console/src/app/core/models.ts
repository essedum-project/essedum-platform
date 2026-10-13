// Mock-only domain types — Tenancy and Audit aren't wired to a real backend
// yet (Tenancy needs the existing Organisation/Project JHipster APIs; Audit
// has no backend endpoint at all). Everything else moved to ./api-models.ts
// once sv/usm-service's access/publishing/menu packages shipped.

export interface Organization {
  id: number;
  name: string;
  status: 'active' | 'suspended';
}

export interface Project {
  id: number;
  organizationId: number;
  name: string;
  status: 'active' | 'archived';
}

export interface Environment {
  id: number;
  projectId: number;
  name: string;
  configRef: string;
}

export interface AuditEvent {
  id: number;
  correlationId: string;
  entity: string;
  action: string;
  actorName: string;
  occurredAt: string;
  details: string;
}

