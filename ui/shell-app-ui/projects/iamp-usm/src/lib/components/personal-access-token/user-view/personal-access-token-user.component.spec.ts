import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalAccessTokenUserComponent } from './personal-access-token-user.component';

describe('PersonalAccessTokenUserComponent', () => {
  let component: PersonalAccessTokenUserComponent;
  let fixture: ComponentFixture<PersonalAccessTokenUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalAccessTokenUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalAccessTokenUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
