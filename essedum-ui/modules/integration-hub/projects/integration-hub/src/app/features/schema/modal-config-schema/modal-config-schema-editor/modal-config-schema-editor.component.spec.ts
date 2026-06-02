import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigSchemaEditorComponent } from './modal-config-schema-editor.component';

describe('ModalConfigSchemaEditorComponent', () => {
  let component: ModalConfigSchemaEditorComponent;
  let fixture: ComponentFixture<ModalConfigSchemaEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfigSchemaEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfigSchemaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
