import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticLandingComponent } from './static-landing.component';

describe('StaticLandingComponent', () => {
  let component: StaticLandingComponent;
  let fixture: ComponentFixture<StaticLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
