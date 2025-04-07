import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstantsComponent } from './constants.component';

describe('ConstantsComponent', () => {
  let component: ConstantsComponent;
  let fixture: ComponentFixture<ConstantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
