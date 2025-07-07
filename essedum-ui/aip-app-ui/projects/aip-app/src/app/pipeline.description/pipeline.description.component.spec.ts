import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDescriptionComponent } from './pipeline.description.component';

describe('PipelineDescriptionComponent', () => {
  let component: PipelineDescriptionComponent;
  let fixture: ComponentFixture<PipelineDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
