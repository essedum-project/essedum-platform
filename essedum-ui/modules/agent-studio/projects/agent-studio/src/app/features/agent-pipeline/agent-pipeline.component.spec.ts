import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPipelineComponent } from './agent-pipeline.component';

describe('AgentPipelineComponent', () => {
  let component: AgentPipelineComponent;
  let fixture: ComponentFixture<AgentPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentPipelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
