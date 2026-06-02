import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipFilterComponent } from './aip-filter.component';

describe('AipFilterComponent', () => {
  let component: AipFilterComponent;
  let fixture: ComponentFixture<AipFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
