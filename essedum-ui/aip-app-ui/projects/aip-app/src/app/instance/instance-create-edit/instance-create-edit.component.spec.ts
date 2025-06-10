import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceCreateEditComponent } from './instance-create-edit.component';

describe('InstanceCreateEditComponent', () => {
  let component: InstanceCreateEditComponent;
  let fixture: ComponentFixture<InstanceCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstanceCreateEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstanceCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
