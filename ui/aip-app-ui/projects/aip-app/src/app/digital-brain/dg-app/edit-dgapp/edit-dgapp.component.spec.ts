import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDgappComponent } from './edit-dgapp.component';

describe('EditDgappComponent', () => {
  let component: EditDgappComponent;
  let fixture: ComponentFixture<EditDgappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDgappComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDgappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
