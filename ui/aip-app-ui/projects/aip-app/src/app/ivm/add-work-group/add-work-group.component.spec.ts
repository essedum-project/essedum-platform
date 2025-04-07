import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkGroupComponent } from './add-work-group.component';

describe('AddWorkGroupComponent', () => {
  let component: AddWorkGroupComponent;
  let fixture: ComponentFixture<AddWorkGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWorkGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWorkGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
