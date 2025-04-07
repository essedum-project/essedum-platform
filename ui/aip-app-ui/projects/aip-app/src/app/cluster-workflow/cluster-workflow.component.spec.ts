import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterWorkflowComponent } from './cluster-workflow.component';

describe('ClusterWorkflowComponent', () => {
  let component: ClusterWorkflowComponent;
  let fixture: ComponentFixture<ClusterWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClusterWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClusterWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
