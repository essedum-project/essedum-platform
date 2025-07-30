import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-modal-config-schema-header',
  templateUrl: './modal-config-schema-header.component.html',
  styleUrls: ['./modal-config-schema-header.component.scss'],
  animations: [
    trigger('searchAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          width: '0px',
          margin: '0',
          padding: '0',
          visibility: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          width: '200px',
          visibility: 'visible',
        })
      ),
      transition('hidden => visible', [
        style({ visibility: 'visible', width: '0px' }),
        animate('600ms ease-in'),
      ]),
      transition('visible => hidden', [
        animate(
          '600ms ease-out',
          style({
            opacity: 0,
            width: '0px',
          })
        ),
      ]),
    ]),
  ],
})
export class ModalConfigSchemaHeaderComponent {
  @Input() cardTitle: string = '';
  @Input() lastRefreshedTime: Date | null = null;
  @Input() showAddButton: boolean = false;
  @Input() tabValue: string = '';
  @Input() formListView: boolean = false;
  @Input() isRawData: boolean = false;

  @Output() navigateBack = new EventEmitter<void>();
  @Output() toggleView = new EventEmitter<boolean | undefined>();
  @Output() search = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  readonly TOOLTIP_POSITION = 'above';
  isSearchHovered: boolean = false;
  isBackHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isSearchVisible: boolean = false;
  isAnimating: boolean = false;
  isRefreshing: boolean = false;
  searchText: string = '';

  constructor() {}

  onNavigateBack(): void {
    this.navigateBack.emit();
  }

  onToggleView(isRawData: boolean | undefined): void {
    this.toggleView.emit(isRawData);
  }

  onSearch(): void {
    this.search.emit(this.searchText);
  }

  onRefreshClick(): void {
    this.isRefreshing = true;

    this.refresh.emit();

    setTimeout(() => {
      this.isRefreshing = false;
    }, 1500);
  }

  toggleSearch(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.isAnimating = true;
    this.isSearchVisible = !this.isSearchVisible;

    setTimeout(() => {
      this.isAnimating = false;

      if (this.isSearchVisible) {
        const input = document.querySelector(
          '.header-search input'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }
    }, 600);

    this.isSearchHovered = false;
  }

  onInputBlur(): void {
    if (!this.searchText) {
      this.isAnimating = true;
      this.isSearchVisible = false;

      setTimeout(() => {
        this.isAnimating = false;
      }, 600);
    }
  }

  // @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isInsideSearch = target.closest('.header-search');
    const isSearchIcon = target.closest('.action-button mat-icon');

    if (isSearchIcon && !this.isSearchVisible) {
      return;
    }

    if (
      !isInsideSearch &&
      !isSearchIcon &&
      this.isSearchVisible &&
      !this.searchText
    ) {
      this.isAnimating = true;
      this.isSearchVisible = false;

      setTimeout(() => {
        this.isAnimating = false;
      }, 600);
    }
  }
}
