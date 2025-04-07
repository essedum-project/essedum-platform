import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkDatasettableviewComponent } from './wk-datasettableview.component';

describe('WkDatasettableviewComponent', () => {
  let component: WkDatasettableviewComponent;
  let fixture: ComponentFixture<WkDatasettableviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkDatasettableviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WkDatasettableviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
