import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditManageGroupComponent } from './edit-manage-group.component';

describe('EditManageGroupComponent', () => {
  let component: EditManageGroupComponent;
  let fixture: ComponentFixture<EditManageGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditManageGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditManageGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
