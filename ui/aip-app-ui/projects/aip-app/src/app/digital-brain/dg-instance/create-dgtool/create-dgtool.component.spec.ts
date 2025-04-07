import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDgtoolComponent } from './create-dgtool.component';

describe('CreateDgtoolComponent', () => {
  let component: CreateDgtoolComponent;
  let fixture: ComponentFixture<CreateDgtoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDgtoolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDgtoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
