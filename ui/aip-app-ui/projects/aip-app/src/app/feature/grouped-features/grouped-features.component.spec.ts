import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedFeaturesComponent } from './grouped-features.component';

describe('GroupedFeaturesComponent', () => {
  let component: GroupedFeaturesComponent;
  let fixture: ComponentFixture<GroupedFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupedFeaturesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
