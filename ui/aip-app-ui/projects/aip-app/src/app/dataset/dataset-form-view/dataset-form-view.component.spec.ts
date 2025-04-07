import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetFormViewComponent } from './dataset-form-view.component';

describe('DatasetFormViewComponent', () => {
  let component: DatasetFormViewComponent;
  let fixture: ComponentFixture<DatasetFormViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetFormViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetFormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
