import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-aip-header',
  templateUrl: './aip-header.component.html',
  styleUrls: ['./aip-header.component.scss'],
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
export class AipHeaderComponent {
  @Input() cardTitle: string = '';
  @Input() cardName: string = '';
  @Input() action: string = '';
  @Input() lastRefreshedTime: Date | null = null;
  @Input() showAddButton: boolean = false;
  @Input() backAction: boolean = false;
  @Input() closeAction: boolean = false;
  @Input() showRelatedInstances: boolean = false;
  @Input() tagCategory:string='';
  @Output() navigateBack = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() zoom = new EventEmitter<void>();

  readonly TOOLTIP_POSITION = 'above';
  isBackHovered: boolean = false;
  isSearchHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isSearchVisible: boolean = false;
  isCloseHovered: boolean = false;
  isAnimating: boolean = false;
  isRefreshing: boolean = false;
  searchText: string = '';

  constructor() {}

  getPageTitle(): string {
    const suffix1 = this.action === 'view-details' ? ': ' + this.cardName : '';
    const suffix2 =
      this.action === 'create'
        ? ' - Create'
        : this.action === 'edit'
        ? ' - Edit'
        : '';
    return `${suffix1}${suffix2}`;
  }

  onNavigateBack(): void {
    this.navigateBack.emit();
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

  onAddClick(): void {
    this.add.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  onZoom(): void {
    this.zoom.emit();
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

  getZoomIcon(): string {
    return this.showRelatedInstances ? 'zoom_out_map' : 'zoom_in_map';
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

  @HostListener('document:click', ['$event'])
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
