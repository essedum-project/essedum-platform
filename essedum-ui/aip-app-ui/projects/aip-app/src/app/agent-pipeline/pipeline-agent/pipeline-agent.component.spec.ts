import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineAgentComponent } from './pipeline-agent.component';

describe('PipelineAgentComponent', () => {
  let component: PipelineAgentComponent;
  let fixture: ComponentFixture<PipelineAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineAgentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});