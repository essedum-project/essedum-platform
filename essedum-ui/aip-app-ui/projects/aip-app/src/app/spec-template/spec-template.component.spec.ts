import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecTemplateComponent } from './spec-template.component';

describe('SpecTemplateComponent', () => {
  let component: SpecTemplateComponent;
  let fixture: ComponentFixture<SpecTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
