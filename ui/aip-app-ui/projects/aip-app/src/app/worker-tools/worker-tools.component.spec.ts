import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerToolsComponent } from './worker-tools.component';

describe('WorkerToolsComponent', () => {
  let component: WorkerToolsComponent;
  let fixture: ComponentFixture<WorkerToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
