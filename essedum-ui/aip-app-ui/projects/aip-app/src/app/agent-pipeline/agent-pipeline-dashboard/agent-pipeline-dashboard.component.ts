import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface AgentCard {
  cid: string;
  name: string;
  alias: string;
  description: string;
  type: string;
  language: string;
  status: string;
  version: string;
  lastModified: Date;
  tags?: string[];
  lastmodifiedon?: Date;
  createdby?: string;
  hover?: boolean;
}

@Component({
  selector: 'app-agent-pipeline-dashboard',
  templateUrl: './agent-pipeline-dashboard.component.html',
  styleUrls: ['./agent-pipeline-dashboard.component.scss'],
})
export class AgentPipelineDashboardComponent implements OnInit {
  @Input() agentCards: AgentCard[] = [];
  @Input() CARD_TITLE = 'Agent Pipelines';
  @Input() lastRefreshedTime: Date | null = null;
  @Input() tagrefresh: boolean = false;
  @Input() selectedFilterTypes: any = {};

  @Output() search = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() tagSelected = new EventEmitter<any>();
  @Output() filterStatusChange = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<AgentCard>();
  @Output() edit = new EventEmitter<AgentCard>();
  @Output() delete = new EventEmitter<AgentCard>();

  constructor() {}

  ngOnInit(): void {}

  trackByCardId(index: number, card: AgentCard): string {
    return card.cid;
  }

  onSearch(searchTerm: string): void {
    this.search.emit(searchTerm);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onAdd(): void {
    this.add.emit();
  }

  onTagSelected(tags: any): void {
    this.tagSelected.emit(tags);
  }

  onFilterStatusChange(filters: any): void {
    this.filterStatusChange.emit(filters);
  }

  onViewDetails(agent: AgentCard): void {
    this.viewDetails.emit(agent);
  }

  onEdit(agent: AgentCard): void {
    this.edit.emit(agent);
  }

  onDelete(agent: AgentCard): void {
    this.delete.emit(agent);
  }
}
