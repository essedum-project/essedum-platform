import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveStoryComponent } from './save-story.component';

describe('SaveStoryComponent', () => {
  let component: SaveStoryComponent;
  let fixture: ComponentFixture<SaveStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveStoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
