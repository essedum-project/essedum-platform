import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainsLogComponent } from './chains-log.component';

describe('ChainsLogComponent', () => {
  let component: ChainsLogComponent;
  let fixture: ComponentFixture<ChainsLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChainsLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChainsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
