import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewEditPropertiesComponent } from './modal-view-edit-properties.component';

describe('ModalViewEditPropertiesComponent', () => {
  let component: ModalViewEditPropertiesComponent;
  let fixture: ComponentFixture<ModalViewEditPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViewEditPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalViewEditPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
