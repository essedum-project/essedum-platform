import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.replace(
      /{{(.*?)}}/g,
      '<span class="highlight-color">{{$1}}</span>'
    );
  }
}

@Pipe({
  name: 'highlightSearch',
})
export class HighlightSearchPipe implements PipeTransform {
  transform(value: string, search: string): string {
    if (!value || !search) {
      return value;
    }
    const regex = new RegExp(`(${search})`, 'gi');
    return value.replace(regex, `<span class="highlight-color">$1</span>`);
  }
}
