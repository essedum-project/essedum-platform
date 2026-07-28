import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Directive({ selector: '[inlineSVG]', standalone: false })
export class InlineSvgDirective implements OnChanges {
  @Input('inlineSVG') svgPath = '';

  private readonly http = inject(HttpClient);
  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnChanges(): void {
    if (!this.svgPath) return;
    this.http.get(this.svgPath, { responseType: 'text' }).subscribe({
      next: svg => { this.el.nativeElement.innerHTML = svg; },
      error: () => { this.el.nativeElement.innerHTML = ''; }
    });
  }
}
