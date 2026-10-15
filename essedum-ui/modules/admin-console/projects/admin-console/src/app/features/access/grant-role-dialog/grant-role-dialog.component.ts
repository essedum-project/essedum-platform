import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/api.service';
import { RbacRole, LegacyOrganisation, LegacyProject, UserOption } from '../../../core/api-models';

@Component({
  selector: 'app-grant-role-dialog',
  templateUrl: './grant-role-dialog.component.html',
  styleUrls: ['./grant-role-dialog.component.scss'],
  standalone: false,
})
export class GrantRoleDialogComponent implements OnInit {
  roles: RbacRole[] = [];
  users: UserOption[] = [];
  organizations: LegacyOrganisation[] = [];
  projects: LegacyProject[] = [];

  userId: number | null = null;
  roleId: number | null = null;
  organizationId: number | null = null;
  // true = org-scoped grant (dynamic — automatically covers future projects
  // too, per AccessContextService's org→project expansion); false = pick
  // specific current projects.
  wholeOrganization = true;
  projectIds: number[] = [];

  constructor(
    private readonly ref: MatDialogRef<GrantRoleDialogComponent>,
    private readonly api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.getRoles().subscribe(roles => (this.roles = roles));
    this.api.getUsers().subscribe(users => (this.users = users));
    this.api.getOrganisations().subscribe(orgs => (this.organizations = orgs));
    this.api.getProjects().subscribe(projects => (this.projects = projects));
  }

  // Org-scoped grant is org-first: pick the org, then either apply to the
  // whole org (dynamic) or pick which of its current projects to grant into.
  get projectsForOrg(): LegacyProject[] {
    return this.organizationId == null
      ? []
      : this.projects.filter(p => p.organisationId === this.organizationId);
  }

  onOrganizationChange(): void {
    this.wholeOrganization = true;
    this.projectIds = [];
  }

  save(): void {
    if (!this.userId || !this.roleId || !this.organizationId) {
      return;
    }
    if (!this.wholeOrganization && this.projectIds.length === 0) {
      return;
    }
    this.ref.close({
      userId: this.userId,
      roleId: this.roleId,
      organizationId: this.wholeOrganization ? this.organizationId : null,
      projectIds: this.wholeOrganization ? [] : this.projectIds,
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
