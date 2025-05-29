import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigRestDatasourceComponent } from './modal-config-rest-datasource.component';

describe('ModalConfigRestDatasourceComponent', () => {
  let component: ModalConfigRestDatasourceComponent;
  let fixture: ComponentFixture<ModalConfigRestDatasourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfigRestDatasourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfigRestDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
