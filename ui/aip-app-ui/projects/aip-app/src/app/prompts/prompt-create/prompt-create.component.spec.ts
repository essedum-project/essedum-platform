import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptCreateComponent } from './prompt-create.component';

describe('PromptCreateComponent', () => {
  let component: PromptCreateComponent;
  let fixture: ComponentFixture<PromptCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
