import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DgInstanceComponent } from './dg-instance.component';

describe('DgInstanceComponent', () => {
  let component: DgInstanceComponent;
  let fixture: ComponentFixture<DgInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DgInstanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DgInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
