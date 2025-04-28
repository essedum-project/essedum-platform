import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsmPermissionDetailsComponent } from './usm-permission-details.component';

describe('UsmPermissionDetailsComponent', () => {
  let component: UsmPermissionDetailsComponent;
  let fixture: ComponentFixture<UsmPermissionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsmPermissionDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsmPermissionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
