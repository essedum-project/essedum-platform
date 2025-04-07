import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDialogComponent } from './pipeline-dialog.component';

describe('PipelineDialogComponent', () => {
  let component: PipelineDialogComponent;
  let fixture: ComponentFixture<PipelineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
