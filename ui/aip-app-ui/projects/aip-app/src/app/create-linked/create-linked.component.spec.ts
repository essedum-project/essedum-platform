import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLinkedComponent } from './create-linked.component';

describe('CreateLinkedComponent', () => {
  let component: CreateLinkedComponent;
  let fixture: ComponentFixture<CreateLinkedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLinkedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLinkedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
