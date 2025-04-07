import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawFlowComponent } from './draw-flow.component';

describe('DrawFlowComponent', () => {
  let component: DrawFlowComponent;
  let fixture: ComponentFixture<DrawFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawFlowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
