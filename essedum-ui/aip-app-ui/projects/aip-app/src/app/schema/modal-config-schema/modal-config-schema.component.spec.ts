import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigSchemaComponent } from './modal-config-schema.component';

describe('ModalConfigSchemaComponent', () => {
  let component: ModalConfigSchemaComponent;
  let fixture: ComponentFixture<ModalConfigSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfigSchemaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfigSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
