import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDescriptionComponent } from './agent-description.component';

describe('AgentDescriptionComponent', () => {
  let component: AgentDescriptionComponent;
  let fixture: ComponentFixture<AgentDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
