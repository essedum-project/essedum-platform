import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDgToolComponent } from './edit-dg-tool.component';

describe('EditDgToolComponent', () => {
  let component: EditDgToolComponent;
  let fixture: ComponentFixture<EditDgToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDgToolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDgToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
