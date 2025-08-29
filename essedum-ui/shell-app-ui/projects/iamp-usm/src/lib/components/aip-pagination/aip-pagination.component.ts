import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-aip-pagination',
  templateUrl: './aip-pagination.component.html',
  styleUrls: ['./aip-pagination.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
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

  getButtonStyle(i: number, idx: number) {
    if (i == this.pageNumber) {
      return {
        color: '#FFFFFF',
        background: '#0052CC 0% 0% no-repeat padding-box',
        cursor: 'unset',
      };
    } else {
      return {
        color: this.hoverStates[idx] ? '#0094ff' : '#737373',
      };
    }
  }
}
