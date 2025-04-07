import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WranglingAdvisoryComponent } from './wrangling-advisory.component';

describe('WranglingAdvisoryComponent', () => {
  let component: WranglingAdvisoryComponent;
  let fixture: ComponentFixture<WranglingAdvisoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WranglingAdvisoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WranglingAdvisoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
