import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-aip-pagination',
  templateUrl: './aip-pagination.component.html',
  styleUrls: ['./aip-pagination.component.scss'],
})
export class AipPaginationComponent {
  @Input() pageNumber!: number;
  @Input() noOfPages!: number;
  @Input() pageArr!: number[];
  @Input() startIndex!: number;
  @Input() endIndex!: number;
  @Input() hoverStates!: boolean[];

  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<number>();

  isPrevHovered = false;
  isNextHovered = false;
  pageNumberInput: number = 1;

  onPrevPage() {
    this.prevPage.emit();
  }

  onNextPage() {
    this.nextPage.emit();
  }

  onChangePage(input: number) {
    this.changePage.emit(input);
  }

  getButtonStyle(_i: number, _idx: number) {
    return {};
  }
}
