import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmInboxComponent } from './ivm-inbox.component';

describe('IvmInboxComponent', () => {
  let component: IvmInboxComponent;
  let fixture: ComponentFixture<IvmInboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmInboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
