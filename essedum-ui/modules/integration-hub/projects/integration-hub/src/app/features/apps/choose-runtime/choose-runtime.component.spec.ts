import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseRuntimeComponent } from './choose-runtime.component';

describe('ChooseRuntimeComponent', () => {
  let component: ChooseRuntimeComponent;
  let fixture: ComponentFixture<ChooseRuntimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChooseRuntimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseRuntimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
