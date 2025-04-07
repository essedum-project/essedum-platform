import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipRatingComponent } from './aip-rating.component';

describe('AipRatingComponent', () => {
  let component: AipRatingComponent;
  let fixture: ComponentFixture<AipRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AipRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
