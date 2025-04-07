import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionBotComponent } from './solution-bot.component';

describe('SolutionBotComponent', () => {
  let component: SolutionBotComponent;
  let fixture: ComponentFixture<SolutionBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolutionBotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
