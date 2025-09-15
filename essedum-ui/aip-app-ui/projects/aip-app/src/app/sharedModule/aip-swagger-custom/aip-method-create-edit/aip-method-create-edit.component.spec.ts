import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipMethodCreateEditComponent } from './aip-method-create-edit.component';

describe('AipMethodCreateEditComponent', () => {
  let component: AipMethodCreateEditComponent;
  let fixture: ComponentFixture<AipMethodCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipMethodCreateEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AipMethodCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
