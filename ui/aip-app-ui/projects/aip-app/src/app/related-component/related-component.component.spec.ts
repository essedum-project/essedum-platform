import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedComponentComponent } from './related-component.component';

describe('RelatedComponentComponent', () => {
  let component: RelatedComponentComponent;
  let fixture: ComponentFixture<RelatedComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
