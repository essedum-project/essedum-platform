import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DgAppComponent } from './dg-app.component';

describe('DgAppComponent', () => {
  let component: DgAppComponent;
  let fixture: ComponentFixture<DgAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DgAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DgAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
