import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerAudioComponent } from './viewer-audio.component';

describe('ViewerAudioComponent', () => {
  let component: ViewerAudioComponent;
  let fixture: ComponentFixture<ViewerAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerAudioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
