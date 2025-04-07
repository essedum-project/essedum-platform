import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMashupComponent } from './create-mashup-popup.component';

describe('CreateMashupComponent', () => {
  let component: CreateMashupComponent;
  let fixture: ComponentFixture<CreateMashupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMashupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreateMashupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
