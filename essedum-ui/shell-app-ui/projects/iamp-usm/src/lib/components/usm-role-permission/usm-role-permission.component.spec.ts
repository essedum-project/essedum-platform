import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsmRolePermissionComponent } from './usm-role-permission.component';

describe('UsmRolePermissionComponent', () => {
  let component: UsmRolePermissionComponent;
  let fixture: ComponentFixture<UsmRolePermissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UsmRolePermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsmRolePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
