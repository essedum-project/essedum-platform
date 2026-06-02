import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { IampUsmComponent } from './iamp-usm.component';

describe('IampUsmComponent', () => {
  let component: IampUsmComponent;
  let fixture: ComponentFixture<IampUsmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IampUsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IampUsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
