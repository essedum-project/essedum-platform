import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFeatureStoreComponent } from './edit-feature-store.component';

describe('EditFeatureStoreComponent', () => {
  let component: EditFeatureStoreComponent;
  let fixture: ComponentFixture<EditFeatureStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFeatureStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFeatureStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
