// Shapes returned by sv/usm-service's RBAC REST endpoints — distinct from
// ./models.ts, which still backs the mock-only Tenancy/Audit screens.

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

export interface MenuItem {
  id: number;
  parentId: number | null;
  label: string;
  route: string;
  minRoleRank: number;
  displayOrder: number;
}

// Shapes from the existing OrganisationResource/ProjectResource APIs
// (/api/organisations, /api/projects) — not the new rbac_* tables. Project
// has no FK to Organisation and no status field in the current schema (see
// AccessContextService's comment on the same gap), so these are sparser
// than the mock Organization/Project models they replace in Tenancy.
export interface LegacyOrganisation {
  id: number;
  name: string;
  status: string | null;
}

export interface LegacyProject {
  id: number;
  name: string;
  description: string | null;
}

