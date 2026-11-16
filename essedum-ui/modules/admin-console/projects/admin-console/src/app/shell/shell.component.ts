import { Component, effect, ElementRef } from '@angular/core';
import { ThemeService } from '../core/theme.service';

// ═══════════════════════════════════════════════════════════════════
// P1 VERSION: Shell Component with Component-Level Styling
// ═══════════════════════════════════════════════════════════════════

// Top-level layout for the admin-console remote — just a content host. The
// host shell's sidebar provides navigation (the admin screens are flattened
// into it), so there is no in-remote tab bar.
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  standalone: false,
})
export class ShellComponent {
  constructor(
    private readonly themeService: ThemeService,
    private readonly elementRef: ElementRef
  ) {
    // Apply light-theme class to shell when isDarkTheme is false
    effect(() => {
      const isDark = this.themeService.isDarkTheme();
      const shellElement = this.elementRef.nativeElement.querySelector('.admin-console-shell');
      if (shellElement) {
        if (isDark) {
          shellElement.classList.remove('light-theme');
        } else {
          shellElement.classList.add('light-theme');
        }
      }
    });
  }
}
