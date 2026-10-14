import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AccessContext, RbacRole, RoleAssignment, Asset, AssetVersion, PromotionEvent, MenuItem,
  LegacyOrganisation, LegacyProject, RbacEnvironment, AuditEvent, UserOption, IdentityTarget, RoleMenu,
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

  getRoleAssignments(): Observable<RoleAssignment[]> {
    return this.http.get<RoleAssignment[]>(`${this.base}/access/role-assignments`);
  }

  grantRole(payload: {
    userId: number; roleId: number; organizationId: number | null; projectId: number | null;
  }): Observable<RoleAssignment> {
    return this.http.post<RoleAssignment>(`${this.base}/access/role-assignments`, payload);
  }

  revokeRoleAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/access/role-assignments/${id}`);
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

  // ---- publishing ----
  getAssets(userId: number): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.base}/assets`, { params: { userId } });
  }

  getVersions(userId: number): Observable<AssetVersion[]> {
    return this.http.get<AssetVersion[]>(`${this.base}/assets/versions`, { params: { userId } });
  }

  getDraftVersions(userId: number): Observable<AssetVersion[]> {
    return this.http.get<AssetVersion[]>(`${this.base}/assets/versions/drafts`, { params: { userId } });
  }

  // §4 marketplace — published assets visible in the caller's scope.
  getCatalog(userId: number): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.base}/assets/catalog`, { params: { userId } });
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

  getApprovals(userId: number): Observable<PromotionEvent[]> {
    return this.http.get<PromotionEvent[]>(`${this.base}/approvals`, { params: { userId } });
  }

  decideApproval(
    versionId: number,
    payload: { gate: string; action: 'approved' | 'rejected'; actorId: number; actorName: string; note: string },
  ): Observable<PromotionEvent> {
    return this.http.post<PromotionEvent>(`${this.base}/approvals/${versionId}/decision`, payload);
  }

  // ---- menu ----
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/menu-items`);
  }

  createMenuItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/menu-items`, item);
  }

  updateMenuItem(id: number, item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.base}/menu-items/${id}`, item);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/menu-items/${id}`);
  }

  // ---- role menus (live per-role sidebars in usm_constant) ----
  getRoleMenuRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/role-menus/roles`);
  }

  getRoleMenuProjects(role: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/role-menus/projects`, { params: { role } });
  }

  getRoleMenus(role: string, project: string): Observable<RoleMenu[]> {
    return this.http.get<RoleMenu[]>(`${this.base}/role-menus`, { params: { role, project } });
  }

  createRoleMenu(body: {
    role: string; project: string; label: string; icon: string | null; url: string | null;
  }): Observable<RoleMenu> {
    return this.http.post<RoleMenu>(`${this.base}/role-menus`, body);
  }

  updateRoleMenu(id: number, body: {
    label: string; icon: string | null; url: string | null;
  }): Observable<RoleMenu> {
    return this.http.put<RoleMenu>(`${this.base}/role-menus/${id}`, body);
  }

  deleteRoleMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/role-menus/${id}`);
  }

  // ---- legacy tenancy (existing OrganisationResource/ProjectResource, under /api not /api/usm) ----
  getOrganisations(): Observable<LegacyOrganisation[]> {
    return this.http.get<LegacyOrganisation[]>('/api/organisations');
  }

  getProjects(): Observable<LegacyProject[]> {
    return this.http.get<LegacyProject[]>('/api/projects');
  }

  // ---- environments (rbac_environment) ----
  getEnvironments(projectId: number): Observable<RbacEnvironment[]> {
    return this.http.get<RbacEnvironment[]>(`${this.base}/environments`, { params: { projectId } });
  }

  // ---- audit (rbac_audit_event, NFR-O2) ----
  getAuditEvents(): Observable<AuditEvent[]> {
    return this.http.get<AuditEvent[]>(`${this.base}/audit`);
  }

  // ---- identity projection status (§8) ----
  getIdentityTargets(): Observable<IdentityTarget[]> {
    return this.http.get<IdentityTarget[]>(`${this.base}/identity/targets`);
  }

  retryIdentityTarget(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/identity/targets/${id}/retry`, {});
  }
}
