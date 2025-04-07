import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetLoadComponent } from './dataset-load.component';

describe('DatasetLoadComponent', () => {
  let component: DatasetLoadComponent;
  let fixture: ComponentFixture<DatasetLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetLoadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
