import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptAgentCreateComponent } from './prompt-agent-create.component';

describe('PromptAgentCreateComponent', () => {
  let component: PromptAgentCreateComponent;
  let fixture: ComponentFixture<PromptAgentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptAgentCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptAgentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
