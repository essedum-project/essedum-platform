import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkWorkareaComponent } from './wk-workarea.component';

describe('WkWorkareaComponent', () => {
  let component: WkWorkareaComponent;
  let fixture: ComponentFixture<WkWorkareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkWorkareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkWorkareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
