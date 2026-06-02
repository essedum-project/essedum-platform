import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivityPopupComponent } from './inactivity-popup.component';

describe('InactivityPopupComponent', () => {
  let component: InactivityPopupComponent;
  let fixture: ComponentFixture<InactivityPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivityPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactivityPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
