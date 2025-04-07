import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotComponentAIP } from './chatbot.component';

describe('ChatbotComponentAIP', () => {
  let component: ChatbotComponentAIP;
  let fixture: ComponentFixture<ChatbotComponentAIP>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotComponentAIP ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotComponentAIP);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});