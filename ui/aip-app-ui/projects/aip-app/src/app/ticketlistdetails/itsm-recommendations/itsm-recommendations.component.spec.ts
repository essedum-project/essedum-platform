import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsmRecommendationsComponent } from './itsm-recommendations.component';

describe('ItsmRecommendationsComponent', () => {
  let component: ItsmRecommendationsComponent;
  let fixture: ComponentFixture<ItsmRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsmRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsmRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
