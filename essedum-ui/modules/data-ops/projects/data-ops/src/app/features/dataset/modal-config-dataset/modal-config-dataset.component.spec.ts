import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigDatasetComponent } from './modal-config-dataset.component';

describe('ModalConfigDatasetComponent', () => {
  let component: ModalConfigDatasetComponent;
  let fixture: ComponentFixture<ModalConfigDatasetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfigDatasetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfigDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
