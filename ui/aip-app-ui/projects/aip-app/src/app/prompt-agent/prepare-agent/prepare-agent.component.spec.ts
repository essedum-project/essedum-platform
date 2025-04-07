import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareAgentComponent } from './prepare-agent.component';

describe('PrepareAgentComponent', () => {
  let component: PrepareAgentComponent;
  let fixture: ComponentFixture<PrepareAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepareAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepareAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
