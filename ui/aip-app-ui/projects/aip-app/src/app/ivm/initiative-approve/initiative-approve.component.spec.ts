import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeApproveComponent } from './initiative-approve.component';

describe('InitiativeApproveComponent', () => {
  let component: InitiativeApproveComponent;
  let fixture: ComponentFixture<InitiativeApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitiativeApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiativeApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
