import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticSearchDataSetViewDialogComponent } from './semantic-search-dataset-view-dialog.component';

describe('SemanticSearchDataSetViewDialogComponent', () => {
  let component: SemanticSearchDataSetViewDialogComponent;
  let fixture: ComponentFixture<SemanticSearchDataSetViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchDataSetViewDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchDataSetViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
