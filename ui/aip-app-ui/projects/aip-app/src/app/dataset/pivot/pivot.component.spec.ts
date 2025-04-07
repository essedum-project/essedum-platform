import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PivotComponent } from './pivot.component';

describe('PivotComponent', () => {
  let component: PivotComponent;
  let fixture: ComponentFixture<PivotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PivotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PivotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
