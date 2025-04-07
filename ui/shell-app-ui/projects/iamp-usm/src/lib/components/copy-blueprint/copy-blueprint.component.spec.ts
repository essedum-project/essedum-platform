import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyBlueprintComponent } from './copy-blueprint.component';

describe('CopyBlueprintComponent', () => {
  let component: CopyBlueprintComponent;
  let fixture: ComponentFixture<CopyBlueprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyBlueprintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyBlueprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
