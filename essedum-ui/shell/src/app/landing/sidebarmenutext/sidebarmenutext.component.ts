import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-sidebar-menu-text',
    templateUrl: './sidebarmenutext.component.html',
    styleUrls: ['./sidebarmenutext.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class SidebarMenuTextComponent {
  @Input() showSidebarMenuList: boolean = false;
  @Input() sidebarMenuPopupPosition: any;
  @Input() sidebarMenu: any[] = [];
  @Input() highlightedLabel: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<any>();

  onClose(): void {
    this.close.emit();
  }

  onMenuItemClick(event: any, item: any): void {
    this.menuItemClick.emit({ event, item });
  }
}
