import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyPipelinesComponent } from './copy-pipelines.component';

describe('CopyPipelinesComponent', () => {
  let component: CopyPipelinesComponent;
  let fixture: ComponentFixture<CopyPipelinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyPipelinesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyPipelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
