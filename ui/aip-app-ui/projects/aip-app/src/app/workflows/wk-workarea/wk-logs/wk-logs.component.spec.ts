import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkLogsComponent } from './wk-logs.component';

describe('WkLogsComponent', () => {
  let component: WkLogsComponent;
  let fixture: ComponentFixture<WkLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
