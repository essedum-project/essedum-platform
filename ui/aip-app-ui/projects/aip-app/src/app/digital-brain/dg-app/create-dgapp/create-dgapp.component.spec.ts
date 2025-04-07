import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDgappComponent } from './create-dgapp.component';

describe('CreateDgappComponent', () => {
  let component: CreateDgappComponent;
  let fixture: ComponentFixture<CreateDgappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDgappComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDgappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
