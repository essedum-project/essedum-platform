import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import type { LegacyProject } from '../../../core/api-models';

// Create a new asset-draft, or edit the content of an existing draft.
// In edit mode the project is fixed (an asset never changes project) and
// only name + payload are editable. §5.
export interface DraftDialogData {
  mode: 'create' | 'edit';
  versionId?: number;
  name?: string;
  assetType?: string;
  payloadRef?: string;
}

export interface DraftDialogResult {
  mode: 'create' | 'edit';
  versionId?: number;
  projectId: number | null;
  assetType: string;
  name: string;
  payloadRef: string;
}

@Component({
  selector: 'app-draft-dialog',
  templateUrl: './draft-dialog.component.html',
  styleUrls: ['./draft-dialog.component.scss'],
  standalone: false,
})
export class DraftDialogComponent implements OnInit {
  projects: LegacyProject[] = [];
  loadError = '';

  projectId: number | null = null;
  name = '';
  assetType = 'generic';
  payloadRef = '';

  readonly isEdit: boolean;

  constructor(
    private readonly ref: MatDialogRef<DraftDialogComponent>,
    private readonly api: ApiService,
    @Inject(MAT_DIALOG_DATA) public readonly data: DraftDialogData,
  ) {
    this.isEdit = data?.mode === 'edit';
    if (this.isEdit) {
      this.name = data.name ?? '';
      this.assetType = data.assetType ?? 'generic';
      this.payloadRef = data.payloadRef ?? '';
    }
  }

  ngOnInit(): void {
    if (!this.isEdit) {
      this.api.getProjects().pipe(
        catchError(err => {
          this.loadError = err?.status === 403
            ? 'You do not have permission to list projects. Contact an admin.'
            : 'Failed to load projects. Please try again.';
          return of([] as LegacyProject[]);
        }),
      ).subscribe(projects => {
        this.projects = projects;
        if (projects.length === 1) {
          this.projectId = projects[0].id;
        }
      });
    }
  }

  get valid(): boolean {
    if (!this.name.trim()) {
      return false;
    }
    return this.isEdit || this.projectId != null;
  }

  save(): void {
    if (!this.valid) {
      return;
    }
    const result: DraftDialogResult = {
      mode: this.isEdit ? 'edit' : 'create',
      versionId: this.data?.versionId,
      projectId: this.projectId,
      assetType: this.assetType.trim() || 'generic',
      name: this.name.trim(),
      payloadRef: this.payloadRef.trim(),
    };
    this.ref.close(result);
  }

  cancel(): void {
    this.ref.close();
  }
}
