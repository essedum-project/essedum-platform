import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopydatasetsComponent } from './copydatasets.component';

describe('CopydatasetsComponent', () => {
  let component: CopydatasetsComponent;
  let fixture: ComponentFixture<CopydatasetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopydatasetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopydatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
