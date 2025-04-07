import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmCreateModalComponent } from './ivm-create-modal.component';

describe('IvmCreateModalComponent', () => {
  let component: IvmCreateModalComponent;
  let fixture: ComponentFixture<IvmCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmCreateModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
