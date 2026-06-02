import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSecretsComponent } from './user-secrets.component';

describe('UserSecretsComponent', () => {
  let component: UserSecretsComponent;
  let fixture: ComponentFixture<UserSecretsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSecretsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSecretsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
