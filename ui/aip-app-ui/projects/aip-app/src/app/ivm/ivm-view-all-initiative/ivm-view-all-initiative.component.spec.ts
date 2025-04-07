import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmViewAllInitiativeComponent } from './ivm-view-all-initiative.component';

describe('IvmViewAllInitiativeComponent', () => {
  let component: IvmViewAllInitiativeComponent;
  let fixture: ComponentFixture<IvmViewAllInitiativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmViewAllInitiativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmViewAllInitiativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
