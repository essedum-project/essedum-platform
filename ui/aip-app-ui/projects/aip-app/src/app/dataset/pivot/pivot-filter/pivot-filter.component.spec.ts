import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PivotFilterComponent } from './pivot-filter.component';

describe('PivotFilterComponent', () => {
  let component: PivotFilterComponent;
  let fixture: ComponentFixture<PivotFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PivotFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PivotFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
