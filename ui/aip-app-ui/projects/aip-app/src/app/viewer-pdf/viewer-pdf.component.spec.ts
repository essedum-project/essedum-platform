import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerPdfComponent } from './viewer-pdf.component';

describe('ViewerPdfComponent', () => {
  let component: ViewerPdfComponent;
  let fixture: ComponentFixture<ViewerPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerPdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
