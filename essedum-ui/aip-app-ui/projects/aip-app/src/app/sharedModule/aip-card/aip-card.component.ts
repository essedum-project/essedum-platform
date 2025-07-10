import { Component, Input, Output, EventEmitter } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-aip-card',
  templateUrl: './aip-card.component.html',
  styleUrl: './aip-card.component.scss',
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
  @Output() viewDetails = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

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

  getAvatarBackgroundColor(): string {
    const character = this.getAvatar();

    const backgroundColors = [
      '#E3F2FD', // Light blue
      '#F3E5F5', // Light purple
      '#E8F5E8', // Light green
      '#FFF3E0', // Light orange
      '#FCE4EC', // Light pink
      '#E0F2F1', // Light teal
      '#F9FBE7', // Light lime
      '#EFEBE9', // Light brown
      '#E8EAF6', // Light indigo
      '#F1F8E9', // Light light green
      '#FFF8E1', // Light amber
      '#FAFAFA', // Light gray
      '#E0F7FA', // Light cyan
      '#F3E5AB', // Light yellow-green
      '#FFEBEE', // Very light red
      '#E8F5E8', // Another light green variant
    ];

    let hash = 0;

    for (let i = 0; i < character.length; i++) {
      const char = character.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const colorIndex = Math.abs(hash) % backgroundColors.length;
    return backgroundColors[colorIndex];
  }

  getCategory() {
    if (this.servicev1 === 'adapters') {
      return this.card.category;
    } else if (this.servicev1 === 'specs') {
      return this.card.domainname;
    } else if (this.servicev1 === 'instances') {
      return this.card.adaptername;
    } else if (this.servicev1 === 'schemas') {
      return this.card.name;
    } else if (this.servicev1 === 'model') {
      return this.card.type;
    }
  }

  getTitle() {
    if (this.servicev1 === 'adapters' || this.servicev1 === 'instances') {
      return this.card.name;
    } else if (this.servicev1 === 'specs') {
      return this.card.domainname;
    } else if (this.servicev1 === 'schemas') {
      return this.card.alias;
    } else if (this.servicev1 === 'model') {
      return this.card.name && this.card.name != ''
        ? this.card.name
        : this.card.sourceName;
    }
  }

  getDate() {
    if (this.servicev1 === 'adapters' || this.servicev1 === 'instances') {
      return this.card.createdon;
    } else if (this.servicev1 === 'specs') {
      return this.card.lastmodifiedon;
    } else if (this.servicev1 === 'schemas') {
      return this.card.lastmodifieddate;
    } else if (this.servicev1 === 'model') {
      return this.card.createdOn;
    }
  }

  getAvatar() {
    if (
      this.servicev1 === 'adapters' ||
      this.servicev1 === 'instances' ||
      this.servicev1 === 'specs'
    ) {
      return this.card.createdby ? this.card.createdby : 'Name Not Available';
    } else if (this.servicev1 === 'schemas') {
      return this.card.lastmodifiedby
        ? this.card.lastmodifiedby
        : 'Name Not Available';
    } else if (this.servicev1 === 'model') {
      return this.card.createdBy ? this.card.createdBy : 'Name Not Available';
    }
  }
}
