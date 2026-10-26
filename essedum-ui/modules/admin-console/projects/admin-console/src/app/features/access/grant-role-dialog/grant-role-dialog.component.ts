import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import type { RbacRole, LegacyOrganisation, LegacyProject, LegacyPortfolio, UserOption } from '../../../core/api-models';

/** Unified entry shown in the Organization dropdown — covers both usm_organisation (RBAC) and usm_portfolio (legacy). */
interface OrgOption {
  /** The ID sent to the backend when granting. For RBAC orgs this is usm_organisation.id;
   *  for legacy portfolios it is usm_portfolio.id shifted by LEGACY_ORG_OFFSET so the
   *  backend can distinguish them (mirrors the LEGACY_ROLE_ID_OFFSET pattern). */
  grantId: number;
  /** Raw usm_organisation.id or usm_portfolio.id — used to match projects. */
  nativeId: number;
  name: string;
  source: 'rbac' | 'legacy';
}

@Component({
  selector: 'app-grant-role-dialog',
  templateUrl: './grant-role-dialog.component.html',
  styleUrls: ['./grant-role-dialog.component.scss'],
  standalone: false,
})
export class GrantRoleDialogComponent implements OnInit {
  roles: RbacRole[] = [];
  users: UserOption[] = [];
  /** Unified org list (RBAC + legacy portfolios). */
  orgOptions: OrgOption[] = [];
  projects: LegacyProject[] = [];

  userId: number | null = null;
  roleId: number | null = null;
  /** grantId of the selected OrgOption. */
  selectedOrgGrantId: number | null = null;
  wholeOrganization = true;
  projectIds: number[] = [];

  private rbacOrgs: LegacyOrganisation[] = [];
  private portfolios: LegacyPortfolio[] = [];

  private readonly roleNameMap: { [key: string]: string } = {
    'viewer': 'AI Consumer(Read only)',
    'developer': 'AI Engineer',
    'project_admin': 'AI Project Admin',
    'org_admin': 'AI Organization Admin',
    'platform_admin': 'AI Platform Admin',
  };

  constructor(
    private readonly ref: MatDialogRef<GrantRoleDialogComponent>,
    private readonly api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.getRoles().subscribe(roles => {
      // RBAC roles (rank defined) first sorted by rank, then legacy sorted by name
      const rbac = roles.filter(r => r.rank != null).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
      const legacy = roles.filter(r => r.rank == null).sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      this.roles = [...rbac, ...legacy];
    });
    this.api.getUsers().subscribe(users => (this.users = users));
    this.api.getProjects().subscribe(projects => (this.projects = projects));

    forkJoin([
      this.api.getOrganisations().pipe(catchError(() => of([] as LegacyOrganisation[]))),
      this.api.getPortfolios().pipe(catchError(() => of([] as LegacyPortfolio[]))),
    ]).subscribe(([orgs, portfolios]) => {
      this.rbacOrgs = orgs;
      this.portfolios = portfolios;
      this.buildOrgOptions();
    });
  }

  private buildOrgOptions(): void {
    const rbacEntries: OrgOption[] = this.rbacOrgs.map(o => ({
      grantId: o.id,
      nativeId: o.id,
      name: o.name,
      source: 'rbac',
    }));
    const rbacNames = new Set(this.rbacOrgs.map(o => (o.name || '').toLowerCase()));
    const legacyEntries: OrgOption[] = (this.portfolios || [])
      .filter(p => !rbacNames.has((p.portfolioName || '').toLowerCase()))
      .map(p => ({
        grantId: p.id,
        nativeId: p.id,
        name: p.portfolioName,
        source: 'legacy' as const,
      }));
    this.orgOptions = [...rbacEntries, ...legacyEntries]
      .sort((a, b) => (a.name || '').toLowerCase() > (b.name || '').toLowerCase() ? 1 : -1);
  }

  getDisplayRoleName(roleName: string): string {
    return this.roleNameMap[roleName.toLowerCase()] || roleName;
  }

  get selectedOrg(): OrgOption | undefined {
    return this.orgOptions.find(o => o.grantId === this.selectedOrgGrantId);
  }

  get projectsForOrg(): LegacyProject[] {
    const org = this.selectedOrg;
    if (!org) return [];
    if (org.source === 'rbac') {
      // RBAC org: match by organisationId. Also check same-named legacy portfolio
      // for projects linked via portfolioId (best-effort fallback for mixed setups).
      const portfolioMatch = this.portfolios.find(p => (p.portfolioName || '').toLowerCase() === (org.name || '').toLowerCase());
      return this.projects.filter(p =>
        p.organisationId === org.nativeId ||
        (portfolioMatch != null && p.portfolioId?.id === portfolioMatch.id)
      );
    } else {
      // Legacy portfolio org: match projects linked via portfolioId.
      return this.projects.filter(p => p.portfolioId?.id === org.nativeId);
    }
  }

  onOrganizationChange(): void {
    this.wholeOrganization = true;
    this.projectIds = [];
  }

  save(): void {
    if (!this.userId || !this.roleId || !this.selectedOrgGrantId) {
      return;
    }
    if (!this.wholeOrganization && this.projectIds.length === 0) {
      return;
    }
    const org = this.selectedOrg;
    const isLegacy = org?.source === 'legacy';

    // For legacy portfolio orgs: the backend's bridgeAssignment() cannot resolve projects
    // via organisationId (legacy projects link via portfolioId, not organisationId).
    // Pass explicit project IDs so each grant is project-scoped and the bridge fires correctly.
    if (isLegacy && this.wholeOrganization) {
      this.ref.close({
        userId: this.userId,
        roleId: this.roleId,
        organizationId: null,
        projectIds: this.projectsForOrg.map(p => p.id),
        isLegacyOrg: true,
      });
    } else {
      this.ref.close({
        userId: this.userId,
        roleId: this.roleId,
        organizationId: this.wholeOrganization ? org?.nativeId ?? null : null,
        projectIds: this.wholeOrganization ? [] : this.projectIds,
        isLegacyOrg: isLegacy,
      });
    }
  }

  cancel(): void {
    this.ref.close();
  }
}
