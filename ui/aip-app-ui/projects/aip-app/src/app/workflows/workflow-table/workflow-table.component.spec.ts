import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTableComponent } from './workflow-table.component';

describe('WorkflowTableComponent', () => {
  let component: WorkflowTableComponent;
  let fixture: ComponentFixture<WorkflowTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
