import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTemplateComponent } from './dataset-template.component';

describe('DatasetTemplateComponent', () => {
  let component: DatasetTemplateComponent;
  let fixture: ComponentFixture<DatasetTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
