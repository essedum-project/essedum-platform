import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticSearchDialogComponent } from './semantic-search-dialog.component';

describe('SemanticSearchDialogComponent', () => {
  let component: SemanticSearchDialogComponent;
  let fixture: ComponentFixture<SemanticSearchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
