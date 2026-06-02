import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecTemplateCustomSwaggerComponent } from './spec-template-custom-swagger.component';

describe('SpecTemplateCustomSwaggerComponent', () => {
  let component: SpecTemplateCustomSwaggerComponent;
  let fixture: ComponentFixture<SpecTemplateCustomSwaggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecTemplateCustomSwaggerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecTemplateCustomSwaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
