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
  rank?: number; // Optional: present for RBAC roles, null/undefined for legacy USM roles
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
  scope: 'draft' | 'project' | 'organization' | 'public';
  currentVersionId: number | null;
  createdBy: number | null;
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

export interface IdentityTarget {
  id: number;
  projectId: number;
  targetType: string;   // git_team | k8s_rbac | storage_iam | gateway_key
  externalRef?: string | null;
  syncStatus: string;   // pending | synced | failed
  lastAttemptAt?: string | null;
}

export interface MenuItem {
  id: number;
  parentId: number | null;
  label: string;
  route: string;
  minRoleRank: number;
  maxRoleRank?: number | null;
  displayOrder: number;
  icon?: string | null;
  // Optional comma-separated role-override (§7). Blank = rank-based default.
  roles?: string | null;
  // Optional project scope (project_name). Blank = all projects.
  project?: string | null;
}

// One live per-role sidebar item from usm_constant ("<Role> Side"). Editing
// these keeps Menu Configuration in sync with what each role actually sees.
export interface RoleMenu {
  id: number;
  role: string;
  project: string;
  label: string;
  icon: string | null;
  url: string | null;
  hasChildren: boolean;
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
  projectdisplayname: string | null;
  description: string | null;
  organisationId: number | null;
  /** Nested usm_portfolio object serialized by Jackson from the @ManyToOne field. */
  portfolioId?: { id: number; portfolioName?: string } | null;
}

// usm_portfolio — legacy org entity used by the shell's org/portfolio dropdown.
export interface LegacyPortfolio {
  id: number;
  portfolioName: string;
  status?: string | null;
}

// Unified display row used in the Orgs tab — merges LegacyOrganisation + LegacyPortfolio.
export interface DisplayOrg {
  id: number;
  name: string;
  status: string | null;
  source: 'rbac' | 'legacy';
  rawOrg?: LegacyOrganisation;
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

