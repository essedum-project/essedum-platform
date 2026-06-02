import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipHeaderComponent } from './aip-header.component';

describe('AipHeaderComponent', () => {
  let component: AipHeaderComponent;
  let fixture: ComponentFixture<AipHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
