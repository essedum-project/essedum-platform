import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigSchemaComponent } from './modal-config-schema.component';

describe('ModalConfigSchemaComponent', () => {
  let component: ModalConfigSchemaComponent;
  let fixture: ComponentFixture<ModalConfigSchemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfigSchemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfigSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
