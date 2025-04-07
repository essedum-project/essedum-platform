import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceRegistryComponent } from './datasource-registry.component';

describe('DatasourceRegistryComponent', () => {
  let component: DatasourceRegistryComponent;
  let fixture: ComponentFixture<DatasourceRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasourceRegistryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
