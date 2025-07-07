import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetConfigComponent } from './dataset-config.component';

describe('DatasetConfigComponent', () => {
  let component: DatasetConfigComponent;
  let fixture: ComponentFixture<DatasetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
