import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsmSummaryComponent } from './itsm-summary.component';

describe('ItsmSummaryComponent', () => {
  let component: ItsmSummaryComponent;
  let fixture: ComponentFixture<ItsmSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsmSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsmSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
