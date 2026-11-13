// ═══════════════════════════════════════════════════════════════════
// P1 VERSION: Theme Service for Admin Console
// Detects and applies light/dark theme from host shell
// ═══════════════════════════════════════════════════════════════════

import { Injectable, effect, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkTheme = signal<boolean>(true); // default to dark

  constructor(@Inject(DOCUMENT) private doc: Document) {
    this.initThemeDetection();
  }

  private initThemeDetection(): void {
    // Initial detection
    this.updateThemeFromBody();

    // Watch for body class changes
    const observer = new MutationObserver(() => {
      this.updateThemeFromBody();
    });

    observer.observe(this.doc.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private updateThemeFromBody(): void {
    const bodyClasses = this.doc.body.className;
    const hasLightClass = bodyClasses.includes('header-light-theme');
    const hasDarkClass = bodyClasses.includes('header-dark-theme');

    if (hasLightClass) {
      this.isDarkTheme.set(false);
    } else if (hasDarkClass) {
      this.isDarkTheme.set(true);
    } else {
      // Default: check prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
    }
  }
}
