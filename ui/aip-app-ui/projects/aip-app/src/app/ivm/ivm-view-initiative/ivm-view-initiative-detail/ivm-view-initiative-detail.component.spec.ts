import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmViewInitiativeDetailComponent } from './ivm-view-initiative-detail.component';

describe('IvmViewInitiativeDetailComponent', () => {
  let component: IvmViewInitiativeDetailComponent;
  let fixture: ComponentFixture<IvmViewInitiativeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmViewInitiativeDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmViewInitiativeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
