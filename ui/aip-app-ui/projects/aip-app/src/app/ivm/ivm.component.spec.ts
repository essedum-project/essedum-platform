import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmComponent } from './ivm.component';

describe('IvmComponent', () => {
  let component: IvmComponent;
  let fixture: ComponentFixture<IvmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
