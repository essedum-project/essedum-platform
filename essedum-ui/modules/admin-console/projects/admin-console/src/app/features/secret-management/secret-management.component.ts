import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/api.service';
import { Secret } from '../../core/api-models';
import { SecretDialogComponent } from './secret-dialog/secret-dialog.component';

// Native admin-console screen for the legacy usm_secrets store (/api/secrets).
// That endpoint's source is content-excluded from this agent, so the request
// shape here is a best-effort guess — values are never shown back, only set.
@Component({
  selector: 'app-secret-management',
  templateUrl: './secret-management.component.html',
  styleUrls: ['./secret-management.component.scss'],
  standalone: false,
})
export class SecretManagementComponent implements OnInit {
  projectOptions: string[] = [];
  selectedProject = '';
  rows: Secret[] = [];
  readonly columns = ['key', 'value', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.api.getProjects().subscribe(projects => {
      this.projectOptions = projects.map(p => p.name);
      if (this.projectOptions.length) {
        this.onProjectChange(this.projectOptions[0]);
      }
    });
  }

  onProjectChange(project: string): void {
    this.selectedProject = project;
    this.load();
  }

  private load(): void {
    if (!this.selectedProject) {
      this.rows = [];
      return;
    }
    this.api.getSecrets(this.selectedProject).subscribe(rows => (this.rows = rows));
  }

  add(): void {
    if (!this.selectedProject) {
      return;
    }
    const ref = this.dialog.open(SecretDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result: { key: string; value: string } | undefined) => {
      if (result) {
        this.api.createSecret({ project: this.selectedProject, ...result }).subscribe(() => this.load());
      }
    });
  }

  edit(row: Secret): void {
    const ref = this.dialog.open(SecretDialogComponent, { width: '480px', data: row });
    ref.afterClosed().subscribe((result: { key: string; value: string } | undefined) => {
      if (result) {
        this.api.updateSecret({ project: this.selectedProject, key: row.key, value: result.value }).subscribe(() => this.load());
      }
    });
  }

  remove(row: Secret): void {
    this.api.deleteSecret(this.selectedProject, row.key).subscribe(() => this.load());
  }
}
