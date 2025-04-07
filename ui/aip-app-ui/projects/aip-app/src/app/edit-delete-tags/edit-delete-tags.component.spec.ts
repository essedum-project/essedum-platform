import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeleteTagsComponent } from './edit-delete-tags.component';

describe('EditDeleteTagsComponent', () => {
  let component: EditDeleteTagsComponent;
  let fixture: ComponentFixture<EditDeleteTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDeleteTagsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDeleteTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
