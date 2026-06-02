import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetPowerModeViewComponent } from './dataset-power-mode-view.component';

describe('DatasetPowerModeViewComponent', () => {
  let component: DatasetPowerModeViewComponent;
  let fixture: ComponentFixture<DatasetPowerModeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetPowerModeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetPowerModeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
