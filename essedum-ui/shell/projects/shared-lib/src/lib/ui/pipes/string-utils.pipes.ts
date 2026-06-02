import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toJSON' })
export class StringToJSON implements PipeTransform {
  transform(value: string): any {
    return JSON.parse(value);
  }
}

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    const lower = searchText.toLowerCase();
    return items.filter((it) => it?.name?.toLowerCase().includes(lower));
  }
}
