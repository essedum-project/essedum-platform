import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetSemanticComponent } from './dataset-semantic.component';

describe('DatasetSemanticComponent', () => {
  let component: DatasetSemanticComponent;
  let fixture: ComponentFixture<DatasetSemanticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetSemanticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetSemanticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
