import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDatasetAnnotateComponent } from './pdf-dataset-annotate.component';

describe('PdfDatasetAnnotateComponent', () => {
  let component: PdfDatasetAnnotateComponent;
  let fixture: ComponentFixture<PdfDatasetAnnotateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfDatasetAnnotateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfDatasetAnnotateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
