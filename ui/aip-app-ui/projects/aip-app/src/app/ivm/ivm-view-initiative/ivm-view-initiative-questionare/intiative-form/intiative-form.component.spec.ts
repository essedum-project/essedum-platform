import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntiativeFormComponent } from './intiative-form.component';

describe('IntiativeFormComponent', () => {
  let component: IntiativeFormComponent;
  let fixture: ComponentFixture<IntiativeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntiativeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntiativeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
