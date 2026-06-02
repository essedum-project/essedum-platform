import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceConfigComponent } from './datasource-config.component';

describe('DatasourceConfigComponent', () => {
  let component: DatasourceConfigComponent;
  let fixture: ComponentFixture<DatasourceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasourceConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
