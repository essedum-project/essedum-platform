import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatString'})
export class FormatStringPipe implements PipeTransform {
  transform(value: string): string {
    // Split the string on uppercase letters or special characters
    let words = value.split(/(?=[A-Z])|(?=[^a-zA-Z0-9])/);

    // Capitalize the first letter of each word and join them with a space
    let result = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return result;
  }
}
@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    let names = value.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase() + names[names.length - 1].substring(0, 1).toUpperCase();
    return initials;
  }

}