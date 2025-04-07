import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateeventComponent } from './createevent.component';

describe('CreateeventComponent', () => {
  let component: CreateeventComponent;
  let fixture: ComponentFixture<CreateeventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateeventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
