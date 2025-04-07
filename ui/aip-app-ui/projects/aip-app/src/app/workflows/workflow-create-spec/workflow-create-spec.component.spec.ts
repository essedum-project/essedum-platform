import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCreateSpecComponent } from './workflow-create-spec.component';

describe('WorkflowCreateSpecComponent', () => {
  let component: WorkflowCreateSpecComponent;
  let fixture: ComponentFixture<WorkflowCreateSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowCreateSpecComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowCreateSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
