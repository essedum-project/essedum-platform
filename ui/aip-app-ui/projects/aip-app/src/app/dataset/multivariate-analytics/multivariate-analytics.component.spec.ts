import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultivariateAnalyticsComponent } from './multivariate-analytics.component';



describe('MultivariateAnalyticsComponent', () => {
  let component: MultivariateAnalyticsComponent;
  let fixture: ComponentFixture<MultivariateAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultivariateAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultivariateAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
