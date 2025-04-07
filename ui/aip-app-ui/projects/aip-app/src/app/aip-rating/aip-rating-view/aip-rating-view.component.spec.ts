import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipRatingViewComponent } from './aip-rating-view.component';

describe('AipRatingViewComponent', () => {
  let component: AipRatingViewComponent;
  let fixture: ComponentFixture<AipRatingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipRatingViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AipRatingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
