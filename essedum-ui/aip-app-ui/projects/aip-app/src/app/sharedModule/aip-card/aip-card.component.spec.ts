import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipCardComponent } from './aip-card.component';

describe('AipCardComponent', () => {
  let component: AipCardComponent;
  let fixture: ComponentFixture<AipCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
