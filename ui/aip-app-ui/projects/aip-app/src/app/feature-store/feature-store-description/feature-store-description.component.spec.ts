import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureStoreDescriptionComponent } from './feature-store-description.component';

describe('FeatureStoreDescriptionComponent', () => {
  let component: FeatureStoreDescriptionComponent;
  let fixture: ComponentFixture<FeatureStoreDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureStoreDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureStoreDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
