import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamArgumentPopupComponent } from './param-argument-popup.component';

describe('ParamArgumentPopupComponent', () => {
  let component: ParamArgumentPopupComponent;
  let fixture: ComponentFixture<ParamArgumentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamArgumentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamArgumentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
