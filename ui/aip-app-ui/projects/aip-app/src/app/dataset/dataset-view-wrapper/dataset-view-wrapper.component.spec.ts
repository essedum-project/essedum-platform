import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetViewWrapperComponent } from './dataset-view-wrapper.component';

describe('DatasetViewWrapperComponent', () => {
  let component: DatasetViewWrapperComponent;
  let fixture: ComponentFixture<DatasetViewWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetViewWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetViewWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
