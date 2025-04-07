import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmViewInitiativeComponent } from './ivm-view-initiative.component';

describe('IvmViewInitiativeComponent', () => {
  let component: IvmViewInitiativeComponent;
  let fixture: ComponentFixture<IvmViewInitiativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmViewInitiativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmViewInitiativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
