import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigComponent } from './modal-config.component';

describe('ModalConfigComponent', () => {
  let component: ModalConfigComponent;
  let fixture: ComponentFixture<ModalConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
