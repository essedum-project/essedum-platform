import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type {
  AccessContext, RbacRole, RoleAssignment, Asset, AssetVersion, PromotionEvent, MenuItem,
  LegacyOrganisation, LegacyProject, LegacyPortfolio, RbacEnvironment, AuditEvent, UserOption, IdentityTarget, RoleMenu,
} from './api-models';

// Thin HTTP client over the sv/usm-service RBAC endpoints
// (com.lfn.iamp.usm.access/.publishing/.menu). See docs/RBAC_Admin_Replatform_Plan.md §9.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  // ---- access ----
  getAccessContext(userId: number): Observable<AccessContext> {
    return this.http.get<AccessContext>(`${this.base}/access-context/${userId}`);
  }

  getRoles(): Observable<RbacRole[]> {
    return this.http.get<RbacRole[]>(`${this.base}/roles`);
  }

  getUsers(): Observable<UserOption[]> {
    return this.http.get<UserOption[]>(`${this.base}/users`);
  }

  // Distinct legacy role names for the Menu Configuration role-override dropdown.
  getRoleNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/role-names`);
  }

  getRoleAssignments(actorUserId: number): Observable<RoleAssignment[]> {
    return this.http.get<RoleAssignment[]>(`${this.base}/access/role-assignments`, { params: { actorUserId } });
  }

  grantRole(payload: {
    userId: number; roleId: number; organizationId: number | null; projectId: number | null;
    actorUserId: number;
  }): Observable<RoleAssignment> {
    return this.http.post<RoleAssignment>(`${this.base}/access/role-assignments`, payload);
  }

  revokeRoleAssignment(id: number, actorUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/access/role-assignments/${id}`, { params: { actorUserId } });
  }

  // ---- provisioning (rank-gated creation; server re-checks) ----
  createOrganization(actorUserId: number, body: { name: string; status?: string }): Observable<LegacyOrganisation> {
    return this.http.post<LegacyOrganisation>(`${this.base}/provisioning/organizations`, body, { params: { actorUserId } });
  }

  createProject(actorUserId: number, body: { name: string; description?: string; organisationId: number | null }): Observable<LegacyProject> {
    return this.http.post<LegacyProject>(`${this.base}/provisioning/projects`, body, { params: { actorUserId } });
  }

  createEnvironment(actorUserId: number, body: { name: string; projectId: number; configRef?: string }): Observable<RbacEnvironment> {
    return this.http.post<RbacEnvironment>(`${this.base}/provisioning/environments`, body, { params: { actorUserId } });
  }

  createRole(actorUserId: number, body: { name: string; rank: number }): Observable<RbacRole> {
    return this.http.post<RbacRole>(`${this.base}/provisioning/roles`, body, { params: { actorUserId } });
  }

  deleteOrganization(id: number, actorUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/provisioning/organizations/${id}`, { params: { actorUserId } });
  }

  deleteProject(id: number, actorUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/provisioning/projects/${id}`, { params: { actorUserId } });
  }

  // ---- publishing ----
  getAssets(userId: number, orgId?: number | null, projectId?: number | null): Observable<Asset[]> {
    const params: Record<string, any> = { userId };
    if (orgId != null) params['orgId'] = orgId;
    if (projectId != null) params['projectId'] = projectId;
    return this.http.get<Asset[]>(`${this.base}/assets`, { params });
  }

  getVersions(userId: number, orgId?: number | null, projectId?: number | null): Observable<AssetVersion[]> {
    const params: Record<string, any> = { userId };
    if (orgId != null) params['orgId'] = orgId;
    if (projectId != null) params['projectId'] = projectId;
    return this.http.get<AssetVersion[]>(`${this.base}/assets/versions`, { params });
  }

  getDraftVersions(userId: number, orgId?: number | null, projectId?: number | null): Observable<AssetVersion[]> {
    const params: Record<string, any> = { userId };
    if (orgId != null) params['orgId'] = orgId;
    if (projectId != null) params['projectId'] = projectId;
    return this.http.get<AssetVersion[]>(`${this.base}/assets/versions/drafts`, { params });
  }

  // §4 marketplace — published assets visible in the caller's scope.
  getCatalog(userId: number, orgId?: number | null, projectId?: number | null): Observable<Asset[]> {
    const params: Record<string, any> = { userId };
    if (orgId != null) params['orgId'] = orgId;
    if (projectId != null) params['projectId'] = projectId;
    return this.http.get<Asset[]>(`${this.base}/assets/catalog`, { params });
  }

  // Catalog sourced from pipelines approved by project admin (rank 2) or org admin (rank 3).
  getPipelineCatalog(projectId?: number | null, orgId?: number | null): Observable<any[]> {
    const params: Record<string, any> = {};
    if (projectId != null) params['projectId'] = projectId;
    if (orgId != null) params['orgId'] = orgId;
    return this.http.get<any[]>(`/api/aip/streamingServices/approval/catalog`, { params });
  }

  // Create an asset + its first draft version. §5.
  createAsset(payload: {
    projectId: number; assetType: string; name: string; payloadRef: string;
    actorId: number; actorName: string;
  }): Observable<AssetVersion> {
    return this.http.post<AssetVersion>(`${this.base}/assets`, payload);
  }

  // Edit a draft/rejected version in place.
  editVersion(
    versionId: number,
    payload: { name: string; payloadRef: string; actorId: number; actorName: string },
  ): Observable<AssetVersion> {
    return this.http.put<AssetVersion>(`${this.base}/assets/versions/${versionId}`, payload);
  }

  // Open a fresh draft version on a published asset (live keeps serving).
  createNewVersion(
    assetId: number,
    payload: { payloadRef: string; actorId: number; actorName: string },
  ): Observable<AssetVersion> {
    return this.http.post<AssetVersion>(`${this.base}/assets/${assetId}/versions`, payload);
  }

  // The gate a version must clear next ('project_admin' | 'org_admin' | 'platform_admin' | null).
  getNextGate(versionId: number): Observable<{ gate: string | null }> {
    return this.http.get<{ gate: string | null }>(`${this.base}/assets/versions/${versionId}/next-gate`);
  }

  submitVersion(
    versionId: number,
    payload: { actorId: number; actorName: string; note: string },
  ): Observable<PromotionEvent> {
    return this.http.post<PromotionEvent>(`${this.base}/assets/versions/${versionId}/submit`, payload);
  }

  // Full append-only promotion event history for a version ( audit trail / rejection note).
  getVersionEvents(versionId: number): Observable<PromotionEvent[]> {
    return this.http.get<PromotionEvent[]>(`${this.base}/assets/versions/${versionId}/events`);
  }

  getApprovals(userId: number, orgId?: number | null, projectId?: number | null): Observable<PromotionEvent[]> {
    console.warn('[API] OLD getApprovals() called - this should not be called from approvals page! userId:', userId, 'orgId:', orgId, 'projectId:', projectId);
    const params: Record<string, any> = { userId };
    if (orgId != null) params['orgId'] = orgId;
    if (projectId != null) params['projectId'] = projectId;
    return this.http.get<PromotionEvent[]>(`${this.base}/approvals`, { params });
  }

  decideApproval(
    versionId: number,
    payload: { gate: string; action: 'approved' | 'rejected'; actorId: number; actorName: string; note: string },
  ): Observable<PromotionEvent> {
    return this.http.post<PromotionEvent>(`${this.base}/approvals/${versionId}/decision`, payload);
  }

  escalateToOrg(
    versionId: number,
    payload: { actorId: number; actorName: string; note: string },
  ): Observable<PromotionEvent> {
    return this.http.post<PromotionEvent>(`${this.base}/assets/versions/${versionId}/escalate-org`, payload);
  }

  // ---- menu ----
  getMenuItems(actorUserId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/menu-items`, { params: { actorUserId } });
  }

  createMenuItem(actorUserId: number, item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/menu-items`, item, { params: { actorUserId } });
  }

  updateMenuItem(id: number, actorUserId: number, item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.base}/menu-items/${id}`, item, { params: { actorUserId } });
  }

  deleteMenuItem(id: number, actorUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/menu-items/${id}`, { params: { actorUserId } });
  }

  // ---- role menus (live per-role sidebars in usm_constant) ----
  getRoleMenuRoles(actorUserId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/role-menus/roles`, { params: { actorUserId } });
  }

  getRoleMenuProjects(role: string, actorUserId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/role-menus/projects`, { params: { role, actorUserId } });
  }

  getRoleMenus(role: string, project: string, actorUserId: number): Observable<RoleMenu[]> {
    return this.http.get<RoleMenu[]>(`${this.base}/role-menus`, { params: { role, project, actorUserId } });
  }

  createRoleMenu(actorUserId: number, body: {
    role: string; project: string; label: string; icon: string | null; url: string | null; children?: any[];
  }): Observable<RoleMenu> {
    return this.http.post<RoleMenu>(`${this.base}/role-menus`, body, { params: { actorUserId } });
  }

  updateRoleMenu(id: number, actorUserId: number, body: {
    label: string; icon: string | null; url: string | null;
  }): Observable<RoleMenu> {
    return this.http.put<RoleMenu>(`${this.base}/role-menus/${id}`, body, { params: { actorUserId } });
  }

  deleteRoleMenu(id: number, actorUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/role-menus/${id}`, { params: { actorUserId } });
  }

  // ---- legacy user-project-role assignments (usm_user_project_role) ----
  // Returns Map<projectId, Role[]> for the given user login.
  getLegacyUserAssignments(userLogin: string): Observable<Record<string, any[]>> {
    return this.http.post<Record<string, any[]>>('/api/user-project-roles/user', userLogin, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ---- legacy tenancy (existing OrganisationResource/ProjectResource, under /api not /api/usm) ----
  getOrganisations(): Observable<LegacyOrganisation[]> {
    return this.http.get<LegacyOrganisation[]>('/api/organisations', { params: { size: '1000' } });
  }

  getProjects(): Observable<LegacyProject[]> {
    return this.http.get<LegacyProject[]>('/api/projects', { params: { size: '1000' } });
  }

  getPortfolios(): Observable<LegacyPortfolio[]> {
    // Try the paginated endpoint first; fall back to empty list on any error so org table still loads.
    return this.http.get<any>('/api/usm-portfolios', { params: { size: '1000' } }).pipe(
      map((res: any) => (Array.isArray(res) ? res : (res?.content ?? [])) as LegacyPortfolio[]),
      catchError(() => of([] as LegacyPortfolio[]))
    );
  }

  // ---- DashConstants: per-role sidebar items (usm_constant table, key = "<Role> Side") ----
  // Returns ALL dash-constant records for a project so the menu picker can show every
  // available sidebar item across all roles.
  getDashConstants(projectId?: string | number, portfolioId?: string | number): Observable<any[]> {
    const params: any = {};
    if (projectId != null) params['projectId'] = String(projectId);
    if (portfolioId != null) params['portfolioId'] = String(portfolioId);
    return this.http.get<any[]>('/api/get-dash-constants', { params });
  }

  // ---- environments (rbac_environment) ----
  getEnvironments(projectId: number): Observable<RbacEnvironment[]> {
    return this.http.get<RbacEnvironment[]>(`${this.base}/environments`, { params: { projectId } });
  }

  // ---- audit (rbac_audit_event, NFR-O2) ----
  getAuditEvents(actorUserId: number): Observable<AuditEvent[]> {
    return this.http.get<AuditEvent[]>(`${this.base}/audit`, { params: { actorUserId } });
  }

  // ---- identity projection status (§8) ----
  getIdentityTargets(actorUserId: number): Observable<IdentityTarget[]> {
    return this.http.get<IdentityTarget[]>(`${this.base}/identity/targets`, { params: { actorUserId } });
  }

  retryIdentityTarget(id: number, actorUserId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/identity/targets/${id}/retry`, {}, { params: { actorUserId } });
  }

  // ---- streaming services approval workflow (pipelines, agents, mcps) ----
  
  /**
   * Rank 2 Project Admin - Get pending approvals for their project
   * Status: PENDING_PROJECT_APPROVAL
   */
  getProjectAdminApprovals(projectId: number): Observable<any> {
    console.log('[API] getProjectAdminApprovals called with projectId:', projectId);
    
    // Extract rank from sessionStorage
    let rank = '2'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '2';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }
    
    const url = `/api/aip/streamingServices/approval/project-admin/list`;
    console.log('[API] Calling URL:', url, 'with params:', { projectId, rank });
    return this.http.get<any>(url, { 
      params: { projectId, rank } 
    });
  }

  /**
   * Rank 3 Org Admin - Get pending approvals for their organization
   * Status: PENDING_ORG_APPROVAL
   */
  getOrgAdminApprovals(organizationId: number): Observable<any> {
    console.log('[API] getOrgAdminApprovals called with organizationId:', organizationId);
    
    // Extract rank from sessionStorage
    let rank = '3'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '3';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }
    
    const url = `/api/aip/streamingServices/approval/org-admin/list`;
    console.log('[API] Calling URL:', url, 'with params:', { organizationId, rank });
    return this.http.get<any>(url, { 
      params: { organizationId, rank } 
    });
  }

  /**
   * Rank 2 Project Admin - Get PROJECT_APPROVED resources (draft resources)
   * Resources ready to be submitted to org for publishing
   */
  getDraftResources(projectId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '2'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '2';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }
    
    console.log('[API] getDraftResources called with projectId:', projectId, 'rank:', rank);
    return this.http.get<any>(`/api/aip/streamingServices/approval/draft-resources`, { 
      params: { projectId, rank } 
    }).pipe(
      tap(response => {
        console.log('[API] getDraftResources response:', response);
      })
    );
  }

  /**
   * Rank 2 Project Admin - Approve resource at project level
   * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
   */
  approveProjectApproval(resourceId: number, projectId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '2'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '2';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }
    
    console.log('[API] approveProjectApproval - resourceId:', resourceId, 'projectId:', projectId, 'rank:', rank);
    return this.http.post<any>(
      `/api/aip/streamingServices/approval/project/approve/${resourceId}`,
      { projectId, rank },
      { params: { projectId, rank } }
    );
  }

  /**
   * Rank 2 Project Admin - Reject resource at project level
   * Status: PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED
   */
  rejectProjectApproval(resourceId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '2'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '2';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }
    
    console.log('[API] rejectProjectApproval - resourceId:', resourceId, 'rank:', rank);
    return this.http.post<any>(
      `/api/aip/streamingServices/approval/project/reject/${resourceId}`,
      { rank },
      { params: { rank } }
    );
  }

  /**
   * Rank 2 Project Admin - Submit approved resource to Org Admin
   * Status: PROJECT_APPROVED -> PENDING_ORG_APPROVAL
   */
  submitForOrgApproval(resourceId: number, organizationId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '2'; // default
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '2';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }

    return this.http.post<any>(
      `/api/aip/streamingServices/approval/org/submit`,
      { resourceId, organizationId },
      { params: { rank } }
    );
  }

  /**
   * Rank 3 Org Admin - Approve resource at org level (publish)
   * Status: PENDING_ORG_APPROVAL -> PUBLISHED
   */
  approveOrgApproval(resourceId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '3'; // default for org admin
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '3';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }

    // portfoliodata.name holds the actual org/portfolio name; portfoliodata.id is the numeric portfolio ID.
    // Both are sourced from portfoliodata (not sessionStorage 'organization' which is the project name).
    let orgName = '';
    let orgId: string | null = null;
    try {
      const pd = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}');
      orgName = pd?.name || '';
      orgId = pd?.id != null ? String(pd.id) : null;
    } catch {}

    const params: Record<string, string> = { rank };
    if (orgName) params['orgName'] = orgName;
    if (orgId) params['orgId'] = orgId;

    return this.http.post<any>(
      `/api/aip/streamingServices/approval/org/approve/${resourceId}`,
      {},
      { params }
    );
  }

  /**
   * Rank 3 Org Admin - Reject resource at org level
   * Status: PENDING_ORG_APPROVAL -> ORG_REJECTED
   */
  rejectOrgApproval(resourceId: number): Observable<any> {
    // Extract rank from sessionStorage
    let rank = '3'; // default for org admin
    try {
      const roleStr = sessionStorage.getItem('role');
      if (roleStr) {
        const roleObj = JSON.parse(roleStr);
        rank = roleObj?.rank?.toString() || '3';
      }
    } catch (e) {
      console.error('[API] Error reading rank from sessionStorage:', e);
    }

    return this.http.post<any>(
      `/api/aip/streamingServices/approval/org/reject/${resourceId}`,
      {},
      { params: { rank } }
    );
  }

  // ─── Rank 4 Platform Admin approval methods ───────────────────────────────

  getPlatformAdminApprovals(): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.get<any>(`/api/aip/streamingServices/approval/platform-admin/list`, { params: { rank } });
  }

  getOrgAdminDraftResources(organizationId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.get<any>(`/api/aip/streamingServices/approval/org-admin/draft-resources`, { params: { organizationId, rank } });
  }

  submitForPlatformApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/streamingServices/approval/platform/submit`, { resourceId }, { params: { rank } });
  }

  approvePlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/streamingServices/approval/platform/approve/${resourceId}`, {}, { params: { rank } });
  }

  rejectPlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/streamingServices/approval/platform/reject/${resourceId}`, {}, { params: { rank } });
  }

  /**
   * Get organizations linked to a project
   * Used by Rank 2 to select which org to submit resource to
   */
  getProjectOrganizations(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/aip/projects/${projectId}/organizations`).pipe(
      catchError(() => of([]))
    );
  }

  // ─── Dataset approval workflow ────────────────────────────────────────────

  getProjectAdminDatasetApprovals(projectId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.get<any>(`/api/aip/datasets/approval/project-admin/list`, { params: { projectId, rank } });
  }

  getOrgAdminDatasetApprovals(organizationId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.get<any>(`/api/aip/datasets/approval/org-admin/list`, { params: { organizationId, rank } });
  }

  getPlatformAdminDatasetApprovals(): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.get<any>(`/api/aip/datasets/approval/platform-admin/list`, { params: { rank } });
  }

  approveDatasetProjectApproval(resourceId: number, projectId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/project/approve/${resourceId}`, { projectId }, { params: { rank } });
  }

  rejectDatasetProjectApproval(resourceId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/project/reject/${resourceId}`, {}, { params: { rank } });
  }

  submitDatasetForOrgApproval(resourceId: number, organizationId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/org/submit`, { resourceId, organizationId }, { params: { rank } });
  }

  approveDatasetOrgApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    let portfolioId: string | undefined;
    try {
      const pd = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}');
      if (pd?.id) { portfolioId = pd.id.toString(); }
    } catch {}
    const params: any = { rank };
    if (portfolioId) { params['organizationId'] = portfolioId; }
    return this.http.post<any>(`/api/aip/datasets/approval/org/approve/${resourceId}`, {}, { params });
  }

  rejectDatasetOrgApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/org/reject/${resourceId}`, {}, { params: { rank } });
  }

  submitDatasetForPlatformApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/platform/submit`, { resourceId }, { params: { rank } });
  }

  approveDatasetPlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/platform/approve/${resourceId}`, {}, { params: { rank } });
  }

  rejectDatasetPlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/datasets/approval/platform/reject/${resourceId}`, {}, { params: { rank } });
  }

  getDatasetDraftResources(projectId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.get<any>(`/api/aip/datasets/approval/draft-resources`, { params: { projectId, rank } });
  }

  getDatasetOrgDraftResources(organizationId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.get<any>(`/api/aip/datasets/approval/org-admin/draft-resources`, { params: { organizationId, rank } });
  }

  getDatasetCatalog(projectId?: number | null, orgId?: number | null): Observable<any> {
    const params: any = {};
    if (projectId != null) params['projectId'] = projectId;
    if (orgId != null) params['orgId'] = orgId;
    return this.http.get<any>(`/api/aip/datasets/approval/catalog`, { params }).pipe(catchError(() => of([])));
  }

  // ─── Datasource approval workflow ─────────────────────────────────────────

  getProjectAdminDatasourceApprovals(projectId: number, page: number = 0, size: number = 5): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.get<any>(`/api/aip/datasources/approval/project-admin/list`, { params: { projectId, rank, page, size } });
  }

  getOrgAdminDatasourceApprovals(organizationId: number, page: number = 0, size: number = 5): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.get<any>(`/api/aip/datasources/approval/org-admin/list`, { params: { organizationId, rank, page, size } });
  }

  getPlatformAdminDatasourceApprovals(page: number = 0, size: number = 5): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.get<any>(`/api/aip/datasources/approval/platform-admin/list`, { params: { rank, page, size } });
  }

  approveDatasourceProjectApproval(resourceId: number, projectId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/project/approve/${resourceId}`, { projectId }, { params: { rank } });
  }

  rejectDatasourceProjectApproval(resourceId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/project/reject/${resourceId}`, {}, { params: { rank } });
  }

  submitDatasourceForOrgApproval(resourceId: number, organizationId: number): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/org/submit`, { resourceId, organizationId }, { params: { rank } });
  }

  approveDatasourceOrgApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/org/approve/${resourceId}`, {}, { params: { rank } });
  }

  rejectDatasourceOrgApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/org/reject/${resourceId}`, {}, { params: { rank } });
  }

  submitDatasourceForPlatformApproval(resourceId: number): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/platform/submit`, { resourceId }, { params: { rank } });
  }

  approveDatasourcePlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/platform/approve/${resourceId}`, {}, { params: { rank } });
  }

  rejectDatasourcePlatformApproval(resourceId: number): Observable<any> {
    let rank = '4';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '4'; } catch {}
    return this.http.post<any>(`/api/aip/datasources/approval/platform/reject/${resourceId}`, {}, { params: { rank } });
  }

  getDatasourceDraftResources(projectId: number, page: number = 0, size: number = 5): Observable<any> {
    let rank = '2';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '2'; } catch {}
    return this.http.get<any>(`/api/aip/datasources/approval/draft-resources`, { params: { projectId, rank, page, size } });
  }

  getDatasourceOrgDraftResources(organizationId: number, page: number = 0, size: number = 5): Observable<any> {
    let rank = '3';
    try { rank = JSON.parse(sessionStorage.getItem('role') || '{}')?.rank?.toString() || '3'; } catch {}
    return this.http.get<any>(`/api/aip/datasources/approval/org-admin/draft-resources`, { params: { organizationId, rank, page, size } });
  }

  getDatasourceCatalog(projectId?: number | null, orgId?: number | null, page: number = 0, size: number = 5): Observable<any> {
    const params: any = { page, size };
    if (projectId != null) params['projectId'] = projectId;
    if (orgId != null) params['orgId'] = orgId;
    return this.http.get<any>(`/api/aip/datasources/approval/catalog`, { params }).pipe(catchError(() => of([])));
  }

  // ─── Clone (new version) ──────────────────────────────────────────────────
  // Clones an approved/published asset into a new DRAFT named "<base>-v<n>".
  // The original is left untouched; the clone re-enters the approval chain.

  clonePipeline(resourceId: number): Observable<any> {
    return this.http.post<any>(`/api/aip/streamingServices/approval/clone/${resourceId}`, this.cloneContext());
  }

  cloneDataset(resourceId: number): Observable<any> {
    return this.http.post<any>(`/api/aip/datasets/approval/clone/${resourceId}`, this.cloneContext());
  }

  cloneDatasource(resourceId: number): Observable<any> {
    return this.http.post<any>(`/api/aip/datasources/approval/clone/${resourceId}`, this.cloneContext());
  }

  // admin-console has no HTTP interceptor of its own, so the project/user the
  // clone should be created under is read from the shell's sessionStorage and
  // sent in the body instead of relying on the "project"/"user-login" headers.
  private cloneContext(): { projectId: number | null; username: string | null } {
    let projectId: number | null = null;
    let username: string | null = null;
    try { projectId = Number(JSON.parse(sessionStorage.getItem('project') || '{}')?.id) || null; } catch {}
    try {
      const u = JSON.parse(sessionStorage.getItem('user') || '{}');
      username = u?.username || u?.preferred_username || u?.name || null;
    } catch {}
    return { projectId, username };
  }
}
