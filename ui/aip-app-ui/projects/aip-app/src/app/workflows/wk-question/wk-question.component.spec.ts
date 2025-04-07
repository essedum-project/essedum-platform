import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkQuestionComponent } from './wk-question.component';

describe('WkQuestionComponent', () => {
  let component: WkQuestionComponent;
  let fixture: ComponentFixture<WkQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
