import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'firstCharacter',
    standalone: false
})
export class FirstCharacterPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.charAt(0).toUpperCase() : '';
  }
}
