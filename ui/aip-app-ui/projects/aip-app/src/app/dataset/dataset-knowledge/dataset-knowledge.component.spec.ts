import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetKnowledgeComponent } from './dataset-knowledge.component';

describe('DatasetKnowledgeComponent', () => {
  let component: DatasetKnowledgeComponent;
  let fixture: ComponentFixture<DatasetKnowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetKnowledgeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetKnowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
