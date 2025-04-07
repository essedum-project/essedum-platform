import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonEditComponent } from './common-edit.component';

describe('CommonEditComponent', () => {
  let component: CommonEditComponent;
  let fixture: ComponentFixture<CommonEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
