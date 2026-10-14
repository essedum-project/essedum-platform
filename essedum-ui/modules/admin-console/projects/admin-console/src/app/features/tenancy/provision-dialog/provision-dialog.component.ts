import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/api.service';
import { LegacyOrganisation, LegacyProject } from '../../../core/api-models';

export type ProvisionKind = 'organization' | 'project' | 'environment' | 'role';

@Component({
  selector: 'app-provision-dialog',
  templateUrl: './provision-dialog.component.html',
  standalone: false,
})
export class ProvisionDialogComponent implements OnInit {
  kind: ProvisionKind;

  name = '';
  status = 'active';
  description = '';
  organisationId: number | null = null;
  projectId: number | null = null;
  configRef = '';
  rank = 0;

  organizations: LegacyOrganisation[] = [];
  projects: LegacyProject[] = [];

  readonly titles: Record<ProvisionKind, string> = {
    organization: 'New Organization',
    project: 'New Project',
    environment: 'New Environment',
    role: 'New Role',
  };

  constructor(
    private readonly ref: MatDialogRef<ProvisionDialogComponent>,
    private readonly api: ApiService,
    @Inject(MAT_DIALOG_DATA) data: { kind: ProvisionKind },
  ) {
    this.kind = data.kind;
  }

  ngOnInit(): void {
    if (this.kind === 'project') {
      this.api.getOrganisations().subscribe(o => (this.organizations = o));
    }
    if (this.kind === 'environment') {
      this.api.getProjects().subscribe(p => (this.projects = p));
    }
  }

  get valid(): boolean {
    if (!this.name.trim()) {
      return false;
    }
    if (this.kind === 'environment' && !this.projectId) {
      return false;
    }
    return true;
  }

  save(): void {
    if (!this.valid) {
      return;
    }
    this.ref.close({
      kind: this.kind,
      name: this.name.trim(),
      status: this.status,
      description: this.description,
      organisationId: this.organisationId,
      projectId: this.projectId,
      configRef: this.configRef,
      rank: this.rank,
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
