import { Component, Input, Output, EventEmitter } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// Constants for service types
const SERVICE_TYPES = {
  ADAPTERS: 'adapters',
  INSTANCES: 'instances',
  SPECS: 'specs',
  SCHEMAS: 'schemas',
  MODEL: 'model',
  PIPELINE: 'pipeline',
  CONNECTIONS: 'connections',
  DATASETS: 'Datasets',
};

// Background colors
const BACKGROUND_COLORS = [
  '#E3F2FD',
  '#F3E5F5',
  '#E8F5E8',
  '#FFF3E0',
  '#FCE4EC',
  '#E0F2F1',
  '#F9FBE7',
  '#EFEBE9',
  '#E8EAF6',
  '#F1F8E9',
  '#FFF8E1',
  '#FAFAFA',
  '#E0F7FA',
  '#F3E5AB',
  '#FFEBEE',
  '#E8F5E8',
];

@Component({
  selector: 'app-aip-card',
  templateUrl: './aip-card.component.html',
  styleUrls: ['./aip-card.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AipCardComponent {
  // Input properties
  @Input() servicev1: string;
  @Input() card: any;
  @Input() editAuth = false;
  @Input() deployAuth = false;
  @Input() deleteAuth = false;

  // Output events
  @Output() viewDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() jobConsole?: EventEmitter<any> = new EventEmitter<any>();
  @Output() viewDatasets = new EventEmitter<any>();
  @Output() download = new EventEmitter<any>();
    @Output() downloadModel = new EventEmitter<any>();
  @Output() copy = new EventEmitter<any>();

  // UI state variables
  isMenuHovered = false;

  // Action handlers
  onViewDetails(): void {
    this.viewDetails.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  onViewDatasets(cardType: any): void {
    this.viewDatasets.emit(cardType);
  }

  onDownload(card: any): void {
    this.download.emit(card);
  }
  onModelDownload(card:any): void {
    this.downloadModel.emit(card);
  }
  onCopy(card: any): void {
    this.copy.emit(card);
  }

  getAvatarBackgroundColor(): string {
    const character = this.getAvatar();
    let hash = 0;

    for (let i = 0; i < character.length; i++) {
      const char = character.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const colorIndex = Math.abs(hash) % BACKGROUND_COLORS.length;
    return BACKGROUND_COLORS[colorIndex];
  }

  getCategory(): string | undefined {
    const categoryMap = {
      [SERVICE_TYPES.ADAPTERS]: this.card?.category,
      [SERVICE_TYPES.SPECS]: this.card?.domainname,
      [SERVICE_TYPES.INSTANCES]: this.card?.adaptername,
      [SERVICE_TYPES.SCHEMAS]: this.card?.name,
      [SERVICE_TYPES.MODEL]: `${this.card?.datasource?.category} - ${this.card?.datasource?.alias}`,
      [SERVICE_TYPES.PIPELINE]: this.card?.type,
      [SERVICE_TYPES.CONNECTIONS]: this.card?.type,
      [SERVICE_TYPES.DATASETS]: `${this.card?.datasource?.category} - ${this.card?.datasource?.alias}`,
    };
    return categoryMap[this.servicev1];
  }

  getTitle(): string | undefined {
    const titleMap = {
      [SERVICE_TYPES.ADAPTERS]: this.card?.name,
      [SERVICE_TYPES.INSTANCES]: this.card?.name,
      [SERVICE_TYPES.SPECS]: this.card?.domainname,
      [SERVICE_TYPES.SCHEMAS]: this.card?.alias,
      [SERVICE_TYPES.PIPELINE]: this.card?.alias,
      [SERVICE_TYPES.CONNECTIONS]: this.card?.alias,
      [SERVICE_TYPES.MODEL]: this.card?.modelName,
      [SERVICE_TYPES.DATASETS]: this.card?.alias,
    };
    return titleMap[this.servicev1];
  }

  getDate(): string | undefined {
    const dateMap = {
      [SERVICE_TYPES.ADAPTERS]: this.card?.createdon,
      [SERVICE_TYPES.INSTANCES]: this.card?.createdon,
      [SERVICE_TYPES.SPECS]: this.card?.lastmodifiedon,
      [SERVICE_TYPES.SCHEMAS]: this.card?.lastmodifieddate,
      [SERVICE_TYPES.CONNECTIONS]: this.card?.lastmodifieddate,
      [SERVICE_TYPES.DATASETS]: this.card?.lastmodifieddate,
      [SERVICE_TYPES.MODEL]: this.card?.createdOn,
      [SERVICE_TYPES.PIPELINE]: this.card?.createdDate,
    };
    return dateMap[this.servicev1];
  }

  getAvatar(): string {
    const avatarMap = {
      [SERVICE_TYPES.ADAPTERS]: this.card?.createdby || 'Name Not Available',
      [SERVICE_TYPES.INSTANCES]: this.card?.createdby || 'Name Not Available',
      [SERVICE_TYPES.SPECS]: this.card?.createdby || 'Name Not Available',
      [SERVICE_TYPES.SCHEMAS]:
        this.card?.lastmodifiedby || 'Name Not Available',
      [SERVICE_TYPES.CONNECTIONS]:
        this.card?.lastmodifiedby || 'Name Not Available',
      [SERVICE_TYPES.MODEL]: this.card?.createdBy || 'Name Not Available',
      [SERVICE_TYPES.PIPELINE]:
        this.card?.target?.created_by || 'Name Not Available',
    };
    return avatarMap[this.servicev1];
  }
}
