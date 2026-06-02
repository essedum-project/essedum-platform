import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretAddComponent } from './secret-add.component';

describe('SecretAddComponent', () => {
  let component: SecretAddComponent;
  let fixture: ComponentFixture<SecretAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
