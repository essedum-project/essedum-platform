import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmViewInitiativeQuestionareComponent } from './ivm-view-initiative-questionare.component';

describe('IvmViewInitiativeQuestionareComponent', () => {
  let component: IvmViewInitiativeQuestionareComponent;
  let fixture: ComponentFixture<IvmViewInitiativeQuestionareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmViewInitiativeQuestionareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmViewInitiativeQuestionareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
