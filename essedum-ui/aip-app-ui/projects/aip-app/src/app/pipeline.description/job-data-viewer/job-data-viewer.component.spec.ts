import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDataViewerComponent } from './job-data-viewer.component';

describe('JobDataViewerComponent', () => {
  let component: JobDataViewerComponent;
  let fixture: ComponentFixture<JobDataViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDataViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDataViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
