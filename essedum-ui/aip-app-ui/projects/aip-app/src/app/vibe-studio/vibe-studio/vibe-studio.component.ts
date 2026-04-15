import { Component, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { VibeStudioService } from '../services/vibe-studio.service';
import { APP_TYPE_OPTIONS, AppType } from '../models/vibe-studio.models';

@Component({
  selector: 'app-vibe-studio',
  templateUrl: './vibe-studio.component.html',
  styleUrls: ['./vibe-studio.component.scss'],
})
export class VibeStudioComponent implements OnDestroy {
  readonly appTypeOptions = APP_TYPE_OPTIONS;

  selectedAppType: AppType | null = null;
  leftPanelWidth = 35;
  private isDragging = false;
  private destroy$ = new Subject<void>();

  constructor(private vibeService: VibeStudioService) {}

  selectAppType(appType: AppType): void {
    this.selectedAppType = appType;
    this.vibeService.setAppType(appType);
    const label = this.appTypeOptions.find(o => o.value === appType)?.label || appType;
    this.vibeService.generate(`I want to create a ${label} app`);
  }

  onNewSession(): void {
    this.selectedAppType = null;
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
    this.destroy$.next();
    this.destroy$.complete();
    this.vibeService.resetSession();
  }
}
