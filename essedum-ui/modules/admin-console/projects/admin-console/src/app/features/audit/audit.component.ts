import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { AuditEvent } from '../../core/api-models';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
  standalone: false,
})
export class AuditComponent implements OnInit {
  events: AuditEvent[] = [];
  filterText = '';

  readonly columns = ['occurredAt', 'entity', 'action', 'actorName', 'details', 'correlationId'];

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    this.api.getAuditEvents(this.userContext.userId$.value).subscribe(events => (this.events = events));
  }

  get filteredEvents(): AuditEvent[] {
    if (!this.filterText) {
      return this.events;
    }
    const term = this.filterText.toLowerCase();
    return this.events.filter(
      e =>
        e.entity.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        (e.actorName ?? '').toLowerCase().includes(term) ||
        (e.details ?? '').toLowerCase().includes(term),
    );
  }
}
