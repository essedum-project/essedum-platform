import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toJSON' })
export class StringToJSON implements PipeTransform {
  transform(value: string): any {
    return JSON.parse(value);
  }
}

@Pipe({ name: 'firstCharacter' })
export class FirstCharacterPipe implements PipeTransform {
  transform(value: string): string {
    return value.charAt(0).toUpperCase();
  }
}
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter((it) => {
      return it.name.toLowerCase().includes(searchText);
    });
  }
}
