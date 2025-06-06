import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelEditsComponent } from './model-edit.component';

describe('ModelEditComponent', () => {
  let component: ModelEditsComponent;
  let fixture: ComponentFixture<ModelEditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelEditsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelEditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
