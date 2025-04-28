import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsmPermissionComponent } from './usm-permission.component';

describe('UsmPermissionComponent', () => {
  let component: UsmPermissionComponent;
  let fixture: ComponentFixture<UsmPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsmPermissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsmPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
