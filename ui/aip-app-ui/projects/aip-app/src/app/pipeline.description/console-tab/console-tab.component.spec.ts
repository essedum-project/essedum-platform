import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTabComponent } from './console-tab.component';

describe('ConsoleTabComponent', () => {
  let component: ConsoleTabComponent;
  let fixture: ComponentFixture<ConsoleTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsoleTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
