import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSnackbarComponent } from './custom-snackbar.component';

describe('CustomSnackbarComponent', () => {
  let component: CustomSnackbarComponent;
  let fixture: ComponentFixture<CustomSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSnackbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
