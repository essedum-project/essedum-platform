import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetByNameComponent } from './dataset-by-name.component';

describe('DatasetByNameComponent', () => {
  let component: DatasetByNameComponent;
  let fixture: ComponentFixture<DatasetByNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetByNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
