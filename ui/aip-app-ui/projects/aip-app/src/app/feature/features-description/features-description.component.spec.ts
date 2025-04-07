import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesDescriptionComponent } from './features-description.component';

describe('FeaturesDescriptionComponent', () => {
  let component: FeaturesDescriptionComponent;
  let fixture: ComponentFixture<FeaturesDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
