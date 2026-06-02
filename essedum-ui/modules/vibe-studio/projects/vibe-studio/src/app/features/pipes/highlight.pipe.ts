import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightSearchPipe implements PipeTransform {
  transform(value: any): any { return value; }
}
