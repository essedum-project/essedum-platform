import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestDatasetConfigComponent } from './rest-dataset-config.component';

describe('RestDatasetConfigComponent', () => {
  let component: RestDatasetConfigComponent;
  let fixture: ComponentFixture<RestDatasetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestDatasetConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestDatasetConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
