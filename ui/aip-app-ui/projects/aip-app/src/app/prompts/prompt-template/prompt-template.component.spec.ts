import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptTemplateComponent } from './prompt-template.component';

describe('PromptTemplateComponent', () => {
  let component: PromptTemplateComponent;
  let fixture: ComponentFixture<PromptTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
