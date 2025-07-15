import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipLoadingComponent } from './aip-loading.component';

describe('AipLoadingComponent', () => {
  let component: AipLoadingComponent;
  let fixture: ComponentFixture<AipLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipLoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
