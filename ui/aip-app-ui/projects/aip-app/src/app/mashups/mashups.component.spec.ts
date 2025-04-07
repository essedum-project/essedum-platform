import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MashupsComponent } from './mashups.component';

describe('MashupsComponent', () => {
  let component: MashupsComponent;
  let fixture: ComponentFixture<MashupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MashupsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MashupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
