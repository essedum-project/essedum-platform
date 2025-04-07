import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateOrgaanizationComponent } from './create-orgaanization.component';

describe('CreateOrgaanizationComponent', () => {
  let component: CreateOrgaanizationComponent;
  let fixture: ComponentFixture<CreateOrgaanizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrgaanizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrgaanizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
