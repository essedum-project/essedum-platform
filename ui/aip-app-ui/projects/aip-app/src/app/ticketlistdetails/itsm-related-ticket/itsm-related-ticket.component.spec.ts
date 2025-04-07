import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsmRelatedTicketComponent } from './itsm-related-ticket.component';

describe('ItsmRelatedTicketComponent', () => {
  let component: ItsmRelatedTicketComponent;
  let fixture: ComponentFixture<ItsmRelatedTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsmRelatedTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsmRelatedTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
