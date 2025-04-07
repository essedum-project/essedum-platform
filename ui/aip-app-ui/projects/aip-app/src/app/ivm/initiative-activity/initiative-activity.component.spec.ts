import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeActivityComponent } from './initiative-activity.component';

describe('InitiativeActivityComponent', () => {
  let component: InitiativeActivityComponent;
  let fixture: ComponentFixture<InitiativeActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitiativeActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiativeActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
