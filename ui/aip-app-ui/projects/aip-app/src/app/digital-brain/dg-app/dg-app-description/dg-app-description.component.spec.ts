import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DgAppDescriptionComponent } from './dg-app-description.component';

describe('DgAppDescriptionComponent', () => {
  let component: DgAppDescriptionComponent;
  let fixture: ComponentFixture<DgAppDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DgAppDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DgAppDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
