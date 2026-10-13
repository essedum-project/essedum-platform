import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/api.service';
import { MenuItem } from '../../../core/api-models';

@Component({
  selector: 'app-menu-item-dialog',
  templateUrl: './menu-item-dialog.component.html',
  standalone: false,
})
export class MenuItemDialogComponent implements OnInit {
  label = this.existing?.label ?? '';
  route = this.existing?.route ?? '';
  parentId: number | null = this.existing?.parentId ?? null;
  minRoleRank = this.existing?.minRoleRank ?? 0;
  displayOrder = this.existing?.displayOrder ?? 1;

  candidateParents: MenuItem[] = [];

  constructor(
    private readonly ref: MatDialogRef<MenuItemDialogComponent>,
    private readonly api: ApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly existing: MenuItem | null,
  ) {}

  ngOnInit(): void {
    this.api.getMenuItems().subscribe(items => {
      this.candidateParents = items.filter(item => item.id !== this.existing?.id);
    });
  }

  save(): void {
    if (!this.label || !this.route) {
      return;
    }
    this.ref.close({
      label: this.label,
      route: this.route,
      parentId: this.parentId,
      minRoleRank: this.minRoleRank,
      displayOrder: this.displayOrder,
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
