import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerVideoComponent } from './viewer-video.component';

describe('ViewerVideoComponent', () => {
  let component: ViewerVideoComponent;
  let fixture: ComponentFixture<ViewerVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
