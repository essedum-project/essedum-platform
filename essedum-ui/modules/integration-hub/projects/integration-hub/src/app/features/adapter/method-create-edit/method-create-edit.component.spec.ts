import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodCreateEditComponent } from './method-create-edit.component';

describe('MethodCreateEditComponent', () => {
  let component: MethodCreateEditComponent;
  let fixture: ComponentFixture<MethodCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MethodCreateEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MethodCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
