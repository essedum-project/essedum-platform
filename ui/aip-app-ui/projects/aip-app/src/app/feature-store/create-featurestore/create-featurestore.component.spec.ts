import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeaturestoreComponent } from './create-featurestore.component';

describe('CreateFeaturestoreComponent', () => {
  let component: CreateFeaturestoreComponent;
  let fixture: ComponentFixture<CreateFeaturestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFeaturestoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFeaturestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
