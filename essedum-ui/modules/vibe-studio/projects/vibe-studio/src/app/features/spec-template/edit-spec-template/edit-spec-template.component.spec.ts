import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpecTemplateComponent } from './edit-spec-template.component';

describe('EditSpecTemplateComponent', () => {
  let component: EditSpecTemplateComponent;
  let fixture: ComponentFixture<EditSpecTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSpecTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSpecTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
