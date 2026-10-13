import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../core/mock-data.service';
import { AuditEvent } from '../../core/models';

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

  constructor(private readonly data: MockDataService) {}

  ngOnInit(): void {
    this.data.auditEvents$.subscribe(events => (this.events = events));
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
        e.actorName.toLowerCase().includes(term) ||
        e.details.toLowerCase().includes(term),
    );
  }
}
