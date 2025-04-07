import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptTaskViewComponent } from './prompt-task-view.component';

describe('PromptTaskViewComponent', () => {
  let component: PromptTaskViewComponent;
  let fixture: ComponentFixture<PromptTaskViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptTaskViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
