import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipPaginationComponent } from './aip-pagination.component';

describe('AipPaginationComponent', () => {
  let component: AipPaginationComponent;
  let fixture: ComponentFixture<AipPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
