import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputSchemaComponent } from './output-schema.component';

describe('OutputSchemaComponent', () => {
  let component: OutputSchemaComponent;
  let fixture: ComponentFixture<OutputSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutputSchemaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
