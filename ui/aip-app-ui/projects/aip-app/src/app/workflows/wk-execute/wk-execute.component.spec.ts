import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkExecuteComponent } from './wk-execute.component';

describe('WkExecuteComponent', () => {
  let component: WkExecuteComponent;
  let fixture: ComponentFixture<WkExecuteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkExecuteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
