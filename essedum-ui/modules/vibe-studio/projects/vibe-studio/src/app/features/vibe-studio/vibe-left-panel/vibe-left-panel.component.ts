import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { marked } from 'marked';
import { VibeStudioService } from '../services/vibe-studio.service';
import {
  VibeChatMessage,
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

  /** Label of the model chosen on the picker screen, passed in by the parent. */
  @Input() modelLabel = '';

  prompt = '';
  messages: VibeChatMessage[] = [];
  status: VibeSessionStatus = 'idle';
  inputFocused = false;

  private destroy$ = new Subject<void>();

  constructor(
    private vibeService: VibeStudioService,
    private sanitizer: DomSanitizer,
  ) {}

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

  renderMarkdown(text: string): SafeHtml {
    const result = marked.parse(text);
    const html = typeof result === 'string' ? result : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
