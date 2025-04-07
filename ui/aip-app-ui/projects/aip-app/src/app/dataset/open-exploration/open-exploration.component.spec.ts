import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenExplorationComponent } from './open-exploration.component';

describe('OpenExplorationComponent', () => {
  let component: OpenExplorationComponent;
  let fixture: ComponentFixture<OpenExplorationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenExplorationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
