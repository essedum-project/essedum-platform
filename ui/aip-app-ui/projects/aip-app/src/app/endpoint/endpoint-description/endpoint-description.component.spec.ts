import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndpointDescriptionComponent } from './endpoint-description.component';

describe('EndpointDescriptionComponent', () => {
  let component: EndpointDescriptionComponent;
  let fixture: ComponentFixture<EndpointDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndpointDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndpointDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
