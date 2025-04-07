import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DgToolDescriptionComponent } from './dg-tool-description.component';

describe('DgToolDescriptionComponent', () => {
  let component: DgToolDescriptionComponent;
  let fixture: ComponentFixture<DgToolDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DgToolDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DgToolDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
