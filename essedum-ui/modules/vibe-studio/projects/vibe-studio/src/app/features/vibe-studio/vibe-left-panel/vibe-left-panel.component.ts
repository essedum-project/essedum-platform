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
    standalone: false
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
    // IMPORTANT: escape raw HTML in the agent's response before rendering.
    // Without this, tokens like `<link rel="stylesheet" href="style.css">` or
    // `<img src="foo.png">` inside the reply become live DOM elements — the
    // browser then fires resource requests against the app origin (e.g. a
    // 404 storm on `/style.css`) every time the message re-renders.
    // `marked` no longer sanitises since v5, so we strip dangerous tags with
    // a defensive pass after parsing.
    const parsed = marked.parse(text || '', { async: false });
    const raw = typeof parsed === 'string' ? parsed : '';
    const safe = this.stripDangerousTags(raw);
    return this.sanitizer.bypassSecurityTrustHtml(safe);
  }

  /**
   * Removes tags that trigger network requests when injected via innerHTML:
   * <link>, <script>, <iframe>, <object>, <embed>, <base>, <meta>. Also
   * strips `src`/`href` attributes on <img>/<audio>/<video>/<source>/<track>
   * so those don't fetch either.
   */
  private stripDangerousTags(html: string): string {
    if (!html) return '';
    return html
      // Drop the whole element (opening + content + closing) for tags that
      // execute or fetch on parse.
      .replace(/<(link|script|iframe|object|embed|base|meta|form)\b[\s\S]*?<\/\1\s*>/gi, '')
      // Self-closing / void variants of the same set.
      .replace(/<(link|script|iframe|object|embed|base|meta|form)\b[^>]*\/?>/gi, '')
      // Neutralise resource-fetching attributes on media tags.
      .replace(/<(img|audio|video|source|track)([^>]*)>/gi, (_, tag, attrs) => {
        const cleaned = String(attrs)
          .replace(/\s(src|href|srcset|poster|data)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
        return `<${tag}${cleaned}>`;
      })
      // Drop inline event handlers (onclick, onerror, onload, …).
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
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
