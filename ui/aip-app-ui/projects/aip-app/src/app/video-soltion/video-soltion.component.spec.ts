import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSoltionComponent } from './video-soltion.component';

describe('VideoSoltionComponent', () => {
  let component: VideoSoltionComponent;
  let fixture: ComponentFixture<VideoSoltionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoSoltionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoSoltionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
