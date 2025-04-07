import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticSearchDataSetSummaryViewDialogComponent } from './semantic-search-dataset-summary-view-dialog.component';

describe('SemanticSearchDataSetSummaryViewDialogComponent', () => {
  let component: SemanticSearchDataSetSummaryViewDialogComponent;
  let fixture: ComponentFixture<SemanticSearchDataSetSummaryViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchDataSetSummaryViewDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchDataSetSummaryViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
