import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineAgentDetailComponent } from './pipeline-agent-detail.component';

describe('PipelineAgentDetailComponent', () => {
  let component: PipelineAgentDetailComponent;
  let fixture: ComponentFixture<PipelineAgentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineAgentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineAgentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
