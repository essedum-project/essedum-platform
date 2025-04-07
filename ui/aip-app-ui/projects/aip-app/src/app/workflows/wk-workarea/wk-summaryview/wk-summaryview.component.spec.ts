import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkSummaryviewComponent } from './wk-summaryview.component';

describe('WkSummaryviewComponent', () => {
  let component: WkSummaryviewComponent;
  let fixture: ComponentFixture<WkSummaryviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkSummaryviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkSummaryviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
