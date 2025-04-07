import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterTicketsComponent } from './cluster-tickets.component';

describe('ClusterTicketsComponent', () => {
  let component: ClusterTicketsComponent;
  let fixture: ComponentFixture<ClusterTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClusterTicketsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClusterTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
