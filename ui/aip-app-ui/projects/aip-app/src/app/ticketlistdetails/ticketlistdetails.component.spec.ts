import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketlistdetailsComponent } from './ticketlistdetails.component';

describe('TicketlistdetailsComponent', () => {
  let component: TicketlistdetailsComponent;
  let fixture: ComponentFixture<TicketlistdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketlistdetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketlistdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
