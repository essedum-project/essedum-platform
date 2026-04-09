import { Component, OnDestroy, HostListener } from '@angular/core';
import { VibeStudioService } from '../services/vibe-studio.service';

@Component({
  selector: 'app-vibe-studio',
  templateUrl: './vibe-studio.component.html',
  styleUrls: ['./vibe-studio.component.scss'],
})
export class VibeStudioComponent implements OnDestroy {
  leftPanelWidth = 45;
  private isDragging = false;

  constructor(private vibeService: VibeStudioService) {}

  onNewSession(): void {
    this.vibeService.resetSession();
  }

  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const container = (event.target as HTMLElement).closest('.vibe-panels') || document.querySelector('.vibe-panels');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pct = ((event.clientX - rect.left) / rect.width) * 100;
    this.leftPanelWidth = Math.min(75, Math.max(25, pct));
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  ngOnDestroy(): void {
    this.vibeService.resetSession();
  }
}
