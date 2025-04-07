import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsLogComponent } from './jobs-log.component';

describe('JobsLogComponent', () => {
  let component: JobsLogComponent;
  let fixture: ComponentFixture<JobsLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
