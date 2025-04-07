import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptAgentExecuteComponent } from './prompt-agent-execute.component';

describe('PromptAgentExecuteComponent', () => {
  let component: PromptAgentExecuteComponent;
  let fixture: ComponentFixture<PromptAgentExecuteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptAgentExecuteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptAgentExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
