import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SemanticSearchFeedbackPopup } from './semantic-search-feedback-popup.component';

describe('SemanticSearchFeedbackPopup', () => {
  let component: SemanticSearchFeedbackPopup;
  let fixture: ComponentFixture<SemanticSearchFeedbackPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchFeedbackPopup ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchFeedbackPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
