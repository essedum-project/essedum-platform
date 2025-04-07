import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticSearchConfigComponent } from './semantic-search-config.component';

describe('SemanticSearchConfigComponent', () => {
  let component: SemanticSearchConfigComponent;
  let fixture: ComponentFixture<SemanticSearchConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemanticSearchConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticSearchConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
