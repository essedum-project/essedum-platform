import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WkPublishComponent } from './wk-publish.component';

describe('WkPublishComponent', () => {
  let component: WkPublishComponent;
  let fixture: ComponentFixture<WkPublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WkPublishComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WkPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
