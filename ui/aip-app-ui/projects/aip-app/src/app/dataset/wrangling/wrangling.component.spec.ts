import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WranglingComponent } from './wrangling.component';

describe('WranglingComponent', () => {
  let component: WranglingComponent;
  let fixture: ComponentFixture<WranglingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WranglingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WranglingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
