import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptAgentComponent } from './prompt-agent.component';

describe('PromptAgentComponent', () => {
  let component: PromptAgentComponent;
  let fixture: ComponentFixture<PromptAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
