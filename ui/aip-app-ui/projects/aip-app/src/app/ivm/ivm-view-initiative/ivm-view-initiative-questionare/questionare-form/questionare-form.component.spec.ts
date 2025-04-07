import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionareFormComponent } from './questionare-form.component';

describe('QuestionareFormComponent', () => {
  let component: QuestionareFormComponent;
  let fixture: ComponentFixture<QuestionareFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionareFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionareFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
