import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkDashboardComponent } from './wk-dashboard.component';

describe('WkDashboardComponent', () => {
  let component: WkDashboardComponent;
  let fixture: ComponentFixture<WkDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
