import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticSearchInferComponent } from './semantic-search-infer.component';

describe('SemanticSearchInferComponent', () => {
  let component: SemanticSearchInferComponent;
  let fixture: ComponentFixture<SemanticSearchInferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchInferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchInferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
