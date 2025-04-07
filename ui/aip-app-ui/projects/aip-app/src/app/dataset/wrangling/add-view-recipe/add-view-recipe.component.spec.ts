import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddViewRecipeComponent } from './add-view-recipe.component';

describe('AddViewRecipeComponent', () => {
  let component: AddViewRecipeComponent;
  let fixture: ComponentFixture<AddViewRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddViewRecipeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddViewRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
