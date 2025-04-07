import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketlistsummitComponent } from './ticketlistsummit.component';

describe('TicketlistsummitComponent', () => {
  let component: TicketlistsummitComponent;
  let fixture: ComponentFixture<TicketlistsummitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketlistsummitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketlistsummitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
