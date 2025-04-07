import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiCheckListComponent } from './rai-check-list.component';

describe('RaiCheckListComponent', () => {
  let component: RaiCheckListComponent;
  let fixture: ComponentFixture<RaiCheckListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiCheckListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
