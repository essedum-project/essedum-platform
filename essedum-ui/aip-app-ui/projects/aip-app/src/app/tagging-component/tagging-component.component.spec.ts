import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggingComponentComponent } from './tagging-component.component';

describe('TaggingComponentComponent', () => {
  let component: TaggingComponentComponent;
  let fixture: ComponentFixture<TaggingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggingComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaggingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
