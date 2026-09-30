/**
 * Syncs a same-origin embedded app (LiteLLM, Langfuse, Salus) with the host's
 * light/dark toggle. LiteLLM and Langfuse use next-themes with the `theme`
 * localStorage key and a class on <html>; because the iframes are served from
 * the same origin, the host can set both directly.
 *
 * `lightCss` is for embedded pages that have no theming of their own — it is
 * injected while the host is in light mode and removed in dark mode.
 */
export function syncIframeTheme(
  iframe: HTMLIFrameElement | null | undefined,
  isDark: boolean,
  lightCss?: string
): void {
  const mode = isDark ? 'dark' : 'light';
  try { localStorage.setItem('theme', mode); } catch { /* storage blocked */ }

  const win = iframe?.contentWindow as any;
  const doc = iframe?.contentDocument;
  if (!win || !doc?.documentElement) return;

  try {
    const root = doc.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.colorScheme = mode;
    root.setAttribute('data-theme', mode);
    win.localStorage?.setItem('theme', mode);
    // next-themes only re-renders on a storage event, not on a plain setItem.
    win.dispatchEvent(new win.StorageEvent('storage', { key: 'theme', newValue: mode }));

    if (lightCss !== undefined) {
      let styleEl = doc.getElementById('host-theme-override') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.id = 'host-theme-override';
        doc.head?.appendChild(styleEl);
      }
      styleEl.textContent = isDark ? '' : lightCss;
    }
  } catch { /* iframe turned out to be cross-origin */ }
}
