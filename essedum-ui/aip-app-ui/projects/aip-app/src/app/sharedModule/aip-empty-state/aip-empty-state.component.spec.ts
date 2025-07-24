import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipEmptyStateComponent } from './aip-empty-state.component';

describe('AipEmptyStateComponent', () => {
  let component: AipEmptyStateComponent;
  let fixture: ComponentFixture<AipEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
