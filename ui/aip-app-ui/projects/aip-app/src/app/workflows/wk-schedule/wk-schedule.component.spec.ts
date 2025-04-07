import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkScheduleComponent } from './wk-schedule.component';

describe('WkScheduleComponent', () => {
  let component: WkScheduleComponent;
  let fixture: ComponentFixture<WkScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
