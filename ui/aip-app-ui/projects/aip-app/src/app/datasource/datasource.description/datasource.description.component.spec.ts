import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceDescriptionComponent } from './datasource.description.component';

describe('DatasourceDescriptionComponent', () => {
  let component: DatasourceDescriptionComponent;
  let fixture: ComponentFixture<DatasourceDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasourceDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
