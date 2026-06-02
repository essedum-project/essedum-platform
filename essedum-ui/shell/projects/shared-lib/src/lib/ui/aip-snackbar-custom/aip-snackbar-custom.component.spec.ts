import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipSnackbarCustomComponent } from './aip-snackbar-custom.component';

describe('CustomSnackbarComponent', () => {
  let component: AipSnackbarCustomComponent;
  let fixture: ComponentFixture<AipSnackbarCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipSnackbarCustomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipSnackbarCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
