import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomListboxComponent } from './custom-listbox.component';

describe('CustomListboxComponent', () => {
  let component: CustomListboxComponent;
  let fixture: ComponentFixture<CustomListboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomListboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomListboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
