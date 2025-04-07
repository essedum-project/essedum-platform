import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MashupViewWrapperComponent } from './mashup-view-wrapper.component';

describe('MashupViewWrapperComponent', () => {
  let component: MashupViewWrapperComponent;
  let fixture: ComponentFixture<MashupViewWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MashupViewWrapperComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MashupViewWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
