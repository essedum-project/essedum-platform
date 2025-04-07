import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodConfigComponent } from './method-config.component';

describe('MethodConfigComponent', () => {
  let component: MethodConfigComponent;
  let fixture: ComponentFixture<MethodConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MethodConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MethodConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
