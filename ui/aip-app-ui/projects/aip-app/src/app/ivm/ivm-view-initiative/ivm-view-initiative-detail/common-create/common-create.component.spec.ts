import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonCreateComponent } from './common-create.component';

describe('CommonCreateComponent', () => {
  let component: CommonCreateComponent;
  let fixture: ComponentFixture<CommonCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
