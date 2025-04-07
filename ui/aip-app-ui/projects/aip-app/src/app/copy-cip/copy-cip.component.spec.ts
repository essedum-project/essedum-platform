import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyCipComponent } from './copy-cip.component';

describe('CopyCipComponent', () => {
  let component: CopyCipComponent;
  let fixture: ComponentFixture<CopyCipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyCipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyCipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
