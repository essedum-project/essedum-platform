import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleRoleComponent } from './role-role.component';

describe('RoleRoleComponent', () => {
  let component: RoleRoleComponent;
  let fixture: ComponentFixture<RoleRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
