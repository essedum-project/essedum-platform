import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkDatasetsviewComponent } from './wk-datasetsview.component';

describe('WkDatasetsviewComponent', () => {
  let component: WkDatasetsviewComponent;
  let fixture: ComponentFixture<WkDatasetsviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkDatasetsviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkDatasetsviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
