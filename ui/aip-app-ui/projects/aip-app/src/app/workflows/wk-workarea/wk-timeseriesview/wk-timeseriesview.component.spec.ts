import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkTimeseriesviewComponent } from './wk-timeseriesview.component';

describe('WkTimeseriesviewComponent', () => {
  let component: WkTimeseriesviewComponent;
  let fixture: ComponentFixture<WkTimeseriesviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkTimeseriesviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkTimeseriesviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
