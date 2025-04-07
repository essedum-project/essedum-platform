import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeaturesComponent } from './create-features.component';

describe('CreateFeaturesComponent', () => {
  let component: CreateFeaturesComponent;
  let fixture: ComponentFixture<CreateFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFeaturesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
