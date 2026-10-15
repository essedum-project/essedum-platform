import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/api.service';
import { RbacRole, LegacyOrganisation, LegacyProject, UserOption } from '../../../core/api-models';

@Component({
  selector: 'app-grant-role-dialog',
  templateUrl: './grant-role-dialog.component.html',
  standalone: false,
})
export class GrantRoleDialogComponent implements OnInit {
  roles: RbacRole[] = [];
  users: UserOption[] = [];
  organizations: LegacyOrganisation[] = [];
  projects: LegacyProject[] = [];

  userId: number | null = null;
  roleId: number | null = null;
  scopeType: 'project' | 'organization' | 'platform' = 'project';
  organizationId: number | null = null;
  projectId: number | null = null;

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

  save(): void {
    if (!this.userId || !this.roleId) {
      return;
    }
    this.ref.close({
      userId: this.userId,
      roleId: this.roleId,
      organizationId: this.scopeType === 'organization' ? this.organizationId : null,
      projectId: this.scopeType === 'project' ? this.projectId : null,
    });
  }

  cancel(): void {
    this.ref.close();
  }

  // Project names often coincide with their parent org's name in seed/demo
  // data (one project per org) — show the org alongside the name to disambiguate.
  projectLabel(project: LegacyProject): string {
    const org = this.organizations.find(o => o.id === project.organisationId);
    return org ? `${project.name} (${org.name})` : project.name;
  }
}
