import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigWorkflowComponent } from './modal-config-workflow.component';

describe('ModalConfigWorkflowComponent', () => {
  let component: ModalConfigWorkflowComponent;
  let fixture: ComponentFixture<ModalConfigWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfigWorkflowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfigWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
