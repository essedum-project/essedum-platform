import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProjectRoleListComponent } from './user-project-role-list.component';

describe('UserProjectRoleListComponent', () => {
  let component: UserProjectRoleListComponent;
  let fixture: ComponentFixture<UserProjectRoleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProjectRoleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProjectRoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
