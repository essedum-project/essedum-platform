import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetMacrobaseComponent } from './dataset-macrobase.component';

describe('DatasetMacrobaseComponent', () => {
  let component: DatasetMacrobaseComponent;
  let fixture: ComponentFixture<DatasetMacrobaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetMacrobaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetMacrobaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
