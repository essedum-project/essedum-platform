import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdapterCreateEditComponent } from './adapter-create-edit.component';

describe('AdapterCreateEditComponent', () => {
  let component: AdapterCreateEditComponent;
  let fixture: ComponentFixture<AdapterCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdapterCreateEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdapterCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
