import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AccessContext, RbacRole, RoleAssignment, Asset, AssetVersion, PromotionEvent, MenuItem,
  LegacyOrganisation, LegacyProject, RbacEnvironment, AuditEvent, UserOption,
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

  submitVersion(
    versionId: number,
    payload: { gate: string; actorId: number; actorName: string; note: string },
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
}
