import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChartComponent } from './view-chart.component';

describe('ViewChartComponent', () => {
  let component: ViewChartComponent;
  let fixture: ComponentFixture<ViewChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
