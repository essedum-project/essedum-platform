import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import { VibeFile, VibeSessionStatus } from '../models/vibe-studio.models';

@Component({
  selector: 'app-vibe-right-panel',
  templateUrl: './vibe-right-panel.component.html',
  styleUrls: ['./vibe-right-panel.component.scss'],
})
export class VibeRightPanelComponent implements OnInit, OnDestroy {
  files: VibeFile[] = [];
  selectedFile: VibeFile | null = null;
  previewUrl: SafeResourceUrl | null = null;
  status: VibeSessionStatus = 'idle';
  activeTab: 'preview' | 'code' = 'preview';

  private destroy$ = new Subject<void>();

  constructor(
    private vibeService: VibeStudioService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.vibeService.files$
      .pipe(takeUntil(this.destroy$))
      .subscribe((files) => {
        this.files = files;
        if (files.length && !this.selectedFile) {
          this.selectedFile = files[0];
        }
      });

    this.vibeService.previewUrl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (url) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.activeTab = 'preview';
        }
      });

    this.vibeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => (this.status = s));
  }

  selectFile(file: VibeFile): void {
    this.selectedFile = file;
    this.activeTab = 'code';
  }

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  getFileIcon(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'bi-filetype-py';
      case 'js': return 'bi-filetype-js';
      case 'ts': return 'bi-filetype-tsx';
      case 'jsx':
      case 'tsx': return 'bi-filetype-jsx';
      case 'html': return 'bi-filetype-html';
      case 'css':
      case 'scss': return 'bi-filetype-css';
      case 'json': return 'bi-filetype-json';
      case 'md': return 'bi-filetype-md';
      case 'txt': return 'bi-file-text';
      default: return 'bi-file-code';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
