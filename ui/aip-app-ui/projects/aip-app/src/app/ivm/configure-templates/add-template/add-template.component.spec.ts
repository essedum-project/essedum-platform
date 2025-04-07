import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemplateComponent } from './add-template.component';

describe('AddTemplateComponent', () => {
  let component: AddTemplateComponent;
  let fixture: ComponentFixture<AddTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
