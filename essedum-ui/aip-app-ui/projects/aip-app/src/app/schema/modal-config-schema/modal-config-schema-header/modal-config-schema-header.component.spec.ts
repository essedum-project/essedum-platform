import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigSchemaHeaderComponent } from './modal-config-schema-header.component';

describe('ModalConfigSchemaHeaderComponent', () => {
  let component: ModalConfigSchemaHeaderComponent;
  let fixture: ComponentFixture<ModalConfigSchemaHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfigSchemaHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfigSchemaHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
