// Shapes returned by sv/usm-service's RBAC REST endpoints. Every screen
// (Tenancy, Access, Approvals, Publishing, Audit, Menu) consumes these via
// ApiService — there is no mock data layer.

export interface AccessContext {
  userId: number;
  highestRank: number;
  reachableProjectIds: number[];
  reachableOrganizationIds: number[];
}

export interface RbacRole {
  id: number;
  name: string;
  rank: number;
}

export interface RoleAssignment {
  id: number;
  userId: number;
  roleId: number;
  organizationId: number | null;
  projectId: number | null;
  grantedAt: string;
  revokedAt: string | null;
}

export interface Asset {
  id: number;
  projectId: number;
  assetType: string;
  name: string;
  scope: 'project' | 'organization' | 'public';
  currentVersionId: number | null;
}

export interface AssetVersion {
  id: number;
  assetId: number;
  environmentId: number | null;
  versionNo: number;
  status: 'draft' | 'in_review' | 'published' | 'rejected';
  contentDigest: string | null;
  payloadRef: string | null;
  updatedAt: string;
}

export interface PromotionEvent {
  id: number;
  assetVersionId: number;
  gate: PromotionGate;
  action: 'submitted' | 'approved' | 'rejected';
  actorId: number;
  actorName: string | null;
  note: string | null;
  occurredAt: string;
}

export type PromotionGate = 'project_admin' | 'org_admin' | 'platform_admin';

export interface UserOption {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  parentId: number | null;
  label: string;
  route: string;
  minRoleRank: number;
  displayOrder: number;
  icon?: string | null;
  // Optional comma-separated role-override (§7). Blank = rank-based default.
  roles?: string | null;
}

// Shapes from the existing OrganisationResource/ProjectResource APIs
// (/api/organisations, /api/projects) — not the new rbac_* tables.
export interface LegacyOrganisation {
  id: number;
  name: string;
  status: string | null;
}

export interface LegacyProject {
  id: number;
  name: string;
  description: string | null;
  organisationId: number | null;
}

export interface RbacEnvironment {
  id: number;
  projectId: number;
  name: string;
  configRef: string | null;
}

export interface AuditEvent {
  id: number;
  correlationId: string;
  entity: string;
  action: string;
  actorId: number | null;
  actorName: string | null;
  occurredAt: string;
  details: string | null;
}

