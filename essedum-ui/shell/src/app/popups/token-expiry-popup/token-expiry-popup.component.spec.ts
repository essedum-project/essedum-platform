import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenExpiryPopupComponent } from './token-expiry-popup.component';

describe('TokenExpiryPopupComponent', () => {
  let component: TokenExpiryPopupComponent;
  let fixture: ComponentFixture<TokenExpiryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenExpiryPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenExpiryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
