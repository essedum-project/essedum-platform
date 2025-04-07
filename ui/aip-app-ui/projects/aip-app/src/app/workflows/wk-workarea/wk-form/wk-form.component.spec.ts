import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkFormComponent } from './wk-form.component';

describe('WkFormComponent', () => {
  let component: WkFormComponent;
  let fixture: ComponentFixture<WkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
