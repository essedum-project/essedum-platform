import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainPipelineComponent } from './chain-pipeline.component';

describe('ChainPipelineComponent', () => {
  let component: ChainPipelineComponent;
  let fixture: ComponentFixture<ChainPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChainPipelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChainPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
