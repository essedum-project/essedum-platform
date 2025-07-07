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
  onViewDetails(card: any): void {
    this.viewDetails.emit(card);
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(cardName: any): void {
    this.delete.emit(cardName);
  }
}
