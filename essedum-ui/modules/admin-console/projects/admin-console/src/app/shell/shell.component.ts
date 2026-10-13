import { Component } from '@angular/core';
import { UserContextService } from '../core/user-context.service';

// Top-level layout for the admin-console remote — a simple nav + router-outlet,
// matching §10's six flat areas (no nesting beyond this).
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  standalone: false,
})
export class ShellComponent {
  readonly navLinks = [
    { path: 'tenancy', label: 'Organizations & Projects' },
    { path: 'access', label: 'Members & Roles' },
    { path: 'publishing', label: 'My Drafts' },
    { path: 'approvals', label: 'Approvals' },
    { path: 'audit', label: 'Audit Log' },
    { path: 'menu-configuration', label: 'Menu Configuration' },
  ];

  constructor(readonly userContext: UserContextService) {}

  setUserId(value: string): void {
    const userId = Number(value);
    if (Number.isFinite(userId) && userId > 0) {
      this.userContext.setUserId(userId);
    }
  }
}
