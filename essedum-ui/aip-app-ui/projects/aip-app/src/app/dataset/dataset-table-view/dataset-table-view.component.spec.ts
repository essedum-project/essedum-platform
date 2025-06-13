import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTableViewComponent } from './dataset-table-view.component';

describe('DatasetTableViewComponent', () => {
  let component: DatasetTableViewComponent;
  let fixture: ComponentFixture<DatasetTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetTableViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
