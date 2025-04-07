import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerZipComponent } from './viewer-zip.component';

describe('ViewerZipComponent', () => {
  let component: ViewerZipComponent;
  let fixture: ComponentFixture<ViewerZipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerZipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerZipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
