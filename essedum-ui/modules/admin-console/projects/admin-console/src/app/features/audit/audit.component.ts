import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { AuditEvent } from '../../core/api-models';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
  standalone: false,
})
export class AuditComponent implements OnInit, AfterViewInit {
  events: AuditEvent[] = [];
  loading = true;
  auditDataSource = new MatTableDataSource<AuditEvent>([]);

  private _filterText = '';
  get filterText(): string { return this._filterText; }
  set filterText(val: string) { this._filterText = val; this.syncFilteredData(); }

  readonly columns = ['occurredAt', 'entity', 'action', 'actorName', 'targetUserName', 'details', 'correlationId'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.auditDataSource.paginator = this.paginator;
  }

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.userContext.orgId$, this.userContext.projectId$, this.userContext.selectedRoleRank$])
      .pipe(take(1))
      .subscribe(([orgId, projectId, roleRank]) => {
        const isPlatformAdmin = roleRank != null && roleRank >= 4;
        this.api.getAuditEvents(
          this.userContext.userId$.value,
          isPlatformAdmin ? undefined : (orgId ?? undefined),
          isPlatformAdmin ? undefined : (projectId ?? undefined),
        ).subscribe(events => {
          this.events = events;
          this.loading = false;
          this.syncFilteredData();
        });
      });
  }

  cleanDetails(details: string | null): string {
    if (!details) return '';
    return details
      .replace(/\s*\(org=\d+\)/g, '')
      .replace(/\s*\(project=\d+\)/g, '')
      .replace(/AI Client/g, 'AI Engineer')
      .trim();
  }

  get filteredEvents(): AuditEvent[] {
    if (!this._filterText) {
      return this.events;
    }
    const term = this._filterText.toLowerCase();
    return this.events.filter(
      e =>
        e.entity.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        (e.actorName ?? '').toLowerCase().includes(term) ||
        (e.details ?? '').toLowerCase().includes(term),
    );
  }

  private syncFilteredData(): void {
    this.auditDataSource.data = this.filteredEvents;
    this.auditDataSource.paginator = this.paginator;
  }
}
