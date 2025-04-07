import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerListComponent } from './scheduler-list.component';

describe('SchedulerListComponent', () => {
  let component: SchedulerListComponent;
  let fixture: ComponentFixture<SchedulerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedulerListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
