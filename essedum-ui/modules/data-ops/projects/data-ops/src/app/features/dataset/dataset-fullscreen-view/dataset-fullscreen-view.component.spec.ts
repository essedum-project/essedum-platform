import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetFullscreenViewComponent } from './dataset-fullscreen-view.component';

describe('DatasetFullscreenViewComponent', () => {
  let component: DatasetFullscreenViewComponent;
  let fixture: ComponentFixture<DatasetFullscreenViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetFullscreenViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetFullscreenViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
