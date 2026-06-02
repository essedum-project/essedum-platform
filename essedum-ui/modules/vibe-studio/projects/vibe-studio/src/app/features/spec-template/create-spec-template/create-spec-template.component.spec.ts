import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSpecTemplateComponent } from './create-spec-template.component';

describe('CreateSpecTemplateComponent', () => {
  let component: CreateSpecTemplateComponent;
  let fixture: ComponentFixture<CreateSpecTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSpecTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSpecTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
