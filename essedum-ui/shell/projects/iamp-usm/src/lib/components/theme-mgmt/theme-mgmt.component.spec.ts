import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeMgmtComponent } from './theme-mgmt.component';

describe('ThemeMgmtComponent', () => {
  let component: ThemeMgmtComponent;
  let fixture: ComponentFixture<ThemeMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeMgmtComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ThemeMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
