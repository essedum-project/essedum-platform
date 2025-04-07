import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndpointEditComponent } from './endpoint-edit.component';

describe('EndpointEditComponent', () => {
  let component: EndpointEditComponent;
  let fixture: ComponentFixture<EndpointEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndpointEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndpointEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
