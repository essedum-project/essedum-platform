import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipDeleteConfirmationComponent } from './aip-delete-confirmation.component';

describe('AipDeleteConfirmationComponent', () => {
  let component: AipDeleteConfirmationComponent;
  let fixture: ComponentFixture<AipDeleteConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipDeleteConfirmationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipDeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
