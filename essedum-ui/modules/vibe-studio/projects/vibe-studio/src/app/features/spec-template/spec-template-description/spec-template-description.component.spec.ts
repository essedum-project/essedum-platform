import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecTemplateDescriptionComponent } from './spec-template-description.component';

describe('SpecTemplateDescriptionComponent', () => {
  let component: SpecTemplateDescriptionComponent;
  let fixture: ComponentFixture<SpecTemplateDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecTemplateDescriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecTemplateDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
