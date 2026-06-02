import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlCodeEditorComponent } from './enl-code-editor.component';

describe('EnlCodeEditorComponent', () => {
  let component: EnlCodeEditorComponent;
  let fixture: ComponentFixture<EnlCodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnlCodeEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnlCodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
