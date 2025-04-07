import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MashupCreateComponent } from './mashup-create.component';

describe('MashupCreateComponent', () => {
  let component: MashupCreateComponent;
  let fixture: ComponentFixture<MashupCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MashupCreateComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MashupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
