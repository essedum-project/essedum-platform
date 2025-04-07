import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerImageComponent } from './viewer-image.component';

describe('ViewerImageComponent', () => {
  let component: ViewerImageComponent;
  let fixture: ComponentFixture<ViewerImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
