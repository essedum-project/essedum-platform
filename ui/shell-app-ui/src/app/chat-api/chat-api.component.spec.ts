import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatApiComponent } from './chat-api.component';

describe('ChatApiComponent', () => {
  let component: ChatApiComponent;
  let fixture: ComponentFixture<ChatApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatApiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
