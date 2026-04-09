import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import {
  APP_TYPE_OPTIONS,
  AppType,
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

  readonly appTypeOptions = APP_TYPE_OPTIONS;
  readonly models: { label: string; value: VibeModel }[] = [
    { label: 'Claude', value: 'claude' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'Azure OpenAI', value: 'azure-oai' },
  ];

  selectedModel: VibeModel = 'claude';
  prompt = '';
  messages: VibeChatMessage[] = [];
  status: VibeSessionStatus = 'idle';
  streamingTokens = '';
  selectedAppType: AppType | null = null;

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
        if (s !== 'generating') {
          this.streamingTokens = '';
        }
      });

    this.vibeService.tokenStream$
      .pipe(takeUntil(this.destroy$))
      .subscribe((token) => {
        this.streamingTokens += token;
        this.scrollToBottom();
      });
  }

  selectAppType(appType: AppType): void {
    this.selectedAppType = appType;
    this.vibeService.setAppType(appType);
    const label = this.appTypeOptions.find(o => o.value === appType)?.label || appType;
    const initPrompt = `I want to create a ${label} app`;
    this.vibeService.generate(initPrompt);
  }

  onModelChange(): void {
    this.vibeService.setModel(this.selectedModel);
  }

  sendPrompt(): void {
    if (!this.selectedAppType || !this.prompt.trim() || this.status === 'generating') return;
    this.streamingTokens = '';
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
