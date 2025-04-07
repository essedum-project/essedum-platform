import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeActifactDetailsComponent } from './initiative-actifact-details.component';

describe('InitiativeActifactDetailsComponent', () => {
  let component: InitiativeActifactDetailsComponent;
  let fixture: ComponentFixture<InitiativeActifactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitiativeActifactDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiativeActifactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
