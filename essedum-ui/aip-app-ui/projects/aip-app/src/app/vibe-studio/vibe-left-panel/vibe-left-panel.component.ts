import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import {
  VibeChatMessage,
  VibeModel,
  VibeSessionStatus,
} from '../models/vibe-studio.models';

@Component({
  selector: 'app-vibe-left-panel',
  templateUrl: './vibe-left-panel.component.html',
  styleUrls: ['./vibe-left-panel.component.scss'],
})
export class VibeLeftPanelComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('promptInput') promptInput!: ElementRef;

  readonly models: { label: string; value: VibeModel }[] = [
    { label: 'Claude', value: 'claude' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'Azure OpenAI', value: 'azure-oai' },
  ];

  selectedModel: VibeModel = 'claude';
  prompt = '';
  messages: VibeChatMessage[] = [];
  status: VibeSessionStatus = 'idle';

  private destroy$ = new Subject<void>();

  constructor(private vibeService: VibeStudioService) {}

  ngOnInit(): void {
    this.vibeService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      });

    this.vibeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => {
        this.status = s;
      });
  }

  onModelChange(): void {
    this.vibeService.setModel(this.selectedModel);
  }

  sendPrompt(): void {
    if (!this.prompt.trim() || this.status === 'generating') return;
    this.vibeService.generate(this.prompt.trim());
    this.prompt = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendPrompt();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
